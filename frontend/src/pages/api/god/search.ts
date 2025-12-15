import type { APIRoute } from 'astro';
import { getDirectusClient, readItems } from '@/lib/directus/client';

/**
 * God Mode Unified Search
 * 
 * Searches across multiple collections with filters
 */
export const POST: APIRoute = async ({ request }) => {
    try {
        const { query, collections, filters, limit = 100 } = await request.json();

        if (!collections || collections.length === 0) {
            return new Response(JSON.stringify({
                error: 'collections array is required'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const directus = getDirectusClient();
        const results: any[] = [];

        for (const collection of collections) {
            try {
                // Build filter
                const filter: any = {};

                // Add text search if query provided
                if (query) {
                    filter._or = [
                        { title: { _contains: query } },
                        { name: { _contains: query } },
                        { headline: { _contains: query } },
                        { content: { _contains: query } },
                        { slug: { _contains: query } }
                    ];
                }

                // Merge additional filters
                if (filters) {
                    Object.assign(filter, filters);
                }

                const items = await directus.request(readItems(collection, {
                    filter: Object.keys(filter).length > 0 ? filter : undefined,
                    limit: Math.min(limit, 100),
                    fields: ['*']
                }));

                // Add collection name to each item
                const itemsWithCollection = (items as any[]).map(item => ({
                    ...item,
                    _collection: collection
                }));

                results.push(...itemsWithCollection);
            } catch (error) {
                console.error(`Error searching ${collection}:`, error);
                // Continue with other collections
            }
        }

        return new Response(JSON.stringify({
            success: true,
            results,
            total: results.length,
            query,
            collections
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error: any) {
        console.error('Search error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
