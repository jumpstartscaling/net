import { createDirectus, rest, authentication, createCollection, createField } from '@directus/sdk';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../credentials.env') });

const DIRECTUS_URL = process.env.DIRECTUS_PUBLIC_URL || 'https://spark.jumpstartscaling.com';
const EMAIL = process.env.DIRECTUS_ADMIN_EMAIL;
const PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD;

const client = createDirectus(DIRECTUS_URL).with(authentication()).with(rest());

async function setupSchedulerSchema() {
    console.log(`🚀 Connecting to Directus at ${DIRECTUS_URL}...`);

    try {
        await client.login(EMAIL!, PASSWORD!);
        console.log('✅ Authentication successful.');

        // 1. Campaigns Collection
        console.log('\n--- Setting up Campaigns ---');
        try {
            await client.request(createCollection({
                collection: 'campaigns',
                schema: {},
                meta: {
                    icon: 'campaign', // material icon
                    note: 'Bulk generation campaigns',
                    display_template: '{{name}}'
                }
            }));
            console.log('  ✅ Collection created: campaigns');
        } catch (e: any) { console.log('  ⏭️  Collection exists: campaigns'); }

        const campaignFields = [
            { field: 'name', type: 'string', meta: { required: true } },
            { field: 'status', type: 'string', meta: { interface: 'select-dropdown', options: { choices: [{ text: 'Active', value: 'active' }, { text: 'Paused', value: 'paused' }, { text: 'Completed', value: 'completed' }] } }, schema: { default_value: 'active' } },
            { field: 'type', type: 'string', meta: { interface: 'select-dropdown', options: { choices: [{ text: 'Geo Expansion', value: 'geo' }, { text: 'Spintax Mass', value: 'spintax' }, { text: 'Topic Cluster', value: 'topic' }] } } },

            // Configuration
            { field: 'site', type: 'integer', meta: { interface: 'select-dropdown' } }, // Relation to sites (using int as per Launchpad verification, or will error if UUID, handled separately)
            { field: 'template', type: 'string', meta: { note: 'Article Template ID' } },

            // Strategy Config (JSON is flexible)
            { field: 'config', type: 'json', meta: { interface: 'code', options: { language: 'json' }, note: 'Target Niches, Geo Clusters, or Keys' } },

            // Scheduling
            { field: 'frequency', type: 'string', meta: { interface: 'select-dropdown', options: { choices: [{ text: 'Once (Immediate)', value: 'once' }, { text: 'Daily', value: 'daily' }, { text: 'Weekly', value: 'weekly' }] } }, schema: { default_value: 'once' } },
            { field: 'batch_size', type: 'integer', schema: { default_value: 10 }, meta: { note: 'Articles per run' } },
            { field: 'max_articles', type: 'integer', schema: { default_value: 100 }, meta: { note: 'Total campaign goal' } },

            // Tracking
            { field: 'current_count', type: 'integer', schema: { default_value: 0 } },
            { field: 'last_run', type: 'dateTime' },
            { field: 'next_run', type: 'dateTime' }
        ];

        for (const f of campaignFields) {
            try {
                // @ts-ignore
                await client.request(createField('campaigns', f));
                console.log(`  ✅ Field: campaigns.${f.field}`);
            } catch (e) { }
        }

        // 2. Link Jobs to Campaigns
        console.log('\n--- Linking Jobs to Campaigns ---');
        try {
            // @ts-ignore
            await client.request(createField('generation_jobs', {
                field: 'campaign',
                type: 'integer', // relation
                meta: { note: 'Linked Campaign' }
            }));
            console.log('  ✅ Field: generation_jobs.campaign');
        } catch (e) { }

        console.log('\n✅ Scheduler Schema Setup Complete!');

    } catch (error) {
        console.error('❌ Failed:', error);
    }
}

setupSchedulerSchema();
