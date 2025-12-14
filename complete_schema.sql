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
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(50) DEFAULT 'active',
    name VARCHAR(255) NOT NULL,
    url VARCHAR(500),
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. CAMPAIGN MASTERS (The Content Parent)
-- NOTE: Depends on 'sites' existing!
CREATE TABLE IF NOT EXISTS campaign_masters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(50) DEFAULT 'active',
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE, -- 🔗 Link to Site
    name VARCHAR(255) NOT NULL,
    headline_spintax_root TEXT,
    target_word_count INTEGER DEFAULT 1500,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3-7. INDEPENDENT INTELLIGENCE TABLES
CREATE TABLE IF NOT EXISTS avatar_intelligence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(50) DEFAULT 'published',
    name VARCHAR(255),
    pain_points JSONB,
    demographics JSONB
);

CREATE TABLE IF NOT EXISTS avatar_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(50) DEFAULT 'published',
    name VARCHAR(255),
    prompt_modifier TEXT
);

CREATE TABLE IF NOT EXISTS cartesian_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(50) DEFAULT 'published',
    name VARCHAR(255),
    pattern_logic TEXT
);

CREATE TABLE IF NOT EXISTS geo_intelligence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(50) DEFAULT 'published',
    city VARCHAR(255),
    state VARCHAR(255),
    population INTEGER
);

CREATE TABLE IF NOT EXISTS offer_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(50) DEFAULT 'draft',
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaign_masters(id) ON DELETE SET NULL,
    title VARCHAR(255),
    content TEXT,
    slug VARCHAR(255),
    schema_json JSONB,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. GENERATION JOBS
CREATE TABLE IF NOT EXISTS generation_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(50) DEFAULT 'pending',
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
    batch_size INTEGER DEFAULT 10,
    progress INTEGER DEFAULT 0
);

-- 10. PAGES
CREATE TABLE IF NOT EXISTS pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(50) DEFAULT 'published',
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
    title VARCHAR(255),
    slug VARCHAR(255),
    content TEXT,
    schema_json JSONB
);

-- 11. POSTS
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(50) DEFAULT 'published',
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
    title VARCHAR(255),
    slug VARCHAR(255),
    content TEXT,
    schema_json JSONB
);

-- 12. LEADS
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(50) DEFAULT 'new',
    site_id UUID REFERENCES sites(id) ON DELETE SET NULL,
    email VARCHAR(255),
    name VARCHAR(255),
    source VARCHAR(100)
);

-- 13. HEADLINE INVENTORY
CREATE TABLE IF NOT EXISTS headline_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(50) DEFAULT 'active',
    campaign_id UUID REFERENCES campaign_masters(id) ON DELETE CASCADE,
    headline_text VARCHAR(255),
    is_used BOOLEAN DEFAULT FALSE
);

-- 14. CONTENT FRAGMENTS
CREATE TABLE IF NOT EXISTS content_fragments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(50) DEFAULT 'active',
    campaign_id UUID REFERENCES campaign_masters(id) ON DELETE CASCADE,
    fragment_text TEXT,
    fragment_type VARCHAR(50)
);

-- ===================================================================================
-- 🏠 BATCH 3: THE ROOF (Complex Dependents)
-- Dependencies: Multiple tables
-- ===================================================================================

-- 15. LINK TARGETS (Internal Linking Logic)
CREATE TABLE IF NOT EXISTS link_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(50) DEFAULT 'active',
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
    target_url VARCHAR(500),
    anchor_text VARCHAR(255),
    keyword_focus VARCHAR(255)
);

-- ===================================================================================
-- 🎨 DIRECTUS UI CONFIGURATION (The "Glance" Layer)
-- Fixes interfaces, dropdowns, and template issues automatically
-- ===================================================================================

-- 1. Enable 'Select Dropdown' for all Foreign Keys (Fixes "Raw UUID" UI issue)
INSERT INTO directus_fields (collection, field, interface, readonly, hidden, width)
VALUES 
('campaign_masters', 'site_id', 'select-dropdown-m2o', 'false', 'false', 'half'),
('generated_articles', 'site_id', 'select-dropdown-m2o', 'false', 'false', 'half'),
('generated_articles', 'campaign_id', 'select-dropdown-m2o', 'false', 'false', 'half'),
('generation_jobs', 'site_id', 'select-dropdown-m2o', 'false', 'false', 'half'),
('pages', 'site_id', 'select-dropdown-m2o', 'false', 'false', 'half'),
('posts', 'site_id', 'select-dropdown-m2o', 'false', 'false', 'half'),
('leads', 'site_id', 'select-dropdown-m2o', 'false', 'false', 'half'),
('headline_inventory', 'campaign_id', 'select-dropdown-m2o', 'false', 'false', 'half'),
('content_fragments', 'campaign_id', 'select-dropdown-m2o', 'false', 'false', 'half'),
('link_targets', 'site_id', 'select-dropdown-m2o', 'false', 'false', 'half')
ON CONFLICT (collection, field) 
DO UPDATE SET interface = 'select-dropdown-m2o';

-- 2. Fix the Template Mismatch (The 'campaign_name' vs 'name' bug)
UPDATE directus_collections
SET display_template = '{{campaign_id.name}}'
WHERE collection IN ('content_fragments', 'headline_inventory', 'generated_articles');

-- 3. Set standard display templates for Sites
UPDATE directus_collections
SET display_template = '{{name}}'
WHERE collection IN ('sites', 'campaign_masters');