#!/usr/bin/env node

/**
 * Geo Intelligence Manager
 * Easily add, remove, and manage locations in geo_intelligence collection
 */

const DIRECTUS_URL = 'https://spark.jumpstartscaling.com';
const ADMIN_TOKEN = 'SufWLAbsqmbbqF_gg5I70ng8wE1zXt-a';

async function makeRequest(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'Authorization': `Bearer ${ADMIN_TOKEN}`,
            'Content-Type': 'application/json'
        }
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(`${DIRECTUS_URL}${endpoint}`, options);
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
    }
    return response.json();
}

async function listLocations() {
    console.log('\n📍 GEO INTELLIGENCE LOCATIONS\n');
    console.log('═'.repeat(80));

    const data = await makeRequest('/items/geo_intelligence?limit=-1');
    const locations = data.data || [];

    if (locations.length === 0) {
        console.log('  No locations found.\n');
        return;
    }

    console.log(`\n  ID | City                | State | Country | Cluster      | Status`);
    console.log('─'.repeat(80));

    locations.forEach(loc => {
        const id = (loc.id || 'N/A').toString().padEnd(4);
        const city = (loc.city || 'N/A').padEnd(20);
        const state = (loc.state || 'N/A').padEnd(6);
        const country = (loc.country || 'US').padEnd(8);
        const cluster = (loc.geo_cluster || 'none').padEnd(13);
        const status = loc.is_active ? '✅ Active' : '❌ Inactive';

        console.log(`  ${id} ${city} ${state} ${country} ${cluster} ${status}`);
    });

    console.log('\n═'.repeat(80));
    console.log(`  Total: ${locations.length} locations\n`);
}

async function addLocation(city, state, country = 'US', cluster = null) {
    console.log(`\n➕ Adding location: ${city}, ${state}, ${country}...`);

    const newLocation = {
        city,
        state,
        country,
        geo_cluster: cluster,
        is_active: true,
        population: null,
        latitude: null,
        longitude: null
    };

    try {
        const result = await makeRequest('/items/geo_intelligence', 'POST', newLocation);
        console.log(`✅ Location added successfully! ID: ${result.data.id}\n`);
        return result.data;
    } catch (err) {
        console.log(`❌ Failed to add location: ${err.message}\n`);
        return null;
    }
}

async function addBulkLocations(locations) {
    console.log(`\n➕ Adding ${locations.length} locations in bulk...\n`);

    let added = 0;
    let failed = 0;

    for (const loc of locations) {
        try {
            const newLocation = {
                city: loc.city,
                state: loc.state,
                country: loc.country || 'US',
                geo_cluster: loc.cluster || null,
                is_active: true,
                population: loc.population || null,
                latitude: loc.latitude || null,
                longitude: loc.longitude || null
            };

            await makeRequest('/items/geo_intelligence', 'POST', newLocation);
            console.log(`  ✅ Added: ${loc.city}, ${loc.state}`);
            added++;
        } catch (err) {
            console.log(`  ❌ Failed: ${loc.city}, ${loc.state} - ${err.message}`);
            failed++;
        }
    }

    console.log(`\n📊 Summary: ${added} added, ${failed} failed\n`);
}

async function removeLocation(id) {
    console.log(`\n🗑️  Removing location ID: ${id}...`);

    try {
        await makeRequest(`/items/geo_intelligence/${id}`, 'DELETE');
        console.log(`✅ Location removed successfully!\n`);
        return true;
    } catch (err) {
        console.log(`❌ Failed to remove location: ${err.message}\n`);
        return false;
    }
}

async function toggleLocationStatus(id, isActive) {
    console.log(`\n🔄 Setting location ID ${id} to ${isActive ? 'active' : 'inactive'}...`);

    try {
        await makeRequest(`/items/geo_intelligence/${id}`, 'PATCH', { is_active: isActive });
        console.log(`✅ Location status updated!\n`);
        return true;
    } catch (err) {
        console.log(`❌ Failed to update location: ${err.message}\n`);
        return false;
    }
}

async function updateLocation(id, updates) {
    console.log(`\n✏️  Updating location ID: ${id}...`);

    try {
        const result = await makeRequest(`/items/geo_intelligence/${id}`, 'PATCH', updates);
        console.log(`✅ Location updated successfully!\n`);
        return result.data;
    } catch (err) {
        console.log(`❌ Failed to update location: ${err.message}\n`);
        return null;
    }
}

async function importFromCSV(csvPath) {
    const fs = require('fs');
    console.log(`\n📥 Importing locations from CSV: ${csvPath}...\n`);

    try {
        const csvContent = fs.readFileSync(csvPath, 'utf-8');
        const lines = csvContent.split('\n').filter(l => l.trim());
        const headers = lines[0].split(',').map(h => h.trim());

        const locations = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            const loc = {};

            headers.forEach((header, index) => {
                loc[header.toLowerCase()] = values[index];
            });

            locations.push(loc);
        }

        console.log(`📊 Found ${locations.length} locations in CSV\n`);
        await addBulkLocations(locations);

    } catch (err) {
        console.log(`❌ CSV import failed: ${err.message}\n`);
    }
}

