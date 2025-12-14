// @ts-ignore - Astro types available at build time
import type { APIRoute } from 'astro';
import { getDirectusClient, readItem, readItems } from '@/lib/directus/client';

/**
 * Get Nearby API
 * 
 * Returns related articles in same county/state for "Nearby Locations" footer.
 * Only returns articles that are indexed (not ghost).
 * 
 * GET /api/seo/get-nearby?article_id={id}&limit=10
 */
export const GET: APIRoute = async ({ url }: { url: URL }) => {
    try {
        const articleId = url.searchParams.get('article_id');
        const limit = parseInt(url.searchParams.get('limit') || '10', 10);

        if (!articleId) {
            return new Response(
                JSON.stringify({ error: 'article_id is required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const directus = getDirectusClient();

        // Get the source article
        const article = await directus.request(readItem('generated_articles', articleId)) as any;

        if (!article) {
            return new Response(
                JSON.stringify({ error: 'Article not found' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const nearbyArticles: any[] = [];

        // Strategy 1: Find articles in same county (if article has county)
        if (article.location_county) {
            const countyArticles = await directus.request(readItems('generated_articles', {
                filter: {
                    site: { _eq: article.site },
                    location_county: { _eq: article.location_county },
                    id: { _neq: articleId },
                    sitemap_status: { _eq: 'indexed' }, // PATCH 3: Only indexed articles
                    is_published: { _eq: true }
                },
                sort: ['-date_published'],
                limit: limit,
                fields: ['id', 'headline', 'location_city', 'location_county', 'location_state']
            })) as any[];

            nearbyArticles.push(...countyArticles);
        }

        // Strategy 2: If not enough, find articles in same state
        if (nearbyArticles.length < limit && article.location_state) {
            const remaining = limit - nearbyArticles.length;
            const existingIds = [articleId, ...nearbyArticles.map(a => a.id)];

            const stateArticles = await directus.request(readItems('generated_articles', {
                filter: {
                    site: { _eq: article.site },
                    location_state: { _eq: article.location_state },
                    id: { _nin: existingIds },
                    sitemap_status: { _eq: 'indexed' },
                    is_published: { _eq: true }
                },
                sort: ['location_city'], // Alphabetical by city
                limit: remaining,
                fields: ['id', 'headline', 'location_city', 'location_county', 'location_state']
            })) as any[];

            nearbyArticles.push(...stateArticles);
        }

        // Get parent hub if exists
        let parentHub = null;
        if (article.parent_hub) {
            const hub = await directus.request(readItem('hub_pages', article.parent_hub)) as any;
            if (hub && hub.sitemap_status === 'indexed') {
                parentHub = {
                    id: hub.id,
                    title: hub.title_template,
                    slug: hub.slug_pattern,
                    level: hub.level
                };
            }
        }

        // Get state hub for breadcrumb
        let stateHub = null;
        if (article.location_state) {
            const hubs = await directus.request(readItems('hub_pages', {
                filter: {
                    site: { _eq: article.site },
                    level: { _eq: 'state' },
                    sitemap_status: { _eq: 'indexed' }
                },
                limit: 1
            })) as any[];

            if (hubs.length > 0) {
                stateHub = {
                    id: hubs[0].id,
                    title: hubs[0].title_template?.replace('{State}', article.location_state),
                    slug: hubs[0].slug_pattern?.replace('{state-slug}', slugify(article.location_state))
                };
            }
        }

        return new Response(
            JSON.stringify({
                success: true,
                article_id: articleId,
                location: {
                    city: article.location_city,
                    county: article.location_county,
                    state: article.location_state
                },
                nearby: nearbyArticles.map(a => ({
                    id: a.id,
                    headline: a.headline,
                    city: a.location_city,
                    county: a.location_county
                })),
                parent_hub: parentHub,
                state_hub: stateHub,
                breadcrumb: [
                    { name: 'Home', url: '/' },
                    stateHub ? { name: stateHub.title, url: stateHub.slug } : null,
                    parentHub ? { name: parentHub.title, url: parentHub.slug } : null,
                    { name: article.headline, url: null }
                ].filter(Boolean)
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error getting nearby:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to get nearby articles' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};

function slugify(str: string): string {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
