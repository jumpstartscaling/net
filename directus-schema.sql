-- Spark Platform - Complete Directus Schema Setup
-- This script creates all tables, fields, and imports data

-- 1. Create sites table
CREATE TABLE IF NOT EXISTS sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    name VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    wp_username VARCHAR(255),
    wp_app_password VARCHAR(500),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create posts table
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    title VARCHAR(500) NOT NULL,
    content TEXT,
    excerpt TEXT,
    status VARCHAR(50) DEFAULT 'draft',
    site_id UUID REFERENCES sites (id) ON DELETE CASCADE,
    avatar_key VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP
);

-- 3. Create pages table
CREATE TABLE IF NOT EXISTS pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    content TEXT,
    site_id UUID REFERENCES sites (id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create leads table
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    phone VARCHAR(50),
    source VARCHAR(255),
    site_id UUID REFERENCES sites (id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create avatar_intelligence table
CREATE TABLE IF NOT EXISTS avatar_intelligence (
    id SERIAL PRIMARY KEY,
    avatar_key VARCHAR(100) NOT NULL UNIQUE,
    base_name VARCHAR(255),
    wealth_cluster VARCHAR(255),
    business_niches JSONB,
    data JSONB
);

-- 6. Create avatar_variants table
CREATE TABLE IF NOT EXISTS avatar_variants (
    id SERIAL PRIMARY KEY,
    avatar_key VARCHAR(100) NOT NULL,
    variant_type VARCHAR(50),
    data JSONB
);

-- 7. Create geo_intelligence table
CREATE TABLE IF NOT EXISTS geo_intelligence (
    id SERIAL PRIMARY KEY,
    cluster_key VARCHAR(100) NOT NULL UNIQUE,
    data JSONB
);

-- 8. Create spintax_dictionaries table
CREATE TABLE IF NOT EXISTS spintax_dictionaries (
    id SERIAL PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    data JSONB
);

-- 9. Create cartesian_patterns table
CREATE TABLE IF NOT EXISTS cartesian_patterns (
    id SERIAL PRIMARY KEY,
    pattern_key VARCHAR(100) NOT NULL UNIQUE,
    pattern_type VARCHAR(100),
    data JSONB
);

-- 10. Create offer_blocks table
CREATE TABLE IF NOT EXISTS offer_blocks (
    id SERIAL PRIMARY KEY,
    block_type VARCHAR(100) NOT NULL,
    avatar_key VARCHAR(100),
    data JSONB
);

-- Register collections with Directus
INSERT INTO
    directus_collections (
        collection,
        icon,
        note,
        hidden,
        singleton,
        accountability,
        sort_field
    )
VALUES (
        'sites',
        'language',
        'Managed WordPress sites',
        false,
        false,
        'all',
        NULL
    ),
    (
        'posts',
        'article',
        'Generated content posts',
        false,
        false,
        'all',
        NULL
    ),
    (
        'pages',
        'description',
        'Static pages',
        false,
        false,
        'all',
        NULL
    ),
    (
        'leads',
        'contacts',
        'Lead capture data',
        false,
        false,
        'all',
        NULL
    ),
    (
        'avatar_intelligence',
        'person',
        'Avatar intelligence data',
        false,
        false,
        'all',
        NULL
    ),
    (
        'avatar_variants',
        'people',
        'Avatar variant data',
        false,
        false,
        'all',
        NULL
    ),
    (
        'geo_intelligence',
        'map',
        'Geographic intelligence',
        false,
        false,
        'all',
        NULL
    ),
    (
        'spintax_dictionaries',
        'book',
        'Spintax dictionaries',
        false,
        false,
        'all',
        NULL
    ),
    (
        'cartesian_patterns',
        'grid_on',
        'Cartesian patterns',
        false,
        false,
        'all',
        NULL
    ),
    (
        'offer_blocks',
        'inventory',
        'Offer blocks',
        false,
        false,
        'all',
        NULL
    ) ON CONFLICT (collection) DO NOTHING;

-- Register fields with Directus for sites
INSERT INTO directus_fields (collection, field, type, interface, special)
VALUES 
    ('sites', 'id', 'uuid', 'input', ARRAY['uuid']),
    ('sites', 'name', 'string', 'input', NULL),
    ('sites', 'url', 'string', 'input', NULL),
    ('sites', 'wp_username', 'string', 'input', NULL),
    ('sites', 'wp_app_password', 'string', 'input', ARRAY['hash']),
    ('sites', 'status', 'string', 'select-dropdown', NULL),
    ('sites', 'created_at', 'timestamp', 'datetime', ARRAY['date-created']),
    ('sites', 'updated_at', 'timestamp', 'datetime', ARRAY['date-updated'])
ON CONFLICT (collection, field) DO NOTHING;

-- Register fields for posts
INSERT INTO directus_fields (collection, field, type, interface, special)
VALUES 
    ('posts', 'id', 'uuid', 'input', ARRAY['uuid']),
    ('posts', 'title', 'string', 'input', NULL),
    ('posts', 'content', 'text', 'input-rich-text-html', NULL),
    ('posts', 'excerpt', 'text', 'textarea', NULL),
    ('posts', 'status', 'string', 'select-dropdown', NULL),
    ('posts', 'site_id', 'uuid', 'select-dropdown-m2o', NULL),
    ('posts', 'avatar_key', 'string', 'input', NULL),
    ('posts', 'created_at', 'timestamp', 'datetime', ARRAY['date-created']),
    ('posts', 'published_at', 'timestamp', 'datetime', NULL)
ON CONFLICT (collection, field) DO NOTHING;

-- Register fields for pages
INSERT INTO directus_fields (collection, field, type, interface, special)
VALUES 
    ('pages', 'id', 'uuid', 'input', ARRAY['uuid']),
    ('pages', 'title', 'string', 'input', NULL),
    ('pages', 'slug', 'string', 'input', NULL),
    ('pages', 'content', 'text', 'input-rich-text-html', NULL),
    ('pages', 'site_id', 'uuid', 'select-dropdown-m2o', NULL),
    ('pages', 'status', 'string', 'select-dropdown', NULL),
    ('pages', 'created_at', 'timestamp', 'datetime', ARRAY['date-created'])
ON CONFLICT (collection, field) DO NOTHING;

-- Register fields for leads
INSERT INTO directus_fields (collection, field, type, interface, special)
VALUES 
    ('leads', 'id', 'uuid', 'input', ARRAY['uuid']),
    ('leads', 'email', 'string', 'input', NULL),
    ('leads', 'name', 'string', 'input', NULL),
    ('leads', 'phone', 'string', 'input', NULL),
    ('leads', 'source', 'string', 'input', NULL),
    ('leads', 'site_id', 'uuid', 'select-dropdown-m2o', NULL),
    ('leads', 'created_at', 'timestamp', 'datetime', ARRAY['date-created'])
ON CONFLICT (collection, field) DO NOTHING;

-- Register fields for avatar_intelligence
INSERT INTO
    directus_fields (
        collection,
        field,
        type,
        interface,
        special
    )
VALUES (
        'avatar_intelligence',
        'id',
        'integer',
        'input',
        NULL
    ),
    (
        'avatar_intelligence',
        'avatar_key',
        'string',
        'input',
        NULL
    ),
    (
        'avatar_intelligence',
        'base_name',
        'string',
        'input',
        NULL
    ),
    (
        'avatar_intelligence',
        'wealth_cluster',
        'string',
        'input',
        NULL
    ),
    (
        'avatar_intelligence',
        'business_niches',
        'json',
        'input-code',
        NULL
    ),
    (
        'avatar_intelligence',
        'data',
        'json',
        'input-code',
        NULL
    ) ON CONFLICT (collection, field) DO NOTHING;

COMMIT;