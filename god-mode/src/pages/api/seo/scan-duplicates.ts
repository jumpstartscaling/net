// @ts-ignore - Astro types available at build time
import type { APIRoute } from 'astro';
import { getDirectusClient, readItems, createItem } from '@/lib/directus/client';

/**
 * Scan Duplicates API
 * 
 * Uses shingle hashing to detect duplicate N-gram sequences across articles.
 * Flags any articles that share 7+ word sequences.
 * 
 * POST /api/seo/scan-duplicates
 */
export const POST: APIRoute = async ({ request }: { request: Request }) => {
    try {
        const data = await request.json();
        const { queue_id, batch_ids, ngram_size = 7, threshold = 3 } = data;

        if (!queue_id && !batch_ids) {
            return new Response(
                JSON.stringify({ error: 'queue_id or batch_ids required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const directus = getDirectusClient();

        // Get articles to scan
        let articles: any[];
        if (batch_ids && Array.isArray(batch_ids)) {
            articles = await directus.request(readItems('generated_articles', {
                filter: { id: { _in: batch_ids } },
                fields: ['id', 'site', 'headline', 'full_html_body']
            })) as any[];
        } else {
            // Get test batch articles from queue
            articles = await directus.request(readItems('generated_articles', {
                filter: { is_test_batch: { _eq: true } },
                sort: ['-date_created'],
                limit: 20,
                fields: ['id', 'site', 'headline', 'full_html_body']
            })) as any[];
        }

        if (articles.length < 2) {
            return new Response(
                JSON.stringify({
                    success: true,
                    message: 'Need at least 2 articles to compare',
                    flags_created: 0
                }),
                { status: 200, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Build shingle sets for each article
        const articleShingles: Map<string, Set<string>> = new Map();

        for (const article of articles) {
            const text = stripHtml(article.full_html_body || '');
            const shingles = generateShingles(text, ngram_size);
            articleShingles.set(article.id, shingles);
        }

        // Compare all pairs
        const collisions: Array<{
            articleA: string;
            articleB: string;
            sharedShingles: string[];
            similarity: number;
        }> = [];

        const articleIds = Array.from(articleShingles.keys());

        for (let i = 0; i < articleIds.length; i++) {
            for (let j = i + 1; j < articleIds.length; j++) {
                const idA = articleIds[i];
                const idB = articleIds[j];
                const setA = articleShingles.get(idA)!;
                const setB = articleShingles.get(idB)!;

                // Find intersection
                const shared = [...setA].filter(s => setB.has(s));

                if (shared.length >= threshold) {
                    // Calculate Jaccard similarity
                    const union = new Set([...setA, ...setB]);
                    const similarity = (shared.length / union.size) * 100;

                    collisions.push({
                        articleA: idA,
                        articleB: idB,
                        sharedShingles: shared.slice(0, 5), // Just first 5 examples
                        similarity
                    });
                }
            }
        }

        // Create quality flags for collisions
        const siteId = articles[0]?.site;
        let flagsCreated = 0;

        for (const collision of collisions) {
            await directus.request(
                createItem('quality_flags', {
                    site: siteId,
                    batch_id: queue_id || null,
                    article_a: collision.articleA,
                    article_b: collision.articleB,
                    collision_text: collision.sharedShingles.join(' | '),
                    similarity_score: collision.similarity,
                    status: 'pending'
                })
            );
            flagsCreated++;
        }

        return new Response(
            JSON.stringify({
                success: true,
                articles_scanned: articles.length,
                collisions_found: collisions.length,
                flags_created: flagsCreated,
                details: collisions.map(c => ({
                    article_a: c.articleA,
                    article_b: c.articleB,
                    similarity: c.similarity.toFixed(1) + '%',
                    examples: c.sharedShingles
                }))
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error scanning duplicates:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to scan duplicates' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};

/**
 * Strip HTML tags and normalize text
 */
function stripHtml(html: string): string {
    return html
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
}

/**
 * Generate N-gram shingles from text
 */
function generateShingles(text: string, n: number): Set<string> {
    const words = text.split(/\s+/).filter(w => w.length > 2);
    const shingles = new Set<string>();

    for (let i = 0; i <= words.length - n; i++) {
        const shingle = words.slice(i, i + n).join(' ');
        shingles.add(shingle);
    }

    return shingles;
}
