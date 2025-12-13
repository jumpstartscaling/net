#!/usr/bin/env node

/**
 * Directus Bulk Import/Export Utility
 * Allows bulk import and export of any collection as JSON
 */

const fs = require('fs');
const path = require('path');

const DIRECTUS_URL = 'https://spark.jumpstartscaling.com';
const ADMIN_TOKEN = 'SufWLAbsqmbbqF_gg5I70ng8wE1zXt-a';
const EXPORT_DIR = './exports';

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

async function exportCollection(collectionName, filename = null) {
    console.log(`\n📤 Exporting ${collectionName}...`);

    try {
        // Fetch all items (with pagination if needed)
        let allItems = [];
        let offset = 0;
        const limit = 100;
        let hasMore = true;

        while (hasMore) {
            const data = await makeRequest(
                `/items/${collectionName}?limit=${limit}&offset=${offset}&meta=filter_count`
            );

            const items = data.data || [];
            allItems = allItems.concat(items);

            const totalCount = data.meta?.filter_count || items.length;
            offset += items.length;
            hasMore = items.length === limit && offset < totalCount;

            console.log(`  📊 Fetched ${offset} of ${totalCount} records...`);
        }

        // Create export directory if it doesn't exist
        if (!fs.existsSync(EXPORT_DIR)) {
            fs.mkdirSync(EXPORT_DIR, { recursive: true });
        }

        // Save to file
        const exportFilename = filename || `${collectionName}_${new Date().toISOString().split('T')[0]}.json`;
        const exportPath = path.join(EXPORT_DIR, exportFilename);

        const exportData = {
            collection: collectionName,
            exportedAt: new Date().toISOString(),
            recordCount: allItems.length,
            data: allItems
        };

        fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));

        console.log(`  ✅ Exported ${allItems.length} records to: ${exportPath}`);
        return { collection: collectionName, count: allItems.length, file: exportPath };

    } catch (err) {
        console.log(`  ❌ Export failed: ${err.message}`);
        return null;
    }
}

async function importCollection(collectionName, filename) {
    console.log(`\n📥 Importing to ${collectionName} from ${filename}...`);

    try {
        // Read import file
        const importPath = path.join(EXPORT_DIR, filename);
        if (!fs.existsSync(importPath)) {
            throw new Error(`Import file not found: ${importPath}`);
        }

        const fileContent = fs.readFileSync(importPath, 'utf-8');
        const importData = JSON.parse(fileContent);

        if (importData.collection !== collectionName) {
            console.log(`  ⚠️  Warning: File is for collection '${importData.collection}' but importing to '${collectionName}'`);
        }

        const items = importData.data || [];
        console.log(`  📊 Found ${items.length} records to import`);

        // Import in batches
        const batchSize = 50;
        let imported = 0;
        let failed = 0;

        for (let i = 0; i < items.length; i += batchSize) {
            const batch = items.slice(i, i + batchSize);

            try {
                // Try to create each item individually to handle conflicts
                for (const item of batch) {
                    try {
                        await makeRequest(`/items/${collectionName}`, 'POST', item);
                        imported++;
                    } catch (err) {
                        // If conflict, try to update instead
                        if (err.message.includes('409') || err.message.includes('duplicate')) {
                            try {
                                if (item.id) {
                                    await makeRequest(`/items/${collectionName}/${item.id}`, 'PATCH', item);
                                    imported++;
                                    console.log(`    Updated existing record: ${item.id}`);
                                }
                            } catch (updateErr) {
                                failed++;
                                console.log(`    ⚠️  Failed to update: ${item.id}`);
                            }
                        } else {
                            failed++;
                            console.log(`    ⚠️  Failed to import record: ${err.message.substring(0, 100)}`);
                        }
                    }
                }

                console.log(`  📊 Progress: ${Math.min(i + batchSize, items.length)}/${items.length}`);

            } catch (err) {
                console.log(`  ⚠️  Batch failed: ${err.message}`);
                failed += batch.length;
            }
        }

        console.log(`  ✅ Import complete: ${imported} imported, ${failed} failed`);
        return { collection: collectionName, imported, failed };

    } catch (err) {
        console.log(`  ❌ Import failed: ${err.message}`);
        return null;
    }
}

