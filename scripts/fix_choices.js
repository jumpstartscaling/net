#!/usr/bin/env node

/**
 * Fix Choices Format - Emergency Fix
 * Directus expects choices as array, not object
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

async function updateField(collection, field, updates) {
    try {
        await makeRequest(`/fields/${collection}/${field}`, 'PATCH', updates);
        console.log(`  ✅ Fixed ${collection}.${field}`);
        return true;
    } catch (err) {
        console.log(`  ❌ Failed to fix ${collection}.${field}: ${err.message}`);
        return false;
    }
}

async function fixChoices() {
    console.log('🔧 FIXING CHOICES FORMAT\n');
    console.log('Converting choices from object to array format...\n');

    let successCount = 0;
    let failCount = 0;

    // Fix status fields with correct array format
    const statusFields = [
        {
            collection: 'sites',
            field: 'status',
            choices: [
                { text: 'Active', value: 'active' },
                { text: 'Inactive', value: 'inactive' },
                { text: 'Testing', value: 'testing' }
            ]
        },
        {
            collection: 'campaign_masters',
            field: 'status',
            choices: [
                { text: 'Active', value: 'active' },
                { text: 'Paused', value: 'paused' },
                { text: 'Completed', value: 'completed' },
                { text: 'Draft', value: 'draft' }
            ]
        },
        {
            collection: 'generation_jobs',
            field: 'status',
            choices: [
                { text: 'Pending', value: 'pending' },
                { text: 'Running', value: 'running' },
                { text: 'Completed', value: 'completed' },
                { text: 'Failed', value: 'failed' },
                { text: 'Paused', value: 'paused' }
            ]
        },
        {
            collection: 'headline_inventory',
            field: 'status',
            choices: [
                { text: 'Active', value: 'active' },
                { text: 'Archived', value: 'archived' }
            ]
        }
    ];

    for (const { collection, field, choices } of statusFields) {
        const success = await updateField(collection, field, {
            meta: {
                interface: 'select-dropdown',
                options: {
                    choices
                },
                display: 'labels',
                display_options: {
                    showAsDot: true,
                    choices: choices.reduce((acc, choice) => {
                        acc[choice.value] = choice.text;
                        return acc;
                    }, {})
                }
            }
        });
        success ? successCount++ : failCount++;
    }

    console.log('\n═'.repeat(60));
    console.log(`✅ Fixed: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log('═'.repeat(60) + '\n');

    if (failCount === 0) {
        console.log('🎉 All choices fixed! Refresh your Directus page.\n');
    }
}

fixChoices()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('❌ Fix failed:', err.message);
        process.exit(1);
    });
