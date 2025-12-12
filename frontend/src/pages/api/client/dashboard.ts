// @ts-ignore - Astro types available at build time
import type { APIRoute } from 'astro';
import { getDirectusClient, readItems, aggregate } from '@/lib/directus/client';

/**
 * Client Dashboard API
 * 
 * Returns stats and recent leads for a client's site.
 * Used by the client portal.
 * 
 * GET /api/client/dashboard?site_id={id}
 */
export const GET: APIRoute = async ({ url }) => {
    try {
        const siteId = url.searchParams.get('site_id');

        if (!siteId) {
            return new Response(
                JSON.stringify({ error: 'site_id is required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const directus = getDirectusClient();

        // Get lead stats
        const [totalLeads, newLeads, convertedLeads, recentLeads, leadsByStatus] = await Promise.all([
            // Total leads count
            directus.request(
                readItems('leads', {
                    filter: { site: { _eq: siteId } },
                    aggregate: { count: '*' }
                })
            ),
            // New leads (last 7 days)
            directus.request(
                readItems('leads', {
                    filter: {
                        site: { _eq: siteId },
                        date_created: { _gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() }
                    },
                    aggregate: { count: '*' }
                })
            ),
            // Converted leads
            directus.request(
                readItems('leads', {
                    filter: {
                        site: { _eq: siteId },
                        status: { _eq: 'converted' }
                    },
                    aggregate: { count: '*' }
                })
            ),
            // Recent leads (last 10)
            directus.request(
                readItems('leads', {
                    filter: { site: { _eq: siteId } },
                    sort: ['-date_created'],
                    limit: 10,
                    fields: ['id', 'name', 'email', 'phone', 'source', 'status', 'date_created']
                })
            ),
            // Leads grouped by status
            directus.request(
                readItems('leads', {
                    filter: { site: { _eq: siteId } },
                    groupBy: ['status'],
                    aggregate: { count: '*' }
                })
            )
        ]);

        // Calculate total value
        const valueData = await directus.request(
            readItems('leads', {
                filter: {
                    site: { _eq: siteId },
                    status: { _eq: 'converted' }
                },
                aggregate: { sum: 'value' }
            })
        );

        const stats = {
            total_leads: parseInt((totalLeads as any)?.[0]?.count || '0', 10),
            new_leads_7_days: parseInt((newLeads as any)?.[0]?.count || '0', 10),
            converted_leads: parseInt((convertedLeads as any)?.[0]?.count || '0', 10),
            total_value: parseFloat((valueData as any)?.[0]?.sum?.value || '0'),
            leads_by_status: (leadsByStatus as any[]).reduce((acc, item) => {
                acc[item.status] = parseInt(item.count, 10);
                return acc;
            }, {} as Record<string, number>)
        };

        return new Response(
            JSON.stringify({
                stats,
                recent_leads: recentLeads,
                export_url: `/api/leads/export?site_id=${siteId}`
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    } catch (error) {
        console.error('Error fetching dashboard:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to fetch dashboard data' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
