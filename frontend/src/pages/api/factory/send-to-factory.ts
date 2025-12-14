import type { APIRoute } from 'astro';
import { getDirectusClient, readItems, createItem, updateItem } from '@/lib/directus/client';
import { WordPressClient } from '@/lib/wordpress/WordPressClient';

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const { source, options } = body;

        // Validate input
        if (!source?.postId || !source?.url) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Missing required fields: source.postId and source.url'
            }), { status: 400 });
        }

        const client = getDirectusClient();

        // 1. Fetch WordPress post
        const wpClient = new WordPressClient(source.url, source.auth);
        const post = await wpClient.getPost(source.postId);

        if (!post) {
            return new Response(JSON.stringify({
                success: false,
                error: 'WordPress post not found'
            }), { status: 404 });
        }

        // 2. Get or create site record
        // @ts-ignore
        const sites = await client.request(readItems('sites', {
            // @ts-ignore
            filter: { url: { _eq: source.url } },
            limit: 1
        }));

        let siteId;
        if (sites.length > 0) {
            siteId = sites[0].id;
        } else {
            // @ts-ignore
            const newSite = await client.request(createItem('sites', {
                name: new URL(source.url).hostname,
                // @ts-ignore
                url: source.url
            }));
            siteId = newSite.id;
        }

        // 3. Create generation job
        // @ts-ignore
        const job = await client.request(createItem('generation_jobs', {
            site_id: siteId,
            status: 'Pending',
            // @ts-ignore
            type: options.mode || 'Refactor',
            target_quantity: 1,
            config: {
                wordpress_url: source.url,
                wordpress_auth: source.auth,
                wordpress_post_id: source.postId,
                mode: options.mode || 'refactor',
                template: options.template || 'long_tail_seo',
                location: options.location,
                auto_publish: options.autoPublish || false,
                source_title: post.title.rendered,
                source_slug: post.slug
            }
        }));

        // 4. Generate article
        const requestUrl = new URL(request.url);
        const generateResponse = await fetch(`${requestUrl.origin}/api/seo/generate-article`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                siteId: siteId,
                template: options.template || 'long_tail_seo',
                targetKeyword: post.title.rendered,
                sourceContent: post.content.rendered,
                metadata: {
                    originalSlug: post.slug,
                    originalId: post.id,
                    originalDate: post.date,
                    location: options.location,
                    mode: options.mode
                }
            })
        });

        if (!generateResponse.ok) {
            throw new Error('Article generation failed');
        }

        const article = await generateResponse.json();

        // 5. Update job status
        // @ts-ignore
        await client.request(updateItem('generation_jobs', job.id, {
            status: 'Complete',
            current_offset: 1
        }));

        return new Response(JSON.stringify({
            success: true,
            jobId: job.id,
            articleId: article.id,
            previewUrl: `/preview/article/${article.id}`,
            status: 'complete',
            article: {
                title: article.title,
                slug: article.slug,
                seoScore: article.metadata?.seo_score
            }
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error: any) {
        console.error('Send to Factory error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message || 'Unknown error occurred'
        }), { status: 500 });
    }
};
