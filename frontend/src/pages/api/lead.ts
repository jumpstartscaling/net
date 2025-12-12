import type { APIRoute } from 'astro';
import { getDirectusClient, createItem } from '@/lib/directus/client';

export const POST: APIRoute = async ({ request, locals }) => {
    try {
        const data = await request.json();
        const siteId = locals.siteId;

        if (!data.email) {
            return new Response(
                JSON.stringify({ error: 'Email is required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const directus = getDirectusClient();

        await directus.request(
            createItem('leads', {
                site: siteId,
                name: data.name || '',
                email: data.email,
                phone: data.phone || '',
                message: data.message || '',
                source: data.source || 'website'
            })
        );

        return new Response(
            JSON.stringify({ success: true }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Lead submission error:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to submit lead' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
