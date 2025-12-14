---
description: How to deploy the Spark Platform to Coolify
---

# 🚀 Spark Platform Deployment Workflow

This workflow covers deploying the Spark Platform (Backend + Frontend) to Coolify.

## Pre-Deployment Checks

// turbo
1. Run the frontend build to verify no TypeScript errors:
```bash
cd frontend && npm run build
```

2. Verify the SQL schema has all required extensions and tables:
```bash
# Check that pgcrypto and uuid-ossp are enabled
grep -n "CREATE EXTENSION" complete_schema.sql

# Verify parent tables exist
grep -n "CREATE TABLE IF NOT EXISTS sites" complete_schema.sql
grep -n "CREATE TABLE IF NOT EXISTS campaign_masters" complete_schema.sql
```

3. Verify docker-compose.yaml has persistent uploads volume:
```bash
grep -n "directus-uploads" docker-compose.yaml
```

## Git Push

4. Add all changes and commit:
```bash
git add -A
git commit -m "Deployment: <describe changes>"
```

5. Push to main branch (triggers Coolify deployment):
```bash
git push origin main
```

## Coolify Configuration

### Required Settings

6. In Coolify Service Configuration:
   - **Preserve Repository**: Enable in `Service Configuration > General > Build`
   - This ensures `complete_schema.sql` is available during Postgres initialization

### Environment Variables (Set in Coolify Secrets)

| Variable | Value | Notes |
|----------|-------|-------|
| `GOD_MODE_TOKEN` | `<your-secure-token>` | Admin API access |
| `FORCE_FRESH_INSTALL` | `false` | Set to `true` ONLY on first deploy (WIPES DATABASE!) |
| `CORS_ORIGIN` | `https://spark.jumpstartscaling.com,https://launch.jumpstartscaling.com,http://localhost:4321` | Allowed origins |

### First Deployment Only

7. For first-time deployment, set:
```
FORCE_FRESH_INSTALL=true
```
⚠️ **WARNING**: This wipes the database and runs the schema from scratch!

8. After successful first deployment, change to:
```
FORCE_FRESH_INSTALL=false
```

## Verification

9. Check Coolify deployment logs for:
   - `Database setup completed successfully`
   - `Directus started on port 8055`
   - No ERROR messages during startup

10. Test endpoints:
    - Backend: `https://spark.jumpstartscaling.com/admin`
    - Frontend: `https://launch.jumpstartscaling.com`

## Troubleshooting

### "Table does not exist" Error
- Schema file not mounted properly
- Enable "Preserve Repository" in Coolify
- Verify `FORCE_FRESH_INSTALL=true` for first deploy

### SSR Networking Error (ECONNREFUSED)
- The frontend uses `http://directus:8055` for SSR requests
- Verify Directus service is healthy before frontend starts
- Check `depends_on` in docker-compose.yaml

### CORS Errors
- Update `CORS_ORIGIN` env var in Coolify
- Should include both production and preview domains

### Uploads Missing After Redeploy
- Verify `directus-uploads:/directus/uploads` volume mapping exists
- Check volume persistence in Coolify

## File Locations

| File | Purpose |
|------|---------|
| `complete_schema.sql` | Database schema definition |
| `docker-compose.yaml` | Service configuration |
| `start.sh` | Directus startup script |
| `frontend/src/lib/directus/client.ts` | Directus SDK client (SSR-safe) |
| `frontend/src/lib/schemas.ts` | TypeScript type definitions |
| `frontend/src/vite-env.d.ts` | Environment variable types |
