import { createDirectus, rest, authentication, createCollection, createField } from '@directus/sdk';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../credentials.env') });

const DIRECTUS_URL = process.env.DIRECTUS_PUBLIC_URL || 'https://spark.jumpstartscaling.com';
const EMAIL = process.env.DIRECTUS_ADMIN_EMAIL;
const PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD;

const client = createDirectus(DIRECTUS_URL).with(authentication()).with(rest());

async function setupLaunchpadSchema() {
    console.log(`🚀 Connecting to Directus at ${DIRECTUS_URL}...`);

    try {
        await client.login(EMAIL!, PASSWORD!);
        console.log('✅ Authentication successful.');

        // 1. Sites Collection
        console.log('\n--- Setting up Sites ---');
        try {
            await client.request(createCollection({
                collection: 'sites',
                schema: {},
                meta: {
                    icon: 'public',
                    note: 'Multi-site management',
                    display_template: '{{name}} ({{domain}})'
                }
            }));
            console.log('  ✅ Collection created: sites');
        } catch (e: any) { console.log('  ⏭️  Collection exists: sites'); }

        const siteFields = [
            { field: 'name', type: 'string' },
            { field: 'domain', type: 'string', meta: { note: 'Primary domain (e.g. example.com)' } },
            { field: 'status', type: 'string', meta: { interface: 'select-dropdown', options: { choices: [{ text: 'Active', value: 'active' }, { text: 'Inactive', value: 'inactive' }] } }, schema: { default_value: 'active' } },
            { field: 'settings', type: 'json', meta: { interface: 'code', options: { language: 'json' }, note: 'Advanced config' } }
        ];

        for (const f of siteFields) {
            try {
                // @ts-ignore
                await client.request(createField('sites', f));
                console.log(`  ✅ Field: sites.${f.field}`);
            } catch (e) { }
        }

        // 2. Pages Collection
        console.log('\n--- Setting up Pages ---');
        try {
            await client.request(createCollection({
                collection: 'pages',
                schema: {},
                meta: {
                    icon: 'pages',
                    note: 'Website pages',
                    display_template: '{{title}}'
                }
            }));
            console.log('  ✅ Collection created: pages');
        } catch (e) { console.log('  ⏭️  Collection exists: pages'); }

        const pageFields = [
            { field: 'title', type: 'string' },
            { field: 'permalink', type: 'string', meta: { note: '/slug' } },
            { field: 'status', type: 'string', schema: { default_value: 'draft' } },
            { field: 'blocks', type: 'json', meta: { interface: 'list', note: 'JSON structure of page blocks' } }, // Using JSON for blocks primarily for flexibility
            { field: 'seo_title', type: 'string' },
            { field: 'seo_description', type: 'text' },
            { field: 'site', type: 'integer', meta: { interface: 'select-dropdown' }, schema: { is_nullable: true } } // Simplified relationship
        ];

        for (const f of pageFields) {
            try {
                // @ts-ignore
                await client.request(createField('pages', f));
                console.log(`  ✅ Field: pages.${f.field}`);
            } catch (e) { }
        }

        // 3. Globals (Theme Settings)
        console.log('\n--- Setting up Globals ---');
        try {
            await client.request(createCollection({
                collection: 'globals',
                schema: {},
                meta: {
                    icon: 'settings_suggest',
                    singleton: true, // Only one record usually per site context, but we might want multiple for multi-site
                    note: 'Global site settings'
                }
            }));
            console.log('  ✅ Collection created: globals');
        } catch (e) { console.log('  ⏭️  Collection exists: globals'); }

        const globalFields = [
            { field: 'site', type: 'integer' },
            { field: 'logo', type: 'uuid', meta: { interface: 'file-image' } }, // Assuming directus_files
            { field: 'primary_color', type: 'string', meta: { interface: 'color' } },
            { field: 'secondary_color', type: 'string', meta: { interface: 'color' } },
            { field: 'footer_text', type: 'text' },
            { field: 'social_links', type: 'json', meta: { interface: 'list' } }
        ];

        for (const f of globalFields) {
            try {
                // @ts-ignore
                await client.request(createField('globals', f));
                console.log(`  ✅ Field: globals.${f.field}`);
            } catch (e) { }
        }

        console.log('\n✅ Launchpad Schema Setup Complete!');

    } catch (error) {
        console.error('❌ Failed:', error);
    }
}

setupLaunchpadSchema();
