import { createDirectus, rest, authentication, deleteCollection } from '@directus/sdk';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { exec } from 'child_process';

dotenv.config({ path: path.resolve(__dirname, '../credentials.env') });

const client = createDirectus(process.env.DIRECTUS_PUBLIC_URL!).with(authentication()).with(rest());

async function resetPages() {
    try {
        await client.login(process.env.DIRECTUS_ADMIN_EMAIL!, process.env.DIRECTUS_ADMIN_PASSWORD!);

        console.log('🗑️ Deleting pages collection...');
        try {
            // @ts-ignore
            await client.request(deleteCollection('pages'));
            console.log('✅ Deleted pages collection.');
        } catch (e: any) {
            console.log('  Pages collection might not exist or verify failed: ' + e.message);
        }

        console.log('🔄 Re-running setup schema...');
        exec('npx tsx backend/scripts/setup_launchpad_schema.ts', (err, stdout, stderr) => {
            if (err) console.error(stderr);
            console.log(stdout);

            console.log('🔄 Re-running demo generation...');
            exec('npx tsx backend/scripts/generate_flagship_demo.ts', (err, stdout, stderr) => {
                if (err) console.error(stderr);
                console.log(stdout);
            });
        });

    } catch (e) {
        console.error(e);
    }
}

resetPages();
