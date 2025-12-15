# 🔱 Spark God Mode

God Mode is the centralized control panel and intelligence engine for the Spark Platform.

## 📚 Documentation

- **[God Mode API](./docs/GOD_MODE_API.md)**: Full API documentation for direct database access and system control.
- **[Content Generation API](./docs/CONTENT_GENERATION_API.md)**: Documentation for the AI content generation pipeline.
- **[Admin Manual](./docs/ADMIN_MANUAL.md)**: Guide for using the visual dashboard.
- **[Implementation Plan](./docs/GOD_MODE_IMPLEMENTATION_PLAN.md)**: Technical architecture and roadmap.
- **[Handoff & Context](./docs/GOD_MODE_HANDOFF.md)**: Context for developers and AI agents.
- **[Harris Matrix](./docs/GOD_MODE_HARRIS_MATRIX.md)**: Strategy and priority matrix.
- **[Health Check](./docs/GOD_MODE_HEALTH_CHECK.md)**: System diagnostics guide.

## 🚀 Quick Start

### Development
```bash
npm install
npm run dev
```

### Production
Deployed via Coolify (Docker).
See `Dockerfile` for build details.

## 🛠️ Scripts
Located in `./scripts/`:
- `god-mode.js`: Core engine script.
- `start-worker.js`: Job queue worker.
- `test-campaign.js`: Campaign testing utility.
