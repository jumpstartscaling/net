#!/usr/bin/env node

/**
 * Complete Schema Validation & Relationship Test
 * Validates all collections have proper relationships and can work together
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

async function validateSchema() {
    console.log('\n🔍 COMPLETE SCHEMA VALIDATION\n');
    console.log('═'.repeat(80));

    const validationResults = {
        collections: {},
        relationships: [],
        issues: [],
        recommendations: []
    };

    // Test 1: Verify all critical collections exist and have data
    console.log('\n1️⃣  COLLECTION DATA CHECK\n');

    const criticalCollections = [
        'sites',
        'posts',
        'pages',
        'generated_articles',
        'generation_jobs',
        'avatar_intelligence',
        'avatar_variants',
        'geo_intelligence',
        'cartesian_patterns',
        'spintax_dictionaries',
        'campaign_masters'
    ];

    for (const collection of criticalCollections) {
        try {
            const data = await makeRequest(`/items/${collection}?aggregate[count]=*&limit=1`);
            const count = data.data?.[0]?.count || 0;
            const hasData = count > 0;

            validationResults.collections[collection] = { exists: true, count, hasData };

            const status = hasData ? '✅' : '⚠️ ';
            console.log(`  ${status} ${collection.padEnd(25)} ${count.toString().padStart(4)} records`);

            if (!hasData && ['avatar_intelligence', 'geo_intelligence', 'sites'].includes(collection)) {
                validationResults.issues.push({
                    severity: 'medium',
                    collection,
                    issue: 'Empty collection - system needs data to function'
                });
            }
        } catch (err) {
            console.log(`  ❌ ${collection.padEnd(25)} ERROR: ${err.message.substring(0, 40)}`);
            validationResults.collections[collection] = { exists: false, error: err.message };
            validationResults.issues.push({
                severity: 'high',
                collection,
                issue: 'Collection does not exist or is not accessible'
            });
        }
    }

    // Test 2: Verify relationships work
    console.log('\n\n2️⃣  RELATIONSHIP VALIDATION\n');

    const relationshipTests = [
        {
            name: 'Sites → Posts',
            test: async () => {
                const sites = await makeRequest('/items/sites?limit=1');
                if (sites.data?.length > 0) {
                    const siteId = sites.data[0].id;
                    const posts = await makeRequest(`/items/posts?filter[site_id][_eq]=${siteId}`);
                    return { works: true, siteId, postCount: posts.data?.length || 0 };
                }
                return { works: false, reason: 'No sites available' };
            }
        },
        {
            name: 'Sites → Pages',
            test: async () => {
                const sites = await makeRequest('/items/sites?limit=1');
                if (sites.data?.length > 0) {
                    const siteId = sites.data[0].id;
                    const pages = await makeRequest(`/items/pages?filter[site_id][_eq]=${siteId}`);
                    return { works: true, siteId, pageCount: pages.data?.length || 0 };
                }
                return { works: false, reason: 'No sites available' };
            }
        },
        {
            name: 'Campaign → Generated Articles',
            test: async () => {
                const campaigns = await makeRequest('/items/campaign_masters?limit=1');
                if (campaigns.data?.length > 0) {
                    const campaignId = campaigns.data[0].id;
                    const articles = await makeRequest(`/items/generated_articles?filter[campaign_id][_eq]=${campaignId}`);
                    return { works: true, campaignId, articleCount: articles.data?.length || 0 };
                }
                return { works: false, reason: 'No campaigns available' };
            }
        },
        {
            name: 'Generation Jobs → Sites',
            test: async () => {
                const jobs = await makeRequest('/items/generation_jobs?limit=1');
                if (jobs.data?.length > 0) {
                    const job = jobs.data[0];
                    if (job.site_id) {
                        const site = await makeRequest(`/items/sites/${job.site_id}`);
                        return { works: true, jobId: job.id, siteName: site.data?.name };
                    }
                }
                return { works: false, reason: 'No generation jobs with site_id' };
            }
        }
    ];

    for (const test of relationshipTests) {
        try {
            const result = await test.test();
            if (result.works) {
                console.log(`  ✅ ${test.name.padEnd(35)} WORKING`);
                validationResults.relationships.push({ name: test.name, status: 'working', ...result });
            } else {
                console.log(`  ⚠️  ${test.name.padEnd(35)} ${result.reason}`);
                validationResults.relationships.push({ name: test.name, status: 'unavailable', reason: result.reason });
            }
        } catch (err) {
            console.log(`  ❌ ${test.name.padEnd(35)} ERROR: ${err.message.substring(0, 30)}`);
            validationResults.relationships.push({ name: test.name, status: 'error', error: err.message });
            validationResults.issues.push({
                severity: 'high',
                relationship: test.name,
                issue: `Relationship test failed: ${err.message}`
            });
        }
    }

    // Test 3: Check field interfaces are user-friendly
    console.log('\n\n3️⃣  FIELD INTERFACE CHECK\n');

    const fieldsData = await makeRequest('/fields');
    const importantFields = [
        { collection: 'posts', field: 'site_id', expectedInterface: 'select-dropdown-m2o' },
        { collection: 'pages', field: 'site_id', expectedInterface: 'select-dropdown-m2o' },
        { collection: 'sites', field: 'status', expectedInterface: 'select-dropdown' },
        { collection: 'generation_jobs', field: 'status', expectedInterface: 'select-dropdown' },
        { collection: 'posts', field: 'content', expectedInterface: 'input-rich-text-html' }
    ];

    for (const { collection, field, expectedInterface } of importantFields) {
        const fieldData = fieldsData.data.find(f => f.collection === collection && f.field === field);
        if (fieldData) {
            const actualInterface = fieldData.meta?.interface || 'none';
            const matches = actualInterface === expectedInterface;

            const status = matches ? '✅' : '⚠️ ';
            const displayName = `${collection}.${field}`.padEnd(35);
            console.log(`  ${status} ${displayName} ${actualInterface}`);

            if (!matches) {
                validationResults.recommendations.push({
                    collection,
                    field,
                    recommendation: `Change interface from '${actualInterface}' to '${expectedInterface}' for better UX`
                });
            }
        }
    }

    // Test 4: Sample data integrity
    console.log('\n\n4️⃣  DATA INTEGRITY CHECK\n');

    // Check for orphaned records
    const orphanChecks = [
        {
            name: 'Posts without sites',
            check: async () => {
                const posts = await makeRequest('/items/posts?filter[site_id][_null]=true');
                return posts.data?.length || 0;
            }
        },
        {
            name: 'Generated articles without campaigns',
            check: async () => {
                const articles = await makeRequest('/items/generated_articles?filter[campaign_id][_null]=true');
                return articles.data?.length || 0;
            }
        },
        {
            name: 'Generation jobs without sites',
            check: async () => {
                const jobs = await makeRequest('/items/generation_jobs?filter[site_id][_null]=true');
                return jobs.data?.length || 0;
            }
        }
    ];

    for (const { name, check } of orphanChecks) {
        try {
            const count = await check();
            if (count === 0) {
                console.log(`  ✅ ${name.padEnd(40)} None found`);
            } else {
                console.log(`  ⚠️  ${name.padEnd(40)} ${count} found`);
                validationResults.issues.push({
                    severity: 'low',
                    issue: name,
                    count
                });
            }
        } catch (err) {
            console.log(`  ⚠️  ${name.padEnd(40)} Unable to check`);
        }
    }

    // Summary
    console.log('\n\n═'.repeat(80));
    console.log('📋 VALIDATION SUMMARY');
    console.log('═'.repeat(80));

    const totalCollections = Object.keys(validationResults.collections).length;
    const existingCollections = Object.values(validationResults.collections).filter(c => c.exists).length;
    const populatedCollections = Object.values(validationResults.collections).filter(c => c.hasData).length;

    console.log(`\n📦 Collections: ${existingCollections}/${totalCollections} exist, ${populatedCollections} have data`);
    console.log(`🔗 Relationships: ${validationResults.relationships.filter(r => r.status === 'working').length}/${validationResults.relationships.length} working`);
    console.log(`⚠️  Issues: ${validationResults.issues.length} found`);
    console.log(`💡 Recommendations: ${validationResults.recommendations.length}`);

    if (validationResults.issues.length > 0) {
        const highPriority = validationResults.issues.filter(i => i.severity === 'high');
        const mediumPriority = validationResults.issues.filter(i => i.severity === 'medium');

        if (highPriority.length > 0) {
            console.log('\n\n🚨 HIGH PRIORITY ISSUES:\n');
            highPriority.forEach(issue => {
                console.log(`  • ${issue.collection || issue.relationship}: ${issue.issue}`);
            });
        }

        if (mediumPriority.length > 0) {
            console.log('\n\n⚠️  MEDIUM PRIORITY ISSUES:\n');
            mediumPriority.forEach(issue => {
                console.log(`  • ${issue.collection}: ${issue.issue}`);
            });
        }
    }

    console.log('\n═'.repeat(80));

    if (validationResults.issues.length === 0) {
        console.log('🎉 ALL VALIDATION CHECKS PASSED!');
    } else {
        console.log('⚠️  Some issues found - see details above');
    }

    console.log('═'.repeat(80) + '\n');

    // Save validation report
    const fs = require('fs');
    fs.writeFileSync(
        'validation_report.json',
        JSON.stringify(validationResults, null, 2)
    );
    console.log('📄 Detailed report saved to: validation_report.json\n');

    return validationResults;
}

// Run validation
validateSchema()
    .then(results => {
        const hasHighIssues = results.issues.some(i => i.severity === 'high');
        process.exit(hasHighIssues ? 1 : 0);
    })
    .catch(err => {
        console.error('❌ Validation failed:', err.message);
        process.exit(1);
    });
