import type { APIRoute } from 'astro';
import { getDirectusClient, readItems } from '@/lib/directus/client';

export const GET: APIRoute = async ({ locals }) => {
    try {
        const directus = getDirectusClient();
        const siteId = locals.siteId;

        const filter: Record<string, any> = {};
        if (siteId) {
            filter.site = { _eq: siteId };
        }

        const articles = await directus.request(
            readItems('generated_articles', {
                filter,
                sort: ['-date_created'],
                limit: 100,
                fields: [
                    'id',
                    'headline',
                    'meta_title',
                    'word_count',
                    'is_published',
                    'location_city',
                    'location_state',
                    'date_created'
                ]
            })
        );

        return new Response(
            JSON.stringify({ articles }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error fetching articles:', error);
        return new Response(
            JSON.stringify({ articles: [], error: 'Failed to fetch articles' }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
