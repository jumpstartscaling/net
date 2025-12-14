#!/bin/bash
# Grant permissions to the Administrator policy (487657d9-0a0c-4bda-b5e3-7ec89bfc5488)

API_URL="https://spark.jumpstartscaling.com"
ADMIN_TOKEN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@sparkplatform.com", "password": "SecureAdmin2024!"}' | jq -r '.data.access_token')

POLICY_ID="487657d9-0a0c-4bda-b5e3-7ec89bfc5488"

echo "🔐 Granting Full Access to Administrator Policy..."
echo "Policy ID: $POLICY_ID"
echo ""

# Get all custom collections
COLLECTIONS=$(curl -s "$API_URL/collections" \
    -H "Authorization: Bearer $ADMIN_TOKEN" | \
    jq -r '.data[] | select(.collection | startswith("directus_") | not) | .collection')

for COLLECTION in $COLLECTIONS; do
    echo "📝 $COLLECTION"
    
    for ACTION in create read update delete; do
        curl -s -X POST "$API_URL/permissions" \
            -H "Authorization: Bearer $ADMIN_TOKEN" \
            -H "Content-Type: application/json" \
            -d "{
                \"policy\": \"$POLICY_ID\",
                \"collection\": \"$COLLECTION\",
                \"action\": \"$ACTION\",
                \"permissions\": {},
                \"fields\": [\"*\"]
            }" > /dev/null 2>&1
    done
    echo "   ✅ All permissions granted"
done

echo ""
echo "✅ Testing access..."
NEW_TOKEN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@sparkplatform.com", "password": "SecureAdmin2024!"}' | jq -r '.data.access_token')

curl -s "$API_URL/items/sites" -H "Authorization: Bearer $NEW_TOKEN" | jq '.data // .errors'
