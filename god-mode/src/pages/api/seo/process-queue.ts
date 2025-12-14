// @ts-ignore - Astro types available at build time
import type { APIRoute } from 'astro';
import { getDirectusClient, readItem, readItems, updateItem, createItem } from '@/lib/directus/client';
import { replaceYearTokens } from '@/lib/seo/velocity-scheduler';

/**
 * Process Queue API
 * 
 * Runs the factory: generates all scheduled articles for an approved queue.
 * Can be called by cron or manually (with limits per call).
 * 
 * POST /api/seo/process-queue
 */
export const POST: APIRoute = async ({ request }: { request: Request }) => {
    try {
        const data = await request.json();
        const { queue_id, batch_limit = 100 } = data;

        if (!queue_id) {
            return new Response(
                JSON.stringify({ error: 'queue_id is required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const directus = getDirectusClient();

        // Get queue
        const queue = await directus.request(readItem('production_queue', queue_id)) as any;

        if (!queue) {
            return new Response(
                JSON.stringify({ error: 'Queue not found' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        if (queue.status !== 'approved' && queue.status !== 'running') {
            return new Response(
                JSON.stringify({ error: 'Queue must be approved to process' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Mark as running
        await directus.request(
            updateItem('production_queue', queue_id, {
                status: 'running',
                started_at: queue.started_at || new Date().toISOString()
            })
        );

        // Get campaign
        const campaign = await directus.request(
            readItem('campaign_masters', queue.campaign)
        ) as any;

        // Get schedule data
        const scheduleData = queue.schedule_data || [];
        const startIndex = queue.completed_count || 0;
        const endIndex = Math.min(startIndex + batch_limit, scheduleData.length);
        const batchSchedule = scheduleData.slice(startIndex, endIndex);

        if (batchSchedule.length === 0) {
            // All done!
            await directus.request(
                updateItem('production_queue', queue_id, {
                    status: 'done',
                    completed_at: new Date().toISOString()
                })
            );

            return new Response(
                JSON.stringify({
                    success: true,
                    message: 'Queue complete',
                    total_generated: queue.completed_count
                }),
                { status: 200, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Get locations based on filter
        const locationFilter = campaign.target_locations_filter || {};
        const locations = await directus.request(readItems('locations_cities', {
            filter: locationFilter,
            limit: batchSchedule.length,
            offset: startIndex
        })) as any[];

        // Get recipe
        const recipe = campaign.content_recipe || ['intro', 'benefits', 'howto', 'conclusion'];

        let generated = 0;
        const errors: string[] = [];

        for (let i = 0; i < batchSchedule.length; i++) {
            const schedule = batchSchedule[i];
            const location = locations[i] || locations[i % locations.length];

            if (!location) continue;

            try {
                const pubDate = new Date(schedule.publish_date);
                const modDate = new Date(schedule.modified_date);

                const context = {
                    city: location.city || location.name || '',
                    state: location.state || '',
                    county: location.county || '',
                    state_code: getStateCode(location.state) || ''
                };

                // Assemble content from modules
                const { content, modulesUsed } = await assembleFromModules(
                    directus, campaign.site, recipe, context, pubDate
                );

                // Generate headline
                const headline = generateHeadline(campaign.spintax_title, context, pubDate) ||
                    `${context.city} ${campaign.name || 'Guide'}`;

                const wordCount = content.replace(/<[^>]*>/g, ' ').split(/\s+/).length;

                // Create article
                await directus.request(
                    createItem('generated_articles', {
                        site: queue.site,
                        campaign: campaign.id,
                        headline: headline,
                        meta_title: headline.substring(0, 60),
                        meta_description: content.replace(/<[^>]*>/g, ' ').substring(0, 155) + '...',
                        full_html_body: content,
                        word_count: wordCount,
                        is_published: true, // Ghost published
                        is_test_batch: false,
                        date_published: pubDate.toISOString(),
                        date_modified: modDate.toISOString(),
                        sitemap_status: 'ghost',
                        location_city: context.city,
                        location_county: context.county,
                        location_state: context.state,
                        modules_used: modulesUsed
                    })
                );

                generated++;
            } catch (err: any) {
                errors.push(`Article ${i}: ${err.message}`);
            }
        }

        // Update queue progress
        const newCompleted = startIndex + generated;
        const isComplete = newCompleted >= scheduleData.length;

        await directus.request(
            updateItem('production_queue', queue_id, {
                completed_count: newCompleted,
                status: isComplete ? 'done' : 'running',
                completed_at: isComplete ? new Date().toISOString() : null,
                error_log: errors.length > 0 ? errors.join('\n') : null
            })
        );

        // Update site factory status
        await directus.request(
            updateItem('sites', queue.site, {
                factory_status: isComplete ? 'publishing' : 'generating'
            })
        );

        // Log work
        await directus.request(
            createItem('work_log', {
                site: queue.site,
                action: 'batch_generated',
                entity_type: 'production_queue',
                entity_id: queue_id,
                details: {
                    generated,
                    errors: errors.length,
                    progress: `${newCompleted}/${scheduleData.length}`
                }
            })
        );

        return new Response(
            JSON.stringify({
                success: true,
                generated,
                errors: errors.length,
                progress: {
                    completed: newCompleted,
                    total: scheduleData.length,
                    percent: Math.round((newCompleted / scheduleData.length) * 100)
                },
                status: isComplete ? 'done' : 'running',
                next_step: isComplete
                    ? 'Queue complete! Run sitemap-drip cron to start indexing.'
                    : 'Call process-queue again to continue.'
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error processing queue:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to process queue' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};

async function assembleFromModules(
    directus: any,
    siteId: string,
    recipe: string[],
    context: any,
    pubDate: Date
): Promise<{ content: string; modulesUsed: string[] }> {
    const parts: string[] = [];
    const modulesUsed: string[] = [];

    for (const moduleType of recipe) {
        const modules = await directus.request(readItems('content_modules', {
            filter: {
                site: { _eq: siteId },
                module_type: { _eq: moduleType },
                is_active: { _eq: true }
            },
            sort: ['usage_count'],
            limit: 1
        })) as any[];

        if (modules.length > 0) {
            const mod = modules[0];
            let content = mod.content_spintax || '';

            // Replace tokens
            content = content
                .replace(/\{City\}/gi, context.city)
                .replace(/\{State\}/gi, context.state)
                .replace(/\{County\}/gi, context.county)
                .replace(/\{State_Code\}/gi, context.state_code);

            content = replaceYearTokens(content, pubDate);
            content = processSpintax(content);

            parts.push(content);
            modulesUsed.push(mod.id);

            // Increment usage
            await directus.request(updateItem('content_modules', mod.id, {
                usage_count: (mod.usage_count || 0) + 1
            }));
        }
    }

    return { content: parts.join('\n\n'), modulesUsed };
}

function processSpintax(text: string): string {
    let result = text;
    let iterations = 100;
    while (result.includes('{') && iterations > 0) {
        result = result.replace(/\{([^{}]+)\}/g, (_, opts) => {
            const choices = opts.split('|');
            return choices[Math.floor(Math.random() * choices.length)];
        });
        iterations--;
    }
    return result;
}

function generateHeadline(template: string | null, context: any, date: Date): string {
    if (!template) return '';
    let h = template
        .replace(/\{City\}/gi, context.city)
        .replace(/\{State\}/gi, context.state);
    h = replaceYearTokens(h, date);
    return processSpintax(h);
}

function getStateCode(state: string): string {
    const codes: Record<string, string> = {
        'Florida': 'FL', 'Texas': 'TX', 'California': 'CA', 'New York': 'NY',
        'Arizona': 'AZ', 'Nevada': 'NV', 'Georgia': 'GA', 'North Carolina': 'NC'
    };
    return codes[state] || state?.substring(0, 2).toUpperCase() || '';
}
