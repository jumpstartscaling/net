#!/usr/bin/env python3
"""
Direct database connection to insert Directus permissions
Run this ON THE SERVER or with port forwarding
"""
import psycopg2

# Connection details
conn = psycopg2.connect(
    host="localhost",  # or the actual host if running remotely
    port=5432,
    database="directus",
    user="postgres",
    password="Idk@2026lolhappyha232"
)

cur = conn.cursor()

# 1. Delete existing permissions
print("Deleting existing permissions...")
cur.execute("DELETE FROM directus_permissions WHERE policy = 'dfd8d293-728a-446a-a256-ef9fef2a41bc';")
conn.commit()
print("✅ Deleted")

# 2. Get all custom collections
cur.execute("""
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND table_name NOT LIKE 'directus_%'
    ORDER BY table_name;
""")

collections = [row[0] for row in cur.fetchall()]
print(f"\n📦 Found {len(collections)} collections")

# 3. Insert permissions for each collection
actions = ['create', 'read', 'update', 'delete']
total = 0

for collection in collections:
    for action in actions:
        cur.execute("""
            INSERT INTO directus_permissions (policy, collection, action, permissions, fields, validation)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, ('dfd8d293-728a-446a-a256-ef9fef2a41bc', collection, action, '{}', ['*'], '{}'))
        total += 1
    print(f"  ✅ {collection}")

conn.commit()

# 4. Verify
cur.execute("SELECT COUNT(*) FROM directus_permissions WHERE policy = 'dfd8d293-728a-446a-a256-ef9fef2a41bc';")
count = cur.fetchone()[0]

print(f"\n✅ Created {total} permissions")
print(f"✅ Verified: {count} permissions in database")

cur.close()
conn.close()

print("\n🔄 Now restart Directus to clear the cache!")
