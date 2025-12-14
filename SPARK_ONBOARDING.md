# Spark Platform: AI Agent Onboarding Guide

> **Current State**: 🚀 LAUNCH READY (All 4 Milestones Complete)  
> **Last Updated**: 2025-12-13  
> **Priority**: Live Verification, Performance Monitoring, and Marketing

---

## 1. Project Overview

Spark is a high-performance content scaling platform. It leverages:
- **Directus** (Headless CMS + PostgreSQL) for data
- **Astro + React** (SSR + Islands) for frontend
- **Frontend Engine**: Universal Render Engine for Landers, Hubs, and Articles
- **Queue System** (BullMQ + Redis) for background processing

**Goal**: Generate and manage millions of SEO-optimized articles at scale.

---

## 2. Architecture

### Frontend (`/frontend`)
- **Framework**: Astro 4.7 (SSR)
- **UI**: React 18.3 (Interactive Islands)
- **Styling**: Tailwind CSS (Titanium Pro Design)
- **Engine**: `[...slug].astro` + `BlockRenderer.tsx`
- **Build**: Vite

### Backend (`/backend`)
- **CMS**: Directus 11
- **Database**: PostgreSQL 16 (PostGIS)
- **Cache**: Redis 7
- **Queue**: BullMQ

### Deployment
- **Platform**: Coolify (Docker Compose)
- **Frontend**: `launch.jumpstartscaling.com`
- **Backend**: `spark.jumpstartscaling.com`

---

## 3. Current Features (Working)

### ✅ Intelligence Library (Fully Interactive)
**Location**: `/admin/intelligence/*` and `/admin/collections/*`
**Status**: ✅ Full CRUD + Stats + Visual Dashboards

**Collections**:
1. **Avatar Intelligence**: Manager, Stats, Variant Generator
2. **Avatar Variants**: Grouped View, DNA Style UI
3. **Geo Intelligence**: Interactive Map (Leaflet), Clusters, City Stats
4. **Spintax Dictionaries**: Manager, Live Preview, Import/Export
5. **Cartesian Patterns**: Formula Builder, Dynamic Preview

### ✅ Content Factory (Kanban & Automation)
**Location**: `/admin/factory/*`
**Status**: ✅ Full Pipeline Operational

**Components**:
- **Kanban Board**: Drag-and-drop workflow (Queued -> Published)
- **Jobs Queue**: Real-time progress monitoring
- **Scheduler**: Calendar view for campaigns
- **Leads Manager**: CRM with status workflow
- **Send to Factory**: One-click generation from WordPress

### ✅ Launchpad (Site Builder)
**Location**: `/admin/sites/*`
**Status**: ✅ Fully Functional

**Components**:
- **Site Manager**: Multi-site support
- **Page Editor**: Visual Block Editor (Hero, Content, Features)
- **Navigation Editor**: Drag-and-drop menu builder
- **Theme Settings**: Global styles and logos

### ✅ Frontend Engine
**Location**: Public URL / Preview
**Status**: ✅ Rendering Live Content

**Features**:
- **Universal Router**: Handles Sites, Pages, and Articles
- **Block Renderer**: Renders JSON blocks to UI
- **Dynamic SEO**: Auto-generates meta tags
- **Preview Mode**: 1:1 match with production

---

## 4. Completed Roadmap

See **IMPLEMENTATION_ROADMAP.md** for history.

- ✅ **Milestone 1**: Intelligence Library (Completed)
- ✅ **Milestone 2**: Factory & Forms (Completed)
- ✅ **Milestone 3**: All Collections (Completed)
- ✅ **Milestone 4**: Launchpad Site Builder (Completed)

---

## 5. Development Standards

### Titanium Pro Design System

**Colors**:
- Background: `#09090b` (Zinc-950)
- Accents: `#eab308` (Yellow-500), `#22c55e` (Green-500), `#a855f7` (Purple-500)
- Text: White/Slate

**Components**:
- Always use Shadcn/UI components (`/components/ui/*.tsx`)
- Icons: Lucide React
- Animations: Framer Motion (admin), CSS (public)

---

## 6. Key Files & Locations

### Intelligence Library
```
frontend/src/components/admin/intelligence/
├── AvatarIntelligenceManager.tsx (Built)
├── GeoIntelligenceManager.tsx (Built)
├── SpintaxManager.tsx (Built)
└── CartesianManager.tsx (Built)
```

### Factory & Forms
```
frontend/src/components/admin/factory/
├── KanbanBoard.tsx (Built)
├── SendToFactoryButton.tsx (Built)
```

### Frontend Engine
```
frontend/src/
├── pages/[...slug].astro (The Router)
└── components/engine/BlockRenderer.tsx (The Renderer)
```

### API Endpoints
```
frontend/src/pages/api/
├── factory/send-to-factory.ts (Working)
├── seo/generate-article.ts (Working)
```

---

## 7. Development Workflow

### Local Development
```bash
cd /Users/christopheramaya/Downloads/spark/frontend
npm run dev
# Access at http://localhost:4321
```

### Deployment
```bash
git add .
git commit -m "feat: Description of changes"
git push origin main
# Coolify auto-deploys in ~2 minutes
```

---

## 8. Troubleshooting Tools

### React Query Devtools
**Access**: Bottom-right corner of admin pages

### Vite Inspector
**Access**: `http://localhost:4321/__inspect/`

### Deployment Verification
See `DEPLOYMENT_VERIFICATION.md`

---

## 9. Next Actions (Post-Launch)

### Immediate Focus:
1. **User Verification**: Ensure all flows work in production.
2. **Content Strategy**: Build templates and patterns.
3. **Marketing**: Launch the platform to users.

---

## 10. Important Notes

### For AI Agents:
- **Project Status**: Stable & Complete.
- **Future Work**: Features requests, bug fixes, performance tuning.
- **Documentation**: Use this file and `DEPLOYMENT_VERIFICATION.md` as source of truth.

### For Humans:
- **Access Admin**: `https://launch.jumpstartscaling.com/admin`
- **Access Directus**: `https://spark.jumpstartscaling.com`
- **Frontend**: `https://launch.jumpstartscaling.com`

**Current Status**: 🚀 OPERATIONAL
**Next Milestone**: 📈 Scale & Growth

🚀 **Ready to Scale!**
