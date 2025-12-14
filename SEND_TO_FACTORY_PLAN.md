# SEND TO FACTORY - Feature Implementation Plan

## 🎯 Concept

A **one-click "Send to Factory" button** that appears on:
1. Individual WordPress posts/pages
2. Bulk selection of articles
3. Jumpstart QC review screen

This button triggers the Spark Content Factory to:
- Fetch the content
- Apply Intelligence Library transformations
- Generate optimized version
- Save to Directus
- Optionally publish back to WordPress

---

## 📋 Current State vs. Desired State

### Current (What We Just Did Manually):
1. Fetch post from WordPress API
2. Create generation job in Directus
3. Call `/api/seo/generate-article` endpoint
4. Save to `generated_articles` collection
5. View in preview page

### Desired (Push Button):
1. Click "Send to Factory" button
2. Select options (template, location, mode)
3. System handles everything automatically
4. Get notification when complete
5. Preview/publish with one click

---

## 🏗️ Implementation Plan

### Phase 1: Backend API Endpoint

**Create**: `/api/factory/send-to-factory`

**Request Body**:
```json
{
  "source": {
    "type": "wordpress",
    "url": "https://chrisamaya.work",
    "postId": 5711,
    "auth": "base64_encoded_credentials"
  },
  "options": {
    "template": "long_tail_seo",
    "location": "Austin, TX",
    "mode": "refactor",
    "autoPublish": false,
    "targetSite": "chrisamaya.work"
  }
}
```

**Response**:
```json
{
  "success": true,
  "jobId": "uuid",
  "articleId": "uuid",
  "previewUrl": "/preview/article/uuid",
  "status": "processing"
}
```

---

### Phase 2: Frontend Components

#### 1. SendToFactoryButton Component
**Location**: `src/components/admin/factory/SendToFactoryButton.tsx`

**Features**:
- Primary action button
- Shows loading state
- Displays success/error messages
- Opens modal for options

#### 2. FactoryOptionsModal Component
**Location**: `src/components/admin/factory/FactoryOptionsModal.tsx`

**Options**:
- Template selection (dropdown)
- Location targeting (autocomplete from geo_intelligence)
- Mode (Refactor, Rewrite, Enhance)
- Auto-publish toggle
- Preview before publish toggle

#### 3. BulkFactoryPanel Component
**Location**: `src/components/admin/factory/BulkFactoryPanel.tsx`

**Features**:
- Select multiple articles
- Apply same template to all
- Queue management
- Progress tracking
- Batch preview

---

### Phase 3: Integration Points

#### A. Jumpstart QC Screen
**Location**: `src/components/admin/jumpstart/JumpstartWizard.tsx`

**Add**:
- "Send to Factory" button on each QC item
- Bulk "Send All to Factory" button
- Individual article options

**Code Addition**:
```tsx
<Button 
  onClick={() => handleSendToFactory(qcItem)}
  className="bg-purple-600 hover:bg-purple-500"
>
  🏭 Send to Factory
</Button>
```

#### B. Generated Articles List
**Location**: `src/pages/admin/content/generated-articles.astro`

**Add**:
- "Regenerate" button (send back to factory)
- "Create Variation" button (new version)
- Bulk actions toolbar

#### C. WordPress Post Browser (New Page)
**Location**: `src/pages/admin/wordpress/posts.astro` (TO CREATE)

**Features**:
- Browse WordPress posts
- Search and filter
- Checkbox selection
- "Send to Factory" button
- Shows which posts already processed

---

### Phase 4: Queue Management

#### FactoryQueue Component
**Location**: `src/components/admin/factory/FactoryQueue.tsx`

**Features**:
- Real-time queue status
- Pause/resume processing
- Cancel jobs
- Reorder priority
- View logs

**Data Source**: `generation_jobs` collection

---

## 📄 Complete Frontend Page Audit

### Admin Pages - Status Report

#### ✅ WORKING PAGES

##### 1. Dashboard & Overview
- **`/admin`** - Main dashboard
  - Status: ✅ Working
  - Shows: System status, recent activity
  - Actions: Navigate to other sections

