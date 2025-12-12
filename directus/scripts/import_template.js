/**
 * Spark Platform - Directus Schema Import Script
 * 
 * This script imports the collections, fields, and relations from the template
 * into a fresh Directus instance.
 * 
 * Usage: node scripts/import_template.js
 */

require('dotenv').config();
const { createDirectus, rest, staticToken, schemaApply, createCollection, createField, createRelation } = require('@directus/sdk');
const collections = require('../template/src/collections.json');
const fields = require('../template/src/fields.json');
const relations = require('../template/src/relations.json');

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_ADMIN_TOKEN;

if (!DIRECTUS_TOKEN) {
    console.error('❌ DIRECTUS_ADMIN_TOKEN is required');
    process.exit(1);
}

const directus = createDirectus(DIRECTUS_URL).with(rest()).with(staticToken(DIRECTUS_TOKEN));

async function importSchema() {
    console.log('🚀 Starting Spark Platform schema import...\n');

    // Create collections
    console.log('📦 Creating collections...');
    for (const collection of collections) {
        try {
            await directus.request(createCollection(collection));
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
                await directus.request(createField(collectionName, field));
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
            await directus.request(createRelation(relation));
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

importSchema().catch(console.error);
