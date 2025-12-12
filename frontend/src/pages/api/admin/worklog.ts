// @ts-ignore
import type { APIRoute } from 'astro';
import { getDirectusClient, readItems } from '@/lib/directus/client';

/**
 * Admin Work Log API
 * Returns recent work log entries for terminal view.
 * 
 * GET /api/admin/worklog?site_id={id}&limit=100
 */
export const GET: APIRoute = async ({ url }: { url: URL }) => {
    try {
        const siteId = url.searchParams.get('site_id');
        const limit = parseInt(url.searchParams.get('limit') || '100', 10);

        const directus = getDirectusClient();

        const filter: any = {};
        if (siteId) {
            filter.site = { _eq: siteId };
        }

        const logs = await directus.request(readItems('work_log', {
            filter,
            sort: ['-date_created'],
            limit,
            fields: ['id', 'action', 'entity_type', 'entity_id', 'details', 'date_created']
        })) as any[];

        const formatted = logs.map(log => {
            const time = new Date(log.date_created).toLocaleTimeString();
            const action = log.action?.toUpperCase() || 'ACTION';
            const details = typeof log.details === 'object'
                ? JSON.stringify(log.details)
                : log.details || '';

            return {
                id: log.id,
                timestamp: log.date_created,
                formatted: `[${time}] [${action}] ${log.entity_type}: ${details}`,
                type: getLogType(log.action)
            };
        });

        return new Response(
            JSON.stringify({ success: true, logs: formatted }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error getting work log:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to get work log', logs: [] }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};

function getLogType(action: string): string {
    const errorActions = ['failed', 'error', 'rejected'];
    const warnActions = ['collision', 'duplicate', 'warning'];
    const successActions = ['done', 'approved', 'indexed', 'published', 'generated'];

    if (errorActions.some(a => action?.includes(a))) return 'error';
    if (warnActions.some(a => action?.includes(a))) return 'warning';
    if (successActions.some(a => action?.includes(a))) return 'system';
    return 'info';
}
