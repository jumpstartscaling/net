// @ts-ignore - Astro types available at build time
import type { APIRoute } from 'astro';
import { getDirectusClient, readItem, createItem, updateItem } from '@/lib/directus/client';
import {
    generateNaturalSchedule,
    getMaxBackdateStart,
    type VelocityConfig
} from '@/lib/seo/velocity-scheduler';

/**
 * Schedule Production API
 * 
 * Generates a natural velocity schedule for article production.
 * Uses Gaussian distribution with weekend throttling and time jitter.
 * 
 * POST /api/seo/schedule-production
 */
export const POST: APIRoute = async ({ request }: { request: Request }) => {
    try {
        const data = await request.json();
        const {
            campaign_id,
            site_id,
            total_articles,
            date_range,
            velocity,
            test_batch_first = true
        } = data;

        if (!campaign_id || !total_articles) {
            return new Response(
                JSON.stringify({ error: 'campaign_id and total_articles are required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const directus = getDirectusClient();

        // Get campaign details
        const campaign = await directus.request(
            readItem('campaign_masters', campaign_id)
        ) as any;

        if (!campaign) {
            return new Response(
                JSON.stringify({ error: 'Campaign not found' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const targetSiteId = site_id || campaign.site;

        // Get site to check domain age
        const site = await directus.request(
            readItem('sites', targetSiteId)
        ) as any;

        const domainAgeYears = site?.domain_age_years || 1;

        // Parse dates
        let startDate: Date;
        let endDate: Date = new Date();

        if (date_range?.start) {
            startDate = new Date(date_range.start);
        } else if (campaign.backdate_start) {
            startDate = new Date(campaign.backdate_start);
        } else {
            // Default: use domain age to determine max backdate
            startDate = getMaxBackdateStart(domainAgeYears);
        }

        if (date_range?.end) {
            endDate = new Date(date_range.end);
        } else if (campaign.backdate_end) {
            endDate = new Date(campaign.backdate_end);
        }

        // Validate startDate isn't before domain existed
        const maxBackdate = getMaxBackdateStart(domainAgeYears);
        if (startDate < maxBackdate) {
            startDate = maxBackdate;
        }

        // Build velocity config
        const velocityConfig: VelocityConfig = {
            mode: velocity?.mode || campaign.velocity_mode || 'RAMP_UP',
            weekendThrottle: velocity?.weekend_throttle ?? campaign.weekend_throttle ?? true,
            jitterMinutes: velocity?.jitter_minutes ?? campaign.time_jitter_minutes ?? 120,
            businessHoursOnly: velocity?.business_hours ?? campaign.business_hours_only ?? true
        };

        // Generate schedule
        const schedule = generateNaturalSchedule(
            startDate,
            endDate,
            total_articles,
            velocityConfig
        );

        // Create production queue entry
        const queueEntry = await directus.request(
            createItem('production_queue', {
                site: targetSiteId,
                campaign: campaign_id,
                status: test_batch_first ? 'test_batch' : 'pending',
                total_requested: total_articles,
                completed_count: 0,
                velocity_mode: velocityConfig.mode,
                schedule_data: schedule.map(s => ({
                    publish_date: s.publishDate.toISOString(),
                    modified_date: s.modifiedDate.toISOString()
                }))
            })
        ) as any;

        // Update campaign with test batch status if applicable
        if (test_batch_first) {
            await directus.request(
                updateItem('campaign_masters', campaign_id, {
                    test_batch_status: 'pending'
                })
            );
        }

        // Log work
        await directus.request(
            createItem('work_log', {
                site: targetSiteId,
                action: 'schedule_created',
                entity_type: 'production_queue',
                entity_id: queueEntry.id,
                details: {
                    total_articles,
                    start_date: startDate.toISOString(),
                    end_date: endDate.toISOString(),
                    velocity_mode: velocityConfig.mode,
                    test_batch_first
                }
            })
        );

        // Return summary
        const dateDistribution: Record<string, number> = {};
        schedule.forEach(s => {
            const key = s.publishDate.toISOString().split('T')[0];
            dateDistribution[key] = (dateDistribution[key] || 0) + 1;
        });

        return new Response(
            JSON.stringify({
                success: true,
                queue_id: queueEntry.id,
                total_scheduled: schedule.length,
                date_range: {
                    start: startDate.toISOString(),
                    end: endDate.toISOString()
                },
                velocity: velocityConfig,
                next_step: test_batch_first
                    ? 'Call /api/seo/generate-test-batch to create review batch'
                    : 'Call /api/seo/process-queue to start generation',
                sample_distribution: Object.entries(dateDistribution)
                    .slice(0, 10)
                    .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {})
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error scheduling production:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to schedule production' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
