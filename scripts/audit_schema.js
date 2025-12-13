#!/usr/bin/env node

/**
 * Comprehensive Directus Schema Audit
 * Checks all collections, fields, relationships, and interfaces
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
        throw new Error(`API Error: ${response.status} - ${await response.text()}`);
    }
    return response.json();
}

async function auditSchema() {
    console.log('🔍 DIRECTUS SCHEMA AUDIT\n');
    console.log('═'.repeat(60));

    const audit = {
        collections: [],
        issues: [],
        recommendations: []
    };

    // Get all collections
    const collectionsData = await makeRequest('/collections');
    const collections = collectionsData.data.filter(c => !c.collection.startsWith('directus_'));

    console.log(`\n📦 Found ${collections.length} user collections\n`);

    // Get all fields
    const fieldsData = await makeRequest('/fields');
    const allFields = fieldsData.data;

    // Get all relations
    const relationsData = await makeRequest('/relations');
    const allRelations = relationsData.data;

    // Audit each collection
    for (const collection of collections) {
        console.log(`\n📁 Collection: ${collection.collection}`);
        console.log('─'.repeat(60));

        const collectionFields = allFields.filter(f => f.collection === collection.collection);
        const collectionRelations = allRelations.filter(r =>
            r.collection === collection.collection || r.related_collection === collection.collection
        );

        // Count records
        try {
            const countData = await makeRequest(`/items/${collection.collection}?aggregate[count]=*`);
            const count = countData.data?.[0]?.count || 0;
            console.log(`📊 Records: ${count}`);
        } catch (err) {
            console.log(`📊 Records: Unable to count`);
        }

        console.log(`\n🔧 Fields (${collectionFields.length}):`);

        const auditedFields = [];

        for (const field of collectionFields) {
            const fieldInfo = {
                field: field.field,
                type: field.type,
                interface: field.meta?.interface || 'none',
                required: field.meta?.required || false,
                readonly: field.meta?.readonly || false,
                hidden: field.meta?.hidden || false,
                hasOptions: !!field.meta?.options,
                issues: []
            };

            // Check for common issues
            if (field.field.includes('_id') && !field.meta?.interface?.includes('select')) {
                fieldInfo.issues.push('ID field without relational interface');
            }

            if (field.type === 'json' && field.meta?.interface === 'input') {
                fieldInfo.issues.push('JSON field using text input instead of JSON editor');
            }

            if (field.field === 'status' && field.meta?.interface !== 'select-dropdown') {
                fieldInfo.issues.push('Status field should use select-dropdown');
            }

            auditedFields.push(fieldInfo);

            // Display field
            const issueFlag = fieldInfo.issues.length > 0 ? '⚠️ ' : '  ';
            console.log(`${issueFlag} ${field.field.padEnd(25)} | ${field.type.padEnd(15)} | ${fieldInfo.interface}`);

            if (fieldInfo.issues.length > 0) {
                fieldInfo.issues.forEach(issue => {
                    console.log(`     └─ Issue: ${issue}`);
                    audit.issues.push({
                        collection: collection.collection,
                        field: field.field,
                        issue
                    });
                });
            }
        }

        console.log(`\n🔗 Relationships (${collectionRelations.length}):`);

        if (collectionRelations.length === 0) {
            console.log('   No relationships defined');

            // Check if this collection should have relationships
            if (['posts', 'pages', 'generated_articles'].includes(collection.collection)) {
                audit.recommendations.push({
                    collection: collection.collection,
                    recommendation: 'Should have relationship to sites collection'
                });
            }
        } else {
            collectionRelations.forEach(rel => {
                const relType = rel.collection === collection.collection ? 'Many-to-One' : 'One-to-Many';
                const target = rel.collection === collection.collection ? rel.related_collection : rel.collection;
                const field = rel.field || rel.meta?.many_field || 'unknown';
                console.log(`   ${relType}: ${field} → ${target}`);
            });
        }

        audit.collections.push({
            name: collection.collection,
            fields: auditedFields,
            relationships: collectionRelations
        });
    }

    // Summary
    console.log('\n\n═'.repeat(60));
    console.log('📋 AUDIT SUMMARY');
    console.log('═'.repeat(60));

    console.log(`\n✅ Total Collections: ${collections.length}`);
    console.log(`⚠️  Total Issues Found: ${audit.issues.length}`);
    console.log(`💡 Recommendations: ${audit.recommendations.length}`);

    if (audit.issues.length > 0) {
        console.log('\n🔧 ISSUES TO FIX:\n');
        const groupedIssues = {};
        audit.issues.forEach(issue => {
            if (!groupedIssues[issue.collection]) {
                groupedIssues[issue.collection] = [];
            }
            groupedIssues[issue.collection].push(issue);
        });

        for (const [collection, issues] of Object.entries(groupedIssues)) {
            console.log(`\n${collection}:`);
            issues.forEach(issue => {
                console.log(`  • ${issue.field}: ${issue.issue}`);
            });
        }
    }

    if (audit.recommendations.length > 0) {
        console.log('\n\n💡 RECOMMENDATIONS:\n');
        audit.recommendations.forEach(rec => {
            console.log(`  • ${rec.collection}: ${rec.recommendation}`);
        });
    }

    // Check for missing critical collections
    console.log('\n\n🔍 CRITICAL COLLECTION CHECK:\n');
    const criticalCollections = {
        'sites': 'Multi-tenant site management',
        'posts': 'WordPress imported posts',
        'pages': 'Static pages',
        'generated_articles': 'AI-generated content',
        'generation_jobs': 'Batch generation tracking',
        'avatar_intelligence': 'Customer personas',
        'geo_intelligence': 'Location data',
        'cartesian_patterns': 'Content templates',
        'spintax_dictionaries': 'Content variations'
    };

    const foundCollectionNames = collections.map(c => c.collection);

    for (const [name, purpose] of Object.entries(criticalCollections)) {
        if (foundCollectionNames.includes(name)) {
            console.log(`  ✅ ${name.padEnd(25)} - ${purpose}`);
        } else {
            console.log(`  ❌ ${name.padEnd(25)} - MISSING: ${purpose}`);
            audit.issues.push({
                collection: name,
                field: 'N/A',
                issue: `Missing critical collection: ${purpose}`
            });
        }
    }

    console.log('\n═'.repeat(60));
    console.log('Audit complete! See issues and recommendations above.');
    console.log('═'.repeat(60) + '\n');

    return audit;
}

// Run audit
auditSchema()
    .then(audit => {
        // Save audit report
        const fs = require('fs');
        fs.writeFileSync(
            'schema_audit_report.json',
            JSON.stringify(audit, null, 2)
        );
        console.log('📄 Detailed report saved to: schema_audit_report.json\n');
    })
    .catch(err => {
        console.error('❌ Audit failed:', err.message);
        process.exit(1);
    });
