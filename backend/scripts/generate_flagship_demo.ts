import { createDirectus, rest, authentication, readItems, createItem } from '@directus/sdk';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../credentials.env') });

const client = createDirectus(process.env.DIRECTUS_PUBLIC_URL!).with(authentication()).with(rest());

async function generateFlagshipDemo() {
    console.log('🚀 Generating Flagship Demo Data...');

    try {
        await client.login(process.env.DIRECTUS_ADMIN_EMAIL!, process.env.DIRECTUS_ADMIN_PASSWORD!);

        // 1. Ensure a Site Exists
        // @ts-ignore
        let sites = await client.request(readItems('sites', { limit: 1 }));
        let siteId;
        if (sites.length === 0) {
            console.log('  Testing Site creating...');
            // @ts-ignore
            const newSite = await client.request(createItem('sites', {
                name: 'Flagship Demo Site',
                domain: 'demo.jumpstartscaling.com',
                status: 'active'
            }));
            siteId = newSite.id;
        } else {
            console.log('  Using existing site: ' + sites[0].name);
            siteId = sites[0].id;
        }

        // 2. Ensure an Avatar Exists
        // @ts-ignore
        let avatars = await client.request(readItems('avatars', { limit: 1 }));
        let avatarId;
        if (avatars.length === 0) {
            console.log('  Creating Demo Avatar: Sarah (SEO Expert)...');
            // @ts-ignore
            // Note: Schema uses 'id' string key usually, but let's see. My M1 Setup used 'sarah_marketing' as key.
            try {
                // @ts-ignore
                const newAvatar = await client.request(createItem('avatars', {
                    id: 'sarah_marketing',
                    base_name: 'Sarah',
                    business_niches: ['Marketing', 'SEO', 'SaaS'],
                    wealth_cluster: 'High'
                }));
                avatarId = newAvatar.id;
            } catch (e) {
                // Fallback if ID exists but wasn't returned in list?
                avatarId = 'sarah_marketing';
            }
        } else {
            avatarId = avatars[0].id;
        }

        console.log(`  Site ID: ${siteId} (Type: ${typeof siteId})`);

        // 3. Create 3 Flagship Landers (Pages in Launchpad)
        console.log('\n--- Creating 3 Flagship Landers in Launchpad ---');

        const landers = [
            {
                title: 'High-Converting Home',
                permalink: '/',
                blocks: [
                    { id: 101, block_type: 'hero', block_config: { title: 'Scale Your Business 10x', subtitle: 'The ultimate growth platform for agencies.', bg: 'dark' } },
                    { id: 102, block_type: 'features', block_config: { items: [{title: 'Automated SEO', desc: 'Rank #1'}, {title: 'Lead Gen', desc: 'Get more customers'}] } },
                    { id: 103, block_type: 'cta', block_config: { label: 'Get Started', url: '/signup' } }
                ]
            },
            {
                title: 'SEO Services Landing Page',
                permalink: '/services/seo',
                slug: 'seo-services',
                blocks: [
                    { id: 201, block_type: 'hero', block_config: { title: 'Dominate Search Results', subtitle: 'We help you own your niche.', bg: 'blue' } },
                    { id: 202, block_type: 'content', block_config: { content: '<h2>Why SEO Matters</h2><p>Organic traffic is the best traffic...</p>' } }
                ]
            },
            {
                title: 'SaaS Case Study',
                permalink: '/case-studies/saas-growth',
                slug: 'saas-case-study',
                blocks: [
                    { id: 301, block_type: 'hero', block_config: { title: 'How X Grew 500%', subtitle: 'A deep dive into growth hacking.', bg: 'purple' } },
                    { id: 302, block_type: 'content', block_config: { content: '<p>It started with a simple idea...</p>' } }
                ]
            }
        ];

        for (const lander of landers) {
            try {
                // @ts-ignore
                await client.request(createItem('pages', {
                    ...lander,
                    slug: lander.permalink.replace(/^\//, '').replace(/\//g, '-') || 'home',
                    site: siteId, // relation ID
                    status: 'published'
                }));
                console.log(`  ✅ Created Page: ${lander.title}`);
            } catch (e: any) {
                console.error(`  ❌ Failed to create page ${lander.title}:`);
                if (e.errors) console.error(JSON.stringify(e.errors, null, 2));
                else console.error(e.message);
                // Skip to next to try generic jobs
            }
        }


        // 4. Create 3 Long Form Article Jobs (In Factory)
        console.log('\n--- Queuing 3 Long Form Articles in Factory ---');

        const articles = [
            { type: 'Topic Cluster', topic: 'Future of AI in Marketing', niche: 'Marketing' },
            { type: 'Geo Expansion', topic: 'Best Plumber in Austin', niche: 'Plumbing' },
            { type: 'Spintax Mass', topic: 'Affordable CRM Software', niche: 'SaaS' }
        ];

        for (const art of articles) {
            // @ts-ignore
            await client.request(createItem('generation_jobs', {
                site_id: siteId, // Schema uses 'site_id' or relation? Types say site_id, schema says campaign->site. Factory->Job link?
                // Job schema has 'site_id' (legacy?) or 'site' (relation)? My setup script didn't explicitly add 'site_id' to `generation_jobs`, it existed or I added 'campaign'.
                // If `generation_jobs` was existing, it probably has `site_id` field from older setup. I'll use `config` to be safe.
                type: art.type,
                status: 'queued',
                progress: 0,
                priority: 'high',
                config: {
                    topic: art.topic,
                    niche: art.niche,
                    avatar: avatarId,
                    template: 'long_form_v1'
                }
            }));
            console.log(`  ✅ Queued Job: ${art.topic}`);
        }

        console.log('\n✅ Flagship Demo Data Generation Complete!');

    } catch (error: any) {
        console.error('❌ Generation Failed:', error.message, error);
    }
}

generateFlagshipDemo();
