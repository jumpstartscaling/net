-- ===================================================================================
-- 🛠️ SPARK PLATFORM: GOLDEN SCHEMA (HARRIS MATRIX ORDERED)
-- ===================================================================================
-- 1. Foundation (Independent Tables)
-- 2. Walls (First-Level Dependents)
-- 3. Roof (Complex Dependents)
-- 4. Directus UI Configuration (Interfaces & Templates)
-- ===================================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===================================================================================
-- 🏗️ BATCH 1: THE FOUNDATION (Create these FIRST)
-- Dependencies: None
-- ===================================================================================

-- 1. SITES (The Super Parent)
CREATE TABLE IF NOT EXISTS sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    status VARCHAR(50) DEFAULT 'active',
    name VARCHAR(255) NOT NULL,
    url VARCHAR(500),
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. CAMPAIGN MASTERS (The Content Parent)
-- NOTE: Depends on 'sites' existing!
CREATE TABLE IF NOT EXISTS campaign_masters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    status VARCHAR(50) DEFAULT 'active',
    site_id UUID REFERENCES sites (id) ON DELETE CASCADE, -- 🔗 Link to Site
    name VARCHAR(255) NOT NULL,
    headline_spintax_root TEXT,
    target_word_count INTEGER DEFAULT 1500,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3-7. INDEPENDENT INTELLIGENCE TABLES
CREATE TABLE IF NOT EXISTS avatar_intelligence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    status VARCHAR(50) DEFAULT 'published',
    name VARCHAR(255),
    pain_points JSONB,
    demographics JSONB
);

CREATE TABLE IF NOT EXISTS avatar_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    status VARCHAR(50) DEFAULT 'published',
    name VARCHAR(255),
    prompt_modifier TEXT
);

CREATE TABLE IF NOT EXISTS cartesian_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    status VARCHAR(50) DEFAULT 'published',
    name VARCHAR(255),
    pattern_logic TEXT
);

CREATE TABLE IF NOT EXISTS geo_intelligence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    status VARCHAR(50) DEFAULT 'published',
    city VARCHAR(255),
    state VARCHAR(255),
    population INTEGER
);

CREATE TABLE IF NOT EXISTS offer_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    status VARCHAR(50) DEFAULT 'published',
    name VARCHAR(255),
    html_content TEXT
);

-- ===================================================================================
-- 🧱 BATCH 2: THE WALLS (First-Level Children)
-- Dependencies: 'sites' or 'campaign_masters'
-- ===================================================================================

-- 8. GENERATED ARTICLES
CREATE TABLE IF NOT EXISTS generated_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    status VARCHAR(50) DEFAULT 'draft',
    site_id UUID REFERENCES sites (id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaign_masters (id) ON DELETE SET NULL,
    title VARCHAR(255),
    content TEXT,
    slug VARCHAR(255),
    schema_json JSONB,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. GENERATION JOBS
CREATE TABLE IF NOT EXISTS generation_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    status VARCHAR(50) DEFAULT 'pending',
    site_id UUID REFERENCES sites (id) ON DELETE CASCADE,
    batch_size INTEGER DEFAULT 10,
    progress INTEGER DEFAULT 0
);

-- 10. PAGES
CREATE TABLE IF NOT EXISTS pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    status VARCHAR(50) DEFAULT 'published',
    site_id UUID REFERENCES sites (id) ON DELETE CASCADE,
    title VARCHAR(255),
    slug VARCHAR(255),
    content TEXT,
    schema_json JSONB
);

-- 11. POSTS
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    status VARCHAR(50) DEFAULT 'published',
    site_id UUID REFERENCES sites (id) ON DELETE CASCADE,
    title VARCHAR(255),
    slug VARCHAR(255),
    content TEXT,
    schema_json JSONB
);

-- 12. LEADS
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    status VARCHAR(50) DEFAULT 'new',
    site_id UUID REFERENCES sites (id) ON DELETE SET NULL,
    email VARCHAR(255),
    name VARCHAR(255),
    source VARCHAR(100)
);

-- 13. HEADLINE INVENTORY
CREATE TABLE IF NOT EXISTS headline_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    status VARCHAR(50) DEFAULT 'active',
    campaign_id UUID REFERENCES campaign_masters (id) ON DELETE CASCADE,
    headline_text VARCHAR(255),
    is_used BOOLEAN DEFAULT FALSE
);

-- 14. CONTENT FRAGMENTS
CREATE TABLE IF NOT EXISTS content_fragments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    status VARCHAR(50) DEFAULT 'active',
    campaign_id UUID REFERENCES campaign_masters (id) ON DELETE CASCADE,
    fragment_text TEXT,
    fragment_type VARCHAR(50)
);

-- ===================================================================================
-- 🏠 BATCH 3: THE ROOF (Complex Dependents)
-- Dependencies: Multiple tables
-- ===================================================================================

