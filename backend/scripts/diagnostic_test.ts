import { createDirectus, rest, authentication, readItems, readCollections } from '@directus/sdk';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const DIRECTUS_URL = process.env.DIRECTUS_PUBLIC_URL || 'https://spark.jumpstartscaling.com';
const EMAIL = process.env.DIRECTUS_ADMIN_EMAIL;
const PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD;

const client = createDirectus(DIRECTUS_URL).with(authentication()).with(rest());

interface TestResult {
    name: string;
    status: 'PASS' | 'FAIL' | 'WARN';
    message: string;
    details?: any;
}

const results: TestResult[] = [];

function logTest(result: TestResult) {
    const icon = result.status === 'PASS' ? '✅' : result.status === 'WARN' ? '⚠️' : '❌';
    console.log(`${icon} ${result.name}: ${result.message}`);
    if (result.details) {
        console.log(`   Details:`, result.details);
    }
    results.push(result);
}

async function runDiagnostics() {
    console.log('\n🔍 SPARK PLATFORM - FULL DIAGNOSTIC TEST\n');
    console.log(`📡 Testing Directus API at: ${DIRECTUS_URL}\n`);

    // TEST 1: Authentication
    try {
        console.log('--- TEST 1: Authentication ---');
        await client.login(EMAIL!, PASSWORD!);
        logTest({
            name: 'Authentication',
            status: 'PASS',
            message: 'Successfully authenticated with Directus'
        });
    } catch (error: any) {
        logTest({
            name: 'Authentication',
            status: 'FAIL',
            message: 'Failed to authenticate',
            details: error.message
        });
        console.log('\n❌ Cannot proceed without authentication. Exiting.\n');
        process.exit(1);
    }

    // TEST 2: Collections Exist
    console.log('\n--- TEST 2: Collections ---');
    try {
        const collections = await client.request(readCollections());
        const collectionNames = collections.map((c: any) => c.collection);

        const requiredCollections = [
            'sites',
            'avatars',
            'avatar_variants',
            'geo_clusters',
            'geo_locations',
            'spintax_dictionaries',
            'cartesian_patterns',
            'generation_jobs',
            'generated_articles',
            'work_log'
        ];

        let allExist = true;
        for (const col of requiredCollections) {
            if (collectionNames.includes(col)) {
                logTest({
                    name: `Collection: ${col}`,
                    status: 'PASS',
                    message: 'Exists'
                });
            } else {
                logTest({
                    name: `Collection: ${col}`,
                    status: 'FAIL',
                    message: 'Missing'
                });
                allExist = false;
            }
        }

        if (allExist) {
            logTest({
                name: 'All Collections',
                status: 'PASS',
                message: `All ${requiredCollections.length} required collections exist`
            });
        }
    } catch (error: any) {
        logTest({
            name: 'Collections Check',
            status: 'FAIL',
            message: 'Failed to read collections',
            details: error.message
        });
    }

    // TEST 3: Geo Intelligence Data
    console.log('\n--- TEST 3: Geo Intelligence ---');
    try {
        // @ts-ignore
        const clusters = await client.request(readItems('geo_clusters', { limit: -1 }));
        // @ts-ignore
        const locations = await client.request(readItems('geo_locations', { limit: -1 }));

        logTest({
            name: 'Geo Clusters',
            status: clusters.length > 0 ? 'PASS' : 'WARN',
            message: `Found ${clusters.length} clusters`,
            details: clusters.length > 0 ? clusters.map((c: any) => c.cluster_name) : 'No data'
        });

        logTest({
            name: 'Geo Locations',
            status: locations.length > 0 ? 'PASS' : 'WARN',
            message: `Found ${locations.length} locations`,
            details: locations.length > 0 ? `${new Set(locations.map((l: any) => l.state)).size} states` : 'No data'
        });
    } catch (error: any) {
        logTest({
            name: 'Geo Intelligence',
            status: 'FAIL',
            message: 'Failed to read geo data',
            details: error.message
        });
    }

    // TEST 4: Avatar Variants
    console.log('\n--- TEST 4: Avatar Variants ---');
    try {
        // @ts-ignore
        const variants = await client.request(readItems('avatar_variants', { limit: -1 }));

        logTest({
            name: 'Avatar Variants',
            status: variants.length > 0 ? 'PASS' : 'WARN',
            message: `Found ${variants.length} variants`,
            details: variants.length > 0 ? {
                sample: variants[0],
                total: variants.length
            } : 'No data'
        });
    } catch (error: any) {
        logTest({
            name: 'Avatar Variants',
            status: 'FAIL',
            message: 'Failed to read avatar variants',
            details: error.message
        });
    }

    // TEST 5: Spintax Dictionaries
    console.log('\n--- TEST 5: Spintax Dictionaries ---');
    try {
        // @ts-ignore
        const dictionaries = await client.request(readItems('spintax_dictionaries', { limit: -1 }));

        logTest({
            name: 'Spintax Dictionaries',
            status: dictionaries.length > 0 ? 'PASS' : 'WARN',
            message: `Found ${dictionaries.length} dictionaries`,
            details: dictionaries.length > 0 ? {
                categories: dictionaries.map((d: any) => d.category),
                total_terms: dictionaries.reduce((sum: number, d: any) => sum + (d.words?.length || d.data?.length || 0), 0)
            } : 'No data'
        });
    } catch (error: any) {
        logTest({
            name: 'Spintax Dictionaries',
            status: 'FAIL',
            message: 'Failed to read spintax dictionaries',
            details: error.message
        });
    }

    // TEST 6: Cartesian Patterns
    console.log('\n--- TEST 6: Cartesian Patterns ---');
    try {
        // @ts-ignore
        const patterns = await client.request(readItems('cartesian_patterns', { limit: -1 }));

        logTest({
            name: 'Cartesian Patterns',
            status: patterns.length > 0 ? 'PASS' : 'WARN',
            message: `Found ${patterns.length} patterns`,
            details: patterns.length > 0 ? {
                categories: [...new Set(patterns.map((p: any) => p.category))],
                sample: patterns[0]
            } : 'No data'
        });
    } catch (error: any) {
        logTest({
            name: 'Cartesian Patterns',
            status: 'FAIL',
            message: 'Failed to read cartesian patterns',
            details: error.message
        });
    }

    // TEST 7: Sites
    console.log('\n--- TEST 7: Sites ---');
    try {
        // @ts-ignore
        const sites = await client.request(readItems('sites', { limit: -1 }));

        logTest({
            name: 'Sites',
            status: sites.length > 0 ? 'PASS' : 'WARN',
            message: `Found ${sites.length} sites`,
            details: sites.length > 0 ? sites.map((s: any) => ({ name: s.name, url: s.url })) : 'No data'
        });
    } catch (error: any) {
        logTest({
            name: 'Sites',
            status: 'FAIL',
            message: 'Failed to read sites',
            details: error.message
        });
    }

    // TEST 8: Generation Jobs
    console.log('\n--- TEST 8: Generation Jobs ---');
    try {
        // @ts-ignore
        const jobs = await client.request(readItems('generation_jobs', { limit: 10, sort: ['-date_created'] }));

        logTest({
            name: 'Generation Jobs',
            status: 'PASS',
            message: `Found ${jobs.length} recent jobs`,
            details: jobs.length > 0 ? {
                recent: jobs.slice(0, 3).map((j: any) => ({
                    id: j.id,
                    status: j.status,
                    type: j.type
                }))
            } : 'No jobs yet'
        });
    } catch (error: any) {
        logTest({
            name: 'Generation Jobs',
            status: 'FAIL',
            message: 'Failed to read generation jobs',
            details: error.message
        });
    }

    // TEST 9: Generated Articles
    console.log('\n--- TEST 9: Generated Articles ---');
    try {
        // @ts-ignore
        const articles = await client.request(readItems('generated_articles', { limit: 10, sort: ['-date_created'] }));

        logTest({
            name: 'Generated Articles',
            status: 'PASS',
            message: `Found ${articles.length} recent articles`,
            details: articles.length > 0 ? {
                recent: articles.slice(0, 3).map((a: any) => ({
                    id: a.id,
                    title: a.title,
                    slug: a.slug
                }))
            } : 'No articles yet'
        });
    } catch (error: any) {
        logTest({
            name: 'Generated Articles',
            status: 'FAIL',
            message: 'Failed to read generated articles',
            details: error.message
        });
    }

    // TEST 10: Work Log
    console.log('\n--- TEST 10: Work Log ---');
    try {
        // @ts-ignore
        const logs = await client.request(readItems('work_log', { limit: 10, sort: ['-date_created'] }));

        logTest({
            name: 'Work Log',
            status: 'PASS',
            message: `Found ${logs.length} recent log entries`,
            details: logs.length > 0 ? {
                recent: logs.slice(0, 3).map((l: any) => ({
                    action: l.action,
                    status: l.status
                }))
            } : 'No logs yet'
        });
    } catch (error: any) {
        logTest({
            name: 'Work Log',
            status: 'FAIL',
            message: 'Failed to read work log',
            details: error.message
        });
    }

    // SUMMARY
    console.log('\n' + '='.repeat(60));
    console.log('📊 DIAGNOSTIC SUMMARY');
    console.log('='.repeat(60) + '\n');

    const passed = results.filter(r => r.status === 'PASS').length;
    const warned = results.filter(r => r.status === 'WARN').length;
    const failed = results.filter(r => r.status === 'FAIL').length;

    console.log(`✅ PASSED: ${passed}`);
    console.log(`⚠️  WARNINGS: ${warned}`);
    console.log(`❌ FAILED: ${failed}`);
    console.log(`📝 TOTAL TESTS: ${results.length}\n`);

    if (failed === 0 && warned === 0) {
        console.log('🎉 ALL SYSTEMS OPERATIONAL!\n');
        console.log('Your Spark Platform is fully connected and ready to use.\n');
    } else if (failed === 0) {
        console.log('✅ CORE SYSTEMS OPERATIONAL\n');
        console.log('⚠️  Some collections are empty but functional.\n');
        console.log('💡 Run the data import script to populate:\n');
        console.log('   cd backend && npx ts-node scripts/init_schema.ts\n');
    } else {
        console.log('❌ ISSUES DETECTED\n');
        console.log('Please review the failed tests above.\n');
    }

    console.log('='.repeat(60) + '\n');
}

runDiagnostics().catch(console.error);
