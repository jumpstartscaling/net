#!/usr/bin/env node

/**
 * Comprehensive Database Connection Test
 * Tests all connections between admin pages, collections, and engines
 */

const DIRECTUS_URL = 'https://spark.jumpstartscaling.com';
const ADMIN_TOKEN = 'SufWLAbsqmbbqF_gg5I70ng8wE1zXt-a';

async function makeRequest(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'Authorization': `Bearer ${ADMIN_TOKEN}`,
            'Content-Type': 'application/json'
        }
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(`${DIRECTUS_URL}${endpoint}`, options);
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
    }
    return response.json();
}

async function testConnection() {
    console.log('\n🔌 COMPREHENSIVE DATABASE CONNECTION TEST\n');
    console.log('═'.repeat(80));

    const results = {
        collections: {},
        relationships: {},
        adminPages: {},
        engines: {}
    };

    // Test 1: Core Collections Access
    console.log('\n1️⃣  CORE COLLECTIONS ACCESS\n');

    const coreCollections = [
        'sites', 'posts', 'pages', 'generated_articles',
        'generation_jobs', 'avatar_intelligence', 'avatar_variants',
        'geo_intelligence', 'cartesian_patterns', 'spintax_dictionaries',
        'campaign_masters', 'content_fragments', 'headline_inventory'
    ];

    for (const collection of coreCollections) {
        try {
            const data = await makeRequest(`/items/${collection}?limit=1&meta=filter_count`);
            const count = data.meta?.filter_count || 0;
            results.collections[collection] = { accessible: true, count };
            console.log(`  ✅ ${collection.padEnd(30)} ${count.toString().padStart(5)} records`);
        } catch (err) {
            results.collections[collection] = { accessible: false, error: err.message };
            console.log(`  ❌ ${collection.padEnd(30)} ERROR`);
        }
    }

    // Test 2: Relationship Integrity
    console.log('\n\n2️⃣  RELATIONSHIP INTEGRITY TESTS\n');

    // Test Sites → Posts/Pages
    try {
        const sites = await makeRequest('/items/sites?limit=1');
        if (sites.data?.length > 0) {
            const siteId = sites.data[0].id;
            const siteName = sites.data[0].name;

            const posts = await makeRequest(`/items/posts?filter[site_id][_eq]=${siteId}&limit=1`);
            const pages = await makeRequest(`/items/pages?filter[site_id][_eq]=${siteId}&limit=1`);

            console.log(`  ✅ Sites → Posts (tested with site: ${siteName})`);
            console.log(`  ✅ Sites → Pages (tested with site: ${siteName})`);
            results.relationships['sites_posts'] = true;
            results.relationships['sites_pages'] = true;
        }
    } catch (err) {
        console.log(`  ❌ Sites relationships: ${err.message}`);
        results.relationships['sites_posts'] = false;
        results.relationships['sites_pages'] = false;
    }

    // Test Campaign → Content Fragments/Headlines/Articles
    try {
        const campaigns = await makeRequest('/items/campaign_masters?limit=1');
        if (campaigns.data?.length > 0) {
            const campaignId = campaigns.data[0].id;
            const campaignName = campaigns.data[0].name;

            const fragments = await makeRequest(`/items/content_fragments?filter[campaign_id][_eq]=${campaignId}&limit=1`);
            const headlines = await makeRequest(`/items/headline_inventory?filter[campaign_id][_eq]=${campaignId}&limit=1`);
            const articles = await makeRequest(`/items/generated_articles?filter[campaign_id][_eq]=${campaignId}&limit=1`);

            console.log(`  ✅ Campaign → Content Fragments (tested with: ${campaignName})`);
            console.log(`  ✅ Campaign → Headlines (tested with: ${campaignName})`);
            console.log(`  ✅ Campaign → Generated Articles (tested with: ${campaignName})`);
            results.relationships['campaign_fragments'] = true;
            results.relationships['campaign_headlines'] = true;
            results.relationships['campaign_articles'] = true;
        }
    } catch (err) {
        console.log(`  ❌ Campaign relationships: ${err.message}`);
        results.relationships['campaign_fragments'] = false;
    }

    // Test 3: Admin Page Data Access
    console.log('\n\n3️⃣  ADMIN PAGE DATA ACCESS\n');

    // Mission Control (Command Center) - needs sites, generation_jobs
    console.log('\n  📊 Mission Control / Command Center:');
    try {
        const sites = await makeRequest('/items/sites?fields=id,name,status,url');
        const jobs = await makeRequest('/items/generation_jobs?limit=10&sort=-date_created');
        console.log(`     ✅ Can access sites: ${sites.data?.length || 0} sites`);
        console.log(`     ✅ Can access generation jobs: ${jobs.data?.length || 0} recent jobs`);
        results.adminPages['mission_control'] = true;
    } catch (err) {
        console.log(`     ❌ Error: ${err.message}`);
        results.adminPages['mission_control'] = false;
    }

    // Content Factory - needs campaigns, patterns, spintax
    console.log('\n  🏭 Content Factory:');
    try {
        const campaigns = await makeRequest('/items/campaign_masters?fields=id,name,status');
        const patterns = await makeRequest('/items/cartesian_patterns?fields=id,pattern_key');
        const spintax = await makeRequest('/items/spintax_dictionaries?fields=id,category');
        console.log(`     ✅ Can access campaigns: ${campaigns.data?.length || 0} campaigns`);
        console.log(`     ✅ Can access patterns: ${patterns.data?.length || 0} patterns`);
        console.log(`     ✅ Can access spintax: ${spintax.data?.length || 0} dictionaries`);
        results.adminPages['content_factory'] = true;
    } catch (err) {
        console.log(`     ❌ Error: ${err.message}`);
        results.adminPages['content_factory'] = false;
    }

    // Work Log  - check if collection exists
    console.log('\n  📝 Work Log:');
    try {
        const workLog = await makeRequest('/items/work_log?limit=10&sort=-date_created');
        console.log(`     ✅ Can access work log: ${workLog.data?.length || 0} entries`);
        results.adminPages['work_log'] = true;
    } catch (err) {
        if (err.message.includes('404') || err.message.includes('not found')) {
            console.log(`     ⚠️  Work log collection doesn't exist - needs to be created`);
            results.adminPages['work_log'] = 'missing';
        } else {
            console.log(`     ❌ Error: ${err.message}`);
            results.adminPages['work_log'] = false;
        }
    }

    // Test 4: Engine Data Access
    console.log('\n\n4️⃣  ENGINE DATA ACCESS TESTS\n');

    // Cartesian Engine - needs avatars, geo, patterns, spintax
    console.log('\n  🤖 CartesianEngine Requirements:');
    try {
        const avatars = await makeRequest('/items/avatar_intelligence?fields=id,avatar_key');
        const avatarVariants = await makeRequest('/items/avatar_variants?fields=id,avatar_key,variant_type');
        const geoData = await makeRequest('/items/geo_intelligence?fields=id,cluster_key');
        const patterns = await makeRequest('/items/cartesian_patterns?fields=id,pattern_key,data');
        const spintax = await makeRequest('/items/spintax_dictionaries?fields=id,category,data');

        console.log(`     ✅ Avatar Intelligence: ${avatars.data?.length || 0} avatars`);
        console.log(`     ✅ Avatar Variants: ${avatarVariants.data?.length || 0} variants`);
        console.log(`     ✅ Geo Intelligence: ${geoData.data?.length || 0} locations`);
        console.log(`     ✅ Cartesian Patterns: ${patterns.data?.length || 0} patterns`);
        console.log(`     ✅ Spintax Dictionaries: ${spintax.data?.length || 0} dictionaries`);

        results.engines['cartesian_data_access'] = true;
    } catch (err) {
        console.log(`     ❌ Error accessing engine data: ${err.message}`);
        results.engines['cartesian_data_access'] = false;
    }

    // Generation Jobs → Engine Flow
    console.log('\n  ⚙️  Generation Job → Engine Flow:');
    try {
        const jobs = await makeRequest('/items/generation_jobs?filter[status][_eq]=pending&limit=1');
        if (jobs.data?.length > 0) {
            const job = jobs.data[0];
            const site = await makeRequest(`/items/sites/${job.site_id}`);
            console.log(`     ✅ Job can access site data: ${site.data?.name}`);
            console.log(`     ✅ Job status: ${job.status}`);
            console.log(`     ✅ Target quantity: ${job.target_quantity}`);
            results.engines['job_site_access'] = true;
        } else {
            console.log(`     ⚠️  No pending jobs to test`);
            results.engines['job_site_access'] = 'no_pending_jobs';
        }
    } catch (err) {
        console.log(`     ❌ Error: ${err.message}`);
        results.engines['job_site_access'] = false;
    }

    // Test 5: Cross-Collection Queries
    console.log('\n\n5️⃣  CROSS-COLLECTION QUERY TESTS\n');

    // Test joining site with articles
    try {
        const articlesWithSite = await makeRequest(
            '/items/generated_articles?fields=id,title,site_id.*&limit=1'
        );
        if (articlesWithSite.data?.length > 0 && articlesWithSite.data[0].site_id) {
            console.log(`  ✅ Can join generated_articles with sites data`);
            results.relationships['articles_site_join'] = true;
        } else {
            console.log(`  ⚠️  No generated articles to test join`);
            results.relationships['articles_site_join'] = 'no_data';
        }
    } catch (err) {
        console.log(`  ❌ Articles → Sites join failed: ${err.message}`);
        results.relationships['articles_site_join'] = false;
    }

    // Summary
    console.log('\n\n═'.repeat(80));
    console.log('📊 TEST SUMMARY');
    console.log('═'.repeat(80));

    const collectionsPassed = Object.values(results.collections).filter(r => r.accessible).length;
    const relationshipsPassed = Object.values(results.relationships).filter(r => r === true).length;
    const adminPagesPassed = Object.values(results.adminPages).filter(r => r === true).length;
    const enginesPassed = Object.values(results.engines).filter(r => r === true).length;

    console.log(`\n📦 Collections: ${collectionsPassed}/${Object.keys(results.collections).length} accessible`);
    console.log(`🔗 Relationships: ${relationshipsPassed}/${Object.keys(results.relationships).length} working`);
    console.log(`🎛️  Admin Pages: ${adminPagesPassed}/${Object.keys(results.adminPages).length} connected`);
    console.log(`⚙️  Engines: ${enginesPassed}/${Object.keys(results.engines).length} data accessible`);

    // Detailed issues
    const issues = [];

    if (results.adminPages['work_log'] === 'missing') {
        issues.push({ type: 'missing_collection', name: 'work_log', severity: 'medium' });
    }

    Object.entries(results.collections).forEach(([name, data]) => {
        if (!data.accessible) {
            issues.push({ type: 'collection_access', name, severity: 'high', error: data.error });
        }
    });

    Object.entries(results.relationships).forEach(([name, status]) => {
        if (status === false) {
            issues.push({ type: 'relationship', name, severity: 'high' });
        }
    });

    if (issues.length > 0) {
        console.log('\n\n⚠️  ISSUES FOUND:\n');
        issues.forEach(issue => {
            const icon = issue.severity === 'high' ? '🔴' : '🟡';
            console.log(`  ${icon} ${issue.type}: ${issue.name}`);
        });
    } else {
        console.log('\n\n✅ NO ISSUES FOUND - ALL SYSTEMS OPERATIONAL!');
    }

    console.log('\n' + '═'.repeat(80) + '\n');

    // Save results
    const fs = require('fs');
    fs.writeFileSync('connection_test_results.json', JSON.stringify(results, null, 2));
    console.log('📄 Detailed results saved to: connection_test_results.json\n');

    return { results, issues };
}

testConnection()
    .then(({ issues }) => {
        const highIssues = issues.filter(i => i.severity === 'high');
        process.exit(highIssues.length > 0 ? 1 : 0);
    })
    .catch(err => {
        console.error('❌ Connection test failed:', err.message);
        process.exit(1);
    });
