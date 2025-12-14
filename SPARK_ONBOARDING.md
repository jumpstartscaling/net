# Spark Platform: AI Agent Onboarding Guide

> **Current State**: Phase 1 Complete (Send to Factory), Intelligence Library Needs Full CRUD  
> **Last Updated**: 2025-12-13  
> **Priority**: Make Intelligence Library fully interactive + All collections working

---

## 1. Project Overview

Spark is a high-performance content scaling platform. It leverages:
- **Directus** (Headless CMS + PostgreSQL) for data
- **Astro + React** (SSR + Islands) for frontend
- **WordPress Integration** via REST API
- **Queue System** (BullMQ + Redis) for background processing

**Goal**: Generate and manage millions of SEO-optimized articles at scale.

---

## 2. Architecture

### Frontend (`/frontend`)
- **Framework**: Astro 4.7 (SSR)
- **UI**: React 18.3 (Interactive Islands)
- **Styling**: Tailwind CSS (Titanium Pro Design)
- **State**: Nanostores + React Query
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

### ✅ Intelligence Library (Read-Only)
**Location**: `/admin/content/*` and `/admin/collections/*`

**Collections**:
1. **Avatar Intelligence** - 10 base avatars
2. **Avatar Variants** - 30 variants (gender, tone)
3. **Geo Intelligence** - 3 clusters, multiple cities
4. **Spintax Dictionaries** - 12 dictionaries, 62 terms
5. **Cartesian Patterns** - 3 pattern types

**Status**: ✅ Pages exist, data loads  
**Problem**: ❌ Not editable, no stats, no "Send to Engine" buttons  
**Priority**: 🔥 TOP PRIORITY - Make fully interactive

---

### ✅ Jumpstart Workflow
**Location**: `/admin/sites/jumpstart`

**Features**:
- Connect to WordPress site
- Scan all posts (tested with 1,456 posts)
- Generate QC batch (3 samples)
- Create generation job
- "Send to Factory" button on each QC item

**Status**: ✅ Fully operational

---

### ✅ Content Generation
**API**: `/api/seo/generate-article`

**Features**:
- Template selection (Long-Tail SEO, Local Authority, etc.)
- Geo-targeting from Intelligence Library
- Spintax expansion
- Cartesian pattern application
- SEO optimization

**Status**: ✅ Working, tested with sample article

---

### ✅ Article Preview
**Location**: `/preview/article/[articleId]`

**Features**:
- Beautiful purple gradient design
- Shows metadata (SEO score, word count, template)
- Links to edit in Directus

**Status**: ✅ Working

---

## 4. What Needs to Be Built (ROADMAP)

See **IMPLEMENTATION_ROADMAP.md** for complete details.

### 🔥 MILESTONE 1: Intelligence Library - Full CRUD (TOP PRIORITY)

**Goal**: Make all 5 Intelligence pages fully editable with stats and cool UX

**Tasks**:
1. **Avatar Intelligence** - Add/Edit/Delete avatars, stats, "Generate Variants" button
2. **Avatar Variants** - Add/Edit/Delete variants, "Test Variant" button
3. **Geo Intelligence** - Interactive map, Add/Edit/Delete clusters/cities
4. **Spintax Dictionaries** - Add/Edit/Delete terms, "Test Spintax" preview, CSV import
5. **Cartesian Patterns** - Add/Edit/Delete patterns, "Test Pattern" preview, formula builder

**Files Created**: 25 components (already created by build script)  
**Location**: `frontend/src/components/admin/intelligence/`

---

### 🏭 MILESTONE 2: Factory & Forms

**Goal**: Kanban board working, forms for leads, editable tables with stats

**Tasks**:
1. **Kanban Board** - Drag-drop columns, article cards, "Send to Engine" buttons
2. **Lead Forms** - Capture leads, editable table, stats, export
3. **Generation Jobs** - Editable table, retry failed, view details
4. **Scheduler** - Calendar view, drag-drop scheduling, bulk actions

**Files Created**: 20 components (already created by build script)  
**Location**: `frontend/src/components/admin/factory/`, `leads/`, `jobs/`, `scheduler/`

---

### 📦 MILESTONE 3: All Collections - Pages & CRUD

**Goal**: Every Directus collection has a working admin page

**Collections Needing Pages**:
- Page Blocks
- Content Fragments
- Headline Inventory
- Offer Blocks (3 types)
- Sites
- Posts
- Pages
- Campaign Masters
- Work Log

**Files Created**: 16 components (already created by build script)  
**Location**: `frontend/src/pages/admin/collections/`, `sites/`, `campaigns/`, `system/`

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

