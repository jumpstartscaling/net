/**
 * Spark Platform - US Location Data Loader
 * 
 * This script loads US states into Directus.
 * 
 * Usage: node scripts/load_locations.js
 */

const DIRECTUS_URL = process.env.PUBLIC_URL || process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.ADMIN_TOKEN || process.env.DIRECTUS_ADMIN_TOKEN;

if (!DIRECTUS_TOKEN) {
    console.error('❌ ADMIN_TOKEN or DIRECTUS_ADMIN_TOKEN is required');
    process.exit(1);
}

// US States data
const US_STATES = [
    { name: 'Alabama', code: 'AL' },
    { name: 'Alaska', code: 'AK' },
    { name: 'Arizona', code: 'AZ' },
    { name: 'Arkansas', code: 'AR' },
    { name: 'California', code: 'CA' },
    { name: 'Colorado', code: 'CO' },
    { name: 'Connecticut', code: 'CT' },
    { name: 'Delaware', code: 'DE' },
    { name: 'Florida', code: 'FL' },
    { name: 'Georgia', code: 'GA' },
    { name: 'Hawaii', code: 'HI' },
    { name: 'Idaho', code: 'ID' },
    { name: 'Illinois', code: 'IL' },
    { name: 'Indiana', code: 'IN' },
    { name: 'Iowa', code: 'IA' },
    { name: 'Kansas', code: 'KS' },
    { name: 'Kentucky', code: 'KY' },
    { name: 'Louisiana', code: 'LA' },
    { name: 'Maine', code: 'ME' },
    { name: 'Maryland', code: 'MD' },
    { name: 'Massachusetts', code: 'MA' },
    { name: 'Michigan', code: 'MI' },
    { name: 'Minnesota', code: 'MN' },
    { name: 'Mississippi', code: 'MS' },
    { name: 'Missouri', code: 'MO' },
    { name: 'Montana', code: 'MT' },
    { name: 'Nebraska', code: 'NE' },
    { name: 'Nevada', code: 'NV' },
    { name: 'New Hampshire', code: 'NH' },
    { name: 'New Jersey', code: 'NJ' },
    { name: 'New Mexico', code: 'NM' },
    { name: 'New York', code: 'NY' },
    { name: 'North Carolina', code: 'NC' },
    { name: 'North Dakota', code: 'ND' },
    { name: 'Ohio', code: 'OH' },
    { name: 'Oklahoma', code: 'OK' },
    { name: 'Oregon', code: 'OR' },
    { name: 'Pennsylvania', code: 'PA' },
    { name: 'Rhode Island', code: 'RI' },
    { name: 'South Carolina', code: 'SC' },
    { name: 'South Dakota', code: 'SD' },
    { name: 'Tennessee', code: 'TN' },
    { name: 'Texas', code: 'TX' },
    { name: 'Utah', code: 'UT' },
    { name: 'Vermont', code: 'VT' },
    { name: 'Virginia', code: 'VA' },
    { name: 'Washington', code: 'WA' },
    { name: 'West Virginia', code: 'WV' },
    { name: 'Wisconsin', code: 'WI' },
    { name: 'Wyoming', code: 'WY' },
    { name: 'District of Columbia', code: 'DC' }
];

async function createItem(collection, data) {
    const response = await fetch(`${DIRECTUS_URL}/items/${collection}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.errors?.[0]?.message || response.statusText);
    }
    return response.json();
}

async function getItems(collection, limit = 1) {
    const response = await fetch(`${DIRECTUS_URL}/items/${collection}?limit=${limit}`, {
        headers: {
            'Authorization': `Bearer ${DIRECTUS_TOKEN}`
        }
    });
    if (!response.ok) {
        return { data: [] };
    }
    return response.json();
}

async function loadLocations() {
    console.log('🚀 Loading US location data...');
    console.log(`   Directus URL: ${DIRECTUS_URL}\n`);

    // Check if data already loaded
    try {
        const existing = await getItems('locations_states', 1);
        if (existing.data?.length > 0) {
            console.log('📊 Location data already loaded. Skipping...');
            return;
        }
    } catch (err) {
        console.log('⚠️  locations_states collection may not exist. Run import_template.js first.');
        return;
    }

    // Load states
    console.log('🗺️  Loading states...');

    for (const state of US_STATES) {
        try {
            await createItem('locations_states', {
                name: state.name,
                code: state.code,
                country_code: 'US'
            });
            console.log(`  ✅ ${state.name} (${state.code})`);
        } catch (err) {
            if (err.message?.includes('already exists') || err.message?.includes('duplicate')) {
                console.log(`  ⏭️  ${state.name} (exists)`);
            } else {
                console.log(`  ❌ ${state.name}: ${err.message}`);
            }
        }
    }

    console.log('\n✨ Location data import complete!');
}

loadLocations().catch((err) => {
    console.error('❌ Import failed:', err);
    process.exit(1);
});
