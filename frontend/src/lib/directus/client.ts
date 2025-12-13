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

const PUBLIC_URL = import.meta.env.PUBLIC_DIRECTUS_URL || 'http://localhost:8055';

// Internal URL (SSR only) - try process.env first to bypass build-time replacement, then fallback to docker default
let INTERNAL_URL = 'http://directus:8055';
if (typeof process !== 'undefined' && process.env && process.env.INTERNAL_DIRECTUS_URL) {
    INTERNAL_URL = process.env.INTERNAL_DIRECTUS_URL;
}

// Select URL based on environment (Server vs Client)
const DIRECTUS_URL = (typeof window === 'undefined') ? INTERNAL_URL : PUBLIC_URL;

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
