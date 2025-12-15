# Preview Links - Implementation Summary

## ⚠️ **DEPLOYMENT STATUS: NOT WORKING ON LIVE SITE**

**Issue:** Preview routes return 404 errors on production  
**Tested:** `https://spark.jumpstartscaling.com/preview/site/e7c12533-0fb1-4ae1-8b26-b971988a8e84`  
**Result:** 404: Not found  
**Cause:** Astro dynamic routes not deployed or not built correctly

**Code Status:** ✅ All files exist in codebase  
**Live Status:** ❌ Returns 404 on production

---

## 📁 Preview Routes Available (In Code)

The Spark Platform has complete preview functionality for all content types:

### 1. **Article Preview**
- **Route:** `/preview/article/[articleId]`
- **File:** `frontend/src/pages/preview/article/[articleId].astro`
- **Features:**
  - Full article rendering with HTML content
  - Metadata display (word count, SEO score, generation hash)
  - Preview banner with status
  - Back to articles link
  - Edit in Directus link

### 2. **Page Preview**
- **Route:** `/preview/page/[pageId]`
- **File:** `frontend/src/pages/preview/page/[pageId].astro`
- **Features:**
  - Block-based content rendering
  - Fallback to HTML content
  - Preview mode banner
  - Close preview button

### 3. **Post Preview**
- **Route:** `/preview/post/[postId]`
- **File:** `frontend/src/pages/preview/post/[postId].astro`
- **Features:**
  - Article content with meta description
  - Published/Draft status badge
  - Copy preview link button
  - Close preview button

### 4. **Site Preview** (NEW!)
- **Route:** `/preview/site/[siteId]`
- **File:** `frontend/src/pages/preview/site/[siteId].astro`
- **Features:**
  - Shows all pages for a site
  - Site metadata (domain, page count, created date)
  - Grid of page cards
  - Click any page to preview it
  - Empty state for sites with no pages

---

## 🔘 Preview Buttons Added

### Sites Manager
**File:** `frontend/src/components/admin/sites/SitesManager.tsx`

**Added:**
- 👁️ **Preview button** on each site card
- Opens `/preview/site/[siteId]` in new tab
- Purple-themed button to stand out
- Located next to "Manage Content" button

**Usage:**
```tsx
<Button 
  variant="outline" 
  size="sm" 
  className="bg-purple-900/30 border-purple-700 hover:bg-purple-800/40 text-purple-300" 
  onClick={() => window.open(`/preview/site/${site.id}`, '_blank')}
>
  👁️ Preview
</Button>
```

### Other Components with Preview
**Kanban Board** (`KanbanBoard.tsx`):
- Preview button for generated articles
- Opens `/preview/article/[id]`

---

## 📋 Preview Links by Content Type

| Content Type | Preview URL | Access From |
|--------------|-------------|-------------|
| **Sites** | `/preview/site/[siteId]` | Sites Manager → Preview button |
| **Pages** | `/preview/page/[pageId]` | Site preview → Click page card |
| **Posts** | `/preview/post/[postId]` | Posts manager (to be added) |
| **Articles** | `/preview/article/[articleId]` | Kanban Board → Preview button |

---

## 🎨 Preview Page Features

### Common Features (All Previews)
- ✅ Preview mode banner at top
- ✅ Status badge (Draft/Published/Active)
- ✅ Close preview button
- ✅ Responsive design
- ✅ Clean, readable styling

### Site Preview Specific
- ✅ Site metadata display
- ✅ Grid of all pages
- ✅ Click-through to page previews
- ✅ Empty state for no pages
- ✅ Page status indicators
- ✅ Permalink display

### Article Preview Specific
- ✅ Full metadata grid
- ✅ Word count
- ✅ SEO score
- ✅ Generation hash
- ✅ Template info
- ✅ Location targeting data

---

## 🔗 How to Use Preview Links

### From Sites Manager:
1. Go to `/admin/sites`
2. Find your site card
3. Click **👁️ Preview** button
4. Opens site preview in new tab
5. Click any page card to preview that page

### From Kanban Board:
1. Go to `/admin/content-factory`
2. Find an article card
3. Click preview icon
4. Opens article preview in new tab

### Direct URL Access:
```
https://launch.jumpstartscaling.com/preview/site/[site-id]
https://launch.jumpstartscaling.com/preview/page/[page-id]
https://launch.jumpstartscaling.com/preview/post/[post-id]
https://launch.jumpstartscaling.com/preview/article/[article-id]
```

---

## 🚀 Next Steps

### To Add Preview Buttons to Other Managers:

**Posts Manager:**
```tsx
<Button onClick={() => window.open(`/preview/post/${post.id}`, '_blank')}>
  👁️ Preview
</Button>
```

**Pages Manager:**
```tsx
<Button onClick={() => window.open(`/preview/page/${page.id}`, '_blank')}>
  👁️ Preview
</Button>
```

**Articles Manager:**
```tsx
<Button onClick={() => window.open(`/preview/article/${article.id}`, '_blank')}>
  👁️ Preview
</Button>
```

---

## 📊 Implementation Status

| Component | Preview Route | Preview Button | Status |
|-----------|---------------|----------------|--------|
| Sites | ✅ `/preview/site/[id]` | ✅ Added | Complete |
| Pages | ✅ `/preview/page/[id]` | ⏳ To add | Route ready |
| Posts | ✅ `/preview/post/[id]` | ⏳ To add | Route ready |
| Articles | ✅ `/preview/article/[id]` | ✅ In Kanban | Complete |

---

## 🎯 Example Preview URLs

**Site Preview:**
```
/preview/site/e7c12533-0fb1-4ae1-8b26-b971988a8e84
```

**Page Preview:**
```
/preview/page/abc123-page-id
```

**Article Preview:**
```
/preview/article/xyz789-article-id
```

---

## 📝 Code Changes

**Files Modified:**
- `frontend/src/components/admin/sites/SitesManager.tsx` - Added preview button

**Files Created:**
- `frontend/src/pages/preview/site/[siteId].astro` - Site preview page

**Existing Preview Routes:**
- `frontend/src/pages/preview/article/[articleId].astro` ✅
- `frontend/src/pages/preview/page/[pageId].astro` ✅
- `frontend/src/pages/preview/post/[postId].astro` ✅

---

**Commit:** `df8dd18` - feat: add preview button to sites and create site preview page  
**Code Status:** ✅ **COMPLETE**  
**Deployment Status:** ❌ **NOT WORKING ON LIVE SITE**

## 🚨 Critical Issue: Astro Dynamic Routes Not Working

**Problem:** All preview routes return 404 on `https://spark.jumpstartscaling.com`

**Why This Matters:**
- Preview functionality is essential for content review
- Dynamic routes are core to the platform architecture
- Pages and posts will use dynamic routing for custom domains

**Next Steps:**
1. Verify Astro build configuration
2. Check if dynamic routes are in build output
3. Redeploy with proper build settings
4. Test all 4 preview routes (site, page, post, article)
