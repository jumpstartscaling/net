#!/usr/bin/env node

/**
 * Fix Campaign-Related Relationship Templates
 * campaign_masters uses "name" field, not "campaign_name"
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

async function fixCampaignTemplates() {
    console.log('🔧 FIXING CAMPAIGN RELATIONSHIP TEMPLATES\n');
    console.log('Changing {{campaign_name}} to {{name}}...\n');

    let successCount = 0;
    let failCount = 0;

    // Fix campaign_id fields to use correct template
    const campaignIdFields = [
        { collection: 'content_fragments', field: 'campaign_id' },
        { collection: 'generated_articles', field: 'campaign_id' },
        { collection: 'headline_inventory', field: 'campaign_id' }
    ];

    for (const { collection, field } of campaignIdFields) {
        const success = await updateField(collection, field, {
            meta: {
                interface: 'select-dropdown-m2o',
                options: {
                    template: '{{name}}'  // CORRECT: campaign_masters has "name" field
                },
                display: 'related-values',
                display_options: {
                    template: '{{name}}'
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
        console.log('🎉 All campaign templates fixed!\n');
        console.log('The following fields now correctly reference campaign_masters.name:');
        campaignIdFields.forEach(({ collection, field }) => {
            console.log(`  • ${collection}.${field}`);
        });
        console.log('\nRefresh your Directus admin to see changes.\n');
    }
}

fixCampaignTemplates()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('❌ Fix failed:', err.message);
        process.exit(1);
    });
