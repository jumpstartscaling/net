/**
 * Generic Collections API - CRUD for all God Mode tables
 * GET    /api/collections/avatars - List items
 * GET    /api/collections/avatars/[id] - Get single item
 * POST   /api/collections/avatars - Create item
 * PATCH  /api/collections/avatars/[id] - Update item
 * DELETE /api/collections/avatars/[id] - Delete item
 */

import type { APIRoute } from 'astro';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// God Mode Token validation
function validateGodToken(request: Request): boolean {
    const token = request.headers.get('X-God-Token') ||
        request.headers.get('Authorization')?.replace('Bearer ', '') ||
        new URL(request.url).searchParams.get('token');

    const godToken = process.env.GOD_MODE_TOKEN || import.meta.env.GOD_MODE_TOKEN;

    if (!godToken) {
        console.warn('⚠️ GOD_MODE_TOKEN not set - backdoor is open!');
        return true;
    }

    return token === godToken;
}

// Allowed tables (whitelist for security)
const ALLOWED_TABLES = [
    'sites',
    'posts',
    'pages',
    'avatars',
    'content_blocks',
    'campaign_masters',
    'spintax_dictionaries',
    'spintax_patterns',
    'generation_jobs',
    'geo_clusters',
    'geo_locations'
];

function json(data: any, status = 200) {
    return new Response(JSON.stringify(data, null, 2), {
        status,
        headers: { 'Content-Type': 'application/json' }
    });
}

export const GET: APIRoute = async ({ params, request, url }) => {
    if (!validateGodToken(request)) {
        return json({ error: 'Unauthorized' }, 401);
    }

    const table = params.table;

    if (!table || !ALLOWED_TABLES.includes(table)) {
        return json({ error: 'Invalid table name' }, 400);
    }

    try {
        // Pagination
        const limit = parseInt(url.searchParams.get('limit') || '50');
        const offset = parseInt(url.searchParams.get('offset') || '0');

        // Sorting
        const sort = url.searchParams.get('sort') || 'date_created';
        const order = url.searchParams.get('order') || 'DESC';

        // Search
        const search = url.searchParams.get('search');

        let query = `SELECT * FROM ${table}`;
        const queryParams: any[] = [];

        // Add search if provided
        if (search) {
            query += ` WHERE name ILIKE $1`;
            queryParams.push(`%${search}%`);
        }

        query += ` ORDER BY ${sort} ${order} LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
        queryParams.push(limit, offset);

        const result = await pool.query(query, queryParams);

        // Get total count
        const countQuery = search
            ? `SELECT COUNT(*) FROM ${table} WHERE name ILIKE $1`
            : `SELECT COUNT(*) FROM ${table}`;
        const countParams = search ? [`%${search}%`] : [];
        const countResult = await pool.query(countQuery, countParams);

        return json({
            data: result.rows,
            meta: {
                total: parseInt(countResult.rows[0].count),
                limit,
                offset
            }
        });
    } catch (error: any) {
        return json({ error: error.message }, 500);
    }
};

export const POST: APIRoute = async ({ params, request }) => {
    if (!validateGodToken(request)) {
        return json({ error: 'Unauthorized' }, 401);
    }

    const table = params.table;

    if (!table || !ALLOWED_TABLES.includes(table)) {
        return json({ error: 'Invalid table name' }, 400);
    }

    try {
        const body = await request.json();

        // Build INSERT query
        const columns = Object.keys(body);
        const values = Object.values(body);
        const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

        const query = `
            INSERT INTO ${table} (${columns.join(', ')})
            VALUES (${placeholders})
            RETURNING *
        `;

        const result = await pool.query(query, values);

        return json({ data: result.rows[0] }, 201);
    } catch (error: any) {
        return json({ error: error.message }, 500);
    }
};

export const PATCH: APIRoute = async ({ params, request, url }) => {
    if (!validateGodToken(request)) {
        return json({ error: 'Unauthorized' }, 401);
    }

    const table = params.table;
    const id = url.searchParams.get('id');

    if (!table || !ALLOWED_TABLES.includes(table)) {
        return json({ error: 'Invalid table name' }, 400);
    }

    if (!id) {
        return json({ error: 'ID required' }, 400);
    }

    try {
        const body = await request.json();

        // Build UPDATE query
        const columns = Object.keys(body);
        const values = Object.values(body);
        const setClause = columns.map((col, i) => `${col} = $${i + 1}`).join(', ');

        const query = `
            UPDATE ${table}
            SET ${setClause}
            WHERE id = $${values.length + 1}
            RETURNING *
        `;

        const result = await pool.query(query, [...values, id]);

        if (result.rows.length === 0) {
            return json({ error: 'Not found' }, 404);
        }

        return json({ data: result.rows[0] });
    } catch (error: any) {
        return json({ error: error.message }, 500);
    }
};

export const DELETE: APIRoute = async ({ params, request, url }) => {
    if (!validateGodToken(request)) {
        return json({ error: 'Unauthorized' }, 401);
    }

    const table = params.table;
    const id = url.searchParams.get('id');

    if (!table || !ALLOWED_TABLES.includes(table)) {
        return json({ error: 'Invalid table name' }, 400);
    }

    if (!id) {
        return json({ error: 'ID required' }, 400);
    }

    try {
        const query = `DELETE FROM ${table} WHERE id = $1 RETURNING id`;
        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return json({ error: 'Not found' }, 404);
        }

        return json({ success: true });
    } catch (error: any) {
        return json({ error: error.message }, 500);
    }
};
