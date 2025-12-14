#!/usr/bin/env python3
"""
Comprehensive Frontend-Backend Schema Alignment
Ensures ALL collections queried by frontend exist in unified_schema.json
"""
import json

# Collections currently queried by frontend
FRONTEND_COLLECTIONS = [
    'article_templates', 'avatar_intelligence', 'avatar_variants', 'avatars',
    'campaign_masters', 'campaigns', 'cartesian_patterns', 'content_fragments',
    'content_modules', 'conversions', 'events', 'form_submissions', 'forms',
    'generated_articles', 'generation_jobs', 'geo_clusters', 'geo_intelligence',
    'geo_locations', 'globals', 'headline_inventory', 'hub_pages',
    'image_templates', 'leads', 'link_targets', 'locations_cities',
    'locations_counties', 'locations_states', 'navigation',
    'offer_blocks_universal', 'pages', 'pageviews', 'posts',
    'production_queue', 'quality_flags', 'site_analytics', 'sites',
    'spintax_dictionaries', 'work_log'
]

with open('unified_schema.json', 'r') as f:
    schema = json.load(f)

existing_collections = {c['collection'] for c in schema}
missing_collections = set(FRONTEND_COLLECTIONS) - existing_collections

print(f"📊 Frontend queries {len(FRONTEND_COLLECTIONS)} collections")
print(f"✅ Backend has {len(existing_collections)} collections")
print(f"❌ Missing {len(missing_collections)} collections\n")

if missing_collections:
    print("Missing collections:")
    for col in sorted(missing_collections):
        print(f"  - {col}")
    print()

# Add missing collections with basic structure
new_collections = []

if 'locations_states' in missing_collections:
    new_collections.append({
        "collection": "locations_states",
        "meta": {"icon": "map", "note": "US States"},
        "fields": [
            {"field": "name", "type": "string", "meta": {"interface": "input", "required": True}},
            {"field": "code", "type": "string", "meta": {"interface": "input", "required": True, "note": "2-letter state code"}},
            {"field": "population", "type": "integer", "meta": {"interface": "input"}}
        ]
    })

if 'locations_counties' in missing_collections:
    new_collections.append({
        "collection": "locations_counties",
        "meta": {"icon": "map", "note": "US Counties"},
        "fields": [
            {"field": "name", "type": "string", "meta": {"interface": "input", "required": True}},
            {"field": "state", "type": "uuid", "meta": {"interface": "select-dropdown-m2o", "special": ["m2o"]}},
            {"field": "fips_code", "type": "string", "meta": {"interface": "input"}},
            {"field": "population", "type": "integer", "meta": {"interface": "input"}}
        ]
    })

if 'locations_cities' in missing_collections:
    new_collections.append({
        "collection": "locations_cities",
        "meta": {"icon": "location_city", "note": "US Cities"},
        "fields": [
            {"field": "name", "type": "string", "meta": {"interface": "input", "required": True}},
            {"field": "state", "type": "uuid", "meta": {"interface": "select-dropdown-m2o", "special": ["m2o"]}},
            {"field": "county", "type": "uuid", "meta": {"interface": "select-dropdown-m2o", "special": ["m2o"]}},
            {"field": "population", "type": "integer", "meta": {"interface": "input"}},
            {"field": "zip_codes", "type": "json", "meta": {"interface": "list"}}
        ]
    })

if 'forms' in missing_collections:
    new_collections.append({
        "collection": "forms",
        "meta": {"icon": "description", "note": "Contact forms"},
        "fields": [
            {"field": "site", "type": "uuid", "meta": {"interface": "select-dropdown-m2o", "special": ["m2o"]}},
            {"field": "name", "type": "string", "meta": {"interface": "input", "required": True}},
            {"field": "fields_config", "type": "json", "meta": {"interface": "input-code", "options": {"language": "json"}}},
            {"field": "success_message", "type": "text", "meta": {"interface": "input-multiline"}},
            {"field": "redirect_url", "type": "string", "meta": {"interface": "input"}}
        ]
    })

if 'form_submissions' in missing_collections:
    new_collections.append({
        "collection": "form_submissions",
        "meta": {"icon": "send", "note": "Form submissions"},
        "fields": [
            {"field": "form", "type": "uuid", "meta": {"interface": "select-dropdown-m2o", "special": ["m2o"]}},
            {"field": "data", "type": "json", "meta": {"interface": "input-code", "options": {"language": "json"}}},
            {"field": "ip_address", "type": "string", "meta": {"interface": "input"}},
            {"field": "user_agent", "type": "string", "meta": {"interface": "input"}}
        ]
    })

if 'content_modules' in missing_collections:
    new_collections.append({
        "collection": "content_modules",
        "meta": {"icon": "view_module", "note": "Reusable content modules"},
        "fields": [
            {"field": "name", "type": "string", "meta": {"interface": "input", "required": True}},
            {"field": "module_type", "type": "string", "meta": {"interface": "input"}},
            {"field": "content", "type": "text", "meta": {"interface": "input-rich-text-html"}},
            {"field": "variables", "type": "json", "meta": {"interface": "list"}}
        ]
    })

if 'offer_blocks_universal' in missing_collections:
    new_collections.append({
        "collection": "offer_blocks_universal",
        "meta": {"icon": "card_giftcard", "note": "Universal offer blocks"},
        "fields": [
            {"field": "block_id", "type": "string", "meta": {"interface": "input", "required": True}},
            {"field": "title", "type": "string", "meta": {"interface": "input"}},
            {"field": "hook_generator", "type": "text", "meta": {"interface": "input-multiline"}},
            {"field": "universal_pains", "type": "json", "meta": {"interface": "list"}},
            {"field": "universal_solutions", "type": "json", "meta": {"interface": "list"}},
            {"field": "universal_value_points", "type": "json", "meta": {"interface": "list"}},
            {"field": "cta_spintax", "type": "text", "meta": {"interface": "input-multiline"}}
        ]
    })

# Add all new collections
for col in new_collections:
    schema.append(col)
    print(f"✅ Added {col['collection']}")

# Save
with open('unified_schema.json', 'w') as f:
    json.dump(schema, f, indent=4)

print(f"\n✅ Schema updated! Total collections: {len(schema)}")
print(f"📝 Still missing (need manual definition): {sorted(missing_collections - {c['collection'] for c in new_collections})}")
