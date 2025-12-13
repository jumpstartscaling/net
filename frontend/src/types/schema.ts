/**
 * Spark Platform - Directus Schema Types
 */

export interface Site {
    id: string;
    name: string;
    domain: string;
    domain_aliases?: string[];
    settings?: Record<string, any>;
    status: 'active' | 'inactive';
    date_created?: string;
    date_updated?: string;
}

export interface Page {
    id: string;
    site: string | Site;
    title: string;
    permalink: string;
    status: 'draft' | 'published' | 'archived';
    seo_title?: string;
    seo_description?: string;
    seo_image?: string;
    blocks?: PageBlock[];
    date_created?: string;
    date_updated?: string;
}

export interface PageBlock {
    id: string;
    sort: number;
    hide_block: boolean;
    collection: string;
    item: any;
}

export interface Post {
    id: string;
    site: string | Site;
    title: string;
    slug: string;
    excerpt?: string;
    content: string;
    featured_image?: string;
    status: 'draft' | 'published' | 'archived';
    published_at?: string;
    category?: string;
    author?: string;
    seo_title?: string;
    seo_description?: string;
    date_created?: string;
    date_updated?: string;
}

export interface Globals {
    id: string;
    site: string | Site;
    site_name?: string;
    site_tagline?: string;
    logo?: string;
    favicon?: string;
    primary_color?: string;
    secondary_color?: string;
    footer_text?: string;
    social_links?: SocialLink[];
    scripts_head?: string;
    scripts_body?: string;
}

export interface SocialLink {
    platform: string;
    url: string;
}

export interface Navigation {
    id: string;
    site: string | Site;
    label: string;
    url: string;
    target?: '_self' | '_blank';
    parent?: string | Navigation;
    sort: number;
}

export interface Author {
    id: string;
    name: string;
    bio?: string;
    avatar?: string;
    email?: string;
}

// SEO Engine Types
export interface CampaignMaster {
    id: string;
    site?: string | Site;
    name: string;
    headline_spintax_root: string;
    niche_variables?: Record<string, string>;
    location_mode: 'none' | 'state' | 'county' | 'city';
    location_target?: string;
    batch_count?: number;
    status: 'active' | 'paused' | 'completed';
    target_word_count?: number;
    date_created?: string;
}

export interface HeadlineInventory {
    id: string;
    campaign: string | CampaignMaster;
    final_title_text: string;
    status: 'available' | 'used';
    used_on_article?: string;
    date_created?: string;
}

export interface ContentFragment {
    id: string;
    campaign: string | CampaignMaster;
    fragment_type: FragmentType;
    content_body: string;
    word_count?: number;
    date_created?: string;
}

export type FragmentType =
    | 'intro_hook'
    | 'pillar_1_keyword'
    | 'pillar_2_uniqueness'
    | 'pillar_3_relevance'
    | 'pillar_4_quality'
    | 'pillar_5_authority'
    | 'pillar_6_backlinks'
    | 'faq_section';

// ... (Existing types preserved above)

// Cartesian Engine Types
export interface GenerationJob {
    id: string;
    site_id: string | Site;
    target_quantity: number;
    status: 'Pending' | 'Processing' | 'Complete' | 'Failed';
    filters: Record<string, any>; // { avatars: [], niches: [], cities: [], patterns: [] }
    current_offset: number;
    date_created?: string;
}

export interface ArticleTemplate {
    id: string;
    name: string;
    structure_json: string[]; // Array of block IDs
}

export interface Avatar {
    id: string; // key
    base_name: string;
    business_niches: string[];
    wealth_cluster: string;
}

export interface AvatarVariant {
    id: string;
    avatar_id: string;
    variants_json: Record<string, string>;
}

export interface GeoCluster {
    id: string;
    cluster_name: string;
}

export interface GeoLocation {
    id: string;
    cluster: string | GeoCluster;
    city: string;
    state: string;
    zip_focus?: string;
}

export interface SpintaxDictionary {
    id: string;
    category: string;
    words: string[];
}

export interface CartesianPattern {
    id: string;
    pattern_id: string;
    category: string;
    formula: string;
}

export interface OfferBlockUniversal {
    id: string;
    block_id: string;
    title: string;
    hook_generator: string;
    universal_pains: string[];
    universal_solutions: string[];
    universal_value_points: string[];
    cta_spintax: string;
}

export interface OfferBlockPersonalized {
    id: string;
    block_related_id: string;
    avatar_related_id: string;
    pains: string[];
    solutions: string[];
    value_points: string[];
}

// Updated GeneratedArticle to match Init Schema
export interface GeneratedArticle {
    id: string;
    site_id: number; // or string depending on schema
    title: string;
    slug: string;
    html_content: string;
    generation_hash: string;
    meta_desc?: string;
    is_published?: boolean;
    sync_status?: string;
    schema_json?: Record<string, any>;
    date_created?: string;
}

/**
 * Full Spark Platform Schema for Directus SDK
 */
export interface SparkSchema {
    sites: Site[];
    pages: Page[];
    posts: Post[];
    globals: Globals[];
    navigation: Navigation[];
    authors: Author[];

    // Legacy SEO Engine (Keep for compatibility if needed)
    campaign_masters: CampaignMaster[];
    headline_inventory: HeadlineInventory[];
    content_fragments: ContentFragment[];
    image_templates: ImageTemplate[];
    locations_states: LocationState[];
    locations_counties: LocationCounty[];
    locations_cities: LocationCity[];

    // New Cartesian Engine
    generation_jobs: GenerationJob[];
    article_templates: ArticleTemplate[];
    avatars: Avatar[];
    avatar_variants: AvatarVariant[];
    geo_clusters: GeoCluster[];
    geo_locations: GeoLocation[];
    spintax_dictionaries: SpintaxDictionary[];
    cartesian_patterns: CartesianPattern[];
    offer_blocks_universal: OfferBlockUniversal[];
    offer_blocks_personalized: OfferBlockPersonalized[];
    generated_articles: GeneratedArticle[];

    leads: Lead[];
    newsletter_subscribers: NewsletterSubscriber[];
    forms: Form[];
    form_submissions: FormSubmission[];
    link_targets: LinkTarget[];
}

export interface LinkTarget {
    id: string;
    site: string;
    target_url?: string;
    target_post?: string;
    anchor_text: string;
    anchor_variations?: string[];
    priority?: number;
    is_active?: boolean;
    is_hub?: boolean;
    max_per_article?: number;
}
