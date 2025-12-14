/**
 * Zod Validation Schemas
 * Type-safe validation for all collections
 */

import { z } from 'zod';

// Site schema
export const siteSchema = z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(1, 'Site name required'),
    domain: z.string().min(1, 'Domain required'),
    domain_aliases: z.array(z.string()).optional(),
    settings: z.record(z.any()).optional(),
    status: z.enum(['active', 'inactive']),
    date_created: z.string().optional(),
    date_updated: z.string().optional(),
});

// Collection schema
export const collectionSchema = z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(1, 'Collection name required'),
    status: z.enum(['queued', 'processing', 'complete', 'failed']),
    site_id: z.string().uuid('Invalid site ID'),
    avatar_id: z.string().uuid('Invalid avatar ID'),
    pattern_id: z.string().uuid('Invalid pattern ID'),
    geo_cluster_id: z.string().uuid('Invalid geo cluster ID').optional(),
    target_keyword: z.string().min(1, 'Keyword required'),
    batch_size: z.number().min(1).max(1000),
    logs: z.any().optional(),
    date_created: z.string().optional(),
});

// Generated article schema
export const articleSchema = z.object({
    id: z.string().uuid().optional(),
    collection_id: z.string().uuid('Invalid collection ID'),
    status: z.enum(['queued', 'generating', 'review', 'approved', 'published', 'failed']),
    title: z.string().min(1, 'Title required'),
    slug: z.string().min(1, 'Slug required'),
    content_html: z.string().optional(),
    content_raw: z.string().optional(),
    assembly_map: z.object({
        pattern_id: z.string(),
        block_ids: z.array(z.string()),
        variables: z.record(z.string()),
    }).optional(),
    seo_score: z.number().min(0).max(100).optional(),
    geo_city: z.string().optional(),
    geo_state: z.string().optional(),
    featured_image_url: z.string().url().optional(),
    meta_desc: z.string().max(160).optional(),
    schema_json: z.any().optional(),
    logs: z.any().optional(),
    wordpress_post_id: z.number().optional(),
    is_published: z.boolean().optional(),
    date_created: z.string().optional(),
});

// Content block schema
export const contentBlockSchema = z.object({
    id: z.string().uuid().optional(),
    category: z.enum(['intro', 'body', 'cta', 'problem', 'solution', 'benefits']),
    avatar_id: z.string().uuid('Invalid avatar ID'),
    content: z.string().min(1, 'Content required'),
    tags: z.array(z.string()).optional(),
    usage_count: z.number().optional(),
});

// Pattern schema
export const patternSchema = z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(1, 'Pattern name required'),
    structure_json: z.any(),
    execution_order: z.array(z.string()),
    preview_template: z.string().optional(),
});

// Avatar schema
export const avatarSchema = z.object({
    id: z.string().uuid().optional(),
    base_name: z.string().min(1, 'Avatar name required'),
    business_niches: z.array(z.string()),
    wealth_cluster: z.string(),
});

// Geo cluster schema
export const geoClusterSchema = z.object({
    id: z.string().uuid().optional(),
    cluster_name: z.string().min(1, 'Cluster name required'),
});

// Spintax validation
export const validateSpintax = (text: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Check for unbalanced braces
    let braceCount = 0;
    for (let i = 0; i < text.length; i++) {
        if (text[i] === '{') braceCount++;
        if (text[i] === '}') braceCount--;
        if (braceCount < 0) {
            errors.push(`Unbalanced closing brace at position ${i}`);
            break;
        }
    }
    if (braceCount > 0) {
        errors.push('Unclosed opening braces');
    }

    // Check for empty options
    if (/{[^}]*\|\|[^}]*}/.test(text)) {
        errors.push('Empty spintax options found');
    }

    // Check for orphaned pipes
    if (/\|(?![^{]*})/.test(text)) {
        errors.push('Pipe character outside spintax block');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
};

export type Site = z.infer<typeof siteSchema>;
export type Collection = z.infer<typeof collectionSchema>;
export type Article = z.infer<typeof articleSchema>;
export type ContentBlock = z.infer<typeof contentBlockSchema>;
export type Pattern = z.infer<typeof patternSchema>;
export type Avatar = z.infer<typeof avatarSchema>;
export type GeoCluster = z.infer<typeof geoClusterSchema>;
