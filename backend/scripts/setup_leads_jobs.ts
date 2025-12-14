import { createDirectus, rest, authentication, createCollection, createField } from '@directus/sdk';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../credentials.env') });

const DIRECTUS_URL = process.env.DIRECTUS_PUBLIC_URL || 'https://spark.jumpstartscaling.com';
const EMAIL = process.env.DIRECTUS_ADMIN_EMAIL;
const PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD;

const client = createDirectus(DIRECTUS_URL).with(authentication()).with(rest());

async function setupLeadsAndJobs() {
    console.log(`🚀 Connecting to Directus at ${DIRECTUS_URL}...`);

    try {
        await client.login(EMAIL!, PASSWORD!);
        console.log('✅ Authentication successful.');

        // 1. Setup LEADS Collection
        console.log('\n--- Setting up Leads Collection ---');
        try {
            await client.request(createCollection({
                collection: 'leads',
                schema: {},
                meta: {
                    icon: 'person_add',
                    note: 'Incoming leads and prospects',
                    display_template: '{{name}} - {{company}}'
                }
            }));
            console.log('  ✅ Collection created: leads');
        } catch (e: any) {
            if (e.errors?.[0]?.extensions?.code === 'RDB_ERROR_ALREADY_EXISTS' || e.errors?.[0]?.extensions?.code === 'RECORD_NOT_UNIQUE') {
                console.log('  ⏭️  Collection exists: leads');
            } else {
                console.log('  ❌ Error creating leads collection:', e.message);
            }
        }

        // Leads Fields
        const leadFields = [
            { field: 'name', type: 'string', note: 'Lead Name' },
            { field: 'email', type: 'string', note: 'Email Address' },
            { field: 'company', type: 'string', note: 'Company / Organization' },
            { field: 'niche', type: 'string', note: 'Industry Niche' },
            { field: 'notes', type: 'text', note: 'Notes' },
            {
                field: 'status',
                type: 'string',
                meta: {
                    interface: 'select-dropdown',
                    options: {
                        choices: [
                            { text: 'New', value: 'new', color: '#3b82f6' },
                            { text: 'Contacted', value: 'contacted', color: '#eab308' },
                            { text: 'Qualified', value: 'qualified', color: '#a855f7' },
                            { text: 'Converted', value: 'converted', color: '#22c55e' },
                            { text: 'Rejected', value: 'rejected', color: '#ef4444' }
                        ]
                    },
                    display: 'labels',
                    note: 'Lead Status'
                },
                schema: { default_value: 'new' }
            },
            {
                field: 'source',
                type: 'string',
                meta: {
                    interface: 'select-dropdown',
                    options: {
                        choices: [
                            { text: 'Manual Entry', value: 'manual' },
                            { text: 'Web Form', value: 'web' },
                            { text: 'API', value: 'api' }
                        ]
                    }
                },
                schema: { default_value: 'manual' }
            }
        ];

        for (const f of leadFields) {
            try {
                // @ts-ignore
                await client.request(createField('leads', f));
                console.log(`  ✅ Field created: leads.${f.field}`);
            } catch (e: any) {
                // Ignore duplicate field errors
            }
        }

        // 2. Setup Generation Jobs Fields (if missing)
        console.log('\n--- Checking Generation Jobs ---');
        const jobFields = [
            { field: 'progress', type: 'integer', note: 'Progress 0-100', schema: { default_value: 0 } },
            {
                field: 'priority',
                type: 'string',
                meta: {
                    interface: 'select-dropdown',
                    options: {
                        choices: [
                            { text: 'High', value: 'high', color: '#ef4444' },
                            { text: 'Medium', value: 'medium', color: '#eab308' },
                            { text: 'Low', value: 'low', color: '#3b82f6' }
                        ]
                    }
                },
                schema: { default_value: 'medium' }
            }
        ];

        for (const f of jobFields) {
            try {
                // @ts-ignore
                await client.request(createField('generation_jobs', f));
                console.log(`  ✅ Field created: generation_jobs.${f.field}`);
            } catch (e: any) {
                // Ignore duplicate field errors
            }
        }

        console.log('\n✅ Leads & Jobs Schema Setup Complete!');

    } catch (error) {
        console.error('❌ Failed:', error);
    }
}

setupLeadsAndJobs();
