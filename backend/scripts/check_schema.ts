import { createDirectus, rest, authentication, readFieldsByCollection } from '@directus/sdk';

const DIRECTUS_URL = 'https://spark.jumpstartscaling.com';
const EMAIL = 'insanecorp@gmail.com';
const PASSWORD = 'Idk@ai2026yayhappy';

const client = createDirectus(DIRECTUS_URL).with(authentication()).with(rest());

async function checkSchema() {
    try {
        await client.login(EMAIL, PASSWORD);
        console.log('✅ Authenticated\n');

        // @ts-ignore
        const fields = await client.request(readFieldsByCollection('generation_jobs'));

        console.log('📋 generation_jobs fields:\n');
        fields.forEach((field: any) => {
            console.log(`  ${field.field}: ${field.type} ${field.schema?.is_nullable ? '(nullable)' : '(required)'}`);
        });

    } catch (error: any) {
        console.error('❌ Error:', error.message);
    }
}

checkSchema();
