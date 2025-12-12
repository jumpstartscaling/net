/**
 * Spark Platform - US Location Data Loader
 * 
 * This script loads US states, counties, and top cities into Directus.
 * 
 * Usage: node scripts/load_locations.js
 */

require('dotenv').config();
const { createDirectus, rest, staticToken, createItem, readItems } = require('@directus/sdk');
const fs = require('fs');
const path = require('path');

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_ADMIN_TOKEN;

if (!DIRECTUS_TOKEN) {
    console.error('❌ DIRECTUS_ADMIN_TOKEN is required');
    process.exit(1);
}

const directus = createDirectus(DIRECTUS_URL).with(rest()).with(staticToken(DIRECTUS_TOKEN));

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

async function loadLocations() {
    console.log('🚀 Loading US location data...\n');

    // Check if data already loaded
    const existingStates = await directus.request(
        readItems('locations_states', { limit: 1 })
    );

    if (existingStates.length > 0) {
        console.log('📊 Location data already loaded. Skipping...');
        return;
    }

    // Load states
    console.log('🗺️  Loading states...');
    const stateMap = new Map();

    for (const state of US_STATES) {
        try {
            const result = await directus.request(
                createItem('locations_states', {
                    name: state.name,
                    code: state.code,
                    country_code: 'US'
                })
            );
            stateMap.set(state.code, result.id);
            console.log(`  ✅ ${state.name} (${state.code})`);
        } catch (err) {
            console.log(`  ❌ ${state.name}: ${err.message}`);
        }
    }

    // Check if we have the full locations.json file
    const locationsFile = path.join(__dirname, '../template/src/locations.json');

    if (fs.existsSync(locationsFile)) {
        console.log('\n📦 Loading counties and cities from locations.json...');
        const locations = JSON.parse(fs.readFileSync(locationsFile, 'utf8'));

        // Load counties
        const countyMap = new Map();
        console.log(`  Loading ${locations.counties?.length || 0} counties...`);

        for (const county of (locations.counties || [])) {
            const stateId = stateMap.get(county.state_code);
            if (!stateId) continue;

            try {
                const result = await directus.request(
                    createItem('locations_counties', {
                        name: county.name,
                        state: stateId,
                        fips_code: county.fips_code,
                        population: county.population
                    })
                );
                countyMap.set(county.fips_code, result.id);
            } catch (err) {
                // Silently continue on duplicate
            }
        }
        console.log(`  ✅ Counties loaded`);

        // Load cities
        console.log(`  Loading cities (top 50 per county)...`);

        let cityCount = 0;
        for (const city of (locations.cities || [])) {
            const countyId = countyMap.get(city.county_fips);
            const stateId = stateMap.get(city.state_code);
            if (!countyId || !stateId) continue;

            try {
                await directus.request(
                    createItem('locations_cities', {
                        name: city.name,
                        county: countyId,
                        state: stateId,
                        lat: city.lat,
                        lng: city.lng,
                        population: city.population,
                        postal_code: city.postal_code,
                        ranking: city.ranking
                    })
                );
                cityCount++;
            } catch (err) {
                // Silently continue on duplicate
            }
        }
        console.log(`  ✅ ${cityCount} cities loaded`);
    } else {
        console.log('\n⚠️  Full locations.json not found. Only states loaded.');
        console.log('   Download full US location data from GeoNames and run this script again.');
    }

    console.log('\n✨ Location data import complete!');
}

loadLocations().catch(console.error);
