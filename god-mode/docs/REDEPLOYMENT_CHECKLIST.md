# Redeployment Quality Checklist

Before triggering a deployment on Coolify, verify this checklist to minimize downtime and errors.

## 🛑 Pre-Flight Checks (Local)

1.  **Type Check:**
    ```bash
    npm run build
    ```
    *Must complete without errors.*

2.  **Environment Variables:**
    *   Ensure `DATABASE_URL` connects to the correct prod DB.
    *   Ensure `REDIS_URL` is set for the queue.
    *   Ensure `GOD_TOKEN` is defined for API security.

3.  **Schema Sync:**
    *   If you changed the schema, run:
    ```bash
    psql $PROD_DB_URL -f migrations/02_content_generation.sql
    ```
    *(Coolify does not auto-migrate SQL files unless configured in start command)*

4.  **Worker Script:**
    *   Verify `package.json` has `"worker": "node scripts/start-worker.js"`.

## 🚀 Deployment Strategy

### 1. Zero-Downtime Config Changes
*   **Scenario:** Changing API Keys or toggling Features.
*   **Action:** Go to Coolify -> Environment Variables -> Edit -> Click "Restart Service" (NOT Redeploy).
*   **Impact:** < 5s downtime.

### 2. Code Deployment (Standard)
*   **Scenario:** Updating Admin UI or Logic.
*   **Action:** Git Push to `main`.
*   **Impact:** ~1-2 min build time. Coolify keeps old container running until new one is healthy.

### 3. Database Schema Changes (Critical)
*   **Scenario:** Adding tables like `variation_registry`.
*   **Action:** Run SQL manually via `psql` or Admin SQL Console *before* pushing code that relies on it.
*   **Reason:** Code might crash if it queries tables that don't exist yet.

## 🚨 Rollback Plan

If a deployment fails:
1.  **Coolify:** Click "Rollback" to previous image.
2.  **Database:** Review `migrations/` folder for `DOWN` scripts (if any) or manually revert changes.

## 🧪 Post-Deploy Verification

1.  **Health Check:** Visit `/admin/command-station`.
    *   Check all indicators are GREEN.
2.  **API Check:**
    ```bash
    curl -I https://spark.jumpstartscaling.com/api/health
    ```
3.  **Queue Check:**
    *   Send a test campaign from `/admin/jumpstart-test`.
    *   Verify it appears in Generation Queue.
