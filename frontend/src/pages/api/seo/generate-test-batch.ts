// @ts-ignore - Astro types available at build time
import type { APIRoute } from 'astro';
import { getDirectusClient, readItem, readItems, createItem, updateItem } from '@/lib/directus/client';
import { replaceYearTokens } from '@/lib/seo/velocity-scheduler';

/**
 * Generate Test Batch API
 * 
 * Creates a small batch of articles for review before mass production.
 * 
 * POST /api/seo/generate-test-batch
 */
export const POST: APIRoute = async ({ request }: { request: Request }) => {
    try {
        const data = await request.json();
        const { queue_id, campaign_id, batch_size = 10 } = data;

        if (!queue_id && !campaign_id) {
            return new Response(
                JSON.stringify({ error: 'queue_id or campaign_id is required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const directus = getDirectusClient();

        // Get queue entry
        let queue: any;
        if (queue_id) {
            queue = await directus.request(readItem('production_queue', queue_id));
        } else {
            const queues = await directus.request(readItems('production_queue', {
                filter: { campaign: { _eq: campaign_id }, status: { _eq: 'test_batch' } },
                limit: 1
            }));
            queue = (queues as any[])?.[0];
        }

        if (!queue) {
            return new Response(
                JSON.stringify({ error: 'Queue not found' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Get campaign
        const campaign = await directus.request(
            readItem('campaign_masters', queue.campaign)
        ) as any;

        if (!campaign) {
            return new Response(
                JSON.stringify({ error: 'Campaign not found' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Get schedule data (first N for test batch)
        const scheduleData = queue.schedule_data || [];
        const testSchedule = scheduleData.slice(0, batch_size);

        if (testSchedule.length === 0) {
            return new Response(
                JSON.stringify({ error: 'No schedule data found' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Get headline inventory for this campaign
        const headlines = await directus.request(readItems('headline_inventory', {
            filter: { campaign: { _eq: campaign.id }, is_used: { _eq: false } },
            limit: batch_size
        })) as any[];

        if (headlines.length === 0) {
            return new Response(
                JSON.stringify({ error: 'No unused headlines available. Generate headlines first.' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Generate test articles
        const generatedArticles: any[] = [];

        for (let i = 0; i < Math.min(batch_size, headlines.length, testSchedule.length); i++) {
            const headline = headlines[i];
            const schedule = testSchedule[i];
            const publishDate = new Date(schedule.publish_date);
            const modifiedDate = new Date(schedule.modified_date);

            // Apply year tokens to headline
            const processedHeadline = replaceYearTokens(headline.headline, publishDate);

            // Generate article content (simplified - in production, use full content generation)
            const article = await directus.request(
                createItem('generated_articles', {
                    site: queue.site,
                    campaign: campaign.id,
                    headline: processedHeadline,
                    meta_title: processedHeadline.substring(0, 60),
                    meta_description: `Learn about ${processedHeadline}. Expert guide with actionable tips.`,
                    full_html_body: `<h1>${processedHeadline}</h1><p>Test batch article content. Full content will be generated on approval.</p>`,
                    word_count: 100,
                    is_published: false,
                    is_test_batch: true,
                    date_published: publishDate.toISOString(),
                    date_modified: modifiedDate.toISOString(),
                    sitemap_status: 'ghost',
                    location_city: headline.location_city || null,
                    location_state: headline.location_state || null
                })
            );

            // Mark headline as used
            await directus.request(
                updateItem('headline_inventory', headline.id, { is_used: true })
            );

            generatedArticles.push(article);
        }

        // Update queue status
        await directus.request(
            updateItem('production_queue', queue.id, {
                status: 'test_batch',
                completed_count: generatedArticles.length
            })
        );

        // Create review URL
        const reviewUrl = `/admin/review-batch?queue=${queue.id}`;

        // Update campaign with review URL
        await directus.request(
            updateItem('campaign_masters', campaign.id, {
                test_batch_status: 'ready',
                test_batch_review_url: reviewUrl
            })
        );

        // Log work
        await directus.request(
            createItem('work_log', {
                site: queue.site,
                action: 'test_generated',
                entity_type: 'production_queue',
                entity_id: queue.id,
                details: {
                    articles_created: generatedArticles.length,
                    review_url: reviewUrl
                }
            })
        );

        return new Response(
            JSON.stringify({
                success: true,
                queue_id: queue.id,
                articles_created: generatedArticles.length,
                review_url: reviewUrl,
                articles: generatedArticles.map(a => ({
                    id: a.id,
                    headline: a.headline,
                    date_published: a.date_published
                })),
                next_step: `Review articles at ${reviewUrl}, then call /api/seo/approve-batch to start full production`
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error generating test batch:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to generate test batch' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
