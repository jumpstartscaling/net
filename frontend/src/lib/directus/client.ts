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
import type { DirectusSchema } from '../schemas';
import type { DirectusClient, RestClient } from '@directus/sdk';

/**
 * SSR-Safe Directus URL Detection
 * 
 * When running Server-Side (SSR), the frontend container cannot reach
 * the public HTTPS URL from inside Docker. It must use the internal
 * Docker network name 'directus' instead.
 * 
 * - SSR/Server: http://directus:8055 (internal Docker network)
 * - Browser/Client: https://spark.jumpstartscaling.com (public URL)
 */
const isServer = import.meta.env.SSR || typeof window === 'undefined';

// Public URL for client-side requests
const PUBLIC_URL = import.meta.env.PUBLIC_DIRECTUS_URL || 'https://spark.jumpstartscaling.com';

// Internal Docker URL for SSR requests
const INTERNAL_URL = 'http://directus:8055';

// Select URL based on environment
const DIRECTUS_URL = isServer ? INTERNAL_URL : PUBLIC_URL;

// Admin token for authenticated requests
const DIRECTUS_TOKEN = import.meta.env.DIRECTUS_ADMIN_TOKEN || '';

/**
 * Creates a typed Directus client for the Spark Platform
 */
export function getDirectusClient(token?: string): DirectusClient<DirectusSchema> & RestClient<DirectusSchema> {
    const client = createDirectus<DirectusSchema>(DIRECTUS_URL).with(rest());

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
