#!/usr/bin/env node

/**
 * Create Work Log Collection
 * Missing collection needed for system logging
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

async function createWorkLog() {
    console.log('\n📝 CREATING WORK_LOG COLLECTION\n');
    console.log('═'.repeat(60));

    try {
        // Create collection
        console.log('\n1️⃣  Creating collection...');
        await makeRequest('/collections', 'POST', {
            collection: 'work_log',
            meta: {
                icon: 'list_alt',
                note: 'System activity and error logging',
                display_template: '{{action}} - {{message}}',
                singleton: false,
                hidden: false
            },
            schema: {
                name: 'work_log'
            }
        });
        console.log('   ✅ Collection created');

        // Create fields
        console.log('\n2️⃣  Creating fields...');

        const fields = [
            {
                field: 'id',
                type: 'integer',
                meta: {
                    hidden: true,
                    interface: 'input',
                    readonly: true
                },
                schema: {
                    is_primary_key: true,
                    has_auto_increment: true
                }
            },
            {
                field: 'action',
                type: 'string',
                meta: {
                    interface: 'input',
                    width: 'half',
                    required: true,
                    note: 'Action performed (e.g., job_created, article_generated)'
                },
                schema: {}
            },
            {
                field: 'message',
                type: 'text',
                meta: {
                    interface: 'input-multiline',
                    width: 'full',
                    note: 'Detailed message about the action'
                },
                schema: {}
            },
            {
                field: 'details',
                type: 'json',
                meta: {
                    interface: 'input-code',
                    options: {
                        language: 'json'
                    },
                    width: 'full',
                    note: 'Additional structured data'
                },
                schema: {}
            },
            {
                field: 'level',
                type: 'string',
                meta: {
                    interface: 'select-dropdown',
                    width: 'half',
                    options: {
                        choices: [
                            { text: 'Info', value: 'info' },
                            { text: 'Success', value: 'success' },
                            { text: 'Warning', value: 'warning' },
                            { text: 'Error', value: 'error' }
                        ]
                    },
                    display: 'labels',
                    display_options: {
                        showAsDot: true,
                        choices: {
                            info: 'Info',
                            success: 'Success',
                            warning: 'Warning',
                            error: 'Error'
                        }
                    }
                },
                schema: {}
            },
            {
                field: 'user_id',
                type: 'uuid',
                meta: {
                    interface: 'select-dropdown-m2o',
                    width: 'half',
                    special: ['user-created'],
                    display: 'user'
                },
                schema: {}
            },
            {
                field: 'date_created',
                type: 'timestamp',
                meta: {
                    interface: 'datetime',
                    display: 'datetime',
                    readonly: true,
                    special: ['date-created'],
                    width: 'half'
                },
                schema: {}
            }
        ];

        for (const fieldDef of fields) {
            try {
                await makeRequest(`/fields/work_log`, 'POST', fieldDef);
                console.log(`   ✅ Created field: ${fieldDef.field}`);
            } catch (err) {
                console.log(`   ⚠️  Field ${fieldDef.field}: ${err.message.substring(0, 60)}`);
            }
        }

        // Test write
        console.log('\n3️⃣  Testing write access...');
        const testEntry = await makeRequest('/items/work_log', 'POST', {
            action: 'collection_created',
            message: 'Work log collection successfully created via API',
            level: 'success',
            details: {
                created_by: 'test_script',
                timestamp: new Date().toISOString()
            }
        });
        console.log(`   ✅ Test entry created: ID ${testEntry.data.id}`);

        console.log('\n═'.repeat(60));
        console.log('🎉 WORK_LOG COLLECTION READY!\n');
        console.log('Fields created:');
        console.log('  • id (auto-increment)');
        console.log('  • action (required text)');
        console.log('  • message (multiline text)');
        console.log('  • details (JSON)');
        console.log('  • level (dropdown: info/success/warning/error)');
        console.log('  • user_id (auto-captured)');
        console.log('  • date_created (auto-timestamp)');
        console.log('\nThe work_log is now accessible at:');
        console.log(`${DIRECTUS_URL}/admin/content/work_log\n`);

    } catch (err) {
        if (err.message.includes('already exists')) {
            console.log('\n⚠️  Collection already exists - checking if accessible...\n');
            try {
                const data = await makeRequest('/items/work_log?limit=1');
                console.log('✅ Collection exists and is accessible\n');
            } catch (accessErr) {
                console.log(`❌ Collection exists but not accessible: ${accessErr.message}\n`);
            }
        } else {
            throw err;
        }
    }
}

createWorkLog()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('❌ Failed to create work_log:', err.message);
        process.exit(1);
    });