##### 2. Sites Management
- **`/admin/sites`** - Sites list
  - Status: ✅ Working
  - Shows: All connected WordPress sites
  - Actions: Add, edit, delete sites

- **`/admin/sites/jumpstart`** - Jumpstart wizard
  - Status: ✅ Working (after deployment)
  - Shows: 4-step workflow (Connect, Inventory, QC, Launch)
  - Actions: Import WordPress content
  - **NEEDS**: "Send to Factory" buttons on QC items

##### 3. Content Factory
- **`/admin/content/factory`** - Factory dashboard
  - Status: ✅ Working
  - Shows: Generation stats, queue status
  - Actions: View jobs, monitor progress

- **`/admin/content/generated-articles`** - Generated articles list
  - Status: ✅ Working
  - Shows: All generated articles
  - Actions: View, edit, delete
  - **NEEDS**: "Send to Factory" (regenerate) button

##### 4. Intelligence Library

- **`/admin/content/avatars`** - Avatar Intelligence
  - Status: ✅ Working
  - Shows: 10 base avatars + variants
  - Actions: View, manage avatars
  - Data: Loaded from `avatar_intelligence` + `avatar_variants`

- **`/admin/content/geo_clusters`** - Geo Intelligence
  - Status: ✅ Working
  - Shows: 3 geographic clusters + cities
  - Actions: View locations
  - Data: 3 clusters (Silicon Valleys, Wall Street, Growth Havens)

- **`/admin/collections/spintax-dictionaries`** - Spintax
  - Status: ✅ Working
  - Shows: 12 dictionaries, 62 terms
  - Actions: View term lists
  - Data: Quality adjectives, verbs, outcomes, timelines

- **`/admin/collections/cartesian-patterns`** - Patterns
  - Status: ✅ Working
  - Shows: 3 pattern categories
  - Actions: View formulas
  - Data: Long-tail SEO, local hooks, intent-based

##### 5. Collections Management
- **`/admin/collections/campaign-masters`**
  - Status: ✅ Working
  - Shows: Campaign templates
  - Actions: Manage campaigns

- **`/admin/collections/content-fragments`**
  - Status: ✅ Working
  - Shows: Reusable content blocks
  - Actions: Manage fragments

- **`/admin/collections/generation-jobs`**
  - Status: ✅ Working
  - Shows: All generation jobs
  - Actions: View status, cancel jobs
  - **NEEDS**: Better queue management UI

- **`/admin/collections/headline-inventory`**
  - Status: ✅ Working
  - Shows: Pre-generated headlines
  - Actions: Browse, use headlines

- **`/admin/collections/offer-blocks`**
  - Status: ✅ Working
  - Shows: Offer templates
  - Actions: Manage offers

##### 6. System & Logs
- **`/admin/content/work_log`** - Work log
  - Status: ✅ Working
  - Shows: System activity log
  - Actions: View events, filter logs

---

#### ❌ MISSING PAGES (Need to Create)

##### 1. WordPress Integration
- **`/admin/wordpress/posts`** - WordPress post browser
  - Status: ❌ MISSING
  - Should Show: All WordPress posts from connected sites
  - Should Have: 
    - Search/filter
    - Checkbox selection
    - "Send to Factory" button
    - Status indicators (processed/not processed)

- **`/admin/wordpress/pages`** - WordPress pages browser
  - Status: ❌ MISSING
  - Same features as posts browser

##### 2. Factory Management
- **`/admin/factory/queue`** - Queue management
  - Status: ❌ MISSING
  - Should Show: Active jobs, pending, completed
  - Should Have:
    - Pause/resume
    - Priority reordering
    - Bulk actions

- **`/admin/factory/templates`** - Template manager
  - Status: ❌ MISSING
  - Should Show: All article templates
  - Should Have: Create, edit, preview templates

##### 3. Publishing
- **`/admin/publishing/schedule`** - Publishing calendar
  - Status: ❌ MISSING
  - Should Show: Scheduled publications
  - Should Have: Drag-drop scheduling

- **`/admin/publishing/history`** - Publishing history
  - Status: ❌ MISSING
  - Should Show: All published articles
  - Should Have: Success/failure tracking

