import { createDirectus, rest, authentication, realtime } from '@directus/sdk';
import type { DirectusSchema } from '@/lib/schemas';

const DIRECTUS_URL = import.meta.env.PUBLIC_DIRECTUS_URL || 'https://spark.jumpstartscaling.com';

export const directus = createDirectus<DirectusSchema>(DIRECTUS_URL)
    .with(authentication('cookie', { autoRefresh: true }))
    .with(rest())
    .with(realtime());

// Re-export for convenience
export { readItems, readItem, createItem, updateItem, deleteItem, aggregate } from '@directus/sdk';
