-- 1. CLEANUP: Delete existing permissions for this policy to remove duplicates
DELETE FROM directus_permissions
WHERE
    policy = 'dfd8d293-728a-446a-a256-ef9fef2a41bc';

-- 2. INSERT: Loop through tables and add permissions
DO $$
DECLARE
    tbl TEXT;
    act TEXT;
BEGIN
    FOR tbl IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_type = 'BASE TABLE' 
          AND table_name NOT LIKE 'directus_%'
    LOOP
        FOREACH act IN ARRAY ARRAY['create', 'read', 'update', 'delete']
        LOOP
            INSERT INTO directus_permissions (policy, collection, action, permissions, fields, validation)
            VALUES ('dfd8d293-728a-446a-a256-ef9fef2a41bc', tbl, act, '{}', ARRAY['*'], '{}');
        END LOOP;
    END LOOP;
END $$;

-- 3. VERIFY: Check count
SELECT COUNT(*) as new_permission_count
FROM directus_permissions
WHERE
    policy = 'dfd8d293-728a-446a-a256-ef9fef2a41bc';