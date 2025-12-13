import type { APIRoute } from 'astro';
import { directus } from '@/lib/directus/client';
import { createItem, updateItem, readItems } from '@directus/sdk';

export const POST: APIRoute = async ({ request }) => {
    try {
        const { id, title, content } = await request.json();

        if (!title || !content) {
            return new Response(JSON.stringify({ error: 'Title and content are required' }), { status: 400 });
        }

        let result;
        if (id) {
            // Update existing
            result = await directus.request(updateItem('cartesian_patterns', id, {
                pattern_name: title,
                pattern_structure: content // Mapping to correct field
            }));
        } else {
            // Create new
            result = await directus.request(createItem('cartesian_patterns', {
                pattern_name: title,
                pattern_structure: content,
                structure_type: 'custom'
            }));
        }

        return new Response(JSON.stringify(result), { status: 200 });

    } catch (error) {
        console.error('Save error:', error);
        return new Response(JSON.stringify({ error: 'Failed to save template' }), { status: 500 });
    }
};

export const GET: APIRoute = async ({ request }) => {
    try {
        // Fetch all templates
        const templates = await directus.request(readItems('cartesian_patterns', {
            fields: ['id', 'pattern_name', 'pattern_structure', 'structure_type'],
            sort: ['-date_created']
        }));

        return new Response(JSON.stringify(templates), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch templates' }), { status: 500 });
    }
};
