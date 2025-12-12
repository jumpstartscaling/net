
import type { APIRoute } from 'astro';
import { getDirectusClient, readItem, readItems } from '@/lib/directus/client';
import { CartesianEngine } from '@/lib/cartesian/CartesianEngine';

export const POST: APIRoute = async ({ request }) => {
    try {
        const { siteId, avatarId, niche, cityId, templateId } = await request.json();

        const client = getDirectusClient();
        const engine = new CartesianEngine(client);

        // Fetch Context Data
        const [site, avatar, city, template] = await Promise.all([
            client.request(readItem('sites', siteId)),
            client.request(readItem('avatars', avatarId)),
            client.request(readItem('geo_locations', cityId)), // Assuming cityId provided
            client.request(readItem('article_templates', templateId))
        ]);

        const context = {
            avatar,
            niche: niche || avatar.business_niches[0], // fallback
            city,
            site,
            template
        };

        const article = await engine.generateArticle(context);

        return new Response(JSON.stringify(article), { status: 200 });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
