// @ts-ignore
import type { APIRoute } from 'astro';
import { getDirectusClient, readItems } from '@/lib/directus/client';

/**
 * Admin Campaigns API
 * Returns all campaigns with article counts for dashboard.
 * 
 * GET /api/admin/campaigns
 */
export const GET: APIRoute = async () => {
    try {
        const directus = getDirectusClient();

        const campaigns = await directus.request(readItems('campaign_masters', {
            fields: ['id', 'name', 'site', 'velocity_mode', 'test_batch_status', 'target_article_count', 'date_created'],
            sort: ['-date_created'],
            limit: 50
        })) as any[];

        // Get article counts per campaign
        const enriched = await Promise.all(campaigns.map(async (c) => {
            const articles = await directus.request(readItems('generated_articles', {
                filter: { campaign: { _eq: c.id } },
                aggregate: { count: ['id'] }
            })) as any[];

            return {
                id: c.id,
                name: c.name,
                site: c.site,
                velocity_mode: c.velocity_mode,
                test_batch_status: c.test_batch_status,
                target_count: c.target_article_count,
                article_count: articles[0]?.count?.id || 0,
                date_created: c.date_created
            };
        }));

        return new Response(
            JSON.stringify({ success: true, campaigns: enriched }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error getting campaigns:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to get campaigns', campaigns: [] }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
