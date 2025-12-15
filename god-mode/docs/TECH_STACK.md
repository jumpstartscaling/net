# Spark God Mode - Technology Stack & Architecture

## 🖥 Frontend Architecture
*   **Framework:** Astro 4.x (SSR Mode)
*   **UI Library:** React 18 (Islands Architecture)
*   **Styling:** TailwindCSS 3.4
*   **Theme:** "God Mode" (Custom `titanium`, `obsidian`, `gold` palette)
*   **Icons:** Emoji-first design for speed & visual scanning

## ⚙️ Backend Architecture
*   **Runtime:** Node.js 20 (Alpine Linux in Docker)
*   **API Framework:** Astro API Routes (File-based routing)
*   **Database:** PostgreSQL 16
*   **Job Queue:** BullMQ (Redis-backed)
*   **Caching:** Redis

## 🏗 Infrastructure (Coolify)
*   **Orchestration:** Docker Compose
*   **Reverse Proxy:** Traefik (via Coolify)
*   **Deployment:** Git Push -> Coolify Webhook -> Build -> Deploy

## 🔌 Key Libraries
*   `pg`: Native PostgreSQL client for raw SQL performance.
*   `bullmq`: Robust background job processing.
*   `canvas`: (Optional) Image generation support.
*   `zod`: Schema validation for API payloads.

## 📁 Project Structure
```
/src
  /pages
    /admin          # Admin UI Pages (70+ screens)
    /api            # API Endpoints
      /god          # Protected God Mode Routes
  /lib
    /db             # Database connection pool
    /spintax        # Content Generation Engine
    /queue          # BullMQ Config
  /components
    /admin          # Shared Admin UI Components
      /DevStatus.astro # Developer Guidance Overlay
  /workers          # Background Processors
```

## 🔄 Data Flow
1.  **User** submits Campaign JSON via Admin UI.
2.  **API** validates input and stores in Postgres.
3.  **BullMQ** picks up job from Redis.
4.  **Worker** resolves Spintax, generates 1000s of variations.
5.  **Worker** inserts unique content into `posts` table.
6.  **Admin UI** reads from DB to show results.

*Verified & Polished: 2025-12-15*
