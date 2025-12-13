-- Add Schema JSON fields for SEO
ALTER TABLE posts ADD COLUMN IF NOT EXISTS schema_json JSONB;

ALTER TABLE pages ADD COLUMN IF NOT EXISTS schema_json JSONB;

ALTER TABLE generated_articles
ADD COLUMN IF NOT EXISTS schema_json JSONB;

-- Add Word Count Goal to Campaign
ALTER TABLE campaign_masters
ADD COLUMN IF NOT EXISTS target_word_count INTEGER DEFAULT 1500;

-- Create Link Targets table for Internal Linking Engine
CREATE TABLE IF NOT EXISTS link_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    site VARCHAR(255),
    target_url VARCHAR(255),
    target_post UUID,
    anchor_text VARCHAR(255),
    anchor_variations JSONB,
    priority INTEGER DEFAULT 5,
    is_active BOOLEAN DEFAULT TRUE,
    is_hub BOOLEAN DEFAULT FALSE,
    max_per_article INTEGER DEFAULT 2,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attempt to improve Admin UI Inputs via Directus Meta Tables
-- (This assumes standard Directus 10 schema structure)
-- Make 'site' a dropdown
UPDATE directus_fields
SET
    interface = 'select-dropdown'
WHERE
    field = 'site'
    AND collection IN (
        'posts',
        'pages',
        'campaign_masters',
        'generation_jobs'
    );

-- Make 'campaign' a dropdown
UPDATE directus_fields
SET
    interface = 'select-dropdown-m2o'
WHERE
    field = 'campaign'
    AND collection IN (
        'generated_articles',
        'headline_inventory',
        'content_fragments'
    );

-- Make 'status' a color badge dropdown
UPDATE directus_fields
SET
    interface = 'select-dropdown',
    options = '{"choices":[{"text":"Published","value":"published","color":"#2ECDA7"},{"text":"Draft","value":"draft","color":"#D3D3D3"}]}'
WHERE
    field = 'status'
    AND collection IN ('posts', 'pages');