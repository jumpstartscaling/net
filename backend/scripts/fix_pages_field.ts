import { createDirectus, rest, authentication, deleteField, createField, deleteItems, readItems } from '@directus/sdk';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../credentials.env') });

const client = createDirectus(process.env.DIRECTUS_PUBLIC_URL!).with(authentication()).with(rest());

async function fixPagesField() {
    try {
        await client.login(process.env.DIRECTUS_ADMIN_EMAIL!, process.env.DIRECTUS_ADMIN_PASSWORD!);
        console.log('🔧 Fixing Pages Schema...');

        // 1. Delete all pages (to allow schema change)
        console.log('  Deleting existing pages...');
        // @ts-ignore
        const pages = await client.request(readItems('pages', { limit: -1, fields: ['id'] }));
        if (pages.length > 0) {
            // @ts-ignore
            await client.request(deleteItems('pages', pages.map(p => p.id)));
        }

        // 2. Delete site field
        console.log('  Deleting site field...');
        try {
             // @ts-ignore
            await client.request(deleteField('pages', 'site'));
        } catch(e) { console.log('  Field might not exist.'); }

        // 3. Re-create site field as UUID
        console.log('  Creating site field as UUID...');
         // @ts-ignore
        await client.request(createField('pages', {
            field: 'site',
            type: 'uuid',
            meta: { interface: 'select-dropdown' },
            schema: { is_nullable: true }
        }));

        console.log('✅ Pages Schema Fixed.');
    } catch (e: any) {
        console.error('❌ Fix Failed:', e);
    }
}
fixPagesField();