-- 15. LINK TARGETS (Internal Linking Logic)
CREATE TABLE IF NOT EXISTS link_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    status VARCHAR(50) DEFAULT 'active',
    site_id UUID REFERENCES sites (id) ON DELETE CASCADE,
    target_url VARCHAR(500),
    anchor_text VARCHAR(255),
    keyword_focus VARCHAR(255)
);

-- ===================================================================================
-- 🚀 STABILITY PATCH v1.0 (Added 2024-12-14)
-- Purpose: Create missing tables for Analytics, Geo, Forms, Navigation, System
-- Author: Spark Overlord
-- ===================================================================================

-- ===================================================================================
-- 📊 ANALYTICS ENGINE (The "Proof" for Subscribers)
-- ===================================================================================

CREATE TABLE IF NOT EXISTS site_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    site_id UUID UNIQUE REFERENCES sites (id) ON DELETE CASCADE,
    google_analytics_id VARCHAR(255),
    google_ads_id VARCHAR(255),
    fb_pixel_id VARCHAR(255),
    gtm_container_id VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    site_id UUID REFERENCES sites (id) ON DELETE CASCADE,
    event_name VARCHAR(255) NOT NULL,
    page_path VARCHAR(500),
    session_id VARCHAR(255),
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pageviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    site_id UUID REFERENCES sites (id) ON DELETE CASCADE,
    page_path VARCHAR(500),
    session_id VARCHAR(255),
    referrer VARCHAR(500),
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    site_id UUID REFERENCES sites (id) ON DELETE CASCADE,
    lead_id UUID REFERENCES leads (id) ON DELETE SET NULL,
    conversion_type VARCHAR(100),
    value DECIMAL(10, 2),
    source VARCHAR(255),
    timestamp TIMESTAMP DEFAULT NOW()
);

-- ===================================================================================
-- 🌍 GEO-INTELLIGENCE (The "Scale" Engine - 50,000+ Page Potential)
-- ===================================================================================

CREATE TABLE IF NOT EXISTS locations_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) NOT NULL UNIQUE,
    population INTEGER,
    region VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS locations_counties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    name VARCHAR(100) NOT NULL,
    state_id UUID REFERENCES locations_states (id) ON DELETE CASCADE,
    fips_code VARCHAR(10),
    population INTEGER
);

CREATE TABLE IF NOT EXISTS locations_cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    name VARCHAR(100) NOT NULL,
    state_id UUID REFERENCES locations_states (id) ON DELETE CASCADE,
    county_id UUID REFERENCES locations_counties (id) ON DELETE SET NULL,
    population INTEGER,
    zip_codes JSONB,
    latitude DECIMAL(10, 6),
    longitude DECIMAL(10, 6)
);

-- ===================================================================================
-- 📝 LEAD CAPTURE (The "Money" Engine)
-- ===================================================================================

CREATE TABLE IF NOT EXISTS forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    site_id UUID REFERENCES sites (id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255),
    fields JSONB NOT NULL DEFAULT '[]',
    submit_action VARCHAR(50) DEFAULT 'store',
    webhook_url VARCHAR(500),
    email_recipients TEXT,
    success_message TEXT,
    redirect_url VARCHAR(500),
    date_created TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS form_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    form_id UUID REFERENCES forms (id) ON DELETE CASCADE,
    data JSONB NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    date_created TIMESTAMP DEFAULT NOW()
);

-- ===================================================================================
-- 🏗️ SITE BUILDER (The "Experience" Layer)
-- ===================================================================================

CREATE TABLE IF NOT EXISTS navigation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    site_id UUID REFERENCES sites (id) ON DELETE CASCADE,
    label VARCHAR(100) NOT NULL,
    url VARCHAR(500) NOT NULL,
    parent_id UUID REFERENCES navigation (id) ON DELETE CASCADE,
    target VARCHAR(20) DEFAULT '_self',
    icon VARCHAR(100),
    sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS globals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    site_id UUID UNIQUE REFERENCES sites (id) ON DELETE CASCADE,
    site_name VARCHAR(255),
    site_tagline TEXT,
    logo VARCHAR(500),
    favicon VARCHAR(500),
    footer_text TEXT,
    scripts_head TEXT,
    scripts_body TEXT,
    social_links JSONB,
    theme_settings JSONB
);

CREATE TABLE IF NOT EXISTS hub_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    site_id UUID REFERENCES sites (id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES hub_pages (id) ON DELETE SET NULL,
    sort_order INTEGER DEFAULT 0
);

-- ===================================================================================
-- 🔧 SYSTEM ADMIN
-- ===================================================================================

