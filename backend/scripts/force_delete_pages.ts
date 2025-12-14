import { createDirectus, rest, authentication, deleteCollection } from '@directus/sdk';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../credentials.env') });

const client = createDirectus(process.env.DIRECTUS_PUBLIC_URL!).with(authentication()).with(rest());

async function forceDelete() {
    try {
        await client.login(process.env.DIRECTUS_ADMIN_EMAIL!, process.env.DIRECTUS_ADMIN_PASSWORD!);
        console.log('Attempting delete pages...');
        // @ts-ignore
        await client.request(deleteCollection('pages'));
        console.log('✅ Deleted pages.');
    } catch (e: any) {
        console.log('❌ Delete failed:', e);
    }
}
forceDelete();