---

## 🎯 Priority Implementation Order

### Phase 1 (Immediate - This Week)
1. ✅ Create `/api/factory/send-to-factory` endpoint
2. ✅ Create `SendToFactoryButton` component
3. ✅ Create `FactoryOptionsModal` component
4. ✅ Add button to Jumpstart QC screen
5. ✅ Test end-to-end workflow

### Phase 2 (Next Week)
1. ✅ Create WordPress post browser page
2. ✅ Add bulk selection functionality
3. ✅ Create `BulkFactoryPanel` component
4. ✅ Add to generated articles list

### Phase 3 (Following Week)
1. ✅ Create factory queue management page
2. ✅ Add real-time status updates
3. ✅ Implement pause/resume
4. ✅ Add priority management

### Phase 4 (Future)
1. ✅ Publishing calendar
2. ✅ Template manager
3. ✅ Analytics dashboard
4. ✅ A/B testing interface

---

## 🔧 Technical Requirements

### New API Endpoints Needed
1. `POST /api/factory/send-to-factory` - Main factory trigger
2. `GET /api/factory/queue` - Get queue status
3. `POST /api/factory/queue/:id/pause` - Pause job
4. `POST /api/factory/queue/:id/resume` - Resume job
5. `POST /api/factory/queue/:id/cancel` - Cancel job
6. `GET /api/wordpress/posts` - Browse WordPress posts
7. `POST /api/wordpress/publish` - Publish to WordPress

### New Components Needed
1. `SendToFactoryButton.tsx`
2. `FactoryOptionsModal.tsx`
3. `BulkFactoryPanel.tsx`
4. `FactoryQueue.tsx`
5. `WordPressPostBrowser.tsx`
6. `PublishingCalendar.tsx`

### Database Updates Needed
1. Add `processed` boolean to track which WP posts are done
2. Add `priority` field to `generation_jobs`
3. Add `publishing_schedule` collection
4. Add `factory_settings` collection

---

## 📊 User Workflow Examples

### Example 1: Single Post to Factory
1. Go to `/admin/wordpress/posts`
2. Find post "Trust-Based Automation..."
3. Click "Send to Factory" button
4. Modal opens with options
5. Select template: "Long-Tail SEO"
6. Select location: "Austin, TX"
7. Click "Generate"
8. Get notification: "Article queued"
9. View in queue: `/admin/factory/queue`
10. When complete, click "Preview"
11. Review article
12. Click "Publish to WordPress"

### Example 2: Bulk Processing
1. Go to `/admin/sites/jumpstart`
2. Connect to WordPress
3. Scan 1456 posts
4. Review QC batch (3 posts)
5. Click "Send All to Factory"
6. Select bulk options
7. Click "Process Batch"
8. Monitor in queue
9. Preview all when complete
10. Bulk publish or schedule

### Example 3: Regenerate Existing
1. Go to `/admin/content/generated-articles`
2. Find article with low SEO score
3. Click "Regenerate"
4. Select different template
5. Generate new version
6. Compare side-by-side
7. Choose best version
8. Publish

---

## ✅ Summary

### What Exists Now:
- ✅ All Intelligence Library pages working
- ✅ Jumpstart wizard functional
- ✅ Article generation API working
- ✅ Preview system working
- ✅ Generated articles list working

### What Needs to Be Added:
- ❌ "Send to Factory" buttons throughout UI
- ❌ Factory options modal
- ❌ WordPress post browser
- ❌ Queue management page
- ❌ Bulk processing UI
- ❌ Publishing calendar

### Estimated Development Time:
- **Phase 1** (Core functionality): 2-3 days
- **Phase 2** (WordPress browser): 2 days
- **Phase 3** (Queue management): 2 days
- **Phase 4** (Publishing features): 3-4 days

**Total**: ~2 weeks for complete "Send to Factory" system

---

## 🚀 Next Steps

1. Review this plan
2. Approve Phase 1 implementation
3. I'll create the components
4. Test with chrisamaya.work
5. Deploy and iterate

**Ready to start Phase 1?** 🏭
