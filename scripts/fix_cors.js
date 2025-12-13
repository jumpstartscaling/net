#!/usr/bin/env node

/**
 * Fix Directus CORS Settings
 * Allow launch.jumpstartscaling.com to access spark.jumpstartscaling.com
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

async function fixCORS() {
    console.log('\n🔧 FIXING DIRECTUS CORS SETTINGS\n');
    console.log('═'.repeat(60));

    console.log('\n📋 Current Issue:');
    console.log('  Origin: https://launch.jumpstartscaling.com');
    console.log('  Target: https://spark.jumpstartscaling.com');
    console.log('  Error: No Access-Control-Allow-Origin header\n');

    console.log('⚠️  IMPORTANT: CORS settings must be configured in Directus environment variables.\n');
    console.log('The following environment variables need to be set in Coolify:\n');

    console.log('CORS_ENABLED=true');
    console.log('CORS_ORIGIN=https://launch.jumpstartscaling.com,http://localhost:4321');
    console.log('CORS_METHODS=GET,POST,PATCH,DELETE');
    console.log('CORS_ALLOWED_HEADERS=Content-Type,Authorization');
    console.log('CORS_EXPOSED_HEADERS=Content-Range');
    console.log('CORS_CREDENTIALS=true');
    console.log('CORS_MAX_AGE=86400\n');

    console.log('═'.repeat(60));
    console.log('📝 INSTRUCTIONS:\n');
    console.log('1. Go to Coolify: http://72.61.15.216:8000');
    console.log('2. Find the Directus service');
    console.log('3. Go to Environment Variables');
    console.log('4. Add the CORS variables listed above');
    console.log('5. Restart the Directus service\n');
    console.log('OR update docker-compose.yaml with these values and redeploy.\n');
    console.log('═'.repeat(60) + '\n');

    // Test current CORS
    console.log('🔍 Testing if CORS is already configured...\n');

    try {
        // Try a simple request from Node (won't have CORS issue)
        const test = await makeRequest('/server/info');
        console.log('✅ API is accessible (from Node.js)');
        console.log('⚠️  Browser CORS restriction is separate - needs environment variables\n');
    } catch (err) {
        console.log('❌ API test failed:', err.message, '\n');
    }

    return {
        instructions: 'Add CORS environment variables to Directus service in Coolify',
        variables: {
            CORS_ENABLED: 'true',
            CORS_ORIGIN: 'https://launch.jumpstartscaling.com,http://localhost:4321',
            CORS_METHODS: 'GET,POST,PATCH,DELETE',
            CORS_ALLOWED_HEADERS: 'Content-Type,Authorization',
            CORS_EXPOSED_HEADERS: 'Content-Range',
            CORS_CREDENTIALS: 'true',
            CORS_MAX_AGE: '86400'
        }
    };
}

fixCORS()
    .then(result => {
        const fs = require('fs');
        fs.writeFileSync('cors_fix_instructions.json', JSON.stringify(result, null, 2));
        console.log('📄 Instructions saved to: cors_fix_instructions.json\n');
    })
    .catch(err => {
        console.error('❌ Error:', err.message);
        process.exit(1);
    });
