#!/usr/bin/env python3
"""
Fix Intelligence Library schema mismatches
"""
import json

with open('unified_schema.json', 'r') as f:
    schema = json.load(f)

# Fix avatar_intelligence collection
for collection in schema:
    if collection['collection'] == 'avatar_intelligence':
        # Replace fields with what frontend expects
        collection['fields'] = [
            {"field": "avatar_key", "type": "string", "meta": {"interface": "input", "required": True, "note": "Unique slug"}},
            {"field": "slug", "type": "string", "meta": {"interface": "input", "required": True, "note": "URL-friendly identifier"}},
            {"field": "base_name", "type": "string", "meta": {"interface": "input", "required": True}},
            {"field": "wealth_cluster", "type": "string", "meta": {"interface": "select-dropdown", "options": {"choices": [
                {"text": "High Net Worth", "value": "high_net_worth"},
                {"text": "Mass Affluent", "value": "mass_affluent"},
                {"text": "Emerging", "value": "emerging"}
            ]}}},
            {"field": "business_niches", "type": "json", "meta": {"interface": "list", "note": "Array of niche strings"}},
            {"field": "tech_stack", "type": "json", "meta": {"interface": "list", "note": "Technologies used"}},
            {"field": "identity_male", "type": "string", "meta": {"interface": "input"}},
            {"field": "identity_female", "type": "string", "meta": {"interface": "input"}},
            {"field": "identity_neutral", "type": "string", "meta": {"interface": "input"}},
            {"field": "pain_points", "type": "json", "meta": {"interface": "list"}},
            {"field": "goals", "type": "json", "meta": {"interface": "list"}},
            {"field": "data", "type": "json", "meta": {"interface": "input-code", "options": {"language": "json"}, "note": "Additional JSON data"}}
        ]
        print("✅ Fixed avatar_intelligence fields")

# Add geo_clusters collection
geo_clusters = {
    "collection": "geo_clusters",
    "meta": {"icon": "map", "note": "Geographic clusters for targeting"},
    "fields": [
        {"field": "cluster_key", "type": "string", "meta": {"interface": "input", "required": True}},
        {"field": "name", "type": "string", "meta": {"interface": "input", "required": True}},
        {"field": "state", "type": "string", "meta": {"interface": "input"}},
        {"field": "description", "type": "text", "meta": {"interface": "input-multiline"}},
        {"field": "data", "type": "json", "meta": {"interface": "input-code", "options": {"language": "json"}}}
    ]
}

# Add geo_locations collection
geo_locations = {
    "collection": "geo_locations",
    "meta": {"icon": "location_on", "note": "Individual locations within clusters"},
    "fields": [
        {"field": "cluster", "type": "uuid", "meta": {"interface": "select-dropdown-m2o", "special": ["m2o"]}},
        {"field": "city", "type": "string", "meta": {"interface": "input", "required": True}},
        {"field": "state", "type": "string", "meta": {"interface": "input"}},
        {"field": "zip", "type": "string", "meta": {"interface": "input"}},
        {"field": "population", "type": "integer", "meta": {"interface": "input"}},
        {"field": "coordinates", "type": "json", "meta": {"interface": "input-code", "options": {"language": "json"}, "note": "{lat, lng}"}}
    ]
}

# Check if collections exist
has_geo_clusters = any(c['collection'] == 'geo_clusters' for c in schema)
has_geo_locations = any(c['collection'] == 'geo_locations' for c in schema)

if not has_geo_clusters:
    schema.append(geo_clusters)
    print("✅ Added geo_clusters collection")

if not has_geo_locations:
    schema.append(geo_locations)
    print("✅ Added geo_locations collection")

# Save
with open('unified_schema.json', 'w') as f:
    json.dump(schema, f, indent=4)

print(f"\n✅ Intelligence schema fixed! Total collections: {len(schema)}")
