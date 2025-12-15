import { query } from '../db';

/**
 * Directus Shim for Valhalla
 * Translates Directus SDK calls to Raw SQL (Server) or Proxy API (Client).
 */

const isServer = typeof window === 'undefined';
const PROXY_ENDPOINT = '/api/god/proxy';

// --- Types ---
interface QueryCmp {
    _eq?: any;
    _neq?: any;
    _gt?: any;
    _lt?: any;
    _contains?: any;
    _in?: any[];
}

interface QueryFilter {
    [field: string]: QueryCmp | QueryFilter | any;
    _or?: QueryFilter[];
    _and?: QueryFilter[];
}

interface Query {
    filter?: QueryFilter;
    fields?: string[];
    limit?: number;
    offset?: number;
    sort?: string[];
    aggregate?: any;
}

// --- SDK Mocks ---

export function readItems(collection: string, q?: Query) {
    return { type: 'readItems', collection, query: q };
}

export function readItem(collection: string, id: string | number, q?: Query) {
    return { type: 'readItem', collection, id, query: q };
}

export function createItem(collection: string, data: any) {
    return { type: 'createItem', collection, data };
}

export function updateItem(collection: string, id: string | number, data: any) {
    return { type: 'updateItem', collection, id, data };
}

export function deleteItem(collection: string, id: string | number) {
    return { type: 'deleteItem', collection, id };
}

export function readSingleton(collection: string, q?: Query) {
    return { type: 'readSingleton', collection, query: q };
}

export function aggregate(collection: string, q?: Query) {
    return { type: 'aggregate', collection, query: q };
}

// --- Client Implementation ---

export function getDirectusClient() {
    return {
        request: async (command: any) => {
            if (isServer) {
                // SERVER-SIDE: Direct DB Access
                return await executeCommand(command);
            } else {
                // CLIENT-SIDE: Proxy via HTTP
                return await executeProxy(command);
            }
        }
    };
}

// --- Proxy Execution (Client) ---

async function executeProxy(command: any) {
    const token = localStorage.getItem('godToken') || ''; // Assuming auth token storage
    const res = await fetch(PROXY_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(command)
    });

    if (!res.ok) {
        let err = 'Unknown Error';
        try { err = (await res.json()).error; } catch { }
        throw new Error(err);
    }

    return await res.json();
}

// --- Server Execution (Server) ---
// This is exported so the Proxy Endpoint can use it too!
export async function executeCommand(command: any) {
    try {
        switch (command.type) {
            case 'readItems':
                return await executeReadItems(command.collection, command.query);
            case 'readItem':
                return await executeReadItem(command.collection, command.id, command.query);
            case 'createItem':
                return await executeCreateItem(command.collection, command.data);
            case 'updateItem':
                return await executeUpdateItem(command.collection, command.id, command.data);
            case 'deleteItem':
                return await executeDeleteItem(command.collection, command.id);
            case 'aggregate':
                return await executeAggregate(command.collection, command.query);
            default:
                throw new Error(`Unknown command type: ${command.type}`);
        }
    } catch (err: any) {
        console.error(`Shim Error (${command.type} on ${command.collection}):`, err);
        throw err;
    }
}

// --- SQL Builders ---

async function executeReadItems(collection: string, q: Query = {}) {
    // SECURITY: Validate collection name to prevent SQL injection via simple table name abuse
    if (!/^[a-zA-Z0-9_]+$/.test(collection)) throw new Error("Invalid collection name");

    let sql = `SELECT ${buildSelectFields(q.fields)} FROM "${collection}"`;
    const params: any[] = [];

    if (q.filter) {
        const { where, vals } = buildWhere(q.filter, params);
        if (where) sql += ` WHERE ${where}`;
    }

    // Sort
    if (q.sort) {
        const orderBy = q.sort.map(s => {
            const desc = s.startsWith('-');
            const field = desc ? s.substring(1) : s;
            if (!/^[a-zA-Z0-9_]+$/.test(field)) return 'id'; // sanitize
            return `"${field}" ${desc ? 'DESC' : 'ASC'}`;
        }).join(', ');
        if (orderBy) sql += ` ORDER BY ${orderBy}`;
    }

    // Limit/Offset
    if (q.limit !== undefined && q.limit !== -1) sql += ` LIMIT ${q.limit}`;
    if (q.offset) sql += ` OFFSET ${q.offset}`;

    const res = await query(sql, params);
    return res.rows;
}

