import {
    createDirectus,
    rest,
    staticToken,
    readItems,
    readItem,
    readSingleton,
    createItem,
    updateItem,
    deleteItem,
    aggregate
} from '@directus/sdk';
import type { SparkSchema } from '@/types/schema';

const DIRECTUS_URL = import.meta.env.PUBLIC_DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = import.meta.env.DIRECTUS_ADMIN_TOKEN || '';

/**
 * Creates a typed Directus client for the Spark Platform
 */
export function getDirectusClient(token?: string) {
    const client = createDirectus<SparkSchema>(DIRECTUS_URL).with(rest());

    if (token || DIRECTUS_TOKEN) {
        return client.with(staticToken(token || DIRECTUS_TOKEN));
    }

    return client;
}

/**
 * Helper to make authenticated requests
 */
export async function withAuth<T>(
    token: string,
    request: Promise<T>
): Promise<T> {
    return request;
}

// Re-export SDK functions for convenience
export {
    readItems,
    readItem,
    readSingleton,
    createItem,
    updateItem,
    deleteItem,
    aggregate
};
