-- Spark Platform - Full Schema Update
-- Adds missing tables for SEO Engine and Cartesian Engine

-- 1. generated_articles (replacing/aliasing posts)
CREATE TABLE IF NOT EXISTS generated_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    site_id UUID REFERENCES sites (id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) NOT NULL,
    html_content TEXT,
    generation_hash VARCHAR(255),
    meta_desc TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    sync_status VARCHAR(50),
    sitemap_status VARCHAR(50) DEFAULT 'ghost', -- ghost, queued, indexed
    campaign_id UUID, -- Reference to campaign_masters
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. campaign_masters
CREATE TABLE IF NOT EXISTS campaign_masters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    site_id UUID REFERENCES sites (id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    headline_spintax_root TEXT,
    niche_variables JSONB,
    location_mode VARCHAR(50),
    location_target VARCHAR(255),
    batch_count INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active',
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. headline_inventory
CREATE TABLE IF NOT EXISTS headline_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    campaign_id UUID REFERENCES campaign_masters (id) ON DELETE CASCADE,
    final_title_text TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'available',
    used_on_article UUID, -- Reference to generated_articles
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. content_fragments
CREATE TABLE IF NOT EXISTS content_fragments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    campaign_id UUID REFERENCES campaign_masters (id) ON DELETE CASCADE,
    fragment_type VARCHAR(100),
    content_body TEXT,
    word_count INTEGER,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. generation_jobs (Cartesian Engine)
CREATE TABLE IF NOT EXISTS generation_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    site_id UUID REFERENCES sites (id) ON DELETE CASCADE,
    target_quantity INTEGER,
    status VARCHAR(50) DEFAULT 'Pending',
    filters JSONB,
    current_offset INTEGER DEFAULT 0,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Register collections
INSERT INTO
    directus_collections (
        collection,
        icon,
        note,
        hidden,
        singleton,
        accountability
    )
VALUES (
        'generated_articles',
        'article',
        'SEO Generated Articles',
        false,
        false,
        'all'
    ),
    (
        'campaign_masters',
        'campaign',
        'SEO Campaigns',
        false,
        false,
        'all'
    ),
    (
        'headline_inventory',
        'title',
        'Generated Headlines',
        false,
        false,
        'all'
    ),
    (
        'content_fragments',
        'extension',
        'Content Blocks',
        false,
        false,
        'all'
    ),
    (
        'generation_jobs',
        'engineering',
        'Generation Jobs',
        false,
        false,
        'all'
    ) ON CONFLICT (collection) DO NOTHING;

-- Register fields for generated_articles
INSERT INTO directus_fields (collection, field, type, interface, special)
VALUES 
    ('generated_articles', 'id', 'uuid', 'input', ARRAY['uuid']),
    ('generated_articles', 'site_id', 'uuid', 'select-dropdown-m2o', NULL),
    ('generated_articles', 'title', 'string', 'input', NULL),
    ('generated_articles', 'slug', 'string', 'input', NULL),
    ('generated_articles', 'html_content', 'text', 'input-rich-text-html', NULL),
    ('generated_articles', 'is_published', 'boolean', 'boolean', NULL),
    ('generated_articles', 'sitemap_status', 'string', 'select-dropdown', NULL),
    ('generated_articles', 'date_created', 'timestamp', 'datetime', ARRAY['date-created'])
ON CONFLICT (collection, field) DO NOTHING;

-- Register fields for campaign_masters
INSERT INTO directus_fields (collection, field, type, interface, special)
VALUES 
    ('campaign_masters', 'id', 'uuid', 'input', ARRAY['uuid']),
    ('campaign_masters', 'name', 'string', 'input', NULL),
    ('campaign_masters', 'status', 'string', 'select-dropdown', NULL),
    ('campaign_masters', 'date_created', 'timestamp', 'datetime', ARRAY['date-created'])
ON CONFLICT (collection, field) DO NOTHING;