#!/bin/bash

# Spark Platform - Complete Schema Setup Script
# Usage: ./complete-schema-setup.sh [DIRECTUS_URL] [TOKEN]
# Defaults to hardcoded values if not provided

DIRECTUS_URL=${1:-"https://spark.jumpstartscaling.com"}
TOKEN=${2:-"oGn-0AZjenB900pfzQYH8zCbFwGw7flU"}
SCHEMA_FILE="unified_schema.json"

echo "🚀 Starting Complete Schema Setup..."
echo "Target: $DIRECTUS_URL"
echo ""

if [ ! -f "$SCHEMA_FILE" ]; then
    echo "❌ Error: $SCHEMA_FILE not found!"
    exit 1
fi

# Dependency check
if ! command -v jq &> /dev/null; then
    echo "❌ Error: jq is required but not installed."
    exit 1
fi

# Function to create a collection
create_collection() {
    local name=$1
    local meta=$2
    
    echo "📦 Checking collection: $name"
    
    # Construct payload
    local payload=$(jq -n \
                  --arg name "$name" \
                  --argjson meta "$meta" \
                  '{collection: $name, meta: $meta, schema: {}}')

    # Try to create
    response=$(curl -s -k -x POST "$DIRECTUS_URL/collections" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "$payload")

    if echo "$response" | grep -q "errors"; then
        echo "   → Exists or Error: $(echo $response | jq -r '.errors[0].message')"
    else
        echo "   → Created successfully"
    fi
}

# Function to create a field
create_field() {
    local collection=$1
    local field_name=$2
    local field_def=$3
    
    echo "   🔹 Field: $field_name"
    
    response=$(curl -s -k -X POST "$DIRECTUS_URL/fields/$collection" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "$field_def")
        
    if echo "$response" | grep -q "errors"; then
        # Ignore "field already exists" errors silently-ish
        err=$(echo $response | jq -r '.errors[0].message')
        if [[ "$err" != *"already exists"* ]]; then
             echo "      ⚠️ Error: $err"
        fi
    else
        echo "      → Created"
    fi
}

# Main Loop over JSON
count=$(jq '. | length' $SCHEMA_FILE)

for ((i=0; i<$count; i++)); do
    # Get collection details
    name=$(jq -r ".[$i].collection" $SCHEMA_FILE)
    meta=$(jq ".[$i].meta" $SCHEMA_FILE)
    
    # Create Collection
    create_collection "$name" "$meta"
    
    # Get fields count
    field_count=$(jq ".[$i].fields | length" $SCHEMA_FILE)
    
    for ((j=0; j<$field_count; j++)); do
        field_name=$(jq -r ".[$i].fields[$j].field" $SCHEMA_FILE)
        field_def=$(jq ".[$i].fields[$j]" $SCHEMA_FILE)
        
        # Create Field
        create_field "$name" "$field_name" "$field_def"
    done
    
    echo ""
done

echo "✅ Schema Setup Complete!"
