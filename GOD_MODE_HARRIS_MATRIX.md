# 🔷 GOD-MODE HARRIS MATRIX: Complete Schema Dependency Guide

> **What is a Harris Matrix?** In database design, it's a **Dependency Structure Matrix (DSM)** that shows the exact order to create tables so foreign key constraints don't fail. You cannot build a roof before walls. You cannot create `comments` before `users` and `posts` exist.

---

## 🎯 THE GOLDEN RULE

**Build the Foundation First, Then the Walls, Then the Roof**

```
┌─────────────────────────────────────┐
│  BATCH 1: Foundation (Independent) │  ← Create First
├─────────────────────────────────────┤
│  BATCH 2: Walls (First Children)   │  ← Create Second
├─────────────────────────────────────┤
│  BATCH 3: Roof (Complex Children)  │  ← Create Last
└─────────────────────────────────────┘
```

---

## 📊 SPARK PLATFORM: Complete Dependency Matrix

### Summary Statistics
- **Total Collections:** 16 (from schema_map.json)
- **Parent Tables (Batch 1):** 6
- **Child Tables (Batch 2):** 8
- **Complex Tables (Batch 3):** 2
- **Total Foreign Keys:** 12
- **Identified Issues:** 2 (template field mismatches)

---

## 🏗️ BATCH 1: FOUNDATION TABLES
> **Zero Dependencies** - These tables reference NO other tables

| # | Table | Type | Purpose | Children Dependent |
|---|-------|------|---------|-------------------|
| 1 | `sites` ⭐ | Parent | Master site registry | **10 tables** depend on this |
| 2 | `campaign_masters` ⭐ | Parent | Campaign definitions | **3 tables** depend on this |
| 3 | `avatar_intelligence` | Independent | Avatar personality data | 0 |
| 4 | `avatar_variants` | Independent | Avatar variations | 0 |
| 5 | `cartesian_patterns` | Independent | Pattern formulas | 0 |
| 6 | `geo_intelligence` | Independent | Geographic data | 0 |
| 7 | `offer_blocks` | Independent | Content offer blocks | 0 |

**⚠️ CRITICAL:** `sites` and `campaign_masters` are **SUPER PARENTS** - create these FIRST!

---

## 🧱 BATCH 2: FIRST-LEVEL CHILDREN
> **Depend ONLY on Batch 1**

| # | Table | Depends On | Foreign Key | Constraint Action |
|---|-------|------------|-------------|-------------------|
| 8 | `generated_articles` | sites | `site_id` → `sites.id` | CASCADE |
| 9 | `generation_jobs` | sites | `site_id` → `sites.id` | CASCADE |
| 10 | `pages` | sites | `site_id` → `sites.id` | CASCADE |
| 11 | `posts` | sites | `site_id` → `sites.id` | CASCADE |
| 12 | `leads` | sites | `site_id` → `sites.id` | SET NULL |
| 13 | `headline_inventory` | campaign_masters | `campaign_id` → `campaign_masters.id` | CASCADE |
| 14 | `content_fragments` | campaign_masters | `campaign_id` → `campaign_masters.id` | CASCADE |

---

## 🏠 BATCH 3: COMPLEX CHILDREN
> **Depend on Batch 2 or have multiple dependencies**

| # | Table | Depends On | Multiple FKs | Notes |
|---|-------|------------|--------------|-------|
| 15 | `link_targets` | sites | No | Internal linking system |
| 16 | (Future M2M) | Multiple | Yes | Junction tables go here |

---

## 🔍 DETAILED DEPENDENCY MAP

### Visual Cascade

```
sites ─────────┬─── generated_articles
               ├─── generation_jobs
               ├─── pages
               ├─── posts
               ├─── leads
               └─── link_targets

campaign_masters ─┬─── headline_inventory
                  ├─── content_fragments
                  └─── (referenced by generated_articles)

avatar_intelligence  (standalone)
avatar_variants      (standalone)
cartesian_patterns   (standalone)
geo_intelligence     (standalone)
offer_blocks         (standalone)
```

---

## 🚨 DETECTED ISSUES (from schema_issues.json)

### Issue #1: Template Field Mismatch
**Collection:** `content_fragments`  
**Field:** `campaign_id` (M2O relation)  
**Problem:** Display template references `campaign_name` but `campaign_masters` has field `name`, not `campaign_name`  
**Fix:** Update template to use `{{campaign_id.name}}` instead of `{{campaign_id.campaign_name}}`

### Issue #2: Template Field Mismatch  
**Collection:** `headline_inventory`  
**Field:** `campaign_id` (M2O relation)  
**Problem:** Same as above - references non-existent `campaign_name`  
**Fix:** Update template to use `{{campaign_id.name}}`

---

## 📐 EXECUTION PLAN: Step-by-Step

### Phase 1: Create Foundation (Batch 1)
```bash
# Order is CRITICAL - sites MUST be first
npx directus schema apply --only-collections \
  sites,campaign_masters,avatar_intelligence,avatar_variants,cartesian_patterns,geo_intelligence,offer_blocks
```

### Phase 2: Create Walls (Batch 2)
```bash
npx directus schema apply --only-collections \
  generated_articles,generation_jobs,pages,posts,leads,headline_inventory,content_fragments
```

