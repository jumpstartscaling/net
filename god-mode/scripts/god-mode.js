#!/usr/bin/env node
/**
 * SPARK GOD MODE CLI
 * ==================
 * Direct API access to Spark Platform with no connection limits.
 * 
 * Usage:
 *   node scripts/god-mode.js <command> [options]
 * 
 * Commands:
 *   health          - Check API health
 *   collections     - List all collections
 *   schema          - Export schema snapshot
 *   query <coll>    - Query a collection
 *   insert <coll>   - Insert into collection (reads JSON from stdin)
 *   update <coll>   - Update items (requires --filter and --data)
 *   sql <query>     - Execute raw SQL (admin only)
 * 
 * Environment:
 *   DIRECTUS_URL    - Directus API URL (default: https://spark.jumpstartscaling.com)
 *   GOD_MODE_TOKEN  - God Mode authentication token
 *   ADMIN_TOKEN     - Directus Admin Token (for standard ops)
 */

const https = require('https');
const http = require('http');

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
    // Primary URL (can be overridden by env)
    DIRECTUS_URL: process.env.DIRECTUS_URL || 'https://spark.jumpstartscaling.com',

    // Authentication
    GOD_MODE_TOKEN: process.env.GOD_MODE_TOKEN || '',
    ADMIN_TOKEN: process.env.DIRECTUS_ADMIN_TOKEN || process.env.ADMIN_TOKEN || '',

    // Connection settings - NO LIMITS
    TIMEOUT: 0,  // No timeout
    MAX_RETRIES: 5,
    RETRY_DELAY: 1000,
    KEEP_ALIVE: true
};

// Keep-alive agent for persistent connections
const httpAgent = new http.Agent({ keepAlive: true, maxSockets: 10 });
const httpsAgent = new https.Agent({ keepAlive: true, maxSockets: 10 });

// ============================================================================
// HTTP CLIENT (No external dependencies)
// ============================================================================

