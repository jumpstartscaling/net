# Frontend Database Connection Fix

## 🐛 Issue Identified

**Problem:** All frontend admin pages showing "Internal server error"

**Root Cause:** Domain mismatch between frontend and Directus API

### Configuration Before Fix:
- **Frontend Domain:** `launch.jumpstartscaling.com`
- **Directus Domain:** `spark.jumpstartscaling.com`
- **Frontend Environment Variable:** `PUBLIC_DIRECTUS_URL='https://spark.jumpstartscaling.com'`
- **Directus PUBLIC_URL:** `'https://spark.jumpstartscaling.com'`

**Result:** Frontend trying to connect to `spark.jumpstartscaling.com` but CORS not allowing cross-domain requests properly.

---

## ✅ Fix Applied

### Changes Made to `docker-compose.yaml`:

**1. Updated Directus Configuration (Lines 50-54):**
```yaml
# Before:
CORS_ORIGIN: 'https://launch.jumpstartscaling.com,http://localhost:4321'
PUBLIC_URL: 'https://spark.jumpstartscaling.com'

# After:
CORS_ORIGIN: 'https://launch.jumpstartscaling.com,https://spark.jumpstartscaling.com,http://localhost:4321'
PUBLIC_URL: 'https://launch.jumpstartscaling.com'
```

**2. Updated Frontend Configuration (Line 79):**
```yaml
# Before:
PUBLIC_DIRECTUS_URL: 'https://spark.jumpstartscaling.com'

# After:
PUBLIC_DIRECTUS_URL: 'https://launch.jumpstartscaling.com'
```

---

## 🔄 Deployment Steps

1. ✅ **Committed Changes:** `git push gitea-https main`
2. ✅ **Directus Restarted:** Applied new CORS and PUBLIC_URL settings
3. 🔄 **Frontend Rebuild Required:** Coolify will automatically rebuild frontend with new environment variable

---

## 🧪 Testing After Deployment

Once Coolify completes the frontend rebuild (check Coolify dashboard), test these pages:

### Core Pages to Verify:
1. **Avatar Intelligence:** https://launch.jumpstartscaling.com/admin/content/avatars
2. **Sites Manager:** https://launch.jumpstartscaling.com/admin/sites
3. **Generated Articles:** https://launch.jumpstartscaling.com/admin/seo/articles
4. **Mission Control:** https://launch.jumpstartscaling.com/admin

### Expected Results:
- ✅ No "Internal server error"
- ✅ Empty data tables (no data yet) OR
- ✅ Data grids with test data
- ✅ Console shows successful API calls to `/items/{collection}`

### How to Verify:
```bash
# Open browser dev tools (F12)
# Navigate to Network tab
# Reload page
# Look for requests to: https://launch.jumpstartscaling.com/items/{collection}
# Should see: 200 OK responses
```

---

## 📋 All Pages to Test

After deployment completes, verify these pages are working:

1. ✅ https://launch.jumpstartscaling.com/admin/content/avatars
2. ✅ https://launch.jumpstartscaling.com/admin/collections/avatar-variants
3. ✅ https://launch.jumpstartscaling.com/admin/collections/geo-intelligence
4. ✅ https://launch.jumpstartscaling.com/admin/collections/spintax-dictionaries
5. ✅ https://launch.jumpstartscaling.com/admin/collections/cartesian-patterns
6. ✅ https://launch.jumpstartscaling.com/admin/collections/campaign-masters
7. ✅ https://launch.jumpstartscaling.com/admin/collections/content-fragments
8. ✅ https://launch.jumpstartscaling.com/admin/collections/headline-inventory
9. ✅ https://launch.jumpstartscaling.com/admin/collections/offer-blocks
10. ✅ https://launch.jumpstartscaling.com/admin/collections/generation-jobs
11. ✅ https://launch.jumpstartscaling.com/admin/sites
12. ✅ https://launch.jumpstartscaling.com/admin/seo/articles
13. ✅ https://launch.jumpstartscaling.com/admin/leads
14. ✅ https://launch.jumpstartscaling.com/admin/settings
15. ✅ https://launch.jumpstartscaling.com/admin/content/work_log
16. ✅ https://launch.jumpstartscaling.com/admin/media/templates
17. ✅ https://launch.jumpstartscaling.com/admin/content-factory
18. ✅ https://launch.jumpstartscaling.com/admin
19. ✅ https://launch.jumpstartscaling.com/admin/sites/jumpstart

---

## 🔍 Possible Remaining Issues

If pages still show errors after deployment, check:

### 1. **Missing Collections in Database**
Some collections might not have database tables yet.

**Solution:**
```sql
-- Check which tables exist
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename NOT LIKE 'directus_%';
```

### 2. **Hardcoded Data in Components**
Some components might have hardcoded mock data instead of API calls.

**Files to Check:**
- `frontend/src/components/admin/**/*.tsx`
- `frontend/src/pages/admin/**/*.astro`

**Look for:**
- `const mockData = [...]`
- Hardcoded arrays instead of `readItems()` calls

### 3. **TypeScript Type Mismatches**
Frontend types might not match database schema.

**Solution:**
- Compare `frontend/src/types/schema.ts` with `unified_schema.json`
- Ensure field names match exactly

### 4. **Missing API Token**
Some pages might need authentication.

**Solution:**
- Check if `DIRECTUS_ADMIN_TOKEN` is set in environment
- Verify API calls include authentication headers

### 5. **CORS Issues**
If specific API calls fail with CORS errors.

**Solution:**
- Add more origins to `CORS_ORIGIN` in docker-compose.yaml
- Check browser console for CORS-specific errors

---

## 📊 Deployment Status

**Commits Pushed:**
- `c7e6dcb` - Updated Directus PUBLIC_URL and CORS
- `ab8511f` - Updated frontend PUBLIC_DIRECTUS_URL

**Services Restarted:**
- ✅ Directus (manual restart completed)
- 🔄 Frontend (waiting for Coolify auto-deploy)

**Next Action:**
Wait for Coolify to complete frontend rebuild (~2-5 minutes), then test all pages.

---

## 🤖 For AI Agents

If pages still show errors after this fix:

1. **Check Coolify Deployment Logs**
   - Verify frontend rebuild completed successfully
   - Check for build errors

2. **Verify Environment Variables**
   - Confirm `PUBLIC_DIRECTUS_URL` is set during build
   - Check Astro build output for environment variable values

3. **Test API Directly**
   ```bash
   curl https://launch.jumpstartscaling.com/items/sites
   # Should return JSON, not HTML
   ```

4. **Check Individual Page Code**
   - Review each failing page's source code
   - Verify it's using `readItems()` from Directus SDK
   - Ensure no hardcoded data

5. **Database Schema Verification**
   - Confirm all collections have corresponding database tables
   - Verify foreign key relationships are correct

---

**Fix Applied:** December 14, 2025 10:25 AM EST  
**Status:** 🔄 **Waiting for Coolify Deployment**
