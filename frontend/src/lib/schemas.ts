/**
 * Spark Platform - Directus Schema Types v2.0
 * Auto-generated and enhanced during Phase 9
 * 
 * This provides full TypeScript coverage for all Directus collections.
 * 
 * ## Phase 9 Changes (Dec 2025):
 * - Added ArticleTemplates collection (article structure blueprints)
 * - Sites: +1 field (settings for feature flags)
 * - CampaignMasters: +3 fields (article_template, niche_variables, paused status)
 * - GeneratedArticles: +12 fields (headline, SEO, location, featured image metadata)
 * - HeadlineInventory: +3 fields (final_title_text, location_data, used_on_article)
 * - ContentFragments: +2 fields (content_body, word_count)
 * - GenerationJobs: +2 fields (date_created, date_updated)
 * 
 * Total: 17 collections, 23 fields added, 0 TypeScript errors
 * Build Status: ✅ Success
 */

// ============================================================================
// BATCH 1: FOUNDATION TABLES
// ============================================================================

export interface Sites {
    id: string;
    status: 'active' | 'inactive' | 'archived';
    name: string;
    url?: string;
    settings?: Record<string, any>;
    date_created?: string;
    date_updated?: string;
}

export interface CampaignMasters {
    id: string;
    status: 'active' | 'inactive' | 'completed' | 'paused';
    site_id: string | Sites;
    name: string;
    headline_spintax_root?: string;
    target_word_count?: number;
    location_mode?: string;
    batch_count?: number;
    article_template?: string | number;
    niche_variables?: Record<string, any>;
    date_created?: string;
    date_updated?: string;
}

export interface AvatarIntelligence {
    id: string;
    status: 'published' | 'draft';
    base_name?: string; // Corrected from name
    wealth_cluster?: string;
    business_niches?: Record<string, any>;
    pain_points?: Record<string, any>;
    demographics?: Record<string, any>;
}

export interface AvatarVariants {
    id: string;
    status: 'published' | 'draft';
    name?: string;
    prompt_modifier?: string;
}

export interface CartesianPatterns {
    id: string;
    status: 'published' | 'draft';
    name?: string;
    pattern_logic?: string;
}

export interface GeoIntelligence {
    id: string;
    status: 'published' | 'draft';
    city?: string;
    state?: string;
    population?: number;
}

export interface OfferBlocks {
    id: string;
    status: 'published' | 'draft';
    name?: string;
    html_content?: string;
}

export interface ArticleTemplates {
    id: string | number;
    name?: string;
    structure_json?: string[];
    date_created?: string;
    date_updated?: string;
}


// ============================================================================
// BATCH 2: FIRST-LEVEL CHILDREN
// ============================================================================

export interface GeneratedArticles {
    id: string;
    status: 'draft' | 'published' | 'archived';
    site_id: string | Sites;
    campaign_id?: string | CampaignMasters;
    title?: string;
    content?: string;
    slug?: string;
    is_published?: boolean;
    headline?: string;
    meta_title?: string;
    meta_description?: string;
    full_html_body?: string;
    word_count?: number;
    word_count_status?: string;
    location_city?: string;
    location_county?: string;
    location_state?: string;
    featured_image_svg?: string;
    featured_image_filename?: string;
    featured_image_alt?: string;
    schema_json?: Record<string, any>;
    date_created?: string;
    date_updated?: string;
}

export interface GenerationJobs {
    id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    site_id: string | Sites;
    batch_size?: number;
    target_quantity?: number;
    filters?: Record<string, any>;
    current_offset?: number;
    progress?: number;
    date_created?: string;
    date_updated?: string;
}

export interface Pages {
    id: string;
    status: 'published' | 'draft';
    site_id: string | Sites;
    title?: string;
    slug?: string;
    permalink?: string;
    content?: string;
    blocks?: Record<string, any>;
    schema_json?: Record<string, any>;
    seo_title?: string;
    seo_description?: string;
    seo_image?: string | DirectusFiles;
    date_created?: string;
    date_updated?: string;
}

export interface Posts {
    id: string;
    status: 'published' | 'draft';
    site_id: string | Sites;
    title?: string;
    slug?: string;
    excerpt?: string;
    content?: string;
    featured_image?: string | DirectusFiles;
    published_at?: string;
    category?: string;
    author?: string | DirectusUsers;
    schema_json?: Record<string, any>;
    date_created?: string;
    date_updated?: string;
}

export interface Leads {
    id: string;
    status: 'new' | 'contacted' | 'qualified' | 'converted';
    site_id?: string | Sites;
    email?: string;
    name?: string;
    source?: string;
}

export interface HeadlineInventory {
    id: string;
    status: 'active' | 'used' | 'archived' | 'available';
    campaign_id: string | CampaignMasters;
    headline_text?: string;
    final_title_text?: string;
    location_data?: Record<string, any>;
    is_used?: boolean;
    used_on_article?: string;
}

export interface ContentFragments {
    id: string;
    status: 'active' | 'archived';
    campaign_id: string | CampaignMasters;
    fragment_text?: string;
    content_body?: string;
    fragment_type?: string;
    word_count?: number;
}

// ============================================================================
// BATCH 3: COMPLEX CHILDREN
// ============================================================================

