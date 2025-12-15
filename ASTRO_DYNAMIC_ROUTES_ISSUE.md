# Astro Dynamic Routes - Critical Issue

**Date:** December 15, 2025  
**Status:** ❌ **NOT WORKING ON PRODUCTION**  
**Priority:** 🔥 **CRITICAL**

---

## 🚨 Problem

All Astro dynamic routes return **404 errors** on the live site:

```
https://spark.jumpstartscaling.com/preview/site/[siteId] → 404
https://spark.jumpstartscaling.com/preview/page/[pageId] → 404
https://spark.jumpstartscaling.com/preview/post/[postId] → 404
https://spark.jumpstartscaling.com/preview/article/[articleId] → 404
```

**Tested URL:** `https://spark.jumpstartscaling.com/preview/site/e7c12533-0fb1-4ae1-8b26-b971988a8e84`  
**Result:** "404: Not found"

---

## 🎯 Why This is Critical

### 1. Preview System Broken
- Can't preview sites before publish
- Can't review generated articles
- Quality control workflow blocked

### 2. Page/Post Rendering Blocked
**Your question:** "The frontend posts and pages are going to have domains pointed to them that never change?"

**Answer:** NO - they use **dynamic routes**:

```typescript
// How it's supposed to work:
/[...slug].astro → Matches ANY path → Renders page/post dynamically

// Examples:
customsite.com/about → Fetches page with slug "about"
customsite.com/blog/article-title → Fetches post with slug "article-title"
customsite.com/services/pricing → Fetches page with slug "services/pricing"
```

**Without dynamic routes working:**
- ❌ Custom domains won't work
- ❌ Every page would need a static file
- ❌ Can't have dynamic content

### 3. Core Architecture Depends on This

The entire platform uses dynamic routing:

```
Frontend Architecture:
├── /[...slug].astro          ← Main catch-all route (pages/posts)
├── /preview/site/[siteId]    ← Site preview
├── /preview/page/[pageId]    ← Page preview
├── /preview/post/[postId]    ← Post preview
└── /preview/article/[id]     ← Article preview
```

**Everything is dynamic** - no static routes except admin pages.

---

## 🔍 Diagnosis

### What We Know:

1. **Files Exist** ✅
   ```
   frontend/src/pages/
   ├── [...slug].astro
   ├── preview/
   │   ├── site/[siteId].astro
   │   ├── page/[pageId].astro
   │   ├── post/[postId].astro
   │   └── article/[articleId].astro
   ```

2. **Code is Correct** ✅
   - Proper Astro dynamic route syntax
   - Correct file naming convention
   - Components render correctly locally

3. **Deployment Failed** ❌
   - Routes return 404 on live site
   - Not in build output or not served correctly

### Possible Causes:

#### 1. SSR Not Enabled
**Issue:** Astro might be building in static mode

**Check:** `astro.config.ts`
```typescript
export default defineConfig({
  output: 'server', // ← Must be 'server' or 'hybrid'
  // NOT 'static'
});
```

**Fix:** Ensure SSR is enabled

#### 2. Adapter Missing
**Issue:** No adapter configured for dynamic routes

**Check:** `astro.config.ts`
```typescript
import node from '@astrojs/node';

export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }) // ← Required for SSR
});
```

**Fix:** Add Node adapter

#### 3. Build Output Missing Routes
**Issue:** Dynamic routes not in `dist/` folder

**Check:** After build, verify:
```bash
ls -la dist/
# Should see server/ or _server/ directory
# NOT just static HTML files
```

**Fix:** Rebuild with correct config

#### 4. Server Not Serving Dynamic Routes
**Issue:** Coolify serving only static files

**Check:** Docker configuration
```yaml
# Should use Node server, not static file server
CMD ["node", "./dist/server/entry.mjs"]
# NOT: python -m http.server
```

**Fix:** Update Docker entrypoint

---

## 🛠️ Solution Steps

### Step 1: Verify Astro Configuration

**File:** `frontend/astro.config.ts`

```typescript
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import react from '@astrojs/react';

export default defineConfig({
  output: 'server', // ✅ CRITICAL: Must be 'server' for dynamic routes
  adapter: node({  // ✅ CRITICAL: Node adapter required
    mode: 'standalone'
  }),
  integrations: [
    react()
  ],
  // ... other config
});
```

