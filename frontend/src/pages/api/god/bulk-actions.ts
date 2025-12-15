import type { APIRoute } from 'astro';
import { getDirectusClient, updateItem, deleteItem } from '@/lib/directus/client';

/**
 * God Mode Bulk Actions
 * 
 * Perform bulk operations on multiple items
 */
export const POST: APIRoute = async ({ request }) => {
    try {
        const { action, collection, ids, options } = await request.json();

        if (!action || !collection || !ids || ids.length === 0) {
            return new Response(JSON.stringify({
                error: 'action, collection, and ids are required'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const directus = getDirectusClient();
        const results = {
            success: 0,
            failed: 0,
            errors: [] as any[]
        };

        switch (action) {
            case 'publish':
                for (const id of ids) {
                    try {
                        await directus.request(updateItem(collection, id, {
                            status: 'published',
                            published_at: new Date().toISOString()
                        }));
                        results.success++;
                    } catch (error: any) {
                        results.failed++;
                        results.errors.push({ id, error: error.message });
                    }
                }
                break;

            case 'unpublish':
            case 'draft':
                for (const id of ids) {
                    try {
                        await directus.request(updateItem(collection, id, {
                            status: 'draft'
                        }));
                        results.success++;
                    } catch (error: any) {
                        results.failed++;
                        results.errors.push({ id, error: error.message });
                    }
                }
                break;

            case 'archive':
                for (const id of ids) {
                    try {
                        await directus.request(updateItem(collection, id, {
                            status: 'archived'
                        }));
                        results.success++;
                    } catch (error: any) {
                        results.failed++;
                        results.errors.push({ id, error: error.message });
                    }
                }
                break;

            case 'delete':
                for (const id of ids) {
                    try {
                        await directus.request(deleteItem(collection, id));
                        results.success++;
                    } catch (error: any) {
                        results.failed++;
                        results.errors.push({ id, error: error.message });
                    }
                }
                break;

            case 'update':
                // Custom update with fields from options
                if (!options?.fields) {
                    return new Response(JSON.stringify({
                        error: 'options.fields required for update action'
                    }), {
                        status: 400,
                        headers: { 'Content-Type': 'application/json' }
                    });
                }

                for (const id of ids) {
                    try {
                        await directus.request(updateItem(collection, id, options.fields));
                        results.success++;
                    } catch (error: any) {
                        results.failed++;
                        results.errors.push({ id, error: error.message });
                    }
                }
                break;

            default:
                return new Response(JSON.stringify({
                    error: `Unknown action: ${action}`
                }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
        }

        return new Response(JSON.stringify({
            success: true,
            action,
            collection,
            total: ids.length,
            results
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error: any) {
        console.error('Bulk action error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
