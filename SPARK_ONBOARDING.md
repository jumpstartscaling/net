# Spark Platform: Zero-to-One Onboarding Guide

> **Current State**: Phase 8 Complete (Premium Features Active)
> **Last Updated**: 2025-12-13

## 1. Project Overview
Spark is a high-performance content scaling platform ("Titanium Pro" edition). It leverages Directus (CMS/Data) and Astro/React (Frontend) to deliver enterprise-grade mass content generation.

## 2. Key Architecture
- **Frontend**: Astro (SSR) + React (Interactive Islands).
- **Backend**: Directus Headless CMS (Postgres).
- **Styling**: TailwindCSS (Titanium Pro Design System: Dark Mode, Glassmorphism, Neon Accents).
- **Deployment**: Coolify (Dockerized).

## 3. Core Modules (Implemented)

### 🏭 Factory Floor (`/admin/content/factory`)
The bread and butter of the operation.
- **Components**: `KanbanBoard`, `BulkGrid`.
- **Purpose**: Manage the lifecycle of thousands of articles.

### 🧠 Intelligence Station (`/admin/intelligence`)
Data-driven insights engine.
- **Geospatial Map (`/geo-targeting`)**: visualize market dominance with heatmaps using Leaflet.
- **Trend Analysis**: Analyze keyword volatility.
- **Avatar Metrics**: Track performance by user persona.

### 🧩 Assembler Engine (`/admin/assembler`)
The heart of content generation.
- **Template Composer**: 3-pane editor for Spintax templates.
- **Automation Builder (`/automations/workflow`)**: **[NEW]** Visual Node-based editor (React Flow) to design content pipelines (Trigger -> Generate -> Publish).

### 📊 Command Center (`/admin/analytics`)
- **Metrics Dashboard (`/metrics`)**: **[NEW]** Professional Tremor-based analytics (Area Charts, Donut Charts) tracking traffic and engagement.

### 🛡️ Testing Suite (`/admin/testing`)
- **Visual Editor (`/blocks/editor`)**: Drag-and-drop page builder (Craft.js).
- **SEO/Readability**: Real-time content scoring (Flesch-Kincaid).

## 4. Development Standards

### "Titanium Pro" Design Rules
- **Colors**: Background `#09090b` (Zinc-950), Accents `#eab308` (Yellow-500) and `#22c55e` (Green-500).
- **Components**: Always use **Shadcn/UI** (`/components/ui/*.tsx`).
- **Icons**: Lucide React (`<Edit className="h-4 w-4" />`).
- **Animations**: Use `framer-motion` for complex interactions, or CSS transitions for hover states.

### Code Quality
- **Typescript**: Strict mode. No `any` unless absolutely necessary (and temporarily).
- **Linting**: Run `npm run lint` before committing.
- **Testing**: Use the internal `/admin/testing/suite` to validate logic changes.

## 5. Deployment Workflow
1. **Commit**: `git push` triggers Coolify build.
2. **Build Process**: Dockerfile builds frontend (SSR).
3. **Validation**: Check `https://launch.jumpstartscaling.com` for the live site.
4. **Staging**: Use the "Preview" button in `CollectionManager` to vie draft content at `https://launch.jumpstartscaling.com/site/[id]/preview/[post_id]`.

## 6. Next Actions (Phase 7: Polish)
The logic is done. The next phase is strictly **Polish**:
- [ ] **Accessibility Audit**: Ensure ARIA labels on all new UI.
- [ ] **Documentation**: Expand inline JSDoc for complex engines (`engine.ts`).
- [ ] **Performance**: Optimize React Flow rendering for large graphs.

---
**Note to AI Agent**: You are working on a codebase that is feature-complete for Alpha. Your goal is stability and refinement. Do not refactor core engines without explicit instruction.
