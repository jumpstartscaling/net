#!/usr/bin/env python3
"""
Add final 3 missing collections
"""
import json

with open('unified_schema.json', 'r') as f:
    schema = json.load(f)

# Add article_templates (alias for existing structure)
schema.append({
    "collection": "article_templates",
    "meta": {"icon": "article", "note": "Article structure templates"},
    "fields": [
        {"field": "name", "type": "string", "meta": {"interface": "input", "required": True}},
        {"field": "structure_json", "type": "json", "meta": {"interface": "list", "note": "Array of section types"}},
        {"field": "description", "type": "text", "meta": {"interface": "input-multiline"}},
        {"field": "is_default", "type": "boolean", "meta": {"interface": "boolean"}}
    ]
})

# Add avatars (simpler version, avatar_intelligence is the main one)
schema.append({
    "collection": "avatars",
    "meta": {"icon": "person", "note": "Simple avatar list (use avatar_intelligence for full data)"},
    "fields": [
        {"field": "name", "type": "string", "meta": {"interface": "input", "required": True}},
        {"field": "slug", "type": "string", "meta": {"interface": "input", "required": True}},
        {"field": "description", "type": "text", "meta": {"interface": "input-multiline"}}
    ]
})

# Add campaigns (alias for campaign_masters)
schema.append({
    "collection": "campaigns",
    "meta": {"icon": "campaign", "note": "Marketing campaigns (use campaign_masters for SEO campaigns)"},
    "fields": [
        {"field": "name", "type": "string", "meta": {"interface": "input", "required": True}},
        {"field": "site", "type": "uuid", "meta": {"interface": "select-dropdown-m2o", "special": ["m2o"]}},
        {"field": "status", "type": "string", "meta": {"interface": "select-dropdown", "options": {"choices": [
            {"text": "Active", "value": "active"},
            {"text": "Paused", "value": "paused"},
            {"text": "Completed", "value": "completed"}
        ]}}},
        {"field": "start_date", "type": "timestamp", "meta": {"interface": "datetime"}},
        {"field": "end_date", "type": "timestamp", "meta": {"interface": "datetime"}}
    ]
})

with open('unified_schema.json', 'w') as f:
    json.dump(schema, f, indent=4)

print(f"✅ Added article_templates, avatars, campaigns")
print(f"✅ Total collections: {len(schema)}")