### Phase 3: Create Roof (Batch 3)
```bash
npx directus schema apply --only-collections \
  link_targets
```

### Phase 4: Apply Relationships
```bash
# All foreign keys are applied AFTER tables exist
npx directus schema apply --only-relations
```

---

## 🎓 THE "MEASURE TWICE, CUT ONCE" PROMPT

Use this exact prompt to have AI execute your schema correctly:

```markdown
**System Role:** You are a Senior Database Architect specializing in Directus and PostgreSQL.

**Input:** I have 16 collections in my Spark Platform schema.

**Task 1: Dependency Map (DO THIS FIRST)**

Before generating any API calls, output a Dependency Execution Plan:

1. **Identify Nodes:** List all collections
2. **Identify Edges:** List all foreign key relationships
3. **Group by Batches:**
   - Batch 1: Independent tables (No foreign keys)
   - Batch 2: First-level dependents (Only rely on Batch 1)
   - Batch 3: Complex dependents (Rely on Batch 2 or multiple tables)

**Task 2: Directus Logic Check**

Confirm you identified:
- Standard tables vs. Singletons
- Real foreign key fields vs. M2M aliases (virtual fields)
- Display templates that might reference wrong field names

**Output Format:** Structured markdown table showing batches and dependencies.

**Once Approved:** Generate Directus API creation scripts in the correct order.

[PASTE schema_map.json HERE]
```

---

## 🔧 GOD-MODE API: Create Schema Programmatically

Using the God-Mode API to respect dependencies:

```bash
# BATCH 1: Foundation
curl https://spark.jumpstartscaling.com/god/schema/collections/create \
  -H "X-God-Token: $GOD_MODE_TOKEN" \
  -d '{"collection":"sites", "fields":[...]}'

curl https://spark.jumpstartscaling.com/god/schema/collections/create \
  -H "X-God-Token: $GOD_MODE_TOKEN" \
  -d '{"collection":"campaign_masters", "fields":[...]}'

# BATCH 2: Children (ONLY after Batch 1 completes)
curl https://spark.jumpstartscaling.com/god/schema/collections/create \
  -H "X-God-Token: $GOD_MODE_TOKEN" \
  -d '{"collection":"generated_articles", "fields":[...], "relations":[...]}'

# BATCH 3: Relations (ONLY after tables exist)
curl https://spark.jumpstartscaling.com/god/schema/relations/create \
  -H "X-God-Token: $GOD_MODE_TOKEN" \
  -d '{"collection":"generated_articles", "field":"site_id", "related_collection":"sites"}'
```

---

## ✅ VALIDATION CHECKLIST

After executing schema:

- [ ] Verify Batch 1: `SELECT * FROM sites LIMIT 1;` works
- [ ] Verify Batch 1: `SELECT * FROM campaign_masters LIMIT 1;` works
- [ ] Verify Batch 2: Foreign keys resolve (no constraint errors)
- [ ] Check schema_issues.json: Fix template field references
- [ ] Test M2O dropdowns in Directus admin UI
- [ ] Confirm all 16 collections appear in Directus

---

## 📊 COMPLETE FIELD-LEVEL ANALYSIS

### sites (SUPER PARENT)
| Field | Type | Interface | Issues |
|-------|------|-----------|--------|
| id | uuid | input (readonly) | None |
| name | string | input (required) | None |
| url | string | input | None |
| status | string | select-dropdown | None |

**Children:** 10 tables reference this

---

### campaign_masters (SUPER PARENT)
| Field | Type | Interface | Issues |
|-------|------|-----------|--------|
| id | uuid | none | None |
| site_id | uuid | select-dropdown-m2o | Missing interface ⚠️ |
| name | string | input | None |
| status | string | select-dropdown | None |
| target_word_count | integer | input | None |

**Fix Needed:** `site_id` should have `select-dropdown-m2o` interface

**Children:** 3 tables reference this

---

### generated_articles (CHILD)
**Parent:** sites  
**Relationship:** `site_id` → `sites.id` (CASCADE)  
**Issues:**
- `campaign_id` field exists but NO interface (should be `select-dropdown-m2o`)
- Template might reference wrong field names

---

## 🎯 SUCCESS CRITERIA

Your schema is correct when:

1. ✅ **SQL Execution:** No foreign key constraint errors
2. ✅ **Directus UI:** All dropdowns show related data
3. ✅ **TypeScript:** Auto-generated types match reality
4. ✅ **Frontend:** No `undefined` field errors
5. ✅ **God-Mode API:** `/god/schema/snapshot` returns valid YAML

---

## 🚀 NEXT STEPS

1. **Fix Template Issues:** Update display templates for `campaign_id` fields
2. **Add Missing Interfaces:** Apply `select-dropdown-m2o` to all foreign key fields
3. **Generate TypeScript:** Run `npm run db:sync` to get types
4. **Test Fresh Install:** Use `FORCE_FRESH_INSTALL=True` to verify clean build
5. **Deploy:** Push schema changes via God-Mode API

---

**Remember:** The Harris Matrix prevents the #1 cause of schema failures: trying to create relationships before the related tables exist.

**God-Mode Key:** `$GOD_MODE_TOKEN` (set in Coolify secrets)
