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

export interface GeneratedArticle {
    id: string;
    site: string | Site;
    campaign?: string | CampaignMaster;
    headline: string;
    meta_title: string;
    meta_description: string;
    full_html_body: string;
    word_count: number;
    is_published: boolean;
    featured_image?: string;
    location_state?: string;
    location_county?: string;
    location_city?: string;
    date_created?: string;
    date_updated?: string;
}

export interface ImageTemplate {
    id: string;
    site?: string | Site;
    name: string;
    svg_source: string;
    preview?: string;
    is_default: boolean;
    date_created?: string;
}

// Location Types
export interface LocationState {
    id: string;
    name: string;
    code: string;
    country_code: string;
}

export interface LocationCounty {
    id: string;
    name: string;
    state: string | LocationState;
    fips_code?: string;
    population?: number;
}

export interface LocationCity {
    id: string;
    name: string;
    county: string | LocationCounty;
    state: string | LocationState;
    lat?: number;
    lng?: number;
    population?: number;
    postal_code?: string;
    ranking?: number;
}

// Lead Capture Types
export interface Lead {
    id: string;
    site: string | Site;
    name: string;
    email: string;
    phone?: string;
    message?: string;
    source?: string;
    date_created?: string;
}

export interface NewsletterSubscriber {
    id: string;
    site: string | Site;
    email: string;
    status: 'subscribed' | 'unsubscribed';
    date_created?: string;
}

// Form Builder Types
export interface Form {
    id: string;
    site: string | Site;
    name: string;
    fields: FormField[];
    submit_action: 'email' | 'webhook' | 'both';
    submit_email?: string;
    submit_webhook?: string;
    success_message?: string;
    redirect_url?: string;
}

export interface FormField {
    name: string;
    label: string;
    type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox';
    required: boolean;
    options?: string[];
    placeholder?: string;
}

export interface FormSubmission {
    id: string;
    form: string | Form;
    site: string | Site;
    data: Record<string, any>;
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
    campaign_masters: CampaignMaster[];
    headline_inventory: HeadlineInventory[];
    content_fragments: ContentFragment[];
    generated_articles: GeneratedArticle[];
    image_templates: ImageTemplate[];
    locations_states: LocationState[];
    locations_counties: LocationCounty[];
    locations_cities: LocationCity[];
    leads: Lead[];
    newsletter_subscribers: NewsletterSubscriber[];
    forms: Form[];
    form_submissions: FormSubmission[];
}
