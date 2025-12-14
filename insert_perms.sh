#!/bin/bash
# Generate and execute permissions SQL

# Get list of collections
COLLECTIONS=$(docker exec postgresql-cwgks4gs884c08s0s448gow0-142125598525 psql -U postgres -d directus -t -c "
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name NOT LIKE 'directus_%'
ORDER BY table_name;
" | tr -d ' ')

# Delete existing permissions
echo "Deleting existing permissions..."
docker exec postgresql-cwgks4gs884c08s0s448gow0-142125598525 psql -U postgres -d directus -c "
DELETE FROM directus_permissions WHERE policy = 'dfd8d293-728a-446a-a256-ef9fef2a41bc';
"

# Insert permissions for each collection
echo "Inserting permissions..."
for collection in $COLLECTIONS; do
    if [ ! -z "$collection" ]; then
        echo "  - $collection"
        for action in create read update delete; do
            docker exec postgresql-cwgks4gs884c08s0s448gow0-142125598525 psql -U postgres -d directus -c "
INSERT INTO directus_permissions (policy, collection, action, permissions, fields, validation)
VALUES ('dfd8d293-728a-446a-a256-ef9fef2a41bc', '$collection', '$action', '{}', ARRAY['*'], '{}');
" > /dev/null 2>&1
        done
    fi
done

# Verify
echo ""
echo "Verifying..."
docker exec postgresql-cwgks4gs884c08s0s448gow0-142125598525 psql -U postgres -d directus -c "
SELECT COUNT(*) as total_permissions FROM directus_permissions WHERE policy = 'dfd8d293-728a-446a-a256-ef9fef2a41bc';
"

echo ""
echo "✅ Done! Now restart Directus."
