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

const PUBLIC_URL = import.meta.env.PUBLIC_DIRECTUS_URL || 'https://spark.jumpstartscaling.com';

// Internal URL (SSR only) - used when running server-side requests
const INTERNAL_URL = typeof process !== 'undefined' && process.env?.INTERNAL_DIRECTUS_URL
    ? process.env.INTERNAL_DIRECTUS_URL
    : 'https://spark.jumpstartscaling.com';

const DIRECTUS_TOKEN = import.meta.env.DIRECTUS_ADMIN_TOKEN || (typeof process !== 'undefined' && process.env ? process.env.DIRECTUS_ADMIN_TOKEN : '') || 'eufOJ_oKEx_FVyGoz1GxWu6nkSOcgIVS';

// Select URL based on environment (Server vs Client)
// Always use the public URL to ensure consistent access
const DIRECTUS_URL = PUBLIC_URL;

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

// Export a default singleton instance for use throughout the app
export const directus = getDirectusClient();

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
