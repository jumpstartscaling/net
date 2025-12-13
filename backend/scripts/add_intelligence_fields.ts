import { createDirectus, rest, authentication, createField, readCollections } from '@directus/sdk';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const DIRECTUS_URL = process.env.DIRECTUS_PUBLIC_URL || 'https://spark.jumpstartscaling.com';
const EMAIL = process.env.DIRECTUS_ADMIN_EMAIL;
const PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD;

const client = createDirectus(DIRECTUS_URL).with(authentication()).with(rest());

async function addMissingFields() {
    console.log(`🚀 Connecting to Directus at ${DIRECTUS_URL}...`);

    try {
        console.log(`🔑 Authenticating as ${EMAIL}...`);
        await client.login(EMAIL!, PASSWORD!);
        console.log('✅ Authentication successful.');

        const createFieldSafe = async (collection: string, field: string, type: string, meta: any = {}) => {
            try {
                await client.request(createField(collection, { field, type, meta, schema: {} }));
                console.log(`  ✅ Field created: ${collection}.${field}`);
            } catch (e: any) {
                if (e.errors?.[0]?.extensions?.code === 'FIELD_DUPLICATE') {
                    console.log(`  ⏭️  Field exists: ${collection}.${field}`);
                } else {
                    console.log(`  ❌ Error creating ${collection}.${field}:`, e.message);
                }
            }
        };

        console.log('\n📝 Adding missing fields for Intelligence Library...\n');

        // GEO INTELLIGENCE - Create new collection with proper fields
        console.log('--- Geo Intelligence ---');
        await createFieldSafe('geo_intelligence', 'location_key', 'string', { note: 'Unique location identifier' });
        await createFieldSafe('geo_intelligence', 'city', 'string', { note: 'City name' });
        await createFieldSafe('geo_intelligence', 'state', 'string', { note: 'State code' });
        await createFieldSafe('geo_intelligence', 'county', 'string', { note: 'County name' });
        await createFieldSafe('geo_intelligence', 'zip_code', 'string', { note: 'ZIP code' });
        await createFieldSafe('geo_intelligence', 'population', 'integer', { note: 'Population count' });
        await createFieldSafe('geo_intelligence', 'median_income', 'float', { note: 'Median household income' });
        await createFieldSafe('geo_intelligence', 'keywords', 'text', { note: 'Local keywords' });
        await createFieldSafe('geo_intelligence', 'local_modifiers', 'text', { note: 'Local phrases and modifiers' });

        // AVATAR VARIANTS - Update existing collection
        console.log('\n--- Avatar Variants ---');
        await createFieldSafe('avatar_variants', 'avatar_key', 'string', { note: 'Avatar identifier' });
        await createFieldSafe('avatar_variants', 'variant_type', 'string', { note: 'male, female, or neutral' });
        await createFieldSafe('avatar_variants', 'pronoun', 'string', { note: 'Pronoun set' });
        await createFieldSafe('avatar_variants', 'identity', 'string', { note: 'Full identity name' });
        await createFieldSafe('avatar_variants', 'tone_modifiers', 'text', { note: 'Tone adjustments' });

        // SPINTAX DICTIONARIES - Update existing collection
        console.log('\n--- Spintax Dictionaries ---');
        await createFieldSafe('spintax_dictionaries', 'category', 'string', { note: 'Dictionary category' });
        await createFieldSafe('spintax_dictionaries', 'data', 'json', { note: 'Array of terms' });
        await createFieldSafe('spintax_dictionaries', 'description', 'text', { note: 'Optional description' });

        // CARTESIAN PATTERNS - Update existing collection
        console.log('\n--- Cartesian Patterns ---');
        await createFieldSafe('cartesian_patterns', 'pattern_key', 'string', { note: 'Pattern identifier' });
        await createFieldSafe('cartesian_patterns', 'pattern_type', 'string', { note: 'Pattern category' });
        await createFieldSafe('cartesian_patterns', 'formula', 'text', { note: 'Pattern formula with variables' });
        await createFieldSafe('cartesian_patterns', 'example_output', 'text', { note: 'Example of generated output' });
        await createFieldSafe('cartesian_patterns', 'description', 'text', { note: 'Optional description' });

        // GENERATION JOBS - Update for Jumpstart fix
        console.log('\n--- Generation Jobs ---');
        await createFieldSafe('generation_jobs', 'site_id', 'integer', { note: 'Related site' });
        await createFieldSafe('generation_jobs', 'status', 'string', { note: 'Job status' });
        await createFieldSafe('generation_jobs', 'type', 'string', { note: 'Job type' });
        await createFieldSafe('generation_jobs', 'target_quantity', 'integer', { note: 'Total items to process' });
        await createFieldSafe('generation_jobs', 'current_offset', 'integer', { note: 'Current progress' });
        await createFieldSafe('generation_jobs', 'config', 'json', { note: 'Job configuration (WordPress URL, auth, etc)' });

        console.log('\n✅ All fields added successfully!');
        console.log('\n📋 Next steps:');
        console.log('1. Refresh your frontend (hard refresh: Cmd+Shift+R)');
        console.log('2. Visit the Intelligence Library pages');
        console.log('3. Start adding data!');

    } catch (error) {
        console.error('❌ Failed:', error);
        process.exit(1);
    }
}

addMissingFields();
