
import { directus } from '@/lib/directus/client';
import { readItems } from '@directus/sdk';

/**
 * Fetches all spintax dictionaries and flattens them into a usable SpintaxMap.
 * Returns: { "adjective": "{great|good|awesome}", "noun": "{cat|dog}" }
 */
export async function fetchSpintaxMap(): Promise<Record<string, string>> {
    try {
        const items = await directus.request(
            readItems('spintax_dictionaries', {
                fields: ['category', 'variations'],
                limit: -1
            })
        );

        const map: Record<string, string> = {};

        items.forEach((item: any) => {
            if (item.category && item.variations) {
                // Example: category="premium", variations="{high-end|luxury|top-tier}"
                map[item.category] = item.variations;
            }
        });

        return map;
    } catch (error) {
        console.error('Error fetching spintax:', error);
        return {};
    }
}

/**
 * Saves a new pattern (template) to the database.
 */
export async function savePattern(patternName: string, structure: string) {
    // Assuming 'cartesian_patterns' is where we store templates
    // or we might need a dedicated 'templates' collection if structure differs.
    // For now using 'cartesian_patterns' as per config.

    // Implementation pending generic createItem helper or direct SDK usage
    // This will be called by the API endpoint.
}
