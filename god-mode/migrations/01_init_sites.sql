-- Create sites table for Multi-Tenancy
CREATE TABLE IF NOT EXISTS sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    domain VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'active', -- active, maintenance, archived
    config JSONB DEFAULT '{}', -- branding, SEO settings
    client_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast domain lookups
CREATE INDEX IF NOT EXISTS idx_sites_domain ON sites (domain);

-- Insert the Platform/Admin site default
INSERT INTO
    sites (domain, status, config)
VALUES (
        'spark.jumpstartscaling.com',
        'active',
        '{"type": "admin"}'
    ) ON CONFLICT (domain) DO NOTHING;