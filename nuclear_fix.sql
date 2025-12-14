-- NUCLEAR OPTION: Bypass Directus permissions entirely
-- This grants the Administrator ROLE full admin access

-- 1. Set admin_access on the ROLE (not just policy)
UPDATE directus_roles
SET
    admin_access = true,
    app_access = true
WHERE
    id = '09c18db2-1b93-4dc3-82ab-89984af46159';

-- 2. Verify
SELECT
    id,
    name,
    admin_access,
    app_access
FROM directus_roles
WHERE
    id = '09c18db2-1b93-4dc3-82ab-89984af46159';

-- 3. Create actual database tables for all collections
-- Sites
CREATE TABLE IF NOT EXISTS sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    name VARCHAR(255),
    url VARCHAR(255),
    wp_username VARCHAR(255),
    wp_app_password VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    domain_age_years INTEGER,
    domain VARCHAR(255),
    domain_aliases JSONB,
    settings JSONB,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pages
CREATE TABLE IF NOT EXISTS pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    site UUID,
    title VARCHAR(255),
    permalink VARCHAR(255),
    status VARCHAR(50) DEFAULT 'draft',
    seo_title VARCHAR(255),
    seo_description TEXT,
    seo_image VARCHAR(255),
    blocks JSONB,
    content TEXT,
    schema_json JSONB,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Posts
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    site UUID,
    title VARCHAR(255),
    slug VARCHAR(255),
    excerpt TEXT,
    content TEXT,
    featured_image VARCHAR(255),
    status VARCHAR(50) DEFAULT 'draft',
    published_at TIMESTAMP,
    category VARCHAR(255),
    author VARCHAR(255),
    meta_title VARCHAR(255),
    seo_title VARCHAR(255),
    seo_description TEXT,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Globals
CREATE TABLE IF NOT EXISTS globals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    site UUID,
    site_name VARCHAR(255),
    site_tagline VARCHAR(255),
    logo VARCHAR(255),
    favicon VARCHAR(255),
    primary_color VARCHAR(50),
    secondary_color VARCHAR(50),
    footer_text TEXT,
    social_links JSONB,
    scripts_head TEXT,
    scripts_body TEXT
);

-- Navigation
CREATE TABLE IF NOT EXISTS navigation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    site UUID,
    label VARCHAR(255),
    url VARCHAR(255),
    target VARCHAR(50) DEFAULT '_self',
    parent UUID,
    sort INTEGER DEFAULT 0
);

-- Campaign Masters
CREATE TABLE IF NOT EXISTS campaign_masters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    site_id UUID,
    name VARCHAR(255),
    headline_spintax_root TEXT,
    niche_variables JSONB,
    location_mode VARCHAR(50) DEFAULT 'none',
    location_target VARCHAR(255),
    batch_count INTEGER,
    target_word_count INTEGER DEFAULT 1500,
    velocity_mode VARCHAR(50),
    backdate_start DATE,
    backdate_end DATE,
    status VARCHAR(50) DEFAULT 'active',
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Generated Articles
CREATE TABLE IF NOT EXISTS generated_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    site_id UUID,
    campaign_id UUID,
    title VARCHAR(255),
    slug VARCHAR(255),
    html_content TEXT,
    schema_json JSONB,
    meta_desc TEXT,
    meta_title VARCHAR(255),
    featured_image VARCHAR(255),
    generation_hash VARCHAR(255),
    is_published BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'queued',
    sitemap_status VARCHAR(50) DEFAULT 'ghost',
    priority VARCHAR(50),
    assignee VARCHAR(255),
    due_date TIMESTAMP,
    seo_score INTEGER,
    sync_status VARCHAR(255),
    is_test_batch BOOLEAN DEFAULT false,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_published TIMESTAMP,
    date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Avatar Intelligence
CREATE TABLE IF NOT EXISTS avatar_intelligence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    avatar_key VARCHAR(255),
    slug VARCHAR(255),
    base_name VARCHAR(255),
    wealth_cluster VARCHAR(255),
    business_niches JSONB,
    tech_stack JSONB,
    identity_male VARCHAR(255),
    identity_female VARCHAR(255),
    identity_neutral VARCHAR(255),
    pain_points JSONB,
    goals JSONB,
    data JSONB,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leads
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    site UUID,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    message TEXT,
    source VARCHAR(255),
    status VARCHAR(50) DEFAULT 'new',
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    site UUID,
    event_name VARCHAR(255),
    event_category VARCHAR(255),
    event_label VARCHAR(255),
    event_value INTEGER,
    page_path VARCHAR(255),
    session_id VARCHAR(255),
    visitor_id VARCHAR(255),
    metadata JSONB,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pageviews
CREATE TABLE IF NOT EXISTS pageviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    site UUID,
    page_path VARCHAR(255),
    page_title VARCHAR(255),
    referrer VARCHAR(255),
    user_agent TEXT,
    ip_address VARCHAR(50),
    device_type VARCHAR(50),
    browser VARCHAR(100),
    os VARCHAR(100),
    utm_source VARCHAR(255),
    utm_medium VARCHAR(255),
    utm_campaign VARCHAR(255),
    is_bot BOOLEAN DEFAULT false,
    bot_name VARCHAR(255),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SELECT 'Tables created successfully!' as status;