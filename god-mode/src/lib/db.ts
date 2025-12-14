import pg from 'pg';
const { Pool } = pg;

if (!process.env.DATABASE_URL) {
    console.warn("⚠️ DATABASE_URL is missing. DB connections will fail.");
}

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    ssl: process.env.DATABASE_URL?.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
