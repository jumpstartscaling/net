import type { APIRoute } from 'astro';
import { getDirectusClient, readItems } from '@/lib/directus/client';

export const GET: APIRoute = async ({ url }) => {
    try {
        const stateId = url.searchParams.get('state');

        if (!stateId) {
            return new Response(
                JSON.stringify({ error: 'State ID is required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const directus = getDirectusClient();

        const counties = await directus.request(
            readItems('locations_counties', {
                filter: { state: { _eq: stateId } },
                sort: ['name'],
                fields: ['id', 'name', 'fips_code', 'population']
            })
        );

        return new Response(
            JSON.stringify({ counties }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error fetching counties:', error);
        return new Response(
            JSON.stringify({ counties: [], error: 'Failed to fetch counties' }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
