#!/usr/bin/env node

/**
 * Deep Schema Inspector
 * Gets complete field details for all collections to fix relationship issues
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

async function inspectSchema() {
    console.log('🔍 DEEP SCHEMA INSPECTION\n');
    console.log('═'.repeat(80));

    // Get all collections
    const collectionsData = await makeRequest('/collections');
    const collections = collectionsData.data.filter(c => !c.collection.startsWith('directus_'));

    // Get all fields
    const fieldsData = await makeRequest('/fields');

    // Get all relations
    const relationsData = await makeRequest('/relations');

    const schemaMap = {};

    console.log('\n📦 COLLECTION FIELD DETAILS\n');

    for (const collection of collections) {
        const collectionName = collection.collection;
        const fields = fieldsData.data.filter(f => f.collection === collectionName);

        console.log(`\n${'='.repeat(80)}`);
        console.log(`📁 ${collectionName.toUpperCase()}`);
        console.log('='.repeat(80));

        schemaMap[collectionName] = {
            fields: {},
            relations: []
        };

        // Show sample data to see actual field names
        try {
            const sampleData = await makeRequest(`/items/${collectionName}?limit=1`);
            if (sampleData.data && sampleData.data.length > 0) {
                const sample = sampleData.data[0];
                console.log('\n🔬 SAMPLE RECORD FIELDS:');
                Object.keys(sample).forEach(key => {
                    const value = sample[key];
                    const type = Array.isArray(value) ? 'array' : typeof value;
                    console.log(`  • ${key.padEnd(30)} = ${type.padEnd(10)} ${type === 'string' || type === 'number' ? `(${String(value).substring(0, 40)})` : ''}`);
                });
            }
        } catch (err) {
            console.log('\n⚠️  Could not fetch sample data');
        }

        console.log('\n📋 FIELD SCHEMA:');
        fields.forEach(field => {
            const info = {
                type: field.type,
                interface: field.meta?.interface || 'none',
                required: field.meta?.required || false,
                display: field.meta?.display || 'none'
            };

            schemaMap[collectionName].fields[field.field] = info;

            console.log(`  ${field.field.padEnd(30)} | ${field.type.padEnd(15)} | ${info.interface}`);

            // Show relationship details
            if (field.meta?.interface?.includes('select-dropdown-m2o')) {
                const template = field.meta?.options?.template || 'NOT SET';
                console.log(`     └─ Template: ${template}`);
            }
        });

        // Show relations for this collection
        const relations = relationsData.data.filter(r =>
            r.collection === collectionName || r.related_collection === collectionName
        );

        if (relations.length > 0) {
            console.log('\n🔗 RELATIONSHIPS:');
            relations.forEach(rel => {
                schemaMap[collectionName].relations.push(rel);
                if (rel.collection === collectionName) {
                    console.log(`  → Many-to-One: ${rel.field} → ${rel.related_collection}`);
                } else {
                    console.log(`  ← One-to-Many: ${rel.related_collection}.${rel.field || rel.meta?.many_field || '?'}`);
                }
            });
        }
    }

    // Check for problematic relationship templates
    console.log('\n\n' + '═'.repeat(80));
    console.log('🔍 RELATIONSHIP TEMPLATE VALIDATION');
    console.log('═'.repeat(80));

    const issues = [];

    for (const [collectionName, schema] of Object.entries(schemaMap)) {
        for (const [fieldName, fieldInfo] of Object.entries(schema.fields)) {
            if (fieldInfo.interface?.includes('m2o')) {
                // Get the field meta to check template
                const fieldDetail = fieldsData.data.find(f =>
                    f.collection === collectionName && f.field === fieldName
                );

                if (fieldDetail?.meta?.options?.template) {
                    const template = fieldDetail.meta.options.template;
                    const relation = relationsData.data.find(r =>
                        r.collection === collectionName && r.field === fieldName
                    );

                    if (relation) {
                        const targetCollection = relation.related_collection;
                        const targetFields = schemaMap[targetCollection]?.fields || {};

                        // Extract field name from template (e.g., "{{campaign_name}}" → "campaign_name")
                        const templateFieldMatch = template.match(/\{\{(\w+)\}\}/);
                        if (templateFieldMatch) {
                            const templateField = templateFieldMatch[1];

                            if (!targetFields[templateField]) {
                                issues.push({
                                    collection: collectionName,
                                    field: fieldName,
                                    targetCollection,
                                    templateField,
                                    issue: `Template references non-existent field "${templateField}"`
                                });
                                console.log(`\n❌ ${collectionName}.${fieldName}`);
                                console.log(`   Target: ${targetCollection}`);
                                console.log(`   Template: ${template}`);
                                console.log(`   Issue: Field "${templateField}" does not exist in ${targetCollection}`);
                                console.log(`   Available fields: ${Object.keys(targetFields).join(', ')}`);
                            } else {
                                console.log(`\n✅ ${collectionName}.${fieldName} → ${targetCollection}.${templateField}`);
                            }
                        }
                    }
                }
            }
        }
    }

    // Save schema map
    const fs = require('fs');
    fs.writeFileSync('schema_map.json', JSON.stringify(schemaMap, null, 2));
    console.log('\n\n📄 Complete schema map saved to: schema_map.json');

    if (issues.length > 0) {
        console.log(`\n⚠️  Found ${issues.length} relationship template issues\n`);
        fs.writeFileSync('schema_issues.json', JSON.stringify(issues, null, 2));
        console.log('📄 Issues saved to: schema_issues.json\n');
    } else {
        console.log('\n✅ All relationship templates are valid!\n');
    }

    return { schemaMap, issues };
}

inspectSchema()
    .then(({ issues }) => {
        process.exit(issues.length > 0 ? 1 : 0);
    })
    .catch(err => {
        console.error('❌ Inspection failed:', err.message);
        process.exit(1);
    });