// Sample data for quick setup
const SAMPLE_US_CITIES = [
    { city: 'New York', state: 'NY', cluster: 'northeast', population: 8336817 },
    { city: 'Los Angeles', state: 'CA', cluster: 'west', population: 3979576 },
    { city: 'Chicago', state: 'IL', cluster: 'midwest', population: 2693976 },
    { city: 'Houston', state: 'TX', cluster: 'south', population: 2320268 },
    { city: 'Phoenix', state: 'AZ', cluster: 'southwest', population: 1680992 },
    { city: 'Philadelphia', state: 'PA', cluster: 'northeast', population: 1584064 },
    { city: 'San Antonio', state: 'TX', cluster: 'south', population: 1547253 },
    { city: 'San Diego', state: 'CA', cluster: 'west', population: 1423851 },
    { city: 'Dallas', state: 'TX', cluster: 'south', population: 1343573 },
    { city: 'San Jose', state: 'CA', cluster: 'west', population: 1021795 },
    { city: 'Austin', state: 'TX', cluster: 'south', population: 978908 },
    { city: 'Jacksonville', state: 'FL', cluster: 'southeast', population: 911507 },
    { city: 'Fort Worth', state: 'TX', cluster: 'south', population: 909585 },
    { city: 'Columbus', state: 'OH', cluster: 'midwest', population: 898553 },
    { city: 'Charlotte', state: 'NC', cluster: 'southeast', population: 885708 },
    { city: 'San Francisco', state: 'CA', cluster: 'west', population: 881549 },
    { city: 'Indianapolis', state: 'IN', cluster: 'midwest', population: 876384 },
    { city: 'Seattle', state: 'WA', cluster: 'northwest', population: 753675 },
    { city: 'Denver', state: 'CO', cluster: 'mountain', population: 727211 },
    { city: 'Boston', state: 'MA', cluster: 'northeast', population: 692600 }
];

// CLI Interface
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    if (command === 'list') {
        await listLocations();

    } else if (command === 'add') {
        const city = args[1];
        const state = args[2];
        const country = args[3] || 'US';
        const cluster = args[4] || null;

        if (city && state) {
            await addLocation(city, state, country, cluster);
        } else {
            console.log('Usage: node geo_manager.js add <city> <state> [country] [cluster]');
        }

    } else if (command === 'remove') {
        const id = args[1];
        if (id) {
            await removeLocation(id);
        } else {
            console.log('Usage: node geo_manager.js remove <id>');
        }

    } else if (command === 'activate' || command === 'deactivate') {
        const id = args[1];
        if (id) {
            await toggleLocationStatus(id, command === 'activate');
        } else {
            console.log(`Usage: node geo_manager.js ${command} <id>`);
        }

    } else if (command === 'update') {
        const id = args[1];
        const field = args[2];
        const value = args[3];

        if (id && field && value) {
            const updates = { [field]: value };
            await updateLocation(id, updates);
        } else {
            console.log('Usage: node geo_manager.js update <id> <field> <value>');
        }

    } else if (command === 'import-csv') {
        const csvPath = args[1];
        if (csvPath) {
            await importFromCSV(csvPath);
        } else {
            console.log('Usage: node geo_manager.js import-csv <path-to-csv>');
        }

    } else if (command === 'seed-us-cities') {
        console.log('\n🌱 Seeding with top 20 US cities...\n');
        await addBulkLocations(SAMPLE_US_CITIES);

    } else {
        console.log('\n📍 GEO INTELLIGENCE MANAGER\n');
        console.log('Commands:');
        console.log('  list                               List all locations');
        console.log('  add <city> <state> [country] [cluster]  Add a location');
        console.log('  remove <id>                        Remove a location');
        console.log('  activate <id>                      Activate a location');
        console.log('  deactivate <id>                    Deactivate a location');
        console.log('  update <id> <field> <value>        Update a location field');
        console.log('  import-csv <path>                  Import from CSV file');
        console.log('  seed-us-cities                     Add top 20 US cities');
        console.log('\nExamples:');
        console.log('  node geo_manager.js list');
        console.log('  node geo_manager.js add Miami FL US southeast');
        console.log('  node geo_manager.js remove 123');
        console.log('  node geo_manager.js seed-us-cities');
        console.log('  node geo_manager.js import-csv locations.csv\n');
        console.log('CSV Format:');
        console.log('  city,state,country,cluster,population');
        console.log('  Miami,FL,US,southeast,467963\n');
    }
}

main().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
