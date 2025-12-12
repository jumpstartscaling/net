import type { APIRoute } from 'astro';
import { getDirectusClient, readItems } from '@/lib/directus/client';

export const GET: APIRoute = async ({ url }) => {
    try {
        const countyId = url.searchParams.get('county');

        if (!countyId) {
            return new Response(
                JSON.stringify({ error: 'County ID is required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const directus = getDirectusClient();

        const cities = await directus.request(
            readItems('locations_cities', {
                filter: { county: { _eq: countyId } },
                sort: ['-population'],
                limit: 50,
                fields: ['id', 'name', 'population', 'lat', 'lng', 'postal_code']
            })
        );

        return new Response(
            JSON.stringify({ cities }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error fetching cities:', error);
        return new Response(
            JSON.stringify({ cities: [], error: 'Failed to fetch cities' }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
