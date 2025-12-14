/**
 * Dry Run Mode
 * Preview generation without saving to database
 */

import type { Article } from '@/lib/validation/schemas';

export interface DryRunResult {
    preview: Article;
    blocks_used: string[];
    variables_injected: Record<string, string>;
    spintax_resolved: boolean;
    estimated_seo_score: number;
    warnings: string[];
    processing_time_ms: number;
}

export async function dryRunGeneration(
    patternId: string,
    avatarId: string,
    geoCity: string,
    geoState: string,
    keyword: string
): Promise<DryRunResult> {
    const startTime = Date.now();
    const warnings: string[] = [];

    // Simulate generation process without saving
    const preview: Article = {
        id: 'dry-run-preview',
        collection_id: 'dry-run',
        status: 'review',
        title: `Preview: ${keyword} in ${geoCity}, ${geoState}`,
        slug: 'dry-run-preview',
        content_html: '<p>This is a dry-run preview. No data was saved.</p>',
        geo_city: geoCity,
        geo_state: geoState,
        seo_score: 75,
        is_published: false,
    };

    // Track what would be used
    const blocks_used = [
        'intro-block-123',
        'problem-block-456',
        'solution-block-789',
    ];

    const variables_injected = {
        city: geoCity,
        state: geoState,
        keyword,
    };

    return {
        preview,
        blocks_used,
        variables_injected,
        spintax_resolved: true,
        estimated_seo_score: 75,
        warnings,
        processing_time_ms: Date.now() - startTime,
    };
}
