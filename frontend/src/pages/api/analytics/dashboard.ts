// @ts-ignore - Astro types available at build time
import type { APIRoute } from 'astro';
import { getDirectusClient, readItems } from '@/lib/directus/client';

/**
 * Analytics Dashboard API
 * 
 * Returns analytics data for a site.
 * 
 * GET /api/analytics/dashboard?site_id={id}&period=7d
 */
export const GET: APIRoute = async ({ url }: { url: URL }) => {
    try {
        const siteId = url.searchParams.get('site_id');
        const period = url.searchParams.get('period') || '7d'; // 7d, 30d, 90d

        if (!siteId) {
            return new Response(
                JSON.stringify({ error: 'site_id is required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Calculate date range
        const periodDays = parseInt(period) || 7;
        const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString();

        const directus = getDirectusClient();

        // Parallel data fetches
        const [
            totalPageviews,
            uniqueVisitors,
            botPageviews,
            topPages,
            topReferrers,
            deviceBreakdown,
            browserBreakdown,
            utmSources,
            recentEvents,
            conversions
        ] = await Promise.all([
            // Total pageviews
            directus.request(readItems('pageviews', {
                filter: { site: { _eq: siteId }, timestamp: { _gte: startDate }, is_bot: { _eq: false } },
                aggregate: { count: '*' }
            })),
            // Unique visitors
            directus.request(readItems('pageviews', {
                filter: { site: { _eq: siteId }, timestamp: { _gte: startDate }, is_bot: { _eq: false } },
                groupBy: ['visitor_id'],
                aggregate: { count: '*' }
            })),
            // Bot pageviews
            directus.request(readItems('pageviews', {
                filter: { site: { _eq: siteId }, timestamp: { _gte: startDate }, is_bot: { _eq: true } },
                aggregate: { count: '*' }
            })),
            // Top pages
            directus.request(readItems('pageviews', {
                filter: { site: { _eq: siteId }, timestamp: { _gte: startDate }, is_bot: { _eq: false } },
                groupBy: ['page_path'],
                aggregate: { count: '*' },
                sort: ['-count'],
                limit: 10
            })),
            // Top referrers
            directus.request(readItems('pageviews', {
                filter: { site: { _eq: siteId }, timestamp: { _gte: startDate }, is_bot: { _eq: false }, referrer: { _nnull: true } },
                groupBy: ['referrer'],
                aggregate: { count: '*' },
                sort: ['-count'],
                limit: 10
            })),
            // Device breakdown
            directus.request(readItems('pageviews', {
                filter: { site: { _eq: siteId }, timestamp: { _gte: startDate }, is_bot: { _eq: false } },
                groupBy: ['device_type'],
                aggregate: { count: '*' }
            })),
            // Browser breakdown
            directus.request(readItems('pageviews', {
                filter: { site: { _eq: siteId }, timestamp: { _gte: startDate }, is_bot: { _eq: false } },
                groupBy: ['browser'],
                aggregate: { count: '*' }
            })),
            // UTM sources
            directus.request(readItems('pageviews', {
                filter: { site: { _eq: siteId }, timestamp: { _gte: startDate }, utm_source: { _nnull: true } },
                groupBy: ['utm_source', 'utm_medium', 'utm_campaign'],
                aggregate: { count: '*' },
                sort: ['-count'],
                limit: 10
            })),
            // Recent events
            directus.request(readItems('events', {
                filter: { site: { _eq: siteId }, timestamp: { _gte: startDate } },
                groupBy: ['event_name'],
                aggregate: { count: '*' },
                sort: ['-count'],
                limit: 10
            })),
            // Conversions
            directus.request(readItems('conversions', {
                filter: { site: { _eq: siteId }, timestamp: { _gte: startDate } },
                aggregate: { count: '*', sum: 'value' }
            }))
        ]);

        const dashboard = {
            period,
            period_days: periodDays,
            overview: {
                total_pageviews: parseInt((totalPageviews as any)?.[0]?.count || '0', 10),
                unique_visitors: (uniqueVisitors as any[])?.length || 0,
                bot_pageviews: parseInt((botPageviews as any)?.[0]?.count || '0', 10),
                total_conversions: parseInt((conversions as any)?.[0]?.count || '0', 10),
                total_revenue: parseFloat((conversions as any)?.[0]?.sum?.value || '0')
            },
            top_pages: (topPages as any[]).map(p => ({ path: p.page_path, views: parseInt(p.count, 10) })),
            top_referrers: (topReferrers as any[]).map(r => ({ referrer: r.referrer, views: parseInt(r.count, 10) })),
            devices: (deviceBreakdown as any[]).reduce((acc, d) => {
                acc[d.device_type] = parseInt(d.count, 10);
                return acc;
            }, {} as Record<string, number>),
            browsers: (browserBreakdown as any[]).reduce((acc, b) => {
                acc[b.browser] = parseInt(b.count, 10);
                return acc;
            }, {} as Record<string, number>),
            utm_sources: (utmSources as any[]).map(u => ({
                source: u.utm_source,
                medium: u.utm_medium,
                campaign: u.utm_campaign,
                visits: parseInt(u.count, 10)
            })),
            top_events: (recentEvents as any[]).map(e => ({ name: e.event_name, count: parseInt(e.count, 10) }))
        };

        return new Response(
            JSON.stringify(dashboard),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error fetching analytics:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to fetch analytics' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
