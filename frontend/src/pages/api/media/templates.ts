import type { APIRoute } from 'astro';
import { getDirectusClient, readItems, createItem, updateItem } from '@/lib/directus/client';

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

        const templates = await directus.request(
            readItems('image_templates', {
                filter,
                sort: ['-is_default', 'name'],
                fields: ['id', 'name', 'svg_source', 'is_default', 'preview']
            })
        );

        return new Response(
            JSON.stringify({ templates }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error fetching templates:', error);
        return new Response(
            JSON.stringify({ templates: [], error: 'Failed to fetch templates' }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    }
};

export const POST: APIRoute = async ({ request, locals }) => {
    try {
        const data = await request.json();
        const siteId = locals.siteId;

        if (!data.name || !data.svg_source) {
            return new Response(
                JSON.stringify({ error: 'Name and SVG source are required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const directus = getDirectusClient();

        const template = await directus.request(
            createItem('image_templates', {
                site: siteId,
                name: data.name,
                svg_source: data.svg_source,
                is_default: false
            })
        );

        return new Response(
            JSON.stringify({ success: true, template }),
            { status: 201, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error creating template:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to create template' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