function request(method, path, data = null, useGodMode = false) {
    return new Promise((resolve, reject) => {
        const url = new URL(path.startsWith('http') ? path : `${CONFIG.DIRECTUS_URL}${path}`);
        const isHttps = url.protocol === 'https:';
        const client = isHttps ? https : http;

        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'SparkGodMode/1.0'
        };

        // GOD MODE TOKEN is primary - always use it if available
        if (CONFIG.GOD_MODE_TOKEN) {
            headers['X-God-Token'] = CONFIG.GOD_MODE_TOKEN;
            headers['Authorization'] = `Bearer ${CONFIG.GOD_MODE_TOKEN}`;
        } else if (CONFIG.ADMIN_TOKEN) {
            // Fallback only if no God token
            headers['Authorization'] = `Bearer ${CONFIG.ADMIN_TOKEN}`;
        }

        const options = {
            hostname: url.hostname,
            port: url.port || (isHttps ? 443 : 80),
            path: url.pathname + url.search,
            method: method,
            headers: headers,
            agent: isHttps ? httpsAgent : httpAgent,
            timeout: CONFIG.TIMEOUT
        };

        const req = client.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(body);
                    if (res.statusCode >= 400) {
                        reject({ status: res.statusCode, error: json });
                    } else {
                        resolve({ status: res.statusCode, data: json });
                    }
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', reject);
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

// Retry wrapper
async function requestWithRetry(method, path, data = null, useGodMode = false) {
    let lastError;
    for (let i = 0; i < CONFIG.MAX_RETRIES; i++) {
        try {
            return await request(method, path, data, useGodMode);
        } catch (err) {
            lastError = err;
            console.error(`Attempt ${i + 1} failed:`, err.message || err);
            if (i < CONFIG.MAX_RETRIES - 1) {
                await new Promise(r => setTimeout(r, CONFIG.RETRY_DELAY * (i + 1)));
            }
        }
    }
    throw lastError;
}

// ============================================================================
// API METHODS
// ============================================================================

const API = {
    // Health check
    async health() {
        return requestWithRetry('GET', '/server/health');
    },

    // List all collections
    async collections() {
        return requestWithRetry('GET', '/collections');
    },

    // Get collection schema
    async schema(collection) {
        if (collection) {
            return requestWithRetry('GET', `/collections/${collection}`);
        }
        return requestWithRetry('GET', '/schema/snapshot', null, true);
    },

    // Read items from collection
    async readItems(collection, options = {}) {
        const params = new URLSearchParams();
        if (options.filter) params.set('filter', JSON.stringify(options.filter));
        if (options.fields) params.set('fields', options.fields.join(','));
        if (options.limit) params.set('limit', options.limit);
        if (options.offset) params.set('offset', options.offset);
        if (options.sort) params.set('sort', options.sort);

        const query = params.toString() ? `?${params}` : '';
        return requestWithRetry('GET', `/items/${collection}${query}`);
    },

    // Create item
    async createItem(collection, data) {
        return requestWithRetry('POST', `/items/${collection}`, data);
    },

    // Update item
    async updateItem(collection, id, data) {
        return requestWithRetry('PATCH', `/items/${collection}/${id}`, data);
    },

    // Delete item
    async deleteItem(collection, id) {
        return requestWithRetry('DELETE', `/items/${collection}/${id}`);
    },

    // Bulk create
    async bulkCreate(collection, items) {
        return requestWithRetry('POST', `/items/${collection}`, items);
    },

    // God Mode: Create collection
    async godCreateCollection(schema) {
        return requestWithRetry('POST', '/god/schema/collections/create', schema, true);
    },

    // God Mode: Create relation
    async godCreateRelation(relation) {
        return requestWithRetry('POST', '/god/schema/relations/create', relation, true);
    },

    // God Mode: Bulk insert
    async godBulkInsert(collection, items) {
        return requestWithRetry('POST', '/god/data/bulk-insert', { collection, items }, true);
    },

    // Aggregate query
    async aggregate(collection, options = {}) {
        const params = new URLSearchParams();
        if (options.aggregate) params.set('aggregate', JSON.stringify(options.aggregate));
        if (options.groupBy) params.set('groupBy', options.groupBy.join(','));
        if (options.filter) params.set('filter', JSON.stringify(options.filter));

        return requestWithRetry('GET', `/items/${collection}?${params}`);
    }
};

// ============================================================================
// CLI INTERFACE
// ============================================================================

async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    if (!command) {
        console.log(`
SPARK GOD MODE CLI
==================
Commands:
  health              Check API health
  collections         List all collections  
  schema [coll]       Export schema (or single collection)
  read <coll>         Read items from collection
  count <coll>        Count items in collection
  insert <coll>       Create item (pipe JSON via stdin)
  
Environment Variables:
  DIRECTUS_URL        API endpoint (default: https://spark.jumpstartscaling.com)
  ADMIN_TOKEN         Directus admin token
  GOD_MODE_TOKEN      Elevated access token
        `);
        return;
    }

    try {
        let result;

        switch (command) {
            case 'health':
                result = await API.health();
                console.log('✅ API Health:', result.data);
                break;

            case 'collections':
                result = await API.collections();
                console.log('📦 Collections:');
                if (result.data?.data) {
                    result.data.data.forEach(c => console.log(`  - ${c.collection}`));
                }
                break;

            case 'schema':
                result = await API.schema(args[1]);
                console.log(JSON.stringify(result.data, null, 2));
                break;

            case 'read':
                if (!args[1]) {
                    console.error('Usage: read <collection>');
                    process.exit(1);
                }
                result = await API.readItems(args[1], { limit: 100 });
                console.log(JSON.stringify(result.data, null, 2));
                break;

            case 'count':
                if (!args[1]) {
                    console.error('Usage: count <collection>');
                    process.exit(1);
                }
                result = await API.aggregate(args[1], { aggregate: { count: '*' } });
                console.log(`📊 ${args[1]}: ${result.data?.data?.[0]?.count || 0} items`);
                break;

            case 'insert':
                if (!args[1]) {
                    console.error('Usage: echo \'{"key":"value"}\' | node god-mode.js insert <collection>');
                    process.exit(1);
                }
                // Read from stdin
                let input = '';
                for await (const chunk of process.stdin) {
                    input += chunk;
                }
                const data = JSON.parse(input);
                result = await API.createItem(args[1], data);
                console.log('✅ Created:', result.data);
                break;

            default:
                console.error(`Unknown command: ${command}`);
                process.exit(1);
        }
    } catch (err) {
        console.error('❌ Error:', err.error || err.message || err);
        process.exit(1);
    }
}

// ============================================================================
// EXPORTS (For programmatic use)
// ============================================================================

module.exports = { API, CONFIG, request, requestWithRetry };

// Run CLI if executed directly
if (require.main === module) {
    main().catch(console.error);
}
