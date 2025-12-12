import type { APIRoute } from 'astro';
import { getDirectusClient, readItems } from '@/lib/directus/client';

export const GET: APIRoute = async () => {
    try {
        const directus = getDirectusClient();

        const states = await directus.request(
            readItems('locations_states', {
                sort: ['name'],
                fields: ['id', 'name', 'code']
            })
        );

        return new Response(
            JSON.stringify({ states }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error fetching states:', error);
        return new Response(
            JSON.stringify({ states: [], error: 'Failed to fetch states' }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
