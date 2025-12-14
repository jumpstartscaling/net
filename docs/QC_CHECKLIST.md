# QUALITY CONTROL CHECKLIST: Spark Platform

> **BLUF**: Audit reveals gaps between documented features and actual implementation. 15 SQL tables exist but 28 referenced in TypeScript. Several documented API endpoints, admin pages, and components may not be fully wired. Priority issues listed below.

**Audit Date**: 2025-12-14  
**Auditor**: Automated QC Scan

---

## 📊 AUDIT SUMMARY

| Category | Documented | Actual | Gap |
|----------|------------|--------|-----|
| SQL Tables | 30+ | **15** | ⚠️ 15+ missing from schema |
| TypeScript Types | 28 | 28 | ✓ Match |
| API Endpoints | 30+ | **51** | ✓ More than documented |
| Admin Pages | 66 | **66** | ✓ Match |
| Block Components | 20 | **25** | ✓ More than documented |
| UI Components | 18 | **18** | ✓ Match |

---

## 🔴 CRITICAL ISSUES (P0)

### Issue 1: SQL Schema Missing Tables
**Status**: ⚠️ SCHEMA GAP - TypeScript references tables not in SQL

**Tables in TypeScript but NOT in `complete_schema.sql`:**
| Table | TypeScript Interface | SQL Status | Impact |
|-------|---------------------|------------|--------|
| `globals` | `Globals` | ❌ MISSING | Site settings won't persist |
| `navigation` | `Navigation` | ❌ MISSING | Menus won't save |
| `work_log` | `WorkLog` | ❌ MISSING | Activity logging fails |
| `hub_pages` | `HubPages` | ❌ MISSING | Hub page features broken |
| `forms` | `Forms` | ❌ MISSING | Form builder broken |
| `form_submissions` | `FormSubmissions` | ❌ MISSING | Form data lost |
| `site_analytics` | `SiteAnalytics` | ❌ MISSING | Analytics config missing |
| `events` | `AnalyticsEvents` | ❌ MISSING | Event tracking fails |
| `pageviews` | `PageViews` | ❌ MISSING | Pageview tracking fails |
| `conversions` | `Conversions` | ❌ MISSING | Conversion tracking fails |
| `locations_states` | `LocationsStates` | ❌ MISSING | Location data missing |
| `locations_counties` | `LocationsCounties` | ❌ MISSING | Location data missing |
| `locations_cities` | `LocationsCities` | ❌ MISSING | Location data missing |

**Consequence**: API calls to these collections return 500 errors or empty unless tables exist in Directus.

**Resolution**: Add missing tables to `complete_schema.sql` OR create via Directus Admin UI.

---

### Issue 2: Directus Collections May Exist But Not in SQL File
**Status**: ⚠️ NEEDS VERIFICATION

The `complete_schema.sql` only defines the PostgreSQL tables. Directus may have created these collections through its admin interface, but:
- Fresh deploys with `FORCE_FRESH_INSTALL=true` will NOT have these tables
- Only the 15 tables in the SQL file are guaranteed to exist

**Verification Required**:
```bash
# Check Directus for actual collections
curl -H "Authorization: Bearer $TOKEN" \
  https://spark.jumpstartscaling.com/collections
```

---

## 🟠 HIGH PRIORITY ISSUES (P1)

### Issue 3: Analytics Module Likely Broken
**Location**: `/admin/analytics/*`

**Reason**: Tables `events`, `pageviews`, `conversions`, `site_analytics` not in SQL schema.

**API Endpoints Affected**:
- `POST /api/track/pageview` - Will fail to insert
- `POST /api/track/event` - Will fail to insert
- `POST /api/track/conversion` - Will fail to insert
- `GET /api/analytics/dashboard` - Returns empty/error

**Resolution**: Add analytics tables to schema or remove/stub the endpoints.

---

### Issue 4: Location Data Tables Missing
**Location**: `/admin/locations`, `/api/locations/*`

**Reason**: Tables `locations_states`, `locations_counties`, `locations_cities` not in SQL schema.

**API Endpoints Affected**:
- `GET /api/locations/states` - Returns empty/error
- `GET /api/locations/counties` - Returns empty/error
- `GET /api/locations/cities` - Returns empty/error

**Impact**: Geo-targeting features of Content Factory cannot function.

**Data Source Required**: US Census data import scripts.

---

### Issue 5: Forms Module Tables Missing
**Reason**: Tables `forms`, `form_submissions` not in SQL schema.

**Affected Features**:
- Form Builder in page editor
- `POST /api/forms/submit` endpoint
- Lead capture forms

---

### Issue 6: Navigation System Table Missing
**Reason**: Table `navigation` not in SQL schema.

**Affected Features**:
- Navigation Editor in Site Dashboard
- Menu rendering on public pages

---

## 🟡 MEDIUM PRIORITY ISSUES (P2)

### Issue 7: Documented Block Components vs Actual

