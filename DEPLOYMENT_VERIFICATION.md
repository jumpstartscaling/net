# Deployment Verification Guide

Since you are performing a manual deployment, please perform the following checks once the deployment is `Active` in Coolify.

## 1. System Health Check
- **URL**: `https://spark.jumpstartscaling.com` (Backend) / `https://launch.jumpstartscaling.com` (Frontend)
- **Action**: Visit the Frontend URL.
- **Expected**: You should see the login screen or dashboard.

## 2. Priority 1 Collections (Intelligence)
Navigate to `/admin/intelligence` or the respective Collection Manager pages.

### Avatars
- **Path**: `/admin/intelligence/avatars` (or distinct page if separate)
- **Check**: You should see "Sarah (SEO Expert)" in the list (created by demo script).
- **Test**: Click "Edit" and Verify fields (Base Name, Niches).

### Spintax
- **Path**: `/admin/collections/spintax-dictionaries`
- **Check**: Verify the list loads without error.

### Geo Clusters
- **Path**: `/admin/intelligence/geo`
- **Check**: Verify map or list loads.

## 3. Flagship Demo Content
Navigate to `/admin/sites`.

- **Check**: You should see "Flagship Demo Site" or similar.
- **Action**: Click "Manage Content" -> "Pages".
- **Check**: You should see 3 pages:
  - High-Converting Home
  - SEO Services Landing Page
  - SaaS Case Study
- **Action**: Click "Edit" on "High-Converting Home".
- **Validation**: Verify the **Visual Block Editor** loads and displays a Hero block with "Scale Your Business 10x".

## 4. Factory & Automation
- **Path**: `/admin/factory/jobs`
- **Check**: You should see 3 queued jobs (Topic Cluster, Geo Expansion, Spintax).

## 5. Troubleshooting
If any page shows a spinner forever or 404:
1. Check the Browser Console (F12) for JS errors.
2. Verify the `DIRECTUS_URL` environment variable in Coolify matches `https://spark.jumpstartscaling.com`.
3. Check Directus Logs in Coolify.