CREATE TABLE IF NOT EXISTS work_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    site_id UUID REFERENCES sites (id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    details JSONB,
    level VARCHAR(20) DEFAULT 'info',
    status VARCHAR(100),
    user_id UUID,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- ===================================================================================
-- 🎨 DIRECTUS UI CONFIGURATION (The "Glance" Layer)
-- Fixes interfaces, dropdowns, and template issues automatically
-- ===================================================================================

-- 1. Enable 'Select Dropdown' for all Foreign Keys (Fixes "Raw UUID" UI issue)
INSERT INTO
    directus_fields (
        collection,
        field,
        interface,
        readonly,
        hidden,
        width
    )
VALUES (
        'campaign_masters',
        'site_id',
        'select-dropdown-m2o',
        'false',
        'false',
        'half'
    ),
    (
        'generated_articles',
        'site_id',
        'select-dropdown-m2o',
        'false',
        'false',
        'half'
    ),
    (
        'generated_articles',
        'campaign_id',
        'select-dropdown-m2o',
        'false',
        'false',
        'half'
    ),
    (
        'generation_jobs',
        'site_id',
        'select-dropdown-m2o',
        'false',
        'false',
        'half'
    ),
    (
        'pages',
        'site_id',
        'select-dropdown-m2o',
        'false',
        'false',
        'half'
    ),
    (
        'posts',
        'site_id',
        'select-dropdown-m2o',
        'false',
        'false',
        'half'
    ),
    (
        'leads',
        'site_id',
        'select-dropdown-m2o',
        'false',
        'false',
        'half'
    ),
    (
        'headline_inventory',
        'campaign_id',
        'select-dropdown-m2o',
        'false',
        'false',
        'half'
    ),
    (
        'content_fragments',
        'campaign_id',
        'select-dropdown-m2o',
        'false',
        'false',
        'half'
    ),
    (
        'link_targets',
        'site_id',
        'select-dropdown-m2o',
        'false',
        'false',
        'half'
    ),
    -- NEW: Stability Patch FK configurations
    (
        'site_analytics',
        'site_id',
        'select-dropdown-m2o',
        'false',
        'false',
        'half'
    ),
    (
        'events',
        'site_id',
        'select-dropdown-m2o',
        'false',
        'false',
        'half'
    ),
    (
        'pageviews',
        'site_id',
        'select-dropdown-m2o',
        'false',
        'false',
        'half'
    ),
    (
        'conversions',
        'site_id',
        'select-dropdown-m2o',
        'false',
        'false',
        'half'
    ),
    (
        'conversions',
        'lead_id',
        'select-dropdown-m2o',
        'false',
        'false',
        'half'
    ),
    (
        'locations_counties',
        'state_id',
        'select-dropdown-m2o',
        'false',
        'false',
        'half'
    ),
    (
        'locations_cities',
        'state_id',
        'select-dropdown-m2o',
        'false',
        'false',
        'half'
    ),
    (
        'locations_cities',
        'county_id',
        'select-dropdown-m2o',
        'false',
        'false',
        'half'
    ),
    (
        'forms',
        'site_id',
        'select-dropdown-m2o',
        'false',
        'false',
        'half'
    ),
    (
        'form_submissions',
        'form_id',
        'select-dropdown-m2o',
        'false',
        'false',
        'half'
    ),
    (
        'navigation',
        'site_id',
        'select-dropdown-m2o',
        'false',
        'false',
        'half'
    ),
    (
        'navigation',
        'parent_id',
        'select-dropdown-m2o',
        'false',
        'false',
        'half'
    ),
    (
        'globals',
        'site_id',
        'select-dropdown-m2o',
        'false',
        'false',
        'half'
    ),
    (
        'hub_pages',
        'site_id',
        'select-dropdown-m2o',
        'false',
        'false',
        'half'
    ),
    (
        'hub_pages',
        'parent_id',
        'select-dropdown-m2o',
        'false',
        'false',
        'half'
    ),
    (
        'work_log',
        'site_id',
        'select-dropdown-m2o',
        'false',
        'false',
        'half'
    ) ON CONFLICT (collection, field) DO
UPDATE
SET
    interface = 'select-dropdown-m2o';

-- 2. Fix the Template Mismatch (The 'campaign_name' vs 'name' bug)
UPDATE directus_collections
SET
    display_template = '{{campaign_id.name}}'
WHERE
    collection IN (
        'content_fragments',
        'headline_inventory',
        'generated_articles'
    );

-- 3. Set standard display templates for Sites
UPDATE directus_collections
SET
    display_template = '{{name}}'
WHERE
    collection IN (
        'sites',
        'campaign_masters',
        'forms',
        'navigation',
        'hub_pages'
    );

-- 4. Set display templates for Geo tables
UPDATE directus_collections
SET
    display_template = '{{name}} ({{code}})'
WHERE
    collection = 'locations_states';

UPDATE directus_collections
SET
    display_template = '{{name}}'
WHERE
    collection IN (
        'locations_counties',
        'locations_cities'
    );

-- 5. Set display template for globals (one per site)
UPDATE directus_collections
SET
    display_template = '{{site_name}}'
WHERE
    collection = 'globals';