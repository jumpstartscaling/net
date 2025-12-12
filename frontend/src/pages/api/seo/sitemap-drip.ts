// @ts-ignore - Astro types available at build time
import type { APIRoute } from 'astro';
import { getDirectusClient, readItems, updateItem, createItem } from '@/lib/directus/client';

/**
 * Sitemap Drip API (Cron Job)
 * 
 * Processes ghost articles and adds them to sitemap at controlled rate.
 * Should be called daily by a cron job.
 * 
 * GET /api/seo/sitemap-drip?site_id={id}
 */
export const GET: APIRoute = async ({ url }: { url: URL }) => {
    try {
        const siteId = url.searchParams.get('site_id');

        if (!siteId) {
            return new Response(
                JSON.stringify({ error: 'site_id is required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const directus = getDirectusClient();

        // Get site drip rate
        const sites = await directus.request(readItems('sites', {
            filter: { id: { _eq: siteId } },
            limit: 1
        })) as any[];

        const site = sites[0];
        const dripRate = site?.sitemap_drip_rate || 50;

        // Get ghost articles sorted by priority (hubs first) then date
        const ghostArticles = await directus.request(readItems('generated_articles', {
            filter: {
                site: { _eq: siteId },
                sitemap_status: { _eq: 'ghost' },
                is_published: { _eq: true }
            },
            sort: ['-date_published'], // Newest first within ghosts
            limit: dripRate
        })) as any[];

        if (ghostArticles.length === 0) {
            return new Response(
                JSON.stringify({
                    success: true,
                    message: 'No ghost articles to index',
                    indexed: 0
                }),
                { status: 200, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Update to indexed
        const indexedIds: string[] = [];
        for (const article of ghostArticles) {
            await directus.request(
                updateItem('generated_articles', article.id, {
                    sitemap_status: 'indexed'
                })
            );
            indexedIds.push(article.id);
        }

        // Also check hub pages
        const ghostHubs = await directus.request(readItems('hub_pages', {
            filter: {
                site: { _eq: siteId },
                sitemap_status: { _eq: 'ghost' }
            },
            limit: 10 // Hubs get priority
        })) as any[];

        for (const hub of ghostHubs) {
            await directus.request(
                updateItem('hub_pages', hub.id, {
                    sitemap_status: 'indexed'
                })
            );
            indexedIds.push(hub.id);
        }

        // Log work
        await directus.request(
            createItem('work_log', {
                site: siteId,
                action: 'sitemap_drip',
                entity_type: 'batch',
                entity_id: null,
                details: {
                    articles_indexed: ghostArticles.length,
                    hubs_indexed: ghostHubs.length,
                    ids: indexedIds
                }
            })
        );

        // Update site factory status
        await directus.request(
            updateItem('sites', siteId, {
                factory_status: 'dripping'
            })
        );

        return new Response(
            JSON.stringify({
                success: true,
                articles_indexed: ghostArticles.length,
                hubs_indexed: ghostHubs.length,
                total_indexed: indexedIds.length,
                drip_rate: dripRate,
                message: `Added ${indexedIds.length} URLs to sitemap`
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error in sitemap drip:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to process sitemap drip' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
