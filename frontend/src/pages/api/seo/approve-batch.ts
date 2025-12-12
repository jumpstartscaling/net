// @ts-ignore - Astro types available at build time
import type { APIRoute } from 'astro';
import { getDirectusClient, readItem, updateItem, createItem } from '@/lib/directus/client';

/**
 * Approve Batch API
 * 
 * Approves test batch and unlocks full production run.
 * 
 * POST /api/seo/approve-batch
 */
export const POST: APIRoute = async ({ request }: { request: Request }) => {
    try {
        const data = await request.json();
        const { queue_id, approved = true } = data;

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

        if (queue.status !== 'test_batch') {
            return new Response(
                JSON.stringify({ error: 'Queue is not in test_batch status' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const newStatus = approved ? 'approved' : 'pending';

        // Update queue
        await directus.request(
            updateItem('production_queue', queue_id, {
                status: newStatus
            })
        );

        // Update campaign
        await directus.request(
            updateItem('campaign_masters', queue.campaign, {
                test_batch_status: approved ? 'approved' : 'rejected'
            })
        );

        // Log work
        await directus.request(
            createItem('work_log', {
                site: queue.site,
                action: approved ? 'approved' : 'rejected',
                entity_type: 'production_queue',
                entity_id: queue_id,
                details: { approved }
            })
        );

        return new Response(
            JSON.stringify({
                success: true,
                queue_id,
                status: newStatus,
                next_step: approved
                    ? 'Queue approved. Call /api/seo/process-queue to start full generation.'
                    : 'Queue rejected. Modify campaign and resubmit test batch.'
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error approving batch:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to approve batch' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
