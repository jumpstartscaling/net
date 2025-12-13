import { createDirectus, rest, authentication, readItems, createItem } from '@directus/sdk';

const DIRECTUS_URL = 'https://spark.jumpstartscaling.com';
const EMAIL = 'insanecorp@gmail.com';
const PASSWORD = 'Idk@ai2026yayhappy';

const client = createDirectus(DIRECTUS_URL).with(authentication()).with(rest());

async function testJumpstartAPI() {
    try {
        await client.login(EMAIL, PASSWORD);
        console.log('✅ Authenticated\n');

        // 1. Find or create site
        console.log('1. Checking for site record...');
        // @ts-ignore
        const sites = await client.request(readItems('sites', {
            filter: { url: { _eq: 'https://chrisamaya.work' } },
            limit: 1
        }));

        let siteId;
        if (sites.length > 0) {
            siteId = sites[0].id;
            console.log(`   ✅ Found existing site (ID: ${siteId})`);
        } else {
            console.log('   Creating new site...');
            // @ts-ignore
            const newSite = await client.request(createItem('sites', {
                name: 'chrisamaya.work',
                url: 'https://chrisamaya.work'
            }));
            siteId = newSite.id;
            console.log(`   ✅ Created site (ID: ${siteId})`);
        }

        // 2. Create generation job with config
        console.log('\n2. Creating generation job...');
        // @ts-ignore
        const job = await client.request(createItem('generation_jobs', {
            site_id: siteId,
            status: 'Pending',
            type: 'Refactor',
            target_quantity: 1456,
            config: {
                wordpress_url: 'https://chrisamaya.work',
                wordpress_auth: 'gatekeeper:Idk@2025',
                mode: 'refactor',
                batch_size: 5,
                total_posts: 1456
            }
        }));

        console.log(`   ✅ Job created successfully!`);
        console.log(`   Job ID: ${job.id}`);
        console.log(`   Status: ${job.status}`);
        console.log(`   Type: ${job.type}`);
        console.log(`   Target: ${job.target_quantity} posts`);

        console.log('\n🎉 SUCCESS! Jumpstart job creation works!');
        console.log('\nNext step: The frontend should now work correctly.');
        console.log('Try the Jumpstart wizard again in the browser.');

    } catch (error: any) {
        console.error('\n❌ Error:', error.message || error);
        if (error.errors) {
            console.error('Details:', JSON.stringify(error.errors, null, 2));
        }
    }
}

testJumpstartAPI();
