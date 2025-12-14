import { createDirectus, rest, authentication, readCollections } from '@directus/sdk';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../credentials.env') });

const DIRECTUS_URL = process.env.DIRECTUS_PUBLIC_URL;
const EMAIL = process.env.DIRECTUS_ADMIN_EMAIL;
const PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD;

async function verifySystem() {
    console.log('🔍 System Diagnostic Starting...\n');

    // 1. Directus Connection
    console.log(`[1/3] Testing Directus Connection at ${DIRECTUS_URL}...`);
    if (!DIRECTUS_URL || !EMAIL || !PASSWORD) {
        console.error('❌ Missing credentials in credentials.env');
        return;
    }

    try {
        const client = createDirectus(DIRECTUS_URL).with(authentication()).with(rest());
        await client.login(EMAIL, PASSWORD);
        console.log('✅ Directus Auth: SUCCESS');

        // Check Priority 1 Collections
        const requiredCollections = [
            'avatars', 'avatar_variants', 'geo_clusters', 'spintax_dictionaries', 'cartesian_patterns'
        ];

        console.log('\nChecking Priority 1 Collections:');
        // @ts-ignore
        const collections = await client.request(readCollections());
        const collectionNames = collections.map((c: any) => c.collection);

        let missing = [];
        for (const req of requiredCollections) {
            if (collectionNames.includes(req)) {
                console.log(`  ✅ ${req}`);
            } else {
                console.log(`  ❌ ${req} (MISSING)`);
                missing.push(req);
            }
        }

        if (missing.length === 0) {
            console.log('\n✅ All Priority 1 Collections Configured.');
        } else {
            console.error('\n❌ Critical Collections Missing!');
        }

    } catch (error: any) {
        console.error('❌ Directus Connection Failed:', error.message);
    }

    // 2. Coolify Token (Static Check)
    console.log('\n[2/3] Checking Coolify Configuration...');
    if (process.env.COOLIFY_TOKEN) {
        console.log('✅ COOLIFY_TOKEN found in env.');
    } else {
        console.log('⚠️  COOLIFY_TOKEN not found in credentials.env (Deployment checks may fail).');
    }

    // 3. SSH (Environment Check)
    console.log('\n[3/3] Checking SSH Configuration...');
    if (process.env.SSH_PRIVATE_KEY) {
        console.log('✅ SSH_PRIVATE_KEY found in env.');
    } else {
        console.log('⚠️  SSH_PRIVATE_KEY not found in credentials.env.');
    }
}

verifySystem();
