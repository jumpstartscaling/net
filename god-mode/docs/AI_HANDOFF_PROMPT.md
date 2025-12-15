You are receiving a handoff of "Project Valhalla" (God Mode v1.0.0).

## 🚀 Project State
A standalone, high-performance Node.js system ("God Mode") fully deployed and functioning.
*   **Repo:** `gatekeeper/mini.git`
*   **Purpose:** Database-direct content generation & system administration (bypassing CMS API).
*   **Scale:** Tuned for 100,000 concurrent operations.

## 🏗️ Technical Architecture
1.  **Frontend:** Astro (SSR) + React Admin UI (Ported from Spark).
2.  **Backend:** Node.js + `pg` (Postgres) + `ioredis` (Redis).
3.  **The "Shim":** A custom library (`src/lib/directus/client.ts`) that translates Directus SDK calls to SQL.
4.  **"God Tier" Optimizations:**
    *   Memory: 16GB
    *   Connections: 10,000
    *   Ulimit: 65,536

## 🛠️ Critical Files
*   `src/lib/godMode.ts`: The fallback token and API client.
*   `src/lib/queue/BatchProcessor.ts`: The 100k batch engine (with Standby check).
*   `src/components/admin/SystemControl.tsx`: The "Push Button" UI logic.
*   `docker-compose.yml`: Where limits are defined.

## ⚠️ Important Context
*   **Standby Mode:** The system acts as a hybrid. Users can "Deactivate Engine" in the UI to save resources.
*   **Authentication:** Uses `GOD_MODE_TOKEN` (Header: `X-God-Token`).
*   **Deployment:** Must use **Docker Compose** (not just Dockerfile) to get Redis + Ulimits.

## ⏭️ Immediate Next Actions
*   This user is the *original architect*.
*   If they ask for "status", check `/admin` or `/api/god/system/control`.
*   Maintain the "God Tier" config. Do not lower limits unless requested.