async function exportAllCollections() {
    console.log('\n🗂️  BULK EXPORT ALL COLLECTIONS\n');
    console.log('═'.repeat(60));

    // Get all collections
    const collectionsData = await makeRequest('/collections');
    const collections = collectionsData.data
        .filter(c => !c.collection.startsWith('directus_'))
        .map(c => c.collection);

    console.log(`\n📦 Found ${collections.length} collections to export\n`);

    const results = [];

    for (const collection of collections) {
        const result = await exportCollection(collection);
        if (result) {
            results.push(result);
        }
    }

    console.log('\n\n═'.repeat(60));
    console.log('📊 EXPORT SUMMARY');
    console.log('═'.repeat(60));

    let totalRecords = 0;
    results.forEach(r => {
        console.log(`  ${r.collection.padEnd(30)} ${r.count.toString().padStart(6)} records`);
        totalRecords += r.count;
    });

    console.log('═'.repeat(60));
    console.log(`  TOTAL:${' '.repeat(24)}${totalRecords.toString().padStart(6)} records`);
    console.log('\n📁 All exports saved to: ' + path.resolve(EXPORT_DIR) + '\n');
}

async function listExports() {
    console.log('\n📁 AVAILABLE EXPORTS\n');
    console.log('═'.repeat(60));

    if (!fs.existsSync(EXPORT_DIR)) {
        console.log('  No exports directory found.');
        return;
    }

    const files = fs.readdirSync(EXPORT_DIR).filter(f => f.endsWith('.json'));

    if (files.length === 0) {
        console.log('  No export files found.');
        return;
    }

    files.forEach(file => {
        const filePath = path.join(EXPORT_DIR, file);
        const stats = fs.statSync(filePath);
        const sizeInMB = (stats.size / 1024 / 1024).toFixed(2);

        try {
            const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            console.log(`  📄 ${file}`);
            console.log(`     Collection: ${content.collection || 'unknown'}`);
            console.log(`     Records: ${content.recordCount || 0}`);
            console.log(`     Size: ${sizeInMB} MB`);
            console.log(`     Date: ${content.exportedAt || 'unknown'}`);
            console.log('');
        } catch (err) {
            console.log(`  ⚠️  ${file} - Invalid format`);
        }
    });

    console.log('═'.repeat(60) + '\n');
}

// CLI Interface
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    if (command === 'export') {
        const collection = args[1];
        if (collection === 'all') {
            await exportAllCollections();
        } else if (collection) {
            await exportCollection(collection, args[2]);
        } else {
            console.log('Usage: node bulk_io.js export <collection|all> [filename]');
        }
    } else if (command === 'import') {
        const collection = args[1];
        const filename = args[2];
        if (collection && filename) {
            await importCollection(collection, filename);
        } else {
            console.log('Usage: node bulk_io.js import <collection> <filename>');
        }
    } else if (command === 'list') {
        await listExports();
    } else {
        console.log('\n🔄 DIRECTUS BULK IMPORT/EXPORT UTILITY\n');
        console.log('Usage:');
        console.log('  node bulk_io.js export <collection>         Export single collection');
        console.log('  node bulk_io.js export all                  Export all collections');
        console.log('  node bulk_io.js import <collection> <file>  Import from JSON file');
        console.log('  node bulk_io.js list                        List available exports');
        console.log('\nExamples:');
        console.log('  node bulk_io.js export sites');
        console.log('  node bulk_io.js export all');
        console.log('  node bulk_io.js import sites sites_backup.json');
        console.log('  node bulk_io.js list\n');
    }
}

main().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
