/**
 * Spark Platform - Directus Schema Import Script
 * 
 * This script imports the collections, fields, and relations from the template
 * into a fresh Directus instance.
 * 
 * Usage: node scripts/import_template.js
 */

import { createDirectus, rest, staticToken } from '@directus/sdk';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DIRECTUS_URL = process.env.PUBLIC_URL || process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.ADMIN_TOKEN || process.env.DIRECTUS_ADMIN_TOKEN;

if (!DIRECTUS_TOKEN) {
    console.error('❌ ADMIN_TOKEN or DIRECTUS_ADMIN_TOKEN is required');
    console.log('Set it in your environment or run: export ADMIN_TOKEN=your-token');
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

const directus = createDirectus(DIRECTUS_URL).with(rest()).with(staticToken(DIRECTUS_TOKEN));

async function createCollection(collection) {
    const response = await fetch(`${DIRECTUS_URL}/collections`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(collection)
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.errors?.[0]?.message || response.statusText);
    }
    return response.json();
}

async function createField(collectionName, field) {
    const response = await fetch(`${DIRECTUS_URL}/fields/${collectionName}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(field)
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.errors?.[0]?.message || response.statusText);
    }
    return response.json();
}

async function createRelation(relation) {
    const response = await fetch(`${DIRECTUS_URL}/relations`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(relation)
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.errors?.[0]?.message || response.statusText);
    }
    return response.json();
}

async function importSchema() {
    console.log('🚀 Starting Spark Platform schema import...');
    console.log(`   Directus URL: ${DIRECTUS_URL}\n`);

    // Create collections
    console.log('📦 Creating collections...');
    for (const collection of collections) {
        try {
            await createCollection(collection);
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
                await createField(collectionName, field);
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
            await createRelation(relation);
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

importSchema().catch((err) => {
    console.error('❌ Import failed:', err);
    process.exit(1);
});
