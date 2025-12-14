import { query } from '../db';

/**
 * Directus Shim for Valhalla
 * Translates Directus SDK calls to Raw SQL to allow engines to run headless.
 */

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
    };
}

// --- SQL Builders ---

async function executeReadItems(collection: string, q: Query = {}) {
    let sql = `SELECT ${buildSelectFields(q.fields)} FROM "${collection}"`;
    const params: any[] = [];

    if (q.filter) {
        const { where, vals } = buildWhere(q.filter, params);
        if (where) sql += ` WHERE ${where}`;
    }

    // Sort
    if (q.sort) {
        // Simple sort support: ['-date_created'] -> ORDER BY date_created DESC
        const orderBy = q.sort.map(s => {
            const desc = s.startsWith('-');
            const field = desc ? s.substring(1) : s;
            return `"${field}" ${desc ? 'DESC' : 'ASC'}`;
        }).join(', ');
        if (orderBy) sql += ` ORDER BY ${orderBy}`;
    }

    // Limit/Offset
    if (q.limit) sql += ` LIMIT ${q.limit}`;
    if (q.offset) sql += ` OFFSET ${q.offset}`;

    const res = await query(sql, params);
    return res.rows;
}

async function executeReadItem(collection: string, id: string | number, q: Query = {}) {
    // If ID is numeric, simple. If UUID, simple.
    const res = await query(`SELECT * FROM "${collection}" WHERE id = $1`, [id]);
    return res.rows[0];
}

async function executeCreateItem(collection: string, data: any) {
    const keys = Object.keys(data);
    const vals = Object.values(data);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    const cols = keys.map(k => `"${k}"`).join(', '); // Quote cols for safety

    const sql = `INSERT INTO "${collection}" (${cols}) VALUES (${placeholders}) RETURNING *`;
    const res = await query(sql, vals);
    return res.rows[0];
}

async function executeUpdateItem(collection: string, id: string | number, data: any) {
    const keys = Object.keys(data);
    const vals = Object.values(data);
    const setClause = keys.map((k, i) => `"${k}" = $${i + 2}`).join(', '); // Start at $2

    const sql = `UPDATE "${collection}" SET ${setClause} WHERE id = $1 RETURNING *`;
    const res = await query(sql, [id, ...vals]);
    return res.rows[0];
}

async function executeDeleteItem(collection: string, id: string | number) {
    await query(`DELETE FROM "${collection}" WHERE id = $1`, [id]);
    return true;
}

async function executeAggregate(collection: string, q: Query = {}) {
    // Very basic aggregate support (COUNT is most common)
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
    // Filter out nested objects/arrays syntax from Directus SDK (e.g. { county: ['name'] })
    // For raw SQL, we just select top-level cols. 
    // This SHIM assumes flat selection or ignores deep selection for now.
    const cleanFields = fields.filter(f => typeof f === 'string');
    if (cleanFields.length === 0) return '*';
    return cleanFields.map(f => `"${f}"`).join(', ');
}

function buildWhere(filter: QueryFilter, params: any[]): { where: string, vals: any[] } {
    const conditions: string[] = [];

    // Handle _or / _and
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
        if (key.startsWith('_')) continue; // Skip ops

        // If val is object with ops: { _eq: 1 }
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
                } else if (op === '_in') {
                    // opVal is array
                    const placeholders = (opVal as any[]).map(v => {
                        params.push(v);
                        return `$${params.length}`;
                    }).join(', ');
                    conditions.push(`"${key}" IN (${placeholders})`);
                }
            }
        } else {
            // Implicit equality: { status: 'published' }
            params.push(val);
            conditions.push(`"${key}" = $${params.length}`);
        }
    }

    return { where: conditions.join(' AND '), vals: params };
}
