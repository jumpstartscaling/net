// @ts-ignore - Astro types available at build time
import type { APIRoute } from 'astro';
import { getDirectusClient, readItem, readItems, createItem, updateItem } from '@/lib/directus/client';
import { generateFeaturedImage } from '@/lib/seo/image-generator';

/**
 * Publish Article to Site API
 * 
 * Takes a generated article from the SEO engine and creates a post on the target site.
 * 
 * POST /api/seo/publish-article
 */
export const POST: APIRoute = async ({ request }: { request: Request }) => {
    try {
        const data = await request.json();
        const { article_id, site_id, status = 'draft' } = data;

        if (!article_id) {
            return new Response(
                JSON.stringify({ error: 'article_id is required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const directus = getDirectusClient();

        // Get the generated article
        const article = await directus.request(
            readItem('generated_articles', article_id)
        ) as any;

        if (!article) {
            return new Response(
                JSON.stringify({ error: 'Article not found' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Check if already published
        if (article.published_to_post) {
            return new Response(
                JSON.stringify({
                    error: 'Article already published',
                    post_id: article.published_to_post
                }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Use provided site_id or fall back to article's site
        const targetSiteId = site_id || article.site;

        // Generate slug from headline
        const slug = article.headline
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 100);

        // Create the post
        const post = await directus.request(
            createItem('posts', {
                site: targetSiteId,
                title: article.headline,
                slug: slug,
                status: status, // 'draft' or 'published'
                content: article.full_html_body,
                excerpt: article.meta_description,
                meta_title: article.meta_title,
                meta_description: article.meta_description,
                featured_image_alt: article.featured_image_alt,
                source: 'seo_engine',
                source_article_id: article_id,
                robots: 'index,follow',
                schema_type: 'BlogPosting',
                // Location data for local SEO
                meta_keywords: [
                    article.location_city,
                    article.location_state
                ].filter(Boolean).join(', ')
            })
        ) as any;

        // Update the generated article with publish info
        await directus.request(
            updateItem('generated_articles', article_id, {
                publish_status: status === 'published' ? 'published' : 'ready',
                published_to_post: post.id,
                published_at: new Date().toISOString(),
                published_url: `/${slug}`
            })
        );

        return new Response(
            JSON.stringify({
                success: true,
                post_id: post.id,
                slug: slug,
                status: status,
                message: `Article published as ${status} post`
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error publishing article:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to publish article' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};

/**
 * Bulk publish multiple articles
 * 
 * POST /api/seo/publish-article with { article_ids: [...] }
 */
export const PUT: APIRoute = async ({ request }: { request: Request }) => {
    try {
        const data = await request.json();
        const { article_ids, site_id, status = 'draft' } = data;

        if (!article_ids || !Array.isArray(article_ids) || article_ids.length === 0) {
            return new Response(
                JSON.stringify({ error: 'article_ids array is required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const directus = getDirectusClient();
        const results: { article_id: string; post_id?: string; error?: string }[] = [];

        for (const articleId of article_ids) {
            try {
                const article = await directus.request(
                    readItem('generated_articles', articleId)
                ) as any;

                if (!article || article.published_to_post) {
                    results.push({ article_id: articleId, error: 'Already published or not found' });
                    continue;
                }

                const targetSiteId = site_id || article.site;
                const slug = article.headline
                    .toLowerCase()
                    .replace(/[^a-z0-9\s-]/g, '')
                    .replace(/\s+/g, '-')
                    .substring(0, 100);

                const post = await directus.request(
                    createItem('posts', {
                        site: targetSiteId,
                        title: article.headline,
                        slug: slug,
                        status: status,
                        content: article.full_html_body,
                        excerpt: article.meta_description,
                        meta_title: article.meta_title,
                        meta_description: article.meta_description,
                        source: 'seo_engine',
                        source_article_id: articleId
                    })
                ) as any;

                await directus.request(
                    updateItem('generated_articles', articleId, {
                        publish_status: 'published',
                        published_to_post: post.id,
                        published_at: new Date().toISOString()
                    })
                );

                results.push({ article_id: articleId, post_id: post.id });
            } catch (err) {
                results.push({ article_id: articleId, error: 'Failed to publish' });
            }
        }

        const successCount = results.filter(r => r.post_id).length;

        return new Response(
            JSON.stringify({
                success: true,
                published: successCount,
                total: article_ids.length,
                results
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error bulk publishing:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to bulk publish' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
