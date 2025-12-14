/**
 * 🔱 GOD MODE BACKDOOR - Direct PostgreSQL Access
 * 
 * This endpoint bypasses Directus entirely and connects directly to PostgreSQL.
 * Works even when Directus is crashed/frozen.
 * 
 * Endpoints:
 *   GET  /api/god/health     - Full system health check
 *   GET  /api/god/db-status  - Database connection test
 *   POST /api/god/sql        - Execute raw SQL (dangerous!)
 *   GET  /api/god/tables     - List all tables
 *   GET  /api/god/logs       - Recent work_log entries
 */

import type { APIRoute } from 'astro';
import { Pool } from 'pg';

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
            case 'db-status':
                return await getDbStatus();
            case 'tables':
                return await getTables();
            case 'logs':
                return await getLogs();
            default:
                return json({
                    message: '🔱 God Mode Backdoor Active',
                    endpoints: {
                        'GET /api/god/health': 'Full system health check',
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

// POST /api/god/sql - Execute raw SQL
export const POST: APIRoute = async ({ request, url }) => {
    if (!validateGodToken(request)) {
        return json({ error: 'Unauthorized - Invalid God Mode Token' }, 401);
    }

    const action = url.pathname.split('/').pop();

    if (action !== 'sql') {
        return json({ error: 'POST only supported for /api/god/sql' }, 400);
    }

    try {
        const body = await request.json();
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
    } catch (error: any) {
        return json({ error: error.message, code: error.code }, 500);
    }
};

// Health check implementation
async function getHealth() {
    const start = Date.now();

    const checks: Record<string, any> = {
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
    };

    // PostgreSQL check
    try {
        const dbStart = Date.now();
        const result = await pool.query('SELECT NOW() as time, current_database() as db, current_user as user');
        checks.postgresql = {
            status: 'healthy',
            latency_ms: Date.now() - dbStart,
            ...result.rows[0]
        };
    } catch (error: any) {
        checks.postgresql = {
            status: 'unhealthy',
            error: error.message
        };
    }

    // Connection pool status
    checks.pool = {
        total: pool.totalCount,
        idle: pool.idleCount,
        waiting: pool.waitingCount
    };

    // Directus tables check
    try {
        const tables = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name LIKE 'directus_%'
            ORDER BY table_name
        `);
        checks.directus = {
            system_tables: tables.rows.length,
            tables: tables.rows.map(r => r.table_name)
        };
    } catch (error: any) {
        checks.directus = { status: 'error', error: error.message };
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
        checks.custom_tables = { status: 'error', error: error.message };
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