export interface LinkTargets {
    id: string;
    status: 'active' | 'inactive';
    site_id: string | Sites;
    target_url?: string;
    anchor_text?: string;
    keyword_focus?: string;
}

export interface Globals {
    id: string;
    site_id: string | Sites;
    title?: string;
    description?: string;
    logo?: string | DirectusFiles;
}

export interface Navigation {
    id: string;
    site_id: string | Sites;
    label: string;
    url: string;
    parent?: string | Navigation;
    target?: '_blank' | '_self';
    sort?: number;
}

// ============================================================================
// DIRECTUS SYSTEM COLLECTIONS
// ============================================================================

export interface DirectusUsers {
    id: string;
    first_name?: string;
    last_name?: string;
    email: string;
    password?: string;
    location?: string;
    title?: string;
    description?: string;
    tags?: string[];
    avatar?: string;
    language?: string;
    theme?: 'auto' | 'light' | 'dark';
    tfa_secret?: string;
    status: 'active' | 'invited' | 'draft' | 'suspended' | 'archived';
    role: string;
    token?: string;
}

export interface DirectusFiles {
    id: string;
    storage: string;
    filename_disk?: string;
    filename_download: string;
    title?: string;
    type?: string;
    folder?: string;
    uploaded_by?: string | DirectusUsers;
    uploaded_on?: string;
    modified_by?: string | DirectusUsers;
    modified_on?: string;
    charset?: string;
    filesize?: number;
    width?: number;
    height?: number;
    duration?: number;
    embed?: string;
    description?: string;
    location?: string;
    tags?: string[];
    metadata?: Record<string, any>;
}

export interface DirectusActivity {
    id: number;
    action: string;
    user?: string | DirectusUsers;
    timestamp: string;
    ip?: string;
    user_agent?: string;
    collection: string;
    item: string;
    comment?: string;
}

// ============================================================================
// MAIN SCHEMA TYPE
// ============================================================================

export interface DirectusSchema {
    // Batch 1: Foundation
    sites: Sites[];
    campaign_masters: CampaignMasters[];
    avatar_intelligence: AvatarIntelligence[];
    avatar_variants: AvatarVariants[];
    cartesian_patterns: CartesianPatterns[];
    geo_intelligence: GeoIntelligence[];
    offer_blocks: OfferBlocks[];
    article_templates: ArticleTemplates[];


    // Batch 2: Children
    generated_articles: GeneratedArticles[];
    generation_jobs: GenerationJobs[];
    pages: Pages[];
    posts: Posts[];
    leads: Leads[];
    headline_inventory: HeadlineInventory[];
    content_fragments: ContentFragments[];

    // Batch 3: Complex
    link_targets: LinkTargets[];
    globals: Globals[];
    navigation: Navigation[];

    // System & Analytics
    work_log: WorkLog[];
    hub_pages: HubPages[];
    forms: Forms[];
    form_submissions: FormSubmissions[];
    site_analytics: SiteAnalytics[];
    events: AnalyticsEvents[];
    pageviews: PageViews[];
    conversions: Conversions[];
    locations_states: LocationsStates[];
    locations_counties: LocationsCounties[];
    locations_cities: LocationsCities[];

    // Directus System
    directus_users: DirectusUsers[];
    directus_files: DirectusFiles[];
    directus_activity: DirectusActivity[];
}

// ============================================================================
// SYSTEM & ANALYTICS TYPES
// ============================================================================

export interface WorkLog {
    id: number;
    site_id?: string | Sites;
    action: string;
    entity_type?: string;
    entity_id?: string;
    details?: any;
    level?: string;
    status?: string;
    timestamp?: string;
    date_created?: string;
    user?: string | DirectusUsers;
}

export interface HubPages {
    id: string;
    site_id: string | Sites;
    title: string;
    slug: string;
    parent_hub?: string | HubPages;
    level?: number;
    articles_count?: number;
    schema_json?: Record<string, any>;
}

export interface Forms {
    id: string;
    site_id: string | Sites;
    name: string;
    fields: any[];
    submit_action?: string;
    success_message?: string;
    redirect_url?: string;
}

export interface FormSubmissions {
    id: string;
    form: string | Forms;
    data: Record<string, any>;
    date_created?: string;
}

export interface SiteAnalytics {
    id: string;
    site_id: string | Sites;
    google_ads_id?: string;
    fb_pixel_id?: string;
}

export interface AnalyticsEvents {
    id: string;
    site_id: string | Sites;
    event_name: string;
    page_path: string;
    timestamp?: string;
}

export interface PageViews {
    id: string;
    site_id: string | Sites;
    page_path: string;
    session_id?: string;
    timestamp?: string;
}

export interface Conversions {
    id: string;
    site_id: string | Sites;
    lead?: string | Leads;
    conversion_type: string;
    value?: number;
}

export interface LocationsStates {
    id: string;
    name: string;
    code: string;
}

export interface LocationsCities {
    id: string;
    name: string;
    state: string | LocationsStates;
    county?: string | LocationsCounties;
    population?: number;
}

export interface LocationsCounties {
    id: string;
    name: string;
    state: string | LocationsStates;
    population?: number;
}

// ============================================================================
// HELPER TYPES
// ============================================================================

export type Collections = keyof DirectusSchema;

export type Item<Collection extends Collections> = DirectusSchema[Collection];

export type QueryFilter<Collection extends Collections> = Partial<Item<Collection>>;
