-- Grant permissions for ALL 33 custom collections
INSERT INTO directus_permissions (policy, collection, action, permissions, fields) VALUES
-- Sites (4)
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'sites', 'create', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'sites', 'read', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'sites', 'update', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'sites', 'delete', '{}', ARRAY['*']),
-- Pages (4)
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'pages', 'create', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'pages', 'read', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'pages', 'update', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'pages', 'delete', '{}', ARRAY['*']),
-- Posts (4)
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'posts', 'create', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'posts', 'read', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'posts', 'update', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'posts', 'delete', '{}', ARRAY['*']),
-- Leads (4)
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'leads', 'create', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'leads', 'read', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'leads', 'update', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'leads', 'delete', '{}', ARRAY['*']),
-- Campaign Masters (4)
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'campaign_masters', 'create', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'campaign_masters', 'read', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'campaign_masters', 'update', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'campaign_masters', 'delete', '{}', ARRAY['*']),
-- Generated Articles (4)
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'generated_articles', 'create', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'generated_articles', 'read', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'generated_articles', 'update', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'generated_articles', 'delete', '{}', ARRAY['*']),
-- Headline Inventory (4)
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'headline_inventory', 'create', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'headline_inventory', 'read', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'headline_inventory', 'update', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'headline_inventory', 'delete', '{}', ARRAY['*']),
-- Content Fragments (4)
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'content_fragments', 'create', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'content_fragments', 'read', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'content_fragments', 'update', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'content_fragments', 'delete', '{}', ARRAY['*']),
-- Production Queue (4)
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'production_queue', 'create', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'production_queue', 'read', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'production_queue', 'update', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'production_queue', 'delete', '{}', ARRAY['*']),
-- Quality Flags (4)
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'quality_flags', 'create', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'quality_flags', 'read', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'quality_flags', 'update', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'quality_flags', 'delete', '{}', ARRAY['*']),
-- Avatar Intelligence (4)
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'avatar_intelligence', 'create', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'avatar_intelligence', 'read', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'avatar_intelligence', 'update', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'avatar_intelligence', 'delete', '{}', ARRAY['*']),
-- Avatar Variants (4)
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'avatar_variants', 'create', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'avatar_variants', 'read', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'avatar_variants', 'update', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'avatar_variants', 'delete', '{}', ARRAY['*']),
-- Geo Intelligence (4)
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'geo_intelligence', 'create', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'geo_intelligence', 'read', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'geo_intelligence', 'update', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'geo_intelligence', 'delete', '{}', ARRAY['*']),
-- Spintax Dictionaries (4)
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'spintax_dictionaries', 'create', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'spintax_dictionaries', 'read', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'spintax_dictionaries', 'update', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'spintax_dictionaries', 'delete', '{}', ARRAY['*']),
-- Cartesian Patterns (4)
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'cartesian_patterns', 'create', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'cartesian_patterns', 'read', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'cartesian_patterns', 'update', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'cartesian_patterns', 'delete', '{}', ARRAY['*']),
-- Offer Blocks (4)
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'offer_blocks', 'create', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'offer_blocks', 'read', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'offer_blocks', 'update', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'offer_blocks', 'delete', '{}', ARRAY['*']),
-- Generation Jobs (4)
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'generation_jobs', 'create', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'generation_jobs', 'read', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'generation_jobs', 'update', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'generation_jobs', 'delete', '{}', ARRAY['*']),
-- Image Templates (4)
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'image_templates', 'create', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'image_templates', 'read', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'image_templates', 'update', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'image_templates', 'delete', '{}', ARRAY['*']),
-- Events (4)
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'events', 'create', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'events', 'read', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'events', 'update', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'events', 'delete', '{}', ARRAY['*']),
-- Pageviews (4)
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'pageviews', 'create', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'pageviews', 'read', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'pageviews', 'update', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'pageviews', 'delete', '{}', ARRAY['*']),
-- Conversions (4)
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'conversions', 'create', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'conversions', 'read', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'conversions', 'update', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'conversions', 'delete', '{}', ARRAY['*']),
-- Site Analytics (4)
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'site_analytics', 'create', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'site_analytics', 'read', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'site_analytics', 'update', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'site_analytics', 'delete', '{}', ARRAY['*']),
-- Hub Pages (4)
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'hub_pages', 'create', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'hub_pages', 'read', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'hub_pages', 'update', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'hub_pages', 'delete', '{}', ARRAY['*']),
-- Link Targets (4)
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'link_targets', 'create', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'link_targets', 'read', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'link_targets', 'update', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'link_targets', 'delete', '{}', ARRAY['*']),
-- Work Log (4)
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'work_log', 'create', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'work_log', 'read', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'work_log', 'update', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'work_log', 'delete', '{}', ARRAY['*']),
-- Globals (4)
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'globals', 'create', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'globals', 'read', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'globals', 'update', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'globals', 'delete', '{}', ARRAY['*']),
-- Navigation (4)
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'navigation', 'create', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'navigation', 'read', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'navigation', 'update', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'navigation', 'delete', '{}', ARRAY['*']),
-- Geo Clusters (4)
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'geo_clusters', 'create', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'geo_clusters', 'read', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'geo_clusters', 'update', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'geo_clusters', 'delete', '{}', ARRAY['*']),
-- Geo Locations (4)
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'geo_locations', 'create', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'geo_locations', 'read', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'geo_locations', 'update', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'geo_locations', 'delete', '{}', ARRAY['*']),
-- Locations States (4)
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'locations_states', 'create', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'locations_states', 'read', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'locations_states', 'update', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'locations_states', 'delete', '{}', ARRAY['*']),
-- Locations Counties (4)
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'locations_counties', 'create', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'locations_counties', 'read', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'locations_counties', 'update', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'locations_counties', 'delete', '{}', ARRAY['*']),
-- Locations Cities (4)
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'locations_cities', 'create', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'locations_cities', 'read', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'locations_cities', 'update', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'locations_cities', 'delete', '{}', ARRAY['*']),
-- Forms (4)
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'forms', 'create', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'forms', 'read', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'forms', 'update', '{}', ARRAY['*']),
('dfd8d293-728a-446a-a256-ef9fef2a41bc', 'forms', 'delete', '{}', ARRAY['*'])
ON CONFLICT DO NOTHING;

SELECT COUNT(*) as total_permissions
FROM directus_permissions
WHERE
    policy = 'dfd8d293-728a-446a-a256-ef9fef2a41bc';