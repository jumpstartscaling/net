# Week 1 Foundation - Testing Guide

## Components Built

### 1. Database Schema (`migrations/01_init_complete.sql`)
- 7 tables: sites, posts, pages, generation_jobs, geo_clusters, geo_locations
- Foreign keys with CASCADE deletes
- Indexes for performance
- Auto-update triggers for timestamps
- PostGIS integration

### 2. Migration System
- `src/lib/db/migrate.ts` - Transaction wrapper
- `POST /api/god/schema/init` - Initialization endpoint
- Auto-rollback on failure

### 3. SQL Sanitizer (`src/lib/db/sanitizer.ts`)
- Blocks: DROP DATABASE, ALTER USER, DELETE without WHERE
- Warnings: TRUNCATE, DROP TABLE, UPDATE without WHERE
- Maintenance mode for allowed dangerous ops

### 4. Enhanced SQL Endpoint (`src/pages/api/god/sql.ts`)
- Multi-statement transactions
- SQL sanitization
- Mechanic integration
- Queue injection

### 5. Enhanced Mechanic (`src/lib/db/mechanic.ts`)
- killLocks() - Terminate stuck queries
- vacuumAnalyze() - Cleanup after large ops
- getTableBloat() - Monitor database health

---

## Testing Checklist

### Test 1: Schema Initialization
```bash
curl -X POST http://localhost:4321/api/god/schema/init \
  -H "X-God-Token: YOUR_TOKEN"
```

**Expected:** Creates all 7 tables

---

### Test 2: Basic SQL Execution
```bash
curl -X POST http://localhost:4321/api/god/sql \
  -H "X-God-Token: YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT * FROM sites LIMIT 1"}'
```

**Expected:** Returns the default admin site

---

### Test 3: SQL Sanitization (Blocked)
```bash
curl -X POST http://localhost:4321/api/god/sql \
  -H "X-God-Token: YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "DROP DATABASE arc_net"}'
```

**Expected:** 403 error - "Blocked dangerous command"

---

### Test 4: Multi-Statement Transaction
```bash
curl -X POST http://localhost:4321/api/god/sql \
  -H "X-God-Token: YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "INSERT INTO sites (domain, name) VALUES ('\''test1.com'\'', '\''Test 1'\''); INSERT INTO sites (domain, name) VALUES ('\''test2.com'\'', '\''Test 2'\'');"
  }'
```

**Expected:** Both inserts succeed or both rollback

---

### Test 5: Transaction Rollback Test
```bash
curl -X POST http://localhost:4321/api/god/sql \
  -H "X-God-Token: YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "INSERT INTO sites (domain, name) VALUES ('\''test3.com'\'', '\''Test'\''); INSERT INTO sites (domain, name) VALUES ('\''test3.com'\'', '\''Duplicate'\'');"
  }'
```

**Expected:** Unique constraint error, BOTH inserts rolled back

---

### Test 6: Mechanic Integration
```bash
curl -X POST http://localhost:4321/api/god/sql \
  -H "X-God-Token: YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "DELETE FROM sites WHERE domain LIKE '\''test%'\''",
    "run_mechanic": "vacuum"
  }'
```

**Expected:** Deletes test sites + runs VACUUM ANALYZE

---

### Test 7: Queue Injection (requires BullMQ)
```bash
curl -X POST http://localhost:4321/api/god/sql \
  -H "X-God-Token: YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "SELECT id, domain FROM sites WHERE status='\''active'\''",
    "push_to_queue": "test_job"
  }'
```

**Expected:** Rows pushed to BullMQ generation queue

---

## Manual Verification

### Check Database Schema
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Should show:
- generation_jobs
- geo_clusters
- geo_locations
- pages
- posts
- sites

### Check Indexes
```sql
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public';
```

### Check Triggers
```sql
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';
```

Should show `update_*_updated_at` triggers

---

## Success Criteria

- ✅ All 7 tables created
- ✅ Transactions commit/rollback correctly  
- ✅ Dangerous SQL is blocked
- ✅ Mechanic functions work
- ✅ Queue injection adds jobs to BullMQ

---

## Week 1 Complete! 🎉
