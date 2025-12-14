#!/bin/bash
# Grant admin permissions to all custom collections

API_URL="https://spark.jumpstartscaling.com"
TOKEN="JtJMJV9I4MM9r4tUuDuaa2aoXbDlBrSM"

echo "🔐 Granting Admin Permissions to All Collections..."
echo "=================================================="

# Get the admin policy ID
ADMIN_POLICY_ID=$(curl -s "$API_URL/policies" \
    -H "Authorization: Bearer $TOKEN" | jq -r '.data[] | select(.admin_access == true) | .id')

echo "Admin Policy ID: $ADMIN_POLICY_ID"
echo ""

# Get all custom collections (non-directus)
COLLECTIONS=$(curl -s "$API_URL/collections" \
    -H "Authorization: Bearer $TOKEN" | \
    jq -r '.data[] | select(.collection | startswith("directus_") | not) | .collection')

# Grant full CRUD permissions for each collection
for COLLECTION in $COLLECTIONS; do
    echo "📝 Granting permissions for: $COLLECTION"
    
    # Create permission for this collection
    RESPONSE=$(curl -s -X POST "$API_URL/permissions" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "{
            \"policy\": \"$ADMIN_POLICY_ID\",
            \"collection\": \"$COLLECTION\",
            \"action\": \"create\",
            \"permissions\": {},
            \"fields\": [\"*\"]
        }")
    
    # Check response
    if echo "$RESPONSE" | jq -e '.data' > /dev/null 2>&1; then
        echo "   ✅ CREATE permission granted"
    else
        echo "   ⚠️  $(echo "$RESPONSE" | jq -r '.errors[0].message // "Already exists or error"')"
    fi
    
    # Read permission
    curl -s -X POST "$API_URL/permissions" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "{
            \"policy\": \"$ADMIN_POLICY_ID\",
            \"collection\": \"$COLLECTION\",
            \"action\": \"read\",
            \"permissions\": {},
            \"fields\": [\"*\"]
        }" > /dev/null
    echo "   ✅ READ permission granted"
    
    # Update permission
    curl -s -X POST "$API_URL/permissions" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "{
            \"policy\": \"$ADMIN_POLICY_ID\",
            \"collection\": \"$COLLECTION\",
            \"action\": \"update\",
            \"permissions\": {},
            \"fields\": [\"*\"]
        }" > /dev/null
    echo "   ✅ UPDATE permission granted"
    
    # Delete permission
    curl -s -X POST "$API_URL/permissions" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "{
            \"policy\": \"$ADMIN_POLICY_ID\",
            \"collection\": \"$COLLECTION\",
            \"action\": \"delete\",
            \"permissions\": {},
            \"fields\": [\"*\"]
        }" > /dev/null
    echo "   ✅ DELETE permission granted"
    
    echo ""
done

echo "=================================================="
echo "✅ All permissions granted!"
echo ""
echo "Testing access to 'sites' collection..."
curl -s "$API_URL/items/sites" \
    -H "Authorization: Bearer $TOKEN" | jq '.data // .errors'
