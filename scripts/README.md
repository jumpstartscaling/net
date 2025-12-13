---
description: Learn how to manage deployment scripts and database migrations
---

# Scripts & Automation

This directory contains utility scripts for managing the Spark Platform.

## Core Scripts

- `deploy.sh`: (Legacy) Basic shell script for deployment. We now use **Coolify**.
- `seed.ts`: Database seeder (if applicable).

## Deployment

We use **Coolify** for all deployments. The `Dockerfile` in the root determines the build process.
- **Frontend**: Built via `npm run build` (Astro).
- **Backend**: Directus via Docker Image.

## Database Migrations

Directus handles migrations internally.
- To export schema: `npx directus schema snapshot ./schema.yaml`
- To apply schema: `npx directus schema apply ./schema.yaml`

## ⚠️ Important Notes

- **Do NOT** modify `docker-compose.yml` manually on the server. Use Coolify UI.
- **Environment Variables**: Managed in Coolify. See `.env.example` for required keys.
- **Onboarding**: See `SPARK_ONBOARDING.md` in the root for the full developer guide.
