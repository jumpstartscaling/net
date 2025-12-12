
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
    try {
        const { avatars, niches, cities, patterns } = await request.json();

        const count = (avatars?.length || 0) * (niches?.length || 0) * (cities?.length || 0) * (patterns?.length || 0);

        return new Response(JSON.stringify({ count }), { status: 200 });
    } catch (e) {
        return new Response(JSON.stringify({ count: 0 }), { status: 500 });
    }
}
