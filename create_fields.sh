#!/bin/bash
# Create Directus fields from unified_schema.json to generate actual database tables

API_URL="https://spark.jumpstartscaling.com"
TOKEN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@sparkplatform.com", "password": "SecureAdmin2024!"}' | jq -r '.data.access_token')

echo "🔑 Logged in with token: ${TOKEN:0:50}..."
echo ""

# Read unified_schema.json and create fields for each collection
jq -c '.[]' unified_schema.json | while read -r collection_data; do
    COLLECTION=$(echo "$collection_data" | jq -r '.collection')
    
    echo "📦 Creating fields for: $COLLECTION"
    
    # Get fields array
    echo "$collection_data" | jq -c '.fields[]' | while read -r field_data; do
        FIELD_NAME=$(echo "$field_data" | jq -r '.field')
        
        # Create the field
        RESPONSE=$(curl -s -X POST "$API_URL/fields/$COLLECTION" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            -d "$field_data")
        
        if echo "$RESPONSE" | jq -e '.data' > /dev/null 2>&1; then
            echo "  ✅ $FIELD_NAME"
        else
            ERROR=$(echo "$RESPONSE" | jq -r '.errors[0].message // "Unknown error"')
            if [[ "$ERROR" == *"already exists"* ]]; then
                echo "  ⏭️  $FIELD_NAME (already exists)"
            else
                echo "  ❌ $FIELD_NAME: $ERROR"
            fi
        fi
    done
    
    echo ""
done

echo "✅ Fields creation complete!"
echo ""
echo "Checking if tables were created..."
ssh -i /tmp/coolify_key -o StrictHostKeyChecking=no root@72.61.15.216 \
  "docker exec postgresql-cwgks4gs884c08s0s448gow0-142125598525 psql -U postgres -d directus -c \"SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND tablename NOT LIKE 'directus_%' AND tablename NOT LIKE 'spatial_%';\""