**Verify:**
```bash
cd frontend
grep -A 5 "output" astro.config.ts
grep -A 5 "adapter" astro.config.ts
```

---

### Step 2: Check Package Dependencies

**File:** `frontend/package.json`

**Required:**
```json
{
  "dependencies": {
    "astro": "^4.x.x",
    "@astrojs/node": "^8.x.x",  // ✅ CRITICAL
    "@astrojs/react": "^3.x.x"
  }
}
```

**Verify:**
```bash
cd frontend
npm list @astrojs/node
```

**If missing:**
```bash
npm install @astrojs/node
```

---

### Step 3: Rebuild with Correct Settings

```bash
cd frontend

# Clean old build
rm -rf dist/

# Rebuild
npm run build

# Verify output
ls -la dist/
# Should see:
# dist/server/      ← Server-side code
# dist/client/      ← Client assets
# dist/_astro/      ← Optimized assets
```

**Expected output structure:**
```
dist/
├── server/
│   ├── entry.mjs          ← Server entrypoint
│   ├── chunks/            ← Server code chunks
│   └── pages/             ← Compiled pages
├── client/
│   └── _astro/            ← Client assets
└── _astro/                ← Static assets
```

---

### Step 4: Update Docker Configuration

**File:** `frontend/Dockerfile` (or Coolify config)

**Correct configuration:**
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --production

# Copy built files
COPY dist ./dist

# Expose port
EXPOSE 4321

# Run server (NOT static file server)
CMD ["node", "./dist/server/entry.mjs"]
```

**Verify docker-compose.yaml:**
```yaml
frontend:
  build:
    context: ./frontend
  ports:
    - "4321:4321"
  command: node ./dist/server/entry.mjs  # ← Must run node
```

---

### Step 5: Deploy and Test

```bash
# 1. Commit changes
git add frontend/astro.config.ts frontend/package.json
git commit -m "fix: enable SSR for dynamic routes"

# 2. Push to deploy
git push origin main

# 3. Wait for Coolify rebuild

# 4. Test all routes
curl https://spark.jumpstartscaling.com/preview/site/e7c12533-0fb1-4ae1-8b26-b971988a8e84
curl https://spark.jumpstartscaling.com/about  # Test main catch-all
```

**Expected:** Should NOT return 404

---

## 📝 Testing Checklist

After deployment, verify:

- [ ] `/preview/site/[id]` works
- [ ] `/preview/page/[id]` works
- [ ] `/preview/post/[id]` works
- [ ] `/preview/article/[id]` works
- [ ] `/[...slug]` catch-all works
- [ ] Custom domain routing works
- [ ] Static assets load
- [ ] API calls work

---

## 🎯 Impact on Platform

### What Works Now:
- ✅ Admin pages (static routes)
- ✅ API endpoints
- ✅ Database operations

### What's Broken:
- ❌ All preview functionality
- ❌ Dynamic page rendering
- ❌ Custom domain routing
- ❌ Catch-all routes

### What This Blocks:
- ❌ Content review workflow
- ❌ Site customization
- ❌ Multi-domain hosting
- ❌ Production content delivery

---

## 🚀 Priority Actions

1. **IMMEDIATE:** Check `astro.config.ts` - ensure `output: 'server'`
2. **IMMEDIATE:** Add `@astrojs/node` adapter if missing
3. **HIGH:** Rebuild frontend with SSR enabled
4. **HIGH:** Update Docker to run Node server
5. **MEDIUM:** Test all dynamic routes
6. **MEDIUM:** Document deployment process

---

## 📚 References

- [Astro SSR Guide](https://docs.astro.build/en/guides/server-side-rendering/)
- [Astro Node Adapter](https://docs.astro.build/en/guides/integrations-guide/node/)
- [Dynamic Routes](https://docs.astro.build/en/core-concepts/routing/#dynamic-routes)

---

**Status:** 🔴 **CRITICAL - NEEDS IMMEDIATE FIX**  
**Created:** December 15, 2025  
**Priority:** P0 - Blocking core functionality
