import { createDirectus, rest, authentication, readItems, createItem } from '@directus/sdk';

const DIRECTUS_URL = 'https://spark.jumpstartscaling.com';
const EMAIL = 'insanecorp@gmail.com';
const PASSWORD = 'Idk@ai2026yayhappy';

const client = createDirectus(DIRECTUS_URL).with(authentication()).with(rest());

async function generateArticle() {
    try {
        await client.login(EMAIL, PASSWORD);
        console.log('✅ Authenticated\n');

        // 1. Fetch a random post from WordPress
        console.log('📥 Fetching a post from chrisamaya.work...');
        const wpResponse = await fetch('https://chrisamaya.work/wp-json/wp/v2/posts?per_page=1&orderby=rand', {
            headers: {
                'Authorization': 'Basic ' + Buffer.from('gatekeeper:Idk@2025').toString('base64')
            }
        });

        const posts = await wpResponse.json();
        const sourcePost = posts[0];

        console.log(`   ✅ Got post: "${sourcePost.title.rendered}"`);
        console.log(`   Slug: ${sourcePost.slug}`);
        console.log(`   Original length: ${sourcePost.content.rendered.length} chars\n`);

        // 2. Get site ID
        // @ts-ignore
        const sites = await client.request(readItems('sites', {
            filter: { url: { _eq: 'https://chrisamaya.work' } },
            limit: 1
        }));
        const siteId = sites[0].id;

        // 3. Generate new article using the API
        console.log('🎨 Generating new article with Spark...');

        const generateResponse = await fetch('https://launch.jumpstartscaling.com/api/seo/generate-article', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                siteId: siteId,
                template: 'long_tail_seo',
                targetKeyword: sourcePost.title.rendered,
                sourceContent: sourcePost.content.rendered,
                metadata: {
                    originalSlug: sourcePost.slug,
                    originalId: sourcePost.id,
                    originalDate: sourcePost.date
                }
            })
        });

        if (!generateResponse.ok) {
            const error = await generateResponse.text();
            console.error('❌ Generation failed:', error);
            return;
        }

        const result = await generateResponse.json();

        console.log('\n✅ Article generated successfully!');
        console.log(`   Title: ${result.title}`);
        console.log(`   Slug: ${result.slug}`);
        console.log(`   Length: ${result.html_content?.length || 0} chars`);
        console.log(`   Article ID: ${result.id}`);

        console.log('\n📄 Preview (first 500 chars):');
        console.log(result.html_content?.substring(0, 500) + '...');

        console.log('\n🎉 SUCCESS! Article ready for deployment.');

    } catch (error: any) {
        console.error('\n❌ Error:', error.message || error);
        if (error.errors) {
            console.error('Details:', JSON.stringify(error.errors, null, 2));
        }
    }
}

generateArticle();
