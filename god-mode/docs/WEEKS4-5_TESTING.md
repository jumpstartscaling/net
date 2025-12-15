# Week 4 & 5: Operations & UI - Testing Guide

## Week 4: Operations Endpoints

### 1. Mechanic Execute
**File:** `src/pages/api/god/mechanic/execute.ts`

Test kill-locks:
```bash
curl -X POST http://localhost:4321/api/god/mechanic/execute \
  -H "X-God-Token: YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action": "kill-locks"}'
```

Test vacuum:
```bash
curl -X POST http://localhost:4321/api/god/mechanic/execute \
  -H "X-God-Token: YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action": "vacuum", "table": "posts"}'
```

### 2. System Config (Redis)
**File:** `src/pages/api/god/system/config.ts`

Set config:
```bash
curl -X POST http://localhost:4321/api/god/system/config \
  -H "X-God-Token: YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "throttle_delay_ms": 100,
    "max_concurrency": 64,
    "max_cost_per_hour": 50,
    "enable_auto_throttle": true,
    "memory_threshold_pct": 85
  }'
```

Get config:
```bash
curl http://localhost:4321/api/god/system/config \
  -H "X-God-Token: YOUR_TOKEN"
```

### 3. Live Logs
**File:** `src/pages/api/god/logs.ts`

```bash
curl "http://localhost:4321/api/god/logs?lines=50" \
  -H "X-God-Token: YOUR_TOKEN"
```

---

## Week 5: UI Components

### 1. Resource Monitor (Recharts)
**Component:** `src/components/admin/ResourceMonitor.tsx`

**Features:**
- Real-time CPU/RAM charts
- 2-minute history (60 data points)
- Auto-refresh every 2s
- Color-coded areas (blue=CPU, purple=RAM)

**Usage in page:**
```tsx
import ResourceMonitor from '@/components/admin/ResourceMonitor';

<ResourceMonitor client:load />
```

### 2. Campaign Map (Leaflet)
**Component:** `src/components/admin/CampaignMap.tsx`

**Features:**
- OpenStreetMap tiles
- Color-coded markers (green=generated, blue=pending)
- Popup with location details
- Fetches from geo_locations table

**Usage in page:**
```tsx
import CampaignMap from '@/components/admin/CampaignMap';

<CampaignMap client:load />
```

### 3. Tailwind Configuration
**File:** `tailwind.config.mjs`

Ensure proper dark mode and Shadcn/UI integration.

---

## Integration Steps

### Add ResourceMonitor to Admin Dashboard
```astro
---
// src/pages/admin/index.astro
import ResourceMonitor from '@/components/admin/ResourceMonitor';
---

<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <ResourceMonitor client:load />
  <!-- Other dashboard components -->
</div>
```

### Add CampaignMap to Geo-Intelligence Page
```astro
---
// src/pages/admin/intelligence/geo.astro
import CampaignMap from '@/components/admin/CampaignMap';
---

<CampaignMap client:load />
```

---

## Success Criteria

- ✅ Mechanic operations complete without errors
- ✅ System config persists in Redis
- ✅ Logs stream database activity
- ✅ ResourceMonitor shows live charts
- ✅ CampaignMap displays locations
- ✅ Dark mode styling consistent

---

## Weeks 4 & 5 Complete! 🎉