**Example**:
```tsx
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { motion } from 'framer-motion';

<motion.div whileHover={{ scale: 1.05 }}>
  <Button className="bg-purple-600 hover:bg-purple-500">
    <Edit className="h-4 w-4 mr-2" />
    Edit Avatar
  </Button>
</motion.div>
```

---

### Code Quality

**TypeScript**:
- Strict mode enabled
- Use `@ts-ignore` only for Directus type issues
- Define interfaces for all data structures

**React Query**:
- Use for all API calls
- Enable devtools in admin layout
- Cache strategy: `staleTime: 5 * 60 * 1000` (5 minutes)

**Forms**:
- Use `react-hook-form` + `zod` for validation
- Always show loading states
- Display success/error toasts

---

## 6. Key Files & Locations

### Intelligence Library
```
frontend/src/
├── pages/admin/content/
│   ├── avatars.astro
│   └── geo_clusters.astro
├── pages/admin/collections/
│   ├── spintax-dictionaries.astro
│   └── cartesian-patterns.astro
└── components/admin/intelligence/
    ├── AvatarIntelligenceManager.tsx (TO BUILD)
    ├── GeoIntelligenceManager.tsx (TO BUILD)
    ├── SpintaxManager.tsx (TO BUILD)
    └── CartesianManager.tsx (TO BUILD)
```

### Factory & Forms
```
frontend/src/
├── components/admin/factory/
│   ├── KanbanBoard.tsx (TO BUILD)
│   └── SendToFactoryButton.tsx (✅ DONE)
├── components/admin/leads/
│   └── LeadManager.tsx (TO BUILD)
└── components/admin/jobs/
    └── JobsManager.tsx (TO BUILD)
```

### API Endpoints
```
frontend/src/pages/api/
├── factory/
│   └── send-to-factory.ts (✅ DONE)
├── seo/
│   └── generate-article.ts (✅ DONE)
└── admin/
    └── import-blueprint.ts (✅ EXISTS)
```

---

## 7. Development Workflow

### Local Development
```bash
cd /Users/christopheramaya/Downloads/spark/frontend
npm run dev
# Access at http://localhost:4321
```

### Testing
```bash
# Run diagnostic test
cd /Users/christopheramaya/Downloads/spark/backend
npx ts-node scripts/diagnostic_test.ts
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
**Use**: See all API queries, cache status, refetch triggers

### Bundle Analyzer
```bash
npm run build
# Opens interactive bundle visualization
```

### Vite Inspector
**Access**: `http://localhost:4321/__inspect/`  
**Use**: Debug file transformations, module graph

### Queue Dashboard
**Access**: `/admin/queue` (when implemented)  
**Use**: Monitor background jobs, retry failures

---

## 9. Next Actions (Priority Order)

### Immediate (This Week):
1. ✅ Verify deployment succeeds
2. ✅ Test Send to Factory button
3. 🔥 **START: Implement Avatar Intelligence Manager (Milestone 1, Task 1)**
4. 🔥 **Implement Avatar Variants Manager (Milestone 1, Task 2)**
5. 🔥 **Implement Geo Intelligence Manager (Milestone 1, Task 3)**

### This Week:
1. Complete Milestone 1 (Intelligence Library - all 5 pages)
2. Add stats dashboards
3. Add "Send to Engine" buttons
4. Implement cool UX (animations, previews, drag-drop)

### Next Week:
1. Start Milestone 2 (Kanban Board, Leads, Jobs, Scheduler)
2. Implement queue system
3. Add queue dashboard

### Following Week:
1. Complete Milestone 3 (All collection pages)
2. Performance optimization
3. Final polish

---

## 10. Important Notes

### For AI Agents:
- **File Structure**: Already created by `build-structure.sh` (61 files)
- **Implementation Order**: Follow IMPLEMENTATION_ROADMAP.md
- **Design System**: Always use Titanium Pro colors and Shadcn/UI
- **Testing**: Test each component before moving to next
- **Documentation**: Update this file as features are completed

### For Humans:
- **Access Admin**: `https://launch.jumpstartscaling.com/admin`
- **Access Directus**: `https://spark.jumpstartscaling.com`
- **Credentials**: Check DIRECTUS_SECRETS.md
- **Support**: See TROUBLESHOOTING.md (archived)

---

**Current Focus**: 🔥 Milestone 1 - Make Intelligence Library fully interactive  
**Next Milestone**: 🏭 Milestone 2 - Kanban Board & Forms  
**Goal**: Fully functional admin dashboard with all collections editable

🚀 **Ready to build!**
