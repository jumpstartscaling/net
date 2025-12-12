// @ts-ignore
import type { APIRoute } from 'astro';
import { getDirectusClient, readItems } from '@/lib/directus/client';

/**
 * Admin Queues API
 * Returns all production queue items for dashboard.
 * 
 * GET /api/admin/queues
 */
export const GET: APIRoute = async () => {
    try {
        const directus = getDirectusClient();

        const queues = await directus.request(readItems('production_queue', {
            fields: ['id', 'status', 'total_requested', 'completed_count', 'velocity_mode', 'date_created', 'campaign.name'],
            sort: ['-date_created'],
            limit: 50
        })) as any[];

        const formatted = queues.map(q => ({
            id: q.id,
            status: q.status,
            total_requested: q.total_requested,
            completed_count: q.completed_count,
            velocity_mode: q.velocity_mode,
            date_created: q.date_created,
            campaign_name: q.campaign?.name || 'Unknown',
            progress: q.total_requested > 0
                ? Math.round((q.completed_count / q.total_requested) * 100)
                : 0
        }));

        return new Response(
            JSON.stringify({ success: true, queues: formatted }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error getting queues:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to get queues', queues: [] }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
