/**
 * Collection Page Template Generator
 * Creates standardized CRUD pages for all collections
 */

export const collectionConfigs = {
    avatar_intelligence: {
        title: 'Avatar Intelligence',
        description: 'Manage persona profiles and variants',
        icon: '👥',
        fields: ['base_name', 'wealth_cluster', 'business_niches'],
        displayField: 'base_name',
    },
    avatar_variants: {
        title: 'Avatar Variants',
        description: 'Manage gender and tone variations',
        icon: '🎭',
        fields: ['avatar_id', 'variant_name', 'pronouns'],
        displayField: 'variant_name',
    },
    campaign_masters: {
        title: 'Campaign Masters',
        description: 'Manage marketing campaigns',
        icon: '📢',
        fields: ['campaign_name', 'status', 'site_id'],
        displayField: 'campaign_name',
    },
    cartesian_patterns: {
        title: 'Cartesian Patterns',
        description: 'Content structure templates',
        icon: '🔧',
        fields: ['pattern_name', 'structure_type'],
        displayField: 'pattern_name',
    },
    content_fragments: {
        title: 'Content Fragments',
        description: 'Reusable content blocks',
        icon: '📦',
        fields: ['fragment_type', 'content'],
        displayField: 'fragment_type',
    },
    generated_articles: {
        title: 'Generated Articles',
        description: 'AI-generated content output',
        icon: '📝',
        fields: ['title', 'status', 'seo_score', 'geo_city'],
        displayField: 'title',
    },
    generation_jobs: {
        title: 'Generation Jobs',
        description: 'Content generation queue',
        icon: '⚙️',
        fields: ['job_name', 'status', 'progress'],
        displayField: 'job_name',
    },
    geo_intelligence: {
        title: 'Geo Intelligence',
        description: 'Location targeting data',
        icon: '🗺️',
        fields: ['city', 'state', 'zip', 'population'],
        displayField: 'city',
    },
    headline_inventory: {
        title: 'Headline Inventory',
        description: 'Pre-written headlines library',
        icon: '💬',
        fields: ['headline_text', 'category'],
        displayField: 'headline_text',
    },
    leads: {
        title: 'Leads',
        description: 'Customer lead management',
        icon: '👤',
        fields: ['name', 'email', 'status'],
        displayField: 'name',
    },
    offer_blocks: {
        title: 'Offer Blocks',
        description: 'Call-to-action templates',
        icon: '🎯',
        fields: ['offer_text', 'offer_type'],
        displayField: 'offer_text',
    },
    pages: {
        title: 'Pages',
        description: 'Static page content',
        icon: '📄',
        fields: ['title', 'slug', 'status'],
        displayField: 'title',
    },
    posts: {
        title: 'Posts',
        description: 'Blog posts and articles',
        icon: '📰',
        fields: ['title', 'status', 'seo_score'],
        displayField: 'title',
    },
    spintax_dictionaries: {
        title: 'Spintax Dictionaries',
        description: 'Word variation sets',
        icon: '📚',
        fields: ['category', 'variations'],
        displayField: 'category',
    },
};

export type CollectionName = keyof typeof collectionConfigs;
