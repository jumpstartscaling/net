/**
 * Directus Shim for Valhalla
 * Translates Directus SDK calls to Raw SQL (Server) or Proxy API (Client).
 */

import type { Query } from './types';

const PROXY_ENDPOINT = '/api/god/proxy';

// --- Types ---
// Re-export types for consumers
export * from './types';

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
            // Check if running on server via import.meta.env provided by Vite/Astro
            if (import.meta.env.SSR) {
                // SERVER-SIDE: Dynamic import to avoid bundling 'pg' in client
                const { executeCommand } = await import('./server');
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
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('godToken') : '';
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
