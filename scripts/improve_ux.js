#!/usr/bin/env node

/**
 * Directus UX Improvement Script
 * Fixes field interfaces to make admin UI more user-friendly
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
        console.log(`  ✅ Updated ${collection}.${field}`);
        return true;
    } catch (err) {
        console.log(`  ❌ Failed to update ${collection}.${field}: ${err.message}`);
        return false;
    }
}

async function improveUX() {
    console.log('🎨 DIRECTUS UX IMPROVEMENTS\n');
    console.log('═'.repeat(60));

    let successCount = 0;
    let failCount = 0;

    // Fix 1: Make all site_id fields use select-dropdown-m2o
    console.log('\n1️⃣  Fixing site_id relationships...\n');

    const siteIdFields = [
        { collection: 'posts', field: 'site_id' },
        { collection: 'campaign_masters', field: 'site_id' },
        { collection: 'leads', field: 'site_id' }
    ];

    for (const { collection, field } of siteIdFields) {
        const success = await updateField(collection, field, {
            meta: {
                interface: 'select-dropdown-m2o',
                options: {
                    template: '{{name}}'
                },
                display: 'related-values',
                display_options: {
                    template: '{{name}}'
                }
            }
        });
        success ? successCount++ : failCount++;
    }

    // Fix 2: Make campaign_id fields use select-dropdown-m2o
    console.log('\n2️⃣  Fixing campaign_id relationships...\n');

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
                    template: '{{campaign_name}}'
                },
                display: 'related-values',
                display_options: {
                    template: '{{campaign_name}}'
                }
            }
        });
        success ? successCount++ : failCount++;
    }

    // Fix 3: Make status fields use select-dropdown
    console.log('\n3️⃣  Fixing status fields...\n');

    const statusFields = [
        {
            collection: 'sites',
            field: 'status',
            choices: {
                active: 'Active',
                inactive: 'Inactive',
                testing: 'Testing'
            }
        },
        {
            collection: 'campaign_masters',
            field: 'status',
            choices: {
                active: 'Active',
                paused: 'Paused',
                completed: 'Completed',
                draft: 'Draft'
            }
        },
        {
            collection: 'generation_jobs',
            field: 'status',
            choices: {
                pending: 'Pending',
                running: 'Running',
                completed: 'Completed',
                failed: 'Failed',
                paused: 'Paused'
            }
        },
        {
            collection: 'headline_inventory',
            field: 'status',
            choices: {
                active: 'Active',
                archived: 'Archived'
            }
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
                    choices,
                    showAsDot: true
                }
            }
        });
        success ? successCount++ : failCount++;
    }

    // Enhancement 1: Improve avatar_key fields
    console.log('\n4️⃣  Improving avatar selection fields...\n');

    const avatarFields = [
        { collection: 'posts', field: 'avatar_key' },
        { collection: 'offer_blocks', field: 'avatar_key' }
    ];

    for (const { collection, field } of avatarFields) {
        const success = await updateField(collection, field, {
            meta: {
                interface: 'select-dropdown',
                width: 'half',
                note: 'Select avatar persona for content generation',
                options: {
                    allowNone: true,
                    placeholder: 'Choose avatar...'
                }
            }
        });
        success ? successCount++ : failCount++;
    }

    // Enhancement 2: Improve JSON fields
    console.log('\n5️⃣  Improving JSON editor fields...\n');

    const jsonFields = [
        { collection: 'posts', field: 'schema_json' },
        { collection: 'pages', field: 'schema_json' },
        { collection: 'article_templates', field: 'structure_json' },
        { collection: 'link_targets', field: 'anchor_variations' },
        { collection: 'spintax_dictionaries', field: 'data' },
        { collection: 'offer_blocks', field: 'data' },
        { collection: 'cartesian_patterns', field: 'pattern_json' }
    ];

    for (const { collection, field } of jsonFields) {
        const success = await updateField(collection, field, {
            meta: {
                interface: 'input-code',
                options: {
                    language: 'json',
                    lineNumber: true,
                    template: '{}'
                }
            }
        });
        success ? successCount++ : failCount++;
    }

    // Enhancement 3: Improve text areas
    console.log('\n6️⃣  Improving text content fields...\n');

    const textFields = [
        { collection: 'posts', field: 'content' },
        { collection: 'posts', field: 'excerpt' },
        { collection: 'pages', field: 'content' },
        { collection: 'generated_articles', field: 'html_content' }
    ];

    for (const { collection, field } of textFields) {
        const success = await updateField(collection, field, {
            meta: {
                interface: 'input-rich-text-html',
                options: {
                    toolbar: [
                        'bold',
                        'italic',
                        'underline',
                        'h1',
                        'h2',
                        'h3',
                        'numlist',
                        'bullist',
                        'link',
                        'code',
                        'removeformat'
                    ]
                }
            }
        });
        success ? successCount++ : failCount++;
    }

    // Enhancement 4: Improve date fields
    console.log('\n7️⃣  Improving date/time fields...\n');

    const dateFields = [
        { collection: 'posts', field: 'created_at' },
        { collection: 'posts', field: 'published_at' },
        { collection: 'pages', field: 'created_at' },
        { collection: 'sites', field: 'created_at' },
        { collection: 'sites', field: 'updated_at' }
    ];

    for (const { collection, field } of dateFields) {
        const success = await updateField(collection, field, {
            meta: {
                interface: 'datetime',
                display: 'datetime',
                display_options: {
                    relative: true
                },
                readonly: field.includes('created') || field.includes('updated')
            }
        });
        success ? successCount++ : failCount++;
    }

    // Enhancement 5: Add helpful notes and placeholders
    console.log('\n8️⃣  Adding field descriptions and placeholders...\n');

    const fieldNotes = [
        {
            collection: 'sites',
            field: 'wp_username',
            note: 'WordPress admin username for API access',
            placeholder: 'admin'
        },
        {
            collection: 'sites',
            field: 'wp_app_password',
            note: 'WordPress Application Password (not regular password)',
            placeholder: 'xxxx xxxx xxxx xxxx'
        },
        {
            collection: 'generation_jobs',
            field: 'target_quantity',
            note: 'Number of articles to generate in this job'
        },
        {
            collection: 'generated_articles',
            field: 'meta_desc',
            note: 'SEO meta description (150-160 characters)',
            placeholder: 'Compelling description for search results...'
        }
    ];

    for (const { collection, field, note, placeholder } of fieldNotes) {
        const updates = { meta: {} };
        if (note) updates.meta.note = note;
        if (placeholder) updates.meta.options = { placeholder };

        const success = await updateField(collection, field, updates);
        success ? successCount++ : failCount++;
    }

    // Summary
    console.log('\n\n═'.repeat(60));
    console.log('📊 IMPROVEMENT SUMMARY');
    console.log('═'.repeat(60));
    console.log(`✅ Successful updates: ${successCount}`);
    console.log(`❌ Failed updates: ${failCount}`);
    console.log(`📈 Success rate: ${Math.round((successCount / (successCount + failCount)) * 100)}%`);
    console.log('═'.repeat(60) + '\n');

    return { successCount, failCount };
}

// Run improvements
improveUX()
    .then(({ successCount, failCount }) => {
        if (failCount === 0) {
            console.log('🎉 All improvements applied successfully!\n');
            process.exit(0);
        } else {
            console.log('⚠️  Some improvements failed. Check output above.\n');
            process.exit(1);
        }
    })
    .catch(err => {
        console.error('❌ Improvement script failed:', err.message);
        process.exit(1);
    });
