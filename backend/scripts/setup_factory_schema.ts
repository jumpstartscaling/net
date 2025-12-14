import { createDirectus, rest, authentication, createField, updateCollection, readCollections } from '@directus/sdk';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../credentials.env') });

const DIRECTUS_URL = process.env.DIRECTUS_PUBLIC_URL || 'https://spark.jumpstartscaling.com';
const EMAIL = process.env.DIRECTUS_ADMIN_EMAIL;
const PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD;

const client = createDirectus(DIRECTUS_URL).with(authentication()).with(rest());

async function setupFactorySchema() {
    console.log(`🚀 Connecting to Directus at ${DIRECTUS_URL}...`);

    try {
        console.log(`🔑 Authenticating as ${EMAIL}...`);
        await client.login(EMAIL!, PASSWORD!);
        console.log('✅ Authentication successful.');

        // 1. Setup Kanban Status Field
        console.log('\n--- Setting up Kanban Status ---');
        try {
            await client.request(createField('generated_articles', {
                field: 'status',
                type: 'string',
                meta: {
                    interface: 'select-dropdown',
                    options: {
                        choices: [
                            { text: 'Queued', value: 'queued', color: '#6366f1' },       // Indigo
                            { text: 'Processing', value: 'processing', color: '#eab308' }, // Yellow
                            { text: 'QC Review', value: 'qc', color: '#a855f7' },        // Purple
                            { text: 'Approved', value: 'approved', color: '#22c55e' },   // Green
                            { text: 'Published', value: 'published', color: '#10b981' }  // Emerald
                        ]
                    },
                    display: 'labels',
                    display_options: {
                        show_as_dot: true
                    },
                    note: 'Current stage in the content factory'
                },
                schema: {
                    default_value: 'queued'
                }
            }));
            console.log('  ✅ Field created: generated_articles.status');
        } catch (e: any) {
            if (e.errors?.[0]?.extensions?.code === 'FIELD_DUPLICATE') {
                console.log('  ⏭️  Field exists: generated_articles.status');
            } else {
                console.log('  ❌ Error creating status field:', e.message);
            }
        }

        // 2. Add CRM Fields
        console.log('\n--- Adding CRM Fields ---');
        const crmFields = [
            { field: 'priority', type: 'string', note: 'Article priority', choices: [{ text: 'High', value: 'high' }, { text: 'Medium', value: 'medium' }, { text: 'Low', value: 'low' }] },
            { field: 'due_date', type: 'date', note: 'Target publication date' },
            { field: 'assignee', type: 'string', note: 'Team member responsible' },
            { field: 'seo_score', type: 'integer', note: 'Rankmath/Yoast score' },
            { field: 'notes', type: 'text', note: 'Internal notes' }
        ];

        for (const f of crmFields) {
            try {
                const meta: any = { note: f.note };
                if (f.choices) {
                    meta.interface = 'select-dropdown';
                    meta.options = { choices: f.choices };
                }
                await client.request(createField('generated_articles', {
                    field: f.field,
                    type: f.type,
                    meta,
                    schema: {}
                }));
                console.log(`  ✅ Field created: generated_articles.${f.field}`);
            } catch (e: any) {
                if (e.errors?.[0]?.extensions?.code === 'FIELD_DUPLICATE') {
                    console.log(`  ⏭️  Field exists: generated_articles.${f.field}`);
                }
            }
        }

        // 3. Fix Visual Preview URL
        console.log('\n--- Fixing Visual Preview Link ---');
        // We need to update the collection metadata to point to our Astro frontend
        // Note: The URL must be absolute or relative to the Directus root if served together.
        // Since frontend is separate, we use the absolute URL of the deployed frontend.
        // Assuming user acts as the frontend base safely.

        // We'll set it to the Vercel/Coolify URL
        const FRONTEND_URL = 'https://launch.jumpstartscaling.com';

        try {
            await client.request(updateCollection('generated_articles', {
                meta: {
                    preview_url: `${FRONTEND_URL}/preview/article/{id}`
                }
            }));
            console.log(`  ✅ Updated preview_url to: ${FRONTEND_URL}/preview/article/{id}`);
        } catch (e: any) {
            console.log('  ❌ Error updating collection metadata:', e.message);
        }

        console.log('\n✅ Factory Setup Complete!');
        console.log('Your Directus "generated_articles" collection now supports Kanban & CRM features.');

    } catch (error) {
        console.error('❌ Failed:', error);
        process.exit(1);
    }
}

setupFactorySchema();
