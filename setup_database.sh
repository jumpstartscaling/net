#!/bin/bash
# Automated Database Setup Script
# Run this ONCE after deploying Spark Platform to a new server

set -e  # Exit on error

# Configuration
SERVER_IP="${1:-72.61.15.216}"
SSH_KEY="${2:-/tmp/coolify_key}"
SQL_FILE="complete_schema.sql"

echo "🚀 Spark Platform - Database Setup"
echo "=================================="
echo "Server: $SERVER_IP"
echo ""

# Check if SQL file exists
if [ ! -f "$SQL_FILE" ]; then
    echo "❌ Error: $SQL_FILE not found!"
    echo "Please run this script from the spark directory."
    exit 1
fi

echo "📤 Step 1: Copying SQL file to server..."
scp -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SQL_FILE" "root@$SERVER_IP:/tmp/" || {
    echo "❌ Failed to copy SQL file"
    exit 1
}
echo "✅ SQL file copied"
echo ""

echo "🗄️  Step 2: Setting up database..."
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "root@$SERVER_IP" << 'ENDSSH'
    # Find PostgreSQL container
    echo "Finding PostgreSQL container..."
    PG_CONTAINER=$(docker ps --filter 'name=postgresql' --format '{{.Names}}' | grep -v 'lo4s44ck48kkwogsk8wwow4s\|ekw0gg00sk4kw40wg8g8gkco\|r8ok8wkoooo4g4ccoc4kcg8o\|fg44ggskg448og8ogcg0swos\|ro44gwogso440o4ossk40go4\|fo4sgk8ocs4wo4osock04wsk' | head -1)
    
    if [ -z "$PG_CONTAINER" ]; then
        echo "❌ PostgreSQL container not found!"
        exit 1
    fi
    
    echo "Found container: $PG_CONTAINER"
    
    # Copy SQL into container
    echo "Copying SQL into container..."
    docker cp /tmp/complete_schema.sql "$PG_CONTAINER:/tmp/"
    
    # Execute SQL
    echo "Executing SQL schema..."
    docker exec "$PG_CONTAINER" psql -U postgres -d directus -f /tmp/complete_schema.sql
    
    # Verify tables created
    echo ""
    echo "Verifying tables..."
    TABLE_COUNT=$(docker exec "$PG_CONTAINER" psql -U postgres -d directus -t -c "
        SELECT COUNT(*) FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT LIKE 'directus_%' 
        AND tablename NOT LIKE 'spatial_%';
    " | tr -d ' ')
    
    echo "✅ Created $TABLE_COUNT tables"
ENDSSH

echo ""
echo "🔄 Step 3: Restarting Directus..."
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "root@$SERVER_IP" << 'ENDSSH'
    DIRECTUS_CONTAINER=$(docker ps --filter 'name=directus' --format '{{.Names}}' | head -1)
    
    if [ -z "$DIRECTUS_CONTAINER" ]; then
        echo "❌ Directus container not found!"
        exit 1
    fi
    
    echo "Restarting $DIRECTUS_CONTAINER..."
    docker restart "$DIRECTUS_CONTAINER" > /dev/null
    echo "✅ Directus restarted"
ENDSSH

echo ""
echo "⏳ Waiting for Directus to start (15 seconds)..."
sleep 15

echo ""
echo "🧪 Step 4: Verifying setup..."

# Test API access
echo "Testing API access..."
TOKEN=$(curl -s -X POST "https://spark.jumpstartscaling.com/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email": "admin@sparkplatform.com", "password": "SecureAdmin2024!"}' \
    | jq -r '.data.access_token')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
    echo "⚠️  Warning: Could not get API token (Directus may still be starting)"
else
    echo "✅ API authentication working"
    
    # Test collections
    COLLECTIONS=$(curl -s "https://spark.jumpstartscaling.com/collections" \
        -H "Authorization: Bearer $TOKEN" \
        | jq '[.data[] | select(.collection | startswith("directus_") | not)] | length')
    
    echo "✅ Found $COLLECTIONS custom collections"
fi

echo ""
echo "=================================="
echo "✅ Database Setup Complete!"
echo "=================================="
echo ""
echo "Next steps:"
echo "1. Go to https://launch.jumpstartscaling.com/admin/sites"
echo "2. You should see the admin interface (may take 2-5 min for frontend rebuild)"
echo "3. Create your first site and start using Spark!"
echo ""
echo "Credentials:"
echo "  Email: admin@sparkplatform.com"
echo "  Password: SecureAdmin2024!"
echo ""
