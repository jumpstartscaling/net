import type { APIRoute } from 'astro';
import { getDirectusClient, readItems, createItem } from '@/lib/directus/client';

export const GET: APIRoute = async ({ locals }) => {
    try {
        const directus = getDirectusClient();
        const siteId = locals.siteId;

        const filter: Record<string, any> = {};
        if (siteId) {
            filter._or = [
                { site: { _eq: siteId } },
                { site: { _null: true } }
            ];
        }

        const campaigns = await directus.request(
            readItems('campaign_masters', {
                filter,
                sort: ['-date_created'],
                fields: ['id', 'name', 'headline_spintax_root', 'location_mode', 'status', 'date_created']
            })
        );

        return new Response(
            JSON.stringify({ campaigns }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error fetching campaigns:', error);
        return new Response(
            JSON.stringify({ campaigns: [], error: 'Failed to fetch campaigns' }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    }
};

export const POST: APIRoute = async ({ request, locals }) => {
    try {
        const data = await request.json();
        const siteId = locals.siteId;

        if (!data.name || !data.headline_spintax_root) {
            return new Response(
                JSON.stringify({ error: 'Name and headline spintax are required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const directus = getDirectusClient();

        let nicheVariables = {};
        if (data.niche_variables) {
            try {
                nicheVariables = JSON.parse(data.niche_variables);
            } catch { }
        }

        const campaign = await directus.request(
            createItem('campaign_masters', {
                site: siteId,
                name: data.name,
                headline_spintax_root: data.headline_spintax_root,
                niche_variables: nicheVariables,
                location_mode: data.location_mode || 'none',
                status: 'active'
            })
        );

        return new Response(
            JSON.stringify({ success: true, campaign }),
            { status: 201, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error creating campaign:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to create campaign' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
