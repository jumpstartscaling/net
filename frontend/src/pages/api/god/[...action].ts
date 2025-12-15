/**
 * 🔱 GOD MODE BACKDOOR - Direct PostgreSQL Access
 * 
 * This endpoint bypasses Directus entirely and connects directly to PostgreSQL.
 * Works even when Directus is crashed/frozen.
 * 
 * Endpoints:
 *   GET  /api/god/health     - Full system health check
 *   GET  /api/god/services   - Quick service status (all 4 containers)
 *   GET  /api/god/db-status  - Database connection test
 *   POST /api/god/sql        - Execute raw SQL (dangerous!)
 *   GET  /api/god/tables     - List all tables
 *   GET  /api/god/logs       - Recent work_log entries
 */

import type { APIRoute } from 'astro';
import { Pool } from 'pg';
import Redis from 'ioredis';

// Direct PostgreSQL connection (bypasses Directus)
const pool = new Pool({
    host: process.env.DB_HOST || 'postgresql',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_DATABASE || 'directus',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'Idk@2026lolhappyha232',
    max: 3,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

// Directus URL
const DIRECTUS_URL = process.env.PUBLIC_DIRECTUS_URL || 'http://directus:8055';

// God Mode Token validation
function validateGodToken(request: Request): boolean {
    const token = request.headers.get('X-God-Token') ||
        request.headers.get('Authorization')?.replace('Bearer ', '') ||
        new URL(request.url).searchParams.get('token');

    const godToken = process.env.GOD_MODE_TOKEN || import.meta.env.GOD_MODE_TOKEN;

    if (!godToken) {
        console.warn('⚠️ GOD_MODE_TOKEN not set - backdoor is open!');
        return true; // Allow access if no token configured (dev mode)
    }

    return token === godToken;
}

// JSON response helper
function json(data: object, status = 200) {
    return new Response(JSON.stringify(data, null, 2), {
        status,
        headers: { 'Content-Type': 'application/json' }
    });
}

// GET /api/god/health - Full system health
export const GET: APIRoute = async ({ request, url }) => {
    if (!validateGodToken(request)) {
        return json({ error: 'Unauthorized - Invalid God Mode Token' }, 401);
    }

    const action = url.pathname.split('/').pop();

    try {
        switch (action) {
            case 'health':
                return await getHealth();
            case 'services':
                return await getServices();
            case 'db-status':
                return await getDbStatus();
            case 'tables':
                return await getTables();
            case 'logs':
                return await getLogs();
            default:
                return json({
                    message: '🔱 God Mode Backdoor Active',
                    frontend: 'RUNNING ✅',
                    endpoints: {
                        'GET /api/god/health': 'Full system health check',
                        'GET /api/god/services': 'Quick status of all 4 containers',
                        'GET /api/god/db-status': 'Database connection test',
                        'GET /api/god/tables': 'List all tables',
                        'GET /api/god/logs': 'Recent work_log entries',
                        'POST /api/god/sql': 'Execute raw SQL (body: { query: "..." })',
                    },
                    timestamp: new Date().toISOString()
                });
        }
    } catch (error: any) {
        return json({ error: error.message, stack: error.stack }, 500);
    }
};

// POST handlers for /api/god/* endpoints
export const POST: APIRoute = async ({ request, url }) => {
    if (!validateGodToken(request)) {
        return json({ error: 'Unauthorized - Invalid God Mode Token' }, 401);
    }

    const action = url.pathname.split('/').pop();

    try {
        const body = await request.json();

        switch (action) {
            case 'sql':
                return await handleSqlQuery(body);
            case 'deploy':
                return await handleDeploy(body);
            default:
                return json({
                    error: `POST not supported for /api/god/${action}`,
                    available_post_actions: ['sql', 'deploy']
                }, 400);
        }
    } catch (error: any) {
        return json({ error: error.message, code: error.code }, 500);
    }
};

// Handle raw SQL queries
async function handleSqlQuery(body: any) {
    const { query } = body;

    if (!query) {
        return json({ error: 'Missing query in request body' }, 400);
    }

    const result = await pool.query(query);

    return json({
        success: true,
        command: result.command,
        rowCount: result.rowCount,
        rows: result.rows,
        fields: result.fields?.map(f => f.name)
    });
}

// Handle campaign deployment - Direct SQL, bypasses Directus
async function handleDeploy(payload: any) {
    const startTime = Date.now();
    const results: any = {
        success: false,
        workflow: { steps_completed: 0, steps_total: 5 },
        created: {},
        errors: []
    };

    try {
        const { deployment_instruction, deployment_config, deployment_data } = payload;

        if (!deployment_data) {
            return json({ error: 'Missing deployment_data in payload' }, 400);
        }

        // Generate UUIDs for new records
        const crypto = await import('crypto');
        const siteId = crypto.randomUUID();
        const templateId = crypto.randomUUID();
        const campaignId = crypto.randomUUID();

        // Step 1: Create Site
        if (deployment_data.site_setup) {
            await pool.query(`
                INSERT INTO sites (id, name, url, status, date_created)
                VALUES ($1, $2, $3, $4, NOW())
                ON CONFLICT (id) DO UPDATE SET name = $2, url = $3, status = $4
            `, [
                siteId,
                deployment_data.site_setup.name,
                deployment_data.site_setup.url,
                deployment_data.site_setup.status || 'active'
            ]);
            results.created.site_id = siteId;
            results.workflow.steps_completed = 1;
        }

        // Step 2: Create Article Template
        if (deployment_data.article_template) {
            await pool.query(`
                INSERT INTO article_templates (id, name, structure_json, date_created)
                VALUES ($1, $2, $3, NOW())
                ON CONFLICT (id) DO UPDATE SET name = $2, structure_json = $3
            `, [
                templateId,
                deployment_data.article_template.name,
                JSON.stringify(deployment_data.article_template.structure_json)
            ]);
            results.created.template_id = templateId;
        }
        results.workflow.steps_completed = 2;

        // Step 3: Create Campaign Master
        if (deployment_data.campaign_master) {
            await pool.query(`
                INSERT INTO campaign_masters (id, site_id, name, target_word_count, location_mode, niche_variables, article_template, status, date_created)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
            `, [
                campaignId,
                siteId,
                deployment_data.campaign_master.name,
                deployment_data.campaign_master.target_word_count || 2200,
                deployment_data.campaign_master.location_mode || 'city',
                JSON.stringify(deployment_data.campaign_master.niche_variables),
                templateId,
                'active'
            ]);
            results.created.campaign_id = campaignId;
        }
        results.workflow.steps_completed = 3;

        // Step 4: Import Headlines
        if (deployment_data.headline_inventory?.length > 0) {
            let headlinesCreated = 0;
            for (const headline of deployment_data.headline_inventory) {
                const headlineId = crypto.randomUUID();
                await pool.query(`
                    INSERT INTO headline_inventory (id, campaign_id, headline_text, status, location_data, date_created)
                    VALUES ($1, $2, $3, $4, $5, NOW())
                `, [
                    headlineId,
                    campaignId,
                    headline.headline_text,
                    headline.status || 'available',
                    JSON.stringify(headline.location_data)
                ]);
                headlinesCreated++;
            }
            results.created.headlines_created = headlinesCreated;
        }
        results.workflow.steps_completed = 4;

        // Step 5: Import Content Fragments
        if (deployment_data.content_fragments?.length > 0) {
            let fragmentsCreated = 0;
            for (const fragment of deployment_data.content_fragments) {
                const fragmentId = crypto.randomUUID();
                await pool.query(`
                    INSERT INTO content_fragments (id, campaign_id, fragment_type, content_body, word_count, status, date_created)
                    VALUES ($1, $2, $3, $4, $5, $6, NOW())
                `, [
                    fragmentId,
                    campaignId,
                    fragment.type,
                    fragment.content,
                    fragment.word_count || 0,
                    'active'
                ]);
                fragmentsCreated++;
            }
            results.created.fragments_imported = fragmentsCreated;
        }
        results.workflow.steps_completed = 5;

        results.success = true;
        results.execution_time = `${((Date.now() - startTime) / 1000).toFixed(2)}s`;
        results.message = `Campaign "${deployment_data.campaign_master?.name}" deployed successfully via direct SQL`;

        return json(results);
    } catch (error: any) {
        results.error = error.message;
        results.code = error.code;
        return json(results, 500);
    }
}

// Quick service status check
async function getServices() {
    const services: Record<string, any> = {
        timestamp: new Date().toISOString(),
        frontend: { status: '✅ RUNNING', note: 'You are seeing this response' }
    };

    // Check PostgreSQL
    try {
        const start = Date.now();
        await pool.query('SELECT 1');
        services.postgresql = {
            status: '✅ RUNNING',
            latency_ms: Date.now() - start
        };
    } catch (error: any) {
        services.postgresql = {
            status: '❌ DOWN',
            error: error.message
        };
    }

    // Check Redis
    try {
        const redis = new Redis({
            host: process.env.REDIS_HOST || 'redis',
            port: 6379,
            connectTimeout: 3000,
            maxRetriesPerRequest: 1
        });
        const start = Date.now();
        await redis.ping();
        services.redis = {
            status: '✅ RUNNING',
            latency_ms: Date.now() - start
        };
        redis.disconnect();
    } catch (error: any) {
        services.redis = {
            status: '❌ DOWN',
            error: error.message
        };
    }

    // Check Directus
    try {
        const start = Date.now();
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`${DIRECTUS_URL}/server/health`, {
            signal: controller.signal
        });
        clearTimeout(timeout);

        if (response.ok) {
            const data = await response.json();
            services.directus = {
                status: '✅ RUNNING',
                latency_ms: Date.now() - start,
                health: data.status
            };
        } else {
            services.directus = {
                status: '⚠️ UNHEALTHY',
                http_status: response.status
            };
        }
    } catch (error: any) {
        services.directus = {
            status: '❌ DOWN',
            error: error.name === 'AbortError' ? 'Timeout (5s)' : error.message
        };
    }

    // Summary
    const allUp = services.postgresql.status.includes('✅') &&
        services.redis.status.includes('✅') &&
        services.directus.status.includes('✅');

    services.summary = allUp ? '✅ ALL SERVICES HEALTHY' : '⚠️ SOME SERVICES DOWN';

    return json(services);
}

// Health check implementation
async function getHealth() {
    const start = Date.now();

    const checks: Record<string, any> = {
        timestamp: new Date().toISOString(),
        uptime_seconds: Math.round(process.uptime()),
        memory: {
            rss_mb: Math.round(process.memoryUsage().rss / 1024 / 1024),
            heap_used_mb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
            heap_total_mb: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        },
    };

    // PostgreSQL check
    try {
        const dbStart = Date.now();
        const result = await pool.query('SELECT NOW() as time, current_database() as db, current_user as user');
        checks.postgresql = {
            status: '✅ healthy',
            latency_ms: Date.now() - dbStart,
            ...result.rows[0]
        };
    } catch (error: any) {
        checks.postgresql = {
            status: '❌ unhealthy',
            error: error.message
        };
    }

    // Connection pool status
    checks.pg_pool = {
        total: pool.totalCount,
        idle: pool.idleCount,
        waiting: pool.waitingCount
    };

    // Redis check
    try {
        const redis = new Redis({
            host: process.env.REDIS_HOST || 'redis',
            port: 6379,
            connectTimeout: 3000,
            maxRetriesPerRequest: 1
        });
        const redisStart = Date.now();
        const info = await redis.info('server');
        checks.redis = {
            status: '✅ healthy',
            latency_ms: Date.now() - redisStart,
            version: info.match(/redis_version:([^\r\n]+)/)?.[1]
        };
        redis.disconnect();
    } catch (error: any) {
        checks.redis = {
            status: '❌ unhealthy',
            error: error.message
        };
    }

    // Directus check
    try {
        const directusStart = Date.now();
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`${DIRECTUS_URL}/server/health`, {
            signal: controller.signal
        });
        clearTimeout(timeout);

        checks.directus = {
            status: response.ok ? '✅ healthy' : '⚠️ unhealthy',
            latency_ms: Date.now() - directusStart,
            http_status: response.status
        };
    } catch (error: any) {
        checks.directus = {
            status: '❌ unreachable',
            error: error.name === 'AbortError' ? 'Timeout (5s)' : error.message
        };
    }

    // Directus tables check
    try {
        const tables = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name LIKE 'directus_%'
            ORDER BY table_name
        `);
        checks.directus_tables = tables.rows.length;
    } catch (error: any) {
        checks.directus_tables = 0;
    }

    // Custom tables check
    try {
        const tables = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name NOT LIKE 'directus_%'
            ORDER BY table_name
        `);
        checks.custom_tables = {
            count: tables.rows.length,
            tables: tables.rows.map(r => r.table_name)
        };
    } catch (error: any) {
        checks.custom_tables = { count: 0, error: error.message };
    }

    checks.total_latency_ms = Date.now() - start;

    return json(checks);
}

