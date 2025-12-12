// @ts-ignore
import type { APIRoute } from 'astro';
import { getDirectusClient, readItems, readItem } from '@/lib/directus/client';

/**
 * SEO Stats API
 * Returns article counts by status for dashboard KPIs.
 * 
 * GET /api/seo/stats?site_id={id}
 */
export const GET: APIRoute = async ({ url }: { url: URL }) => {
    try {
        const siteId = url.searchParams.get('site_id');
        const directus = getDirectusClient();

        // Build filter
        const filter: any = {};
        if (siteId) {
            filter.site = { _eq: siteId };
        }

        // Get all articles
        const articles = await directus.request(readItems('generated_articles', {
            filter,
            fields: ['id', 'sitemap_status', 'is_published'],
            limit: -1
        })) as any[];

        const total = articles.length;
        const ghost = articles.filter(a => a.sitemap_status === 'ghost').length;
        const indexed = articles.filter(a => a.sitemap_status === 'indexed').length;
        const queued = articles.filter(a => a.sitemap_status === 'queued').length;
        const published = articles.filter(a => a.is_published).length;
        const draft = articles.filter(a => !a.is_published).length;

        return new Response(
            JSON.stringify({
                success: true,
                total,
                ghost,
                indexed,
                queued,
                published,
                draft,
                breakdown: {
                    sitemap: { ghost, indexed, queued },
                    publish: { published, draft }
                }
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error getting stats:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to get stats', total: 0, ghost: 0, indexed: 0 }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
