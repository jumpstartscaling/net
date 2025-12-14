#!/bin/bash
# Create all Spark Platform collections in Directus
# Using the unified_schema.json

API_URL="https://spark.jumpstartscaling.com"
TOKEN="JtJMJV9I4MM9r4tUuDuaa2aoXbDlBrSM"

echo "🚀 Creating Spark Platform Collections in Directus..."
echo "=================================================="
echo ""

# Read the schema and create each collection
jq -c '.[]' unified_schema.json | while read -r collection_data; do
    COLLECTION_NAME=$(echo "$collection_data" | jq -r '.collection')
    
    echo "📦 Creating collection: $COLLECTION_NAME"
    
    # Create the collection
    RESPONSE=$(curl -s -X POST "$API_URL/collections" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "$collection_data")
    
    # Check if successful
    if echo "$RESPONSE" | jq -e '.data' > /dev/null 2>&1; then
        echo "   ✅ Created successfully"
    else
        ERROR=$(echo "$RESPONSE" | jq -r '.errors[0].message // "Unknown error"')
        echo "   ❌ Error: $ERROR"
    fi
    
    echo ""
done

echo "=================================================="
echo "✅ Collection creation complete!"
echo ""
echo "Checking total collections..."
curl -s "$API_URL/collections" \
    -H "Authorization: Bearer $TOKEN" | jq '.data | length'