// Database status
async function getDbStatus() {
    try {
        const result = await pool.query(`
            SELECT 
                pg_database_size(current_database()) as db_size_bytes,
                (SELECT count(*) FROM pg_stat_activity) as active_connections,
                (SELECT count(*) FROM pg_stat_activity WHERE state = 'active') as running_queries,
                (SELECT max(query_start) FROM pg_stat_activity WHERE state = 'active') as oldest_query_start,
                current_database() as database,
                version() as version
        `);

        return json({
            status: 'connected',
            ...result.rows[0],
            db_size_mb: Math.round(result.rows[0].db_size_bytes / 1024 / 1024)
        });
    } catch (error: any) {
        return json({ status: 'error', error: error.message }, 500);
    }
}

// List all tables
async function getTables() {
    try {
        const result = await pool.query(`
            SELECT 
                table_name,
                (SELECT count(*) FROM information_schema.columns c WHERE c.table_name = t.table_name) as column_count
            FROM information_schema.tables t
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);

        // Get row counts for each table
        const tables = [];
        for (const row of result.rows) {
            try {
                const countResult = await pool.query(`SELECT count(*) as count FROM "${row.table_name}"`);
                tables.push({
                    name: row.table_name,
                    columns: row.column_count,
                    rows: parseInt(countResult.rows[0].count)
                });
            } catch {
                tables.push({
                    name: row.table_name,
                    columns: row.column_count,
                    rows: 'error'
                });
            }
        }

        return json({
            total: tables.length,
            tables
        });
    } catch (error: any) {
        return json({ error: error.message }, 500);
    }
}

// Get recent logs
async function getLogs() {
    try {
        // Check if work_log table exists
        const exists = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' AND table_name = 'work_log'
            )
        `);

        if (!exists.rows[0].exists) {
            return json({ message: 'work_log table does not exist', logs: [] });
        }

        const result = await pool.query(`
            SELECT * FROM work_log 
            ORDER BY timestamp DESC 
            LIMIT 50
        `);

        return json({
            count: result.rows.length,
            logs: result.rows
        });
    } catch (error: any) {
        return json({ error: error.message }, 500);
    }
}
