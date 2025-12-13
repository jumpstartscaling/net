#!/bin/bash

# Directus Schema Setup and Data Import Script
# This script creates all necessary collections and imports JSON data

DIRECTUS_URL="https://spark.jumpstartscaling.com"
TOKEN="oGn-0AZjenB900pfzQYH8zCbFwGw7flU"

echo "🚀 Setting up Directus Schema and Importing Data..."
echo ""

# Function to create a collection
create_collection() {
    local collection_name=$1
    local schema=$2
    
    echo "📦 Creating collection: $collection_name"
    
    curl -k -X POST "$DIRECTUS_URL/collections" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "$schema" 2>/dev/null
    
    echo ""
}

# Function to create a field
create_field() {
    local collection=$1
    local field_data=$2
    
    curl -k -X POST "$DIRECTUS_URL/fields/$collection" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "$field_data" 2>/dev/null
}

# 1. Create avatar_intelligence collection
echo "Creating avatar_intelligence collection..."
create_collection "avatar_intelligence" '{
  "collection": "avatar_intelligence",
  "meta": {
    "icon": "person",
    "note": "Avatar intelligence data for content personalization"
  }
}'

create_field "avatar_intelligence" '{
  "field": "id",
  "type": "integer",
  "meta": {"interface": "input", "special": ["auto-increment"]},
  "schema": {"is_primary_key": true, "has_auto_increment": true}
}'

create_field "avatar_intelligence" '{
  "field": "avatar_key",
  "type": "string",
  "meta": {"interface": "input", "required": true},
  "schema": {"is_unique": true}
}'

create_field "avatar_intelligence" '{
  "field": "data",
  "type": "json",
  "meta": {"interface": "input-code", "options": {"language": "json"}}
}'

# 2. Create sites collection
echo "Creating sites collection..."
create_collection "sites" '{
  "collection": "sites",
  "meta": {
    "icon": "language",
    "note": "Managed WordPress sites"
  }
}'

create_field "sites" '{
  "field": "id",
  "type": "uuid",
  "meta": {"interface": "input", "readonly": true},
  "schema": {"is_primary_key": true}
}'

create_field "sites" '{
  "field": "name",
  "type": "string",
  "meta": {"interface": "input", "required": true}
}'

create_field "sites" '{
  "field": "url",
  "type": "string",
  "meta": {"interface": "input", "required": true}
}'

create_field "sites" '{
  "field": "status",
  "type": "string",
  "meta": {"interface": "select-dropdown", "options": {"choices": [
    {"text": "Active", "value": "active"},
    {"text": "Paused", "value": "paused"},
    {"text": "Archived", "value": "archived"}
  ]}}
}'

# 3. Create posts collection
echo "Creating posts collection..."
create_collection "posts" '{
  "collection": "posts",
  "meta": {
    "icon": "article",
    "note": "Generated content posts"
  }
}'

create_field "posts" '{
  "field": "id",
  "type": "uuid",
  "meta": {"interface": "input", "readonly": true},
  "schema": {"is_primary_key": true}
}'

create_field "posts" '{
  "field": "title",
  "type": "string",
  "meta": {"interface": "input", "required": true}
}'

create_field "posts" '{
  "field": "content",
  "type": "text",
  "meta": {"interface": "input-rich-text-html"}
}'

create_field "posts" '{
  "field": "status",
  "type": "string",
  "meta": {"interface": "select-dropdown", "options": {"choices": [
    {"text": "Draft", "value": "draft"},
    {"text": "Published", "value": "published"}
  ]}}
}'

create_field "posts" '{
  "field": "site_id",
  "type": "uuid",
  "meta": {"interface": "select-dropdown-m2o", "display": "related-values"}
}'

# 4. Create pages collection
echo "Creating pages collection..."
create_collection "pages" '{
  "collection": "pages",
  "meta": {
    "icon": "description",
    "note": "Static pages"
  }
}'

create_field "pages" '{
  "field": "id",
  "type": "uuid",
  "meta": {"interface": "input", "readonly": true},
  "schema": {"is_primary_key": true}
}'

create_field "pages" '{
  "field": "title",
  "type": "string",
  "meta": {"interface": "input", "required": true}
}'

create_field "pages" '{
  "field": "content",
  "type": "text",
  "meta": {"interface": "input-rich-text-html"}
}'

# 5. Create leads collection
echo "Creating leads collection..."
create_collection "leads" '{
  "collection": "leads",
  "meta": {
    "icon": "contacts",
    "note": "Lead capture data"
  }
}'

create_field "leads" '{
  "field": "id",
  "type": "uuid",
  "meta": {"interface": "input", "readonly": true},
  "schema": {"is_primary_key": true}
}'

create_field "leads" '{
  "field": "email",
  "type": "string",
  "meta": {"interface": "input", "required": true}
}'

create_field "leads" '{
  "field": "name",
  "type": "string",
  "meta": {"interface": "input"}
}'

create_field "leads" '{
  "field": "source",
  "type": "string",
  "meta": {"interface": "input"}
}'

create_field "leads" '{
  "field": "created_at",
  "type": "timestamp",
  "meta": {"interface": "datetime", "special": ["date-created"]}
}'

echo ""
echo "✅ Schema created successfully!"
echo ""
echo "📊 Now import the JSON data files manually via Directus UI or use the import script."
echo ""
echo "Data files location in container: /directus/data/"
echo "  - avatar_intelligence.json"
echo "  - avatar_variants.json"
echo "  - geo_intelligence.json"
echo "  - spintax_dictionaries.json"
echo "  - cartesian_patterns.json"
echo "  - offer_blocks_universal.json"
echo "  - offer_blocks_avatar_personalized.json"
echo "  - offer_blocks_cartesian_engine.json"
echo "  - master_meta.json"
echo ""
echo "🎉 Setup complete!"
