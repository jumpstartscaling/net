/**
 * Spark Platform - Directus Schema Import Script
 * Uses only fetch API - no external dependencies
 */

const DIRECTUS_URL = process.env.PUBLIC_URL || process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.ADMIN_TOKEN || process.env.DIRECTUS_ADMIN_TOKEN;

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (!DIRECTUS_TOKEN) {
    console.error('❌ ADMIN_TOKEN is required');
    console.log('Run: export ADMIN_TOKEN="your-token-here"');
    console.log('Get token from: Directus Admin → Settings → Access Tokens');
    process.exit(1);
}

// Load schema files
const collectionsPath = join(__dirname, '../template/src/collections.json');
const fieldsPath = join(__dirname, '../template/src/fields.json');
const relationsPath = join(__dirname, '../template/src/relations.json');

let collections, fields, relations;

try {
    collections = JSON.parse(readFileSync(collectionsPath, 'utf8'));
    fields = JSON.parse(readFileSync(fieldsPath, 'utf8'));
    relations = JSON.parse(readFileSync(relationsPath, 'utf8'));
} catch (err) {
    console.error('❌ Failed to load schema files:', err.message);
    process.exit(1);
}

async function apiRequest(method, endpoint, body = null) {
    const options = {
        method,
        headers: {
            'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
            'Content-Type': 'application/json'
        }
    };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(`${DIRECTUS_URL}${endpoint}`, options);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.errors?.[0]?.message || response.statusText);
    }
    return data;
}

async function importSchema() {
    console.log('🚀 Starting Spark Platform schema import...');
    console.log(`   URL: ${DIRECTUS_URL}\n`);

    // Create collections
    console.log('📦 Creating collections...');
    for (const collection of collections) {
        try {
            await apiRequest('POST', '/collections', collection);
            console.log(`  ✅ ${collection.collection}`);
        } catch (err) {
            if (err.message?.includes('already exists')) {
                console.log(`  ⏭️  ${collection.collection} (exists)`);
            } else {
                console.log(`  ❌ ${collection.collection}: ${err.message}`);
            }
        }
    }

    // Create fields
    console.log('\n📝 Creating fields...');
    for (const [collectionName, collectionFields] of Object.entries(fields)) {
        for (const field of collectionFields) {
            try {
                await apiRequest('POST', `/fields/${collectionName}`, field);
                console.log(`  ✅ ${collectionName}.${field.field}`);
            } catch (err) {
                if (err.message?.includes('already exists')) {
                    console.log(`  ⏭️  ${collectionName}.${field.field} (exists)`);
                } else {
                    console.log(`  ❌ ${collectionName}.${field.field}: ${err.message}`);
                }
            }
        }
    }

    // Create relations
    console.log('\n🔗 Creating relations...');
    for (const relation of relations) {
        try {
            await apiRequest('POST', '/relations', relation);
            console.log(`  ✅ ${relation.collection}.${relation.field} → ${relation.related_collection}`);
        } catch (err) {
            if (err.message?.includes('already exists')) {
                console.log(`  ⏭️  ${relation.collection}.${relation.field} (exists)`);
            } else {
                console.log(`  ❌ ${relation.collection}.${relation.field}: ${err.message}`);
            }
        }
    }

    console.log('\n✨ Schema import complete!');
}

importSchema().catch(err => {
    console.error('❌ Import failed:', err);
    process.exit(1);
});