**Documented in COMPONENT_LIBRARY.md but using different names:**
| Documented | Actual File |
|------------|-------------|
| ColumnsBlock | `BlockColumns.astro` |
| MediaBlock | `BlockMedia.astro` |
| StepsBlock | `BlockSteps.astro` |
| QuoteBlock | `BlockQuote.astro` |
| GalleryBlock | `BlockGallery.astro` |
| PostsBlock | `BlockPosts.astro` |
| FormBlock | `BlockForm.astro` |

**Note**: These exist as `.astro` files, not `.tsx` as documented. May affect BlockRenderer registration.

---

### Issue 8: Missing UI Components
**Documented in COMPONENT_LIBRARY.md but NOT found:**
| Component | Status |
|-----------|--------|
| Toast | ❌ NOT FOUND |
| Tooltip | ❌ NOT FOUND |
| Sheet | ❌ NOT FOUND |
| Separator | ❌ NOT FOUND |

**Actual UI components found**: 18 files in `/components/ui/`

---

### Issue 9: Admin Component Directories vs Files
**Some directories may be empty or have minimal content:**

| Directory | Verification Needed |
|-----------|---------------------|
| `/admin/campaigns/` | 1 file only |
| `/admin/dashboard/` | 1 file only |
| `/admin/jumpstart/` | 1 file only |
| `/admin/system/` | 1 file only |
| `/admin/shared/` | May be empty |
| `/admin/wordpress/` | 1 file only |

---

## 🟢 LOW PRIORITY ISSUES (P3)

### Issue 10: Extra API Endpoints Not Documented
**51 actual API files vs ~30 documented.** Extra endpoints found:
- `/api/track/call-click.ts`
- `/api/assembler/expand-spintax.ts`
- `/api/assembler/quality-check.ts`
- `/api/assembler/substitute-vars.ts`
- `/api/intelligence/trends.ts`
- `/api/intelligence/geo-performance.ts`
- `/api/intelligence/metrics.ts`
- `/api/testing/check-links.ts`
- `/api/testing/detect-duplicates.ts`
- `/api/testing/validate-seo.ts`
- `/api/system/health.ts`
- `/api/client/dashboard.ts`
- `/api/seo/generate-test-batch.ts`
- `/api/seo/assemble-article.ts`

**Impact**: Documentation incomplete, but functionality exists.

---

### Issue 11: Documentation References Older Structure
**ADMIN_PAGES_GUIDE.md lists some paths that may not match actual routing:**
- `/admin/sites/edit` - Actual uses dynamic `[id].astro`
- Some nested paths may differ

---

## ✅ VERIFIED WORKING

### Confirmed Matching

| Category | Status |
|----------|--------|
| 15 Core SQL Tables | ✓ In schema, in TypeScript |
| 66 Admin Pages | ✓ All .astro files exist |
| 51 API Endpoints | ✓ All .ts files exist |
| Core Block Components | ✓ Mix of .astro and .tsx |
| Directus Client | ✓ SSR URL detection working |

---

## 📋 REMEDIATION PRIORITY ORDER

### P0 - Critical (Blocks core functionality)
1. [ ] Add missing SQL tables to `complete_schema.sql`
2. [ ] Verify Directus has all collections via admin UI
3. [ ] Test fresh deploy with `FORCE_FRESH_INSTALL=true`

### P1 - High (Affects major features)
4. [ ] Add analytics tables OR remove analytics endpoints
5. [ ] Add location tables + import US Census data
6. [ ] Add forms/form_submissions tables
7. [ ] Add navigation table

### P2 - Medium (Documentation sync)
8. [ ] Update COMPONENT_LIBRARY.md with actual file names
9. [ ] Add missing UI components or remove from docs
10. [ ] Verify BlockRenderer handles both .astro and .tsx

### P3 - Low (Nice to have)
11. [ ] Document additional API endpoints
12. [ ] Clean up empty admin component directories
13. [ ] Align page paths in docs with actual routes

---

## 🔧 VERIFICATION COMMANDS

```bash
# Count SQL tables
grep "CREATE TABLE" complete_schema.sql | wc -l

# Count TypeScript interfaces
grep "export interface" frontend/src/lib/schemas.ts | wc -l

# Count API endpoints
find frontend/src/pages/api -name "*.ts" | wc -l

# Count admin pages
find frontend/src/pages/admin -name "*.astro" | wc -l

# Check Directus collections (live)
curl -s -H "Authorization: Bearer $TOKEN" \
  https://spark.jumpstartscaling.com/collections | jq '.data[].collection'
```

---

## 📍 FILE LOCATIONS

| Purpose | File |
|---------|------|
| SQL Schema | `complete_schema.sql` |
| TypeScript Types | `frontend/src/lib/schemas.ts` |
| API Endpoints | `frontend/src/pages/api/` |
| Admin Pages | `frontend/src/pages/admin/` |
| Block Components | `frontend/src/components/blocks/` |
| UI Components | `frontend/src/components/ui/` |
| Admin Components | `frontend/src/components/admin/` |

---

**Next Action**: Review P0 issues and add missing SQL tables before next deployment.
