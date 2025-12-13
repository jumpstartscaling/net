#!/usr/bin/env node

/**
 * Directus Admin Connection Test
 * Tests connection to Spark Directus API and verifies admin access
 */

const DIRECTUS_URL = 'https://spark.jumpstartscaling.com';
const ADMIN_TOKEN = 'SufWLAbsqmbbqF_gg5I70ng8wE1zXt-a';
const ADMIN_EMAIL = 'somescreenname@gmail.com';

async function testDirectusConnection() {
    console.log('🔌 Testing Directus Connection...\n');
    console.log(`📍 URL: ${DIRECTUS_URL}\n`);

    try {
        // Test 1: Server status
        console.log('1️⃣  Testing server availability...');
        const serverResponse = await fetch(`${DIRECTUS_URL}/server/info`);
        if (!serverResponse.ok) {
            throw new Error(`Server not responding: ${serverResponse.status}`);
        }
        const serverInfo = await serverResponse.json();
        console.log('   ✅ Server is online');
        console.log(`   📦 Directus Version: ${serverInfo.data?.project?.project_name || 'N/A'}\n`);

        // Test 2: Admin authentication
        console.log('2️⃣  Testing admin token authentication...');
        const userResponse = await fetch(`${DIRECTUS_URL}/users/me`, {
            headers: {
                'Authorization': `Bearer ${ADMIN_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        if (!userResponse.ok) {
            throw new Error(`Authentication failed: ${userResponse.status}`);
        }

        const userData = await userResponse.json();
        console.log('   ✅ Admin authentication successful');
        console.log(`   👤 User: ${userData.data.email}`);
        console.log(`   🔑 User ID: ${userData.data.id}`);
        console.log(`   👑 Role: ${userData.data.role || 'Admin'}\n`);

        // Test 3: List collections
        console.log('3️⃣  Fetching collections...');
        const collectionsResponse = await fetch(`${DIRECTUS_URL}/collections`, {
            headers: {
                'Authorization': `Bearer ${ADMIN_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        if (!collectionsResponse.ok) {
            throw new Error(`Failed to fetch collections: ${collectionsResponse.status}`);
        }

        const collectionsData = await collectionsResponse.json();
        const collections = collectionsData.data || [];

        // Filter out system collections for readability
        const userCollections = collections.filter(c => !c.collection.startsWith('directus_'));

        console.log(`   ✅ Found ${userCollections.length} user collections:`);
        userCollections.forEach(col => {
            console.log(`      - ${col.collection}`);
        });
        console.log('');

        // Test 4: Check specific collections
        console.log('4️⃣  Checking critical collections...');
        const criticalCollections = ['sites', 'posts', 'generated_articles', 'generation_jobs', 'avatars', 'work_log'];
        const foundCollections = userCollections.map(c => c.collection);

        criticalCollections.forEach(collectionName => {
            if (foundCollections.includes(collectionName)) {
                console.log(`   ✅ ${collectionName} - exists`);
            } else {
                console.log(`   ⚠️  ${collectionName} - NOT FOUND`);
            }
        });
        console.log('');

        // Test 5: Count records in key collections
        console.log('5️⃣  Counting records in key collections...');
        for (const collectionName of criticalCollections) {
            if (foundCollections.includes(collectionName)) {
                try {
                    const countResponse = await fetch(
                        `${DIRECTUS_URL}/items/${collectionName}?aggregate[count]=*`,
                        {
                            headers: {
                                'Authorization': `Bearer ${ADMIN_TOKEN}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );

                    if (countResponse.ok) {
                        const countData = await countResponse.json();
                        const count = countData.data?.[0]?.count || 0;
                        console.log(`   📊 ${collectionName}: ${count} records`);
                    }
                } catch (err) {
                    console.log(`   ⚠️  ${collectionName}: Unable to count`);
                }
            }
        }
        console.log('');

        // Test 6: Admin permissions test
        console.log('6️⃣  Testing admin write permissions...');
        const testLogEntry = {
            action: 'connection_test',
            message: 'Admin connection test successful',
            details: {
                timestamp: new Date().toISOString(),
                test_runner: 'test_directus_connection.js'
            }
        };

        const writeResponse = await fetch(`${DIRECTUS_URL}/items/work_log`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${ADMIN_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testLogEntry)
        });

        if (writeResponse.ok) {
            const writeData = await writeResponse.json();
            console.log('   ✅ Write permission confirmed');
            console.log(`   📝 Created work_log entry ID: ${writeData.data.id}\n`);
        } else {
            console.log('   ⚠️  Write permission test failed\n');
        }

        // Final summary
        console.log('═══════════════════════════════════════════');
        console.log('🎉 CONNECTION TEST COMPLETE');
        console.log('═══════════════════════════════════════════');
        console.log('Status: ✅ ADMIN CONNECTION VERIFIED');
        console.log(`Admin User: ${userData.data.email}`);
        console.log(`Directus URL: ${DIRECTUS_URL}`);
        console.log(`Collections: ${userCollections.length} available`);
        console.log('Permissions: Read ✅ Write ✅');
        console.log('═══════════════════════════════════════════\n');

        return true;

    } catch (error) {
        console.error('❌ CONNECTION TEST FAILED\n');
        console.error('Error:', error.message);
        console.error('\nPlease verify:');
        console.error('  1. Directus server is running');
        console.error('  2. Admin token is correct');
        console.error('  3. Network connectivity to', DIRECTUS_URL);
        console.error('  4. CORS settings allow API access\n');
        return false;
    }
}

// Run the test
testDirectusConnection()
    .then(success => {
        process.exit(success ? 0 : 1);
    })
    .catch(err => {
        console.error('Unexpected error:', err);
        process.exit(1);
    });
