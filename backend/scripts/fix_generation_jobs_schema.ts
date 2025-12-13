import { createDirectus, rest, authentication, createField } from '@directus/sdk';

const DIRECTUS_URL = 'https://spark.jumpstartscaling.com';
const EMAIL = 'insanecorp@gmail.com';
const PASSWORD = 'Idk@ai2026yayhappy';

const client = createDirectus(DIRECTUS_URL).with(authentication()).with(rest());

async function addConfigField() {
    try {
        await client.login(EMAIL, PASSWORD);
        console.log('✅ Authenticated\n');

        console.log('Adding config field to generation_jobs...');

        await client.request(
            createField('generation_jobs', {
                field: 'config',
                type: 'json',
                meta: {
                    note: 'Job configuration (WordPress URL, auth, mode, etc.)',
                    interface: 'input-code',
                    options: {
                        language: 'json'
                    }
                },
                schema: {
                    is_nullable: true
                }
            })
        );

        console.log('✅ config field added successfully!');
        console.log('\nNow you can also add type field:');

        await client.request(
            createField('generation_jobs', {
                field: 'type',
                type: 'string',
                meta: {
                    note: 'Job type (Refactor, Import, etc.)',
                    interface: 'input',
                    width: 'half'
                },
                schema: {
                    is_nullable: true,
                    max_length: 50
                }
            })
        );

        console.log('✅ type field added successfully!');
        console.log('\n🎉 generation_jobs schema updated!');
        console.log('Jumpstart should now work correctly.');

    } catch (error: any) {
        if (error.errors?.[0]?.extensions?.code === 'FIELD_DUPLICATE') {
            console.log('⚠️  Fields already exist - schema is correct!');
        } else {
            console.error('❌ Error:', error.message || error);
        }
    }
}

addConfigField();
