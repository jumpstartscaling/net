-- Complete Spark Platform Database Schema
-- Creates all remaining tables with proper relationships

-- ============================================
-- CONTENT FACTORY / SEO ENGINE
-- ============================================

CREATE TABLE IF NOT EXISTS headline_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    campaign UUID REFERENCES campaign_masters (id) ON DELETE CASCADE,
    final_title_text VARCHAR(500),
    status VARCHAR(50) DEFAULT 'available',
    used_on_article UUID,
    location_data JSONB,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS content_fragments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    campaign UUID REFERENCES campaign_masters (id) ON DELETE CASCADE,
    fragment_type VARCHAR(100),
    content_body TEXT,
    word_count INTEGER,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS production_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    site UUID REFERENCES sites (id) ON DELETE CASCADE,
    campaign UUID REFERENCES campaign_masters (id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending',
    total_requested INTEGER,
    completed_count INTEGER DEFAULT 0,
    velocity_mode VARCHAR(50),
    schedule_data JSONB,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quality_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    site UUID REFERENCES sites (id) ON DELETE CASCADE,
    batch_id VARCHAR(255),
    article_a VARCHAR(255),
    article_b VARCHAR(255),
    collision_text TEXT,
    similarity_score FLOAT,
    status VARCHAR(50) DEFAULT 'pending',
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- CARTESIAN ENGINE
-- ============================================

CREATE TABLE IF NOT EXISTS generation_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    site_id UUID REFERENCES sites (id) ON DELETE CASCADE,
    target_quantity INTEGER,
    status VARCHAR(50) DEFAULT 'queued',
    type VARCHAR(100),
    progress INTEGER DEFAULT 0,
    priority VARCHAR(50) DEFAULT 'medium',
    config JSONB,
    current_offset INTEGER DEFAULT 0,
    filters JSONB,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS article_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    name VARCHAR(255),
    structure_json JSONB,
    description TEXT,
    is_default BOOLEAN DEFAULT false,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cartesian_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    pattern_key VARCHAR(255) UNIQUE,
    pattern_type VARCHAR(100),
    formula TEXT,
    data JSONB,
    example_output TEXT,
    description TEXT,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS spintax_dictionaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    category VARCHAR(255),
    data JSONB,
    base_word VARCHAR(255),
    variations TEXT,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INTELLIGENCE LIBRARY
-- ============================================

CREATE TABLE IF NOT EXISTS avatar_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    avatar_id VARCHAR(255),
    avatar_key VARCHAR(255),
    variant_type VARCHAR(100),
    variants_json JSONB,
    data JSONB,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS avatars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    name VARCHAR(255),
    slug VARCHAR(255) UNIQUE,
    description TEXT,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- GEO INTELLIGENCE (with hierarchical relationships)
-- ============================================

CREATE TABLE IF NOT EXISTS locations_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    name VARCHAR(255),
    code VARCHAR(2) UNIQUE,
    population INTEGER,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS locations_counties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    name VARCHAR(255),
    state UUID REFERENCES locations_states (id) ON DELETE CASCADE,
    fips_code VARCHAR(10),
    population INTEGER,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS locations_cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    name VARCHAR(255),
    state UUID REFERENCES locations_states (id) ON DELETE CASCADE,
    county UUID REFERENCES locations_counties (id) ON DELETE SET NULL,
    population INTEGER,
    zip_codes JSONB,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS geo_clusters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    cluster_key VARCHAR(255) UNIQUE,
    name VARCHAR(255),
    state VARCHAR(255),
    description TEXT,
    data JSONB,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS geo_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    cluster UUID REFERENCES geo_clusters (id) ON DELETE CASCADE,
    city VARCHAR(255),
    state VARCHAR(255),
    zip VARCHAR(10),
    population INTEGER,
    coordinates JSONB,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS geo_intelligence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    cluster_key VARCHAR(255),
    data JSONB,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- OFFER BLOCKS
-- ============================================

CREATE TABLE IF NOT EXISTS offer_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    block_id VARCHAR(255),
    title VARCHAR(255),
    hook_generator TEXT,
    universal_pains JSONB,
    universal_solutions JSONB,
    universal_value_points JSONB,
    cta_spintax TEXT,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS offer_blocks_universal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    block_id VARCHAR(255),
    title VARCHAR(255),
    hook_generator TEXT,
    universal_pains JSONB,
    universal_solutions JSONB,
    universal_value_points JSONB,
    cta_spintax TEXT,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- MEDIA & TEMPLATES
-- ============================================

CREATE TABLE IF NOT EXISTS image_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    name VARCHAR(255),
    svg_template TEXT,
    svg_source TEXT,
    is_default BOOLEAN DEFAULT false,
    preview VARCHAR(255),
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ANALYTICS & TRACKING
-- ============================================

CREATE TABLE IF NOT EXISTS conversions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    site UUID REFERENCES sites (id) ON DELETE CASCADE,
    lead UUID,
    conversion_type VARCHAR(100),
    value FLOAT,
    currency VARCHAR(10) DEFAULT 'USD',
    source VARCHAR(255),
    sent_to_google BOOLEAN DEFAULT false,
    sent_to_facebook BOOLEAN DEFAULT false,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS site_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    site UUID REFERENCES sites (id) ON DELETE CASCADE,
    google_ads_id VARCHAR(255),
    google_ads_conversion_label VARCHAR(255),
    fb_pixel_id VARCHAR(255),
    fb_access_token TEXT,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INFRASTRUCTURE
-- ============================================

CREATE TABLE IF NOT EXISTS hub_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    site UUID REFERENCES sites (id) ON DELETE CASCADE,
    title VARCHAR(255),
    slug VARCHAR(255),
    parent_hub UUID REFERENCES hub_pages (id) ON DELETE SET NULL,
    level INTEGER DEFAULT 0,
    articles_count INTEGER DEFAULT 0,
    schema_json JSONB,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS link_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    site UUID REFERENCES sites (id) ON DELETE CASCADE,
    target_url VARCHAR(500),
    anchor_text VARCHAR(255),
    anchor_variations JSONB,
    priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_hub BOOLEAN DEFAULT false,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS work_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    site UUID REFERENCES sites (id) ON DELETE CASCADE,
    action VARCHAR(255),
    entity_type VARCHAR(100),
    entity_id VARCHAR(255),
    details JSONB,
    user_id VARCHAR(255),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- FORMS & CRM
-- ============================================

CREATE TABLE IF NOT EXISTS forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    site UUID REFERENCES sites (id) ON DELETE CASCADE,
    name VARCHAR(255),
    fields_config JSONB,
    success_message TEXT,
    redirect_url VARCHAR(500),
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS form_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    form UUID REFERENCES forms (id) ON DELETE CASCADE,
    data JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS content_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    name VARCHAR(255),
    module_type VARCHAR(100),
    content TEXT,
    variables JSONB,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    name VARCHAR(255),
    site UUID REFERENCES sites (id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'active',
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_generated_articles_site ON generated_articles (site_id);

CREATE INDEX IF NOT EXISTS idx_generated_articles_campaign ON generated_articles (campaign_id);

CREATE INDEX IF NOT EXISTS idx_generated_articles_status ON generated_articles (status);

CREATE INDEX IF NOT EXISTS idx_pages_site ON pages (site);

CREATE INDEX IF NOT EXISTS idx_posts_site ON posts (site);

CREATE INDEX IF NOT EXISTS idx_leads_site ON leads (site);

CREATE INDEX IF NOT EXISTS idx_events_site ON events (site);

CREATE INDEX IF NOT EXISTS idx_pageviews_site ON pageviews (site);

CREATE INDEX IF NOT EXISTS idx_locations_counties_state ON locations_counties (state);

CREATE INDEX IF NOT EXISTS idx_locations_cities_state ON locations_cities (state);

CREATE INDEX IF NOT EXISTS idx_locations_cities_county ON locations_cities (county);

CREATE INDEX IF NOT EXISTS idx_geo_locations_cluster ON geo_locations (cluster);

CREATE INDEX IF NOT EXISTS idx_hub_pages_site ON hub_pages (site);

CREATE INDEX IF NOT EXISTS idx_hub_pages_parent ON hub_pages (parent_hub);

-- ============================================
-- VERIFY
-- ============================================

SELECT
    COUNT(*) as total_tables,
    STRING_AGG (
        tablename,
        ', '
        ORDER BY tablename
    ) as table_names
FROM pg_tables
WHERE
    schemaname = 'public'
    AND tablename NOT LIKE 'directus_%'
    AND tablename NOT LIKE 'spatial_%';