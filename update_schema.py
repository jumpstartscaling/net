#!/usr/bin/env python3
"""
Update unified_schema.json to match frontend types
"""
import json

# Load existing schema
with open('unified_schema.json', 'r') as f:
    schema = json.load(f)

# Find sites collection and add missing fields
for collection in schema:
    if collection['collection'] == 'sites':
        # Add domain (alias for url)
        collection['fields'].append({
            "field": "domain",
            "type": "string",
            "meta": {
                "interface": "input",
                "note": "Primary domain (alias for url)"
            }
        })
        # Add domain_aliases
        collection['fields'].append({
            "field": "domain_aliases",
            "type": "json",
            "meta": {
                "interface": "list",
                "note": "Additional domains"
            }
        })
        # Add settings
        collection['fields'].append({
            "field": "settings",
            "type": "json",
            "meta": {
                "interface": "input-code",
                "options": {
                    "language": "json"
                }
            }
        })
        print("✅ Updated sites collection")
    
    elif collection['collection'] == 'generated_articles':
        # Add missing fields
        new_fields = [
            {
                "field": "priority",
                "type": "string",
                "meta": {
                    "interface": "select-dropdown",
                    "options": {
                        "choices": [
                            {"text": "High", "value": "high"},
                            {"text": "Medium", "value": "medium"},
                            {"text": "Low", "value": "low"}
                        ]
                    }
                }
            },
            {
                "field": "assignee",
                "type": "string",
                "meta": {
                    "interface": "input",
                    "note": "Assigned user"
                }
            },
            {
                "field": "due_date",
                "type": "timestamp",
                "meta": {
                    "interface": "datetime"
                }
            },
            {
                "field": "seo_score",
                "type": "integer",
                "meta": {
                    "interface": "input",
                    "note": "SEO quality score 0-100"
                }
            },
            {
                "field": "sync_status",
                "type": "string",
                "meta": {
                    "interface": "input",
                    "note": "WordPress sync status"
                }
            }
        ]
        collection['fields'].extend(new_fields)
        print("✅ Updated generated_articles collection")

# Add globals collection
globals_collection = {
    "collection": "globals",
    "meta": {
        "icon": "settings",
        "note": "Site-wide settings and branding",
        "singleton": True
    },
    "fields": [
        {"field": "site", "type": "uuid", "meta": {"interface": "select-dropdown-m2o", "special": ["m2o"]}},
        {"field": "site_name", "type": "string", "meta": {"interface": "input"}},
        {"field": "site_tagline", "type": "string", "meta": {"interface": "input"}},
        {"field": "logo", "type": "uuid", "meta": {"interface": "file-image", "special": ["file"]}},
        {"field": "favicon", "type": "uuid", "meta": {"interface": "file-image", "special": ["file"]}},
        {"field": "primary_color", "type": "string", "meta": {"interface": "select-color"}},
        {"field": "secondary_color", "type": "string", "meta": {"interface": "select-color"}},
        {"field": "footer_text", "type": "text", "meta": {"interface": "input-rich-text-html"}},
        {"field": "social_links", "type": "json", "meta": {"interface": "list"}},
        {"field": "scripts_head", "type": "text", "meta": {"interface": "input-code", "options": {"language": "html"}}},
        {"field": "scripts_body", "type": "text", "meta": {"interface": "input-code", "options": {"language": "html"}}}
    ]
}

# Add navigation collection
navigation_collection = {
    "collection": "navigation",
    "meta": {
        "icon": "menu",
        "note": "Site menus"
    },
    "fields": [
        {"field": "site", "type": "uuid", "meta": {"interface": "select-dropdown-m2o", "special": ["m2o"]}},
        {"field": "label", "type": "string", "meta": {"interface": "input", "required": True}},
        {"field": "url", "type": "string", "meta": {"interface": "input", "required": True}},
        {"field": "target", "type": "string", "meta": {"interface": "select-dropdown", "options": {"choices": [{"text": "Same Window", "value": "_self"}, {"text": "New Window", "value": "_blank"}]}}},
        {"field": "parent", "type": "uuid", "meta": {"interface": "select-dropdown-m2o", "special": ["m2o"]}},
        {"field": "sort", "type": "integer", "meta": {"interface": "input"}}
    ]
}

# Check if collections already exist
has_globals = any(c['collection'] == 'globals' for c in schema)
has_navigation = any(c['collection'] == 'navigation' for c in schema)

if not has_globals:
    schema.append(globals_collection)
    print("✅ Added globals collection")
else:
    print("⚠️  globals collection already exists")

if not has_navigation:
    schema.append(navigation_collection)
    print("✅ Added navigation collection")
else:
    print("⚠️  navigation collection already exists")

# Save updated schema
with open('unified_schema.json', 'w') as f:
    json.dump(schema, f, indent=4)

print(f"\n✅ Schema updated! Total collections: {len(schema)}")
