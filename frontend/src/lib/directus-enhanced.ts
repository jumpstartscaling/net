import { createDirectus, rest, authentication, realtime } from '@directus/sdk';
import type { SparkSchema } from '@/types/schema';

const DIRECTUS_URL = import.meta.env.PUBLIC_DIRECTUS_URL || 'https://spark.jumpstartscaling.com';

export const directus = createDirectus<SparkSchema>(DIRECTUS_URL)
    .with(authentication('cookie', { autoRefresh: true, mode: 'json' }))
    .with(rest())
    .with(realtime());

// Re-export for convenience
export { readItems, readItem, createItem, updateItem, deleteItem, aggregate } from '@directus/sdk';
