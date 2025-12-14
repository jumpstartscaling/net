# Deployment Verification Guide

Since you are performing a manual deployment, please perform the following checks once the deployment is `Active` in Coolify.

## 1. Public Frontend Check
- **URL**: `https://launch.jumpstartscaling.com`
- **Action**: Visit the home page.
- **Expected**: You should see the "High-Converting Home" page rendered with a Hero Block ("Scale Your Business 10x").
- **Note**: If you see a 404, check if the Demo Page has correct permalink `/` or `home`.

## 2. Admin System Check
- **URL**: `https://launch.jumpstartscaling.com/admin`
- **Action**: Login and check dashboard.

## 3. Priority 1 Collections (Intelligence)

### Avatars
- **Path**: `/admin/content/avatars`
- **Check**: You should see "Sarah (SEO Expert)" in the list.

### Avatar Variants
- **Path**: `/admin/collections/avatar-variants`
- **Check**: Verify variants load.

### Geo Intelligence
- **Path**: `/admin/collections/geo-intelligence`
- **Check**: Verify map loads.

### Spintax
- **Path**: `/admin/collections/spintax-dictionaries`
- **Check**: Verify the list loads.

## 4. Flagship Demo Content
Navigate to `/admin/sites`.

- **Check**: You should see "Jumpstart Demo Site".
- **Action**: Click "Pages".
- **Check**: You should see 3 pages.
- **Action**: Click "Preview" (Eye Icon) on "High-Converting Home".
- **Validation**: Verify the Preview Page loads correctly.

## 5. Factory & Automation
- **Path**: `/admin/factory/jobs`
- **Check**: You should see 3 queued jobs.

## 5. Troubleshooting
If any page shows a spinner forever or 404:
1. Check the Browser Console (F12) for JS errors.
2. Verify the `DIRECTUS_URL` environment variable in Coolify matches `https://spark.jumpstartscaling.com`.
3. Check Directus Logs in Coolify.
