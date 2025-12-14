// @ts-ignore - Astro types available at build time
import type { APIRoute } from 'astro';
import { getDirectusClient, readItem, readItems, updateItem, createItem } from '@/lib/directus/client';

/**
 * Insert Links API
 * 
 * Scans article content and inserts internal links based on link_targets rules.
 * Respects temporal linking (2023 articles can't link to 2025 articles).
 * 
 * POST /api/seo/insert-links
 */
export const POST: APIRoute = async ({ request }: { request: Request }) => {
    try {
        const data = await request.json();
        const { article_id, max_links = 5 } = data;

        if (!article_id) {
            return new Response(
                JSON.stringify({ error: 'article_id is required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const directus = getDirectusClient();

        // Get article
        const article = await directus.request(readItem('generated_articles', article_id)) as any;

        if (!article) {
            return new Response(
                JSON.stringify({ error: 'Article not found' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const articleDate = new Date(article.date_published);
        const articleModified = article.date_modified ? new Date(article.date_modified) : null;

        // Get link targets for this site, sorted by priority
        const linkTargets = await directus.request(readItems('link_targets', {
            filter: {
                site: { _eq: article.site },
                is_active: { _eq: true }
            },
            sort: ['-priority']
        })) as any[];

        if (linkTargets.length === 0) {
            return new Response(
                JSON.stringify({
                    success: true,
                    links_inserted: 0,
                    message: 'No link targets defined for this site'
                }),
                { status: 200, headers: { 'Content-Type': 'application/json' } }
            );
        }

        let content = article.full_html_body || '';
        let linksInserted = 0;
        const insertedAnchors: string[] = [];

        for (const target of linkTargets) {
            if (linksInserted >= max_links) break;

            // Check temporal linking rules
            if (!target.is_hub && target.target_post) {
                // Get the target post's date
                const targetPost = await directus.request(readItem('posts', target.target_post)) as any;
                if (targetPost) {
                    const targetDate = new Date(targetPost.date_published || targetPost.date_created);

                    // Can't link to posts "published" after this article
                    // Unless this article has a recent modified date
                    const recentModified = articleModified &&
                        (new Date().getTime() - articleModified.getTime()) < 30 * 24 * 60 * 60 * 1000; // 30 days

                    if (targetDate > articleDate && !recentModified) {
                        continue; // Skip this link target
                    }
                }
            }

            // Build anchor variations
            const anchors = [target.anchor_text];
            if (target.anchor_variations && Array.isArray(target.anchor_variations)) {
                anchors.push(...target.anchor_variations);
            }

            // Find and replace anchors in content
            let insertedForThisTarget = 0;
            const maxPerArticle = target.max_per_article || 2;

            for (const anchor of anchors) {
                if (insertedForThisTarget >= maxPerArticle) break;
                if (linksInserted >= max_links) break;

                // Case-insensitive regex that doesn't match already-linked text
                // Negative lookbehind for existing links
                const regex = new RegExp(
                    `(?<!<a[^>]*>)\\b(${escapeRegex(anchor)})\\b(?![^<]*</a>)`,
                    'i'
                );

                if (regex.test(content)) {
                    const targetUrl = target.target_url ||
                        (target.target_post ? `/posts/${target.target_post}` : null);

                    if (targetUrl) {
                        content = content.replace(regex, `<a href="${targetUrl}">$1</a>`);
                        linksInserted++;
                        insertedForThisTarget++;
                        insertedAnchors.push(anchor);
                    }
                }
            }
        }

        // Update article with linked content
        if (linksInserted > 0) {
            await directus.request(
                updateItem('generated_articles', article_id, {
                    full_html_body: content
                })
            );

            // Log work
            await directus.request(
                createItem('work_log', {
                    site: article.site,
                    action: 'links_inserted',
                    entity_type: 'generated_article',
                    entity_id: article_id,
                    details: {
                        links_inserted: linksInserted,
                        anchors: insertedAnchors
                    }
                })
            );
        }

        return new Response(
            JSON.stringify({
                success: true,
                article_id,
                links_inserted: linksInserted,
                anchors_used: insertedAnchors
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error inserting links:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to insert links' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
