// @ts-nocheck

import type { APIRoute } from 'astro';
import { getDirectusClient, readItem, createItem, updateItem, readItems } from '@/lib/directus/client';
import { CartesianEngine } from '@/lib/cartesian/CartesianEngine';

export const POST: APIRoute = async ({ request }) => {
    try {
        const { jobId, batchSize = 5, mode } = await request.json();

        if (!jobId) {
            return new Response(JSON.stringify({ error: 'Missing jobId' }), { status: 400 });
        }

        const client = getDirectusClient();
        const engine = new CartesianEngine(client);

        // 1. Fetch Job
        const job = await client.request(readItem('generation_jobs' as any, jobId));
        if (!job || job.status === 'Complete') {
            return new Response(JSON.stringify({ message: 'Job not found or complete' }), { status: 404 });
        }

        // 2. Setup Context
        const filters = job.filters || {};
        const isFullSiteSetup = mode === 'full_site_setup' || (job.target_quantity === 10 && filters.avatars?.length > 5); // Infer or explicit

        // Fetch Site Data
        const siteId = job.site_id;
        const site = await client.request(readItem('sites' as any, siteId));

        let generatedCount = 0;
        let limit = job.target_quantity;
        let offset = job.current_offset || 0;

        // Fetch Global Resources (Optimization: Load once)
        const allNiches = await client.request(readItems('avatars' as any)); // Actually this returns top level obj? No, we need structure.
        // For MVP, simplistic fetch inside loop or robust fetch here.
        // Let's assume engine handles detail fetching for now or we rely on basic info.

        // 3. SPECIAL OPS: Full Site Setup (Home + Blog)
        // Only run if offset is 0 and mode is set
        if (offset === 0 && isFullSiteSetup) {
            console.log("🚀 Executing Full Site Setup (Showcase Mode)...");

            // A. Home Page
            const homeContext = {
                avatar: { id: 'generic' },
                niche: 'General',
                city: { city: 'Los Angeles', state: 'CA' }, // Default
                site: site,
                // Showcase Layout: Hero -> Avatar Grid -> Consult Form
                template: { structure_json: ['block_01_zapier_fix', 'block_11_avatar_showcase', 'block_12_consultation_form'] }
            };
            const homeArticle = await engine.generateArticle(homeContext);
            await client.request(createItem('generated_articles' as any, {
                site_id: siteId,
                title: "Home", // Force override
                slug: "home", // Force override
                html_content: homeArticle.html_content,
                meta_desc: "Welcome to our agency.",
                is_published: true,
            }));
            generatedCount++;

            // B. Blog Archive
            // Ideally a page template, but we'll make a placeholder article for now
            await client.request(createItem('generated_articles' as any, {
                site_id: siteId,
                title: "Insights & Articles",
                slug: "blog",
                html_content: "<div class='archive-feed'>[POST_FEED_PLACEHOLDER]</div>",
                meta_desc: "Read our latest insights.",
                is_published: true,
            }));
            generatedCount++;
        }

        // 4. REFACTOR MODE (WordPress Import)
        if (mode === 'refactor') {
            console.log("♻️ Executing Refactor Mode...");
            const queue = filters.items || [];
            
            // Loop through queue items starting from current offset
            while (generatedCount + offset < queue.length) {
                const item = queue[generatedCount + offset];
                
                // Context for Refactor
                // We use a generic 'Business' avatar for now or try to infer from content?
                // Let's stick to a safe default: "Scaling Founder"
                const avatarItem = await client.request(readItem('avatars' as any, 'scaling_founder')); 
                const city = { city: 'Online', state: 'World' }; // Generic

                const context = {
                    avatar: avatarItem,
                    niche: 'Business',
                    city: city,
                    site: site,
                    // Use a generic article structure
                    template: { structure_json: ['block_03_fix_first_scale_second', 'block_04_market_domination'] }
                };

                // Generate with Overrides
                const article = await engine.generateArticle(context, {
                    slug: item.slug, // PRESERVE SLUG
                    title: `Refactored: ${item.title}` // Indicate change
                });

                // Save
                await client.request(createItem('generated_articles' as any, {
                    site_id: siteId,
                    title: article.title,
                    slug: article.slug,
                    html_content: article.html_content,
                    meta_desc: article.meta_desc,
                    is_published: true, 
                    job_id: jobId
                }));
                generatedCount++;
            }
             
            // Complete safely
             await client.request(updateItem('generation_jobs' as any, jobId, {
                current_offset: offset + generatedCount,
                status: 'Complete'
            }));

            return new Response(JSON.stringify({
                generated: generatedCount,
                completed: true
            }), { status: 200 });
        }


        // 5. Generate Standard Batch
        // We will loop until batchSize is met or limit reached.

        // Load Resources needed for randomization
        const availableAvatars = filters.avatars && filters.avatars.length ? filters.avatars : ['scaling_founder'];
        // We need city IDs. Queries 'geo_locations'
        // For efficiency, we scan 10 cities.
        const cities = await client.request(readItems('geo_locations' as any, { limit: 20 }));

        while (generatedCount < batchSize && (offset + generatedCount) < limit) {
            // SEQUENTIAL AVATAR SELECTION (for Showcase)
            // If full site setup, we want to cycle through avatars 1-by-1 to ensure coverage
            let avatarId;
            if (isFullSiteSetup) {
                // Use offset + generatedCount to pick index (modulo length)
                // Subtract 2 for Home/Blog if they were generated in this batch? 
                // Actually offset tracks total items. 
                // If offset=0, items 0,1 are home/blog. item 2 is post #1.
                // So we use (offset + generatedCount) % availableAvatars.length?
                // But wait, if offset=0, loop starts at generatedCount=2.
                // (0 + 2) % 10 = 2. 
                avatarId = availableAvatars[(offset + generatedCount) % availableAvatars.length];
            } else {
                avatarId = availableAvatars[Math.floor(Math.random() * availableAvatars.length)];
            }

            const randCity = cities[Math.floor(Math.random() * cities.length)];

            // Fetch real avatar to get niche? Or use ID mapping?
            // We need the Niche string for the engine.
            // We'll quick-fetch the avatar Item (not optimal in loop but safe for 10 items)
            const avatarItem = await client.request(readItem('avatars' as any, avatarId));
            const randNiche = avatarItem.business_niches ? avatarItem.business_niches[Math.floor(Math.random() * avatarItem.business_niches.length)] : 'Business';

            const context = {
                avatar: avatarItem,
                niche: randNiche,
                city: randCity,
                site: site,
                template: { structure_json: ['block_03_fix_first_scale_second', 'block_05_stop_wasting_dollars'] } // Randomize this later
            };

            const article = await engine.generateArticle(context);

            // Save
            await client.request(createItem('generated_articles' as any, {
                site_id: siteId,
                title: article.title,
                slug: article.slug + '-' + Math.floor(Math.random() * 1000), // Unique slug
                html_content: article.html_content,
                meta_desc: article.meta_desc,
                is_published: true, // Auto publish for test
            }));

            generatedCount++;
        }

        // 6. Update Job standard
        await client.request(updateItem('generation_jobs' as any, jobId, {
            current_offset: offset + generatedCount,
            status: (offset + generatedCount >= limit) ? 'Complete' : 'Processing'
        }));

        return new Response(JSON.stringify({
            generated: generatedCount,
            completed: (offset + generatedCount >= limit)
        }), { status: 200 });

    } catch (error: any) {
        console.error("Generation Error:", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