async function executeReadItem(collection: string, id: string | number, q: Query = {}) {
    if (!/^[a-zA-Z0-9_]+$/.test(collection)) throw new Error("Invalid collection name");
    const res = await query(`SELECT * FROM "${collection}" WHERE id = $1`, [id]);
    return res.rows[0];
}

async function executeCreateItem(collection: string, data: any) {
    if (!/^[a-zA-Z0-9_]+$/.test(collection)) throw new Error("Invalid collection name");
    const keys = Object.keys(data);
    const vals = Object.values(data);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    const cols = keys.map(k => `"${k}"`).join(', ');

    const sql = `INSERT INTO "${collection}" (${cols}) VALUES (${placeholders}) RETURNING *`;
    const res = await query(sql, vals);
    return res.rows[0];
}

async function executeUpdateItem(collection: string, id: string | number, data: any) {
    if (!/^[a-zA-Z0-9_]+$/.test(collection)) throw new Error("Invalid collection name");
    const keys = Object.keys(data);
    const vals = Object.values(data);
    const setClause = keys.map((k, i) => `"${k}" = $${i + 2}`).join(', ');

    const sql = `UPDATE "${collection}" SET ${setClause} WHERE id = $1 RETURNING *`;
    const res = await query(sql, [id, ...vals]);
    return res.rows[0];
}

async function executeDeleteItem(collection: string, id: string | number) {
    if (!/^[a-zA-Z0-9_]+$/.test(collection)) throw new Error("Invalid collection name");
    await query(`DELETE FROM "${collection}" WHERE id = $1`, [id]);
    return true;
}

async function executeAggregate(collection: string, q: Query = {}) {
    if (!/^[a-zA-Z0-9_]+$/.test(collection)) throw new Error("Invalid collection name");
    if (q.aggregate?.count) {
        let sql = `SELECT COUNT(*) as count FROM "${collection}"`;
        const params: any[] = [];
        if (q.filter) {
            const { where, vals } = buildWhere(q.filter, params);
            if (where) sql += ` WHERE ${where}`;
        }
        const res = await query(sql, params);
        return [{ count: res.rows[0].count }];
    }
    return [];
}

// --- Query Helpers ---

function buildSelectFields(fields?: string[]) {
    if (!fields || fields.includes('*') || fields.length === 0) return '*';
    const cleanFields = fields.filter(f => typeof f === 'string');
    if (cleanFields.length === 0) return '*';
    return cleanFields.map(f => `"${f.replace(/[^a-zA-Z0-9_]/g, '')}"`).join(', ');
}

function buildWhere(filter: QueryFilter, params: any[]): { where: string, vals: any[] } {
    const conditions: string[] = [];

    if (filter._or) {
        const orConds = filter._or.map(f => {
            const res = buildWhere(f, params);
            return `(${res.where})`;
        });
        conditions.push(`(${orConds.join(' OR ')})`);
        return { where: conditions.join(' AND '), vals: params };
    }

    if (filter._and) {
        const andConds = filter._and.map(f => {
            const res = buildWhere(f, params);
            return `(${res.where})`;
        });
        conditions.push(`(${andConds.join(' AND ')})`);
        return { where: conditions.join(' AND '), vals: params };
    }

    for (const [key, val] of Object.entries(filter)) {
        if (key.startsWith('_')) continue;
        if (!/^[a-zA-Z0-9_]+$/.test(key)) continue; // skip invalid keys

        if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
            for (const [op, opVal] of Object.entries(val)) {
                if (op === '_eq') {
                    params.push(opVal);
                    conditions.push(`"${key}" = $${params.length}`);
                } else if (op === '_neq') {
                    params.push(opVal);
                    conditions.push(`"${key}" != $${params.length}`);
                } else if (op === '_contains') {
                    params.push(`%${opVal}%`);
                    conditions.push(`"${key}" LIKE $${params.length}`);
                } else if (op === '_gt') {
                    params.push(opVal);
                    conditions.push(`"${key}" > $${params.length}`);
                } else if (op === '_lt') {
                    params.push(opVal);
                    conditions.push(`"${key}" < $${params.length}`);
                }
            }
        } else {
            params.push(val);
            conditions.push(`"${key}" = $${params.length}`);
        }
    }

    return { where: conditions.join(' AND '), vals: params };
}
