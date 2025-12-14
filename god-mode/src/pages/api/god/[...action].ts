/**
 * 🔱 GOD MODE BACKDOOR - Direct PostgreSQL Access
 * Standalone Version (Valhalla)
 */

import type { APIRoute } from 'astro';
import pg from 'pg'; // Default import for some environments
const { Pool } = pg;
import Redis from 'ioredis';

// Direct PostgreSQL connection (Strict Connection String)
// God Mode requires Superuser access (postgres) to effectively diagnose and fix the DB.
if (!process.env.DATABASE_URL) {
    console.error("❌ FATAL: DATABASE_URL environment variable is missing!");
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 3,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    ssl: process.env.DATABASE_URL?.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined
});

// Redis connection
const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';

// Service URLs
const DIRECTUS_URL = process.env.PUBLIC_DIRECTUS_URL || 'http://directus:8055';

// Token validation
function validateGodToken(request: Request): boolean {
    const token = request.headers.get('X-God-Token') ||
        request.headers.get('Authorization')?.replace('Bearer ', '') ||
        new URL(request.url).searchParams.get('token');

    const godToken = process.env.GOD_MODE_TOKEN;

    if (!godToken) {
        // In standalone mode, we force a token for security
        console.warn('⚠️ GOD_MODE_TOKEN not set in env!');
        return false;
    }

    return token === godToken;
}

function json(data: object, status = 200) {
    return new Response(JSON.stringify(data, null, 2), {
        status,
        headers: { 'Content-Type': 'application/json' }
    });
}

// GET Handler
export const GET: APIRoute = async ({ request, url }) => {
    // Quick health check (no auth needed for load balancers)
    if (url.pathname.endsWith('/healthz')) {
        return new Response('OK', { status: 200 });
    }

    if (!validateGodToken(request)) {
        return json({ error: 'Unauthorized - Invalid God Mode Token' }, 401);
    }

    const action = url.pathname.split('/').pop();

    try {
        switch (action) {
            case 'health': return await getHealth();
            case 'services': return await getServices();
            case 'db-status': return await getDbStatus();
            case 'tables': return await getTables();
            case 'logs': return await getLogs();
            default: return json({
                message: '🔱 Valhalla Active',
                timestamp: new Date().toISOString()
            });
        }
    } catch (error: any) {
        return json({ error: error.message, stack: error.stack }, 500);
    }
};

// POST Handler
export const POST: APIRoute = async ({ request, url }) => {
    if (!validateGodToken(request)) {
        return json({ error: 'Unauthorized' }, 401);
    }

    const action = url.pathname.split('/').pop();

    if (action === 'sql') {
        try {
            const body = await request.json();
            if (!body.query) return json({ error: 'Missing query' }, 400);

            const result = await pool.query(body.query);
            return json({
                success: true,
                rowCount: result.rowCount,
                rows: result.rows,
                fields: result.fields?.map(f => f.name)
            });
        } catch (error: any) {
            return json({ error: error.message }, 500);
        }
    }

    return json({ error: 'Method not allowed' }, 405);
};

// --- Helpers ---

async function getServices() {
    const services: any = { timestamp: new Date().toISOString() };

    // DB Check
    try {
        const start = Date.now();
        await pool.query('SELECT 1');
        services.postgresql = { status: '✅ RUNNING', latency: Date.now() - start };
    } catch (e: any) {
        services.postgresql = { status: '❌ DOWN', error: e.message };
    }

    // Redis Check
    try {
        const redis = new Redis(REDIS_URL, { maxRetriesPerRequest: 1, connectTimeout: 2000 });
        const start = Date.now();
        await redis.ping();
        services.redis = { status: '✅ RUNNING', latency: Date.now() - start };
        redis.disconnect();
    } catch (e: any) {
        services.redis = { status: '❌ DOWN', error: e.message };
    }

    // Directus Check
    try {
        const start = Date.now();
        const res = await fetch(`${DIRECTUS_URL}/server/health`, { signal: AbortSignal.timeout(5000) });
        services.directus = {
            status: res.ok ? '✅ RUNNING' : `⚠️ HTTP ${res.status}`,
            latency: Date.now() - start
        };
    } catch (e: any) {
        services.directus = { status: '❌ DOWN', error: e.message };
    }

    return json(services);
}

async function getHealth() {
    // Full system health (similar to getServices but more detail)
    return getServices();
}

async function getDbStatus() {
    try {
        const res = await pool.query(`
            SELECT current_database() as db, version(), 
            (SELECT count(*) FROM pg_stat_activity) as connections
        `);
        return json({ status: 'connected', ...res.rows[0] });
    } catch (e: any) {
        return json({ status: 'error', error: e.message });
    }
}

async function getTables() {
    try {
        const res = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `);
        return json({ total: res.rows.length, tables: res.rows });
    } catch (e: any) {
        return json({ error: e.message });
    }
}

async function getLogs() {
    try {
        const res = await pool.query('SELECT * FROM work_log ORDER BY timestamp DESC LIMIT 50');
        return json({ logs: res.rows });
    } catch (e: any) {
        return json({ error: e.message });
    }
}
