import { createDirectus, rest, authentication, readField } from '@directus/sdk';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../credentials.env') });

const DIRECTUS_URL = process.env.DIRECTUS_PUBLIC_URL || 'https://spark.jumpstartscaling.com';
const EMAIL = process.env.DIRECTUS_ADMIN_EMAIL;
const PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD;

const client = createDirectus(DIRECTUS_URL).with(authentication()).with(rest());

async function checkStatusField() {
    await client.login(EMAIL!, PASSWORD!);

    try {
        const field = await client.request(readField('generated_articles', 'status'));
        console.log('Status Field Choices:', JSON.stringify(field.meta?.options?.choices, null, 2));
    } catch (e: any) {
        console.error('Error reading status field:', e.message);
    }
}

checkStatusField();
