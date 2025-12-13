# 🗺️ SPARK PLATFORM - PAGE DIRECTORY

## 🌐 **Live Site URLs**

### **Frontend (Astro/React)**
**Base URL**: https://launch.jumpstartscaling.com

### **Backend (Directus)**
**Base URL**: https://spark.jumpstartscaling.com

---

## 📄 **All Available Pages**

### 🎯 **Main Dashboard**
- **Command Station** (Mission Control)
  - URL: https://launch.jumpstartscaling.com/admin
  - Component: `SystemMonitor.tsx`
  - Shows: Sub-station status, API health, content integrity

---

### 🏭 **Content Factory**
- **Factory Dashboard**
  - URL: https://launch.jumpstartscaling.com/admin/factory
  - Component: `ContentFactoryDashboard.tsx`
  - Shows: Cartesian engine, article generation

- **Content Factory (Simple)**
  - URL: https://launch.jumpstartscaling.com/admin/content-factory
  - Basic content generation interface

---

### 🌍 **Sites Management**
- **Sites List**
  - URL: https://launch.jumpstartscaling.com/admin/sites
  - Component: `SiteList.tsx`
  - Shows: All managed sites

- **Site Editor**
  - URL: https://launch.jumpstartscaling.com/admin/sites/edit
  - Component: `SiteEditor.tsx`
  - Edit site settings

- **WordPress Importer**
  - URL: https://launch.jumpstartscaling.com/admin/sites/import
  - Component: `WPImporter.tsx`
  - Import content from WordPress

- **Jumpstart Test UI** ⭐
  - URL: https://launch.jumpstartscaling.com/admin/sites/jumpstart
  - Component: `JumpstartWizard.tsx`
  - Interactive dashboard for Phase 6

---

### 📝 **Content Management**

#### **Avatars**
- URL: https://launch.jumpstartscaling.com/admin/content/avatars
- Manage avatar intelligence data

#### **Geo Clusters**
- URL: https://launch.jumpstartscaling.com/admin/content/geo_clusters
- Manage geographic intelligence

#### **Spintax Dictionaries**
- URL: https://launch.jumpstartscaling.com/admin/content/spintax_dictionaries
- Manage content variation dictionaries

#### **Cartesian Patterns**
- URL: https://launch.jumpstartscaling.com/admin/content/cartesian_patterns
- Manage title/hook formulas

#### **Work Log**
- URL: https://launch.jumpstartscaling.com/admin/content/work_log
- View generation work log

---

### 📄 **Pages Management**
- **Pages List**
  - URL: https://launch.jumpstartscaling.com/admin/pages
  - Component: `PageList.tsx`

- **Page Editor**
  - URL: https://launch.jumpstartscaling.com/admin/pages/edit
  - Component: `PageEditor.tsx`

---

### 📰 **Posts Management**
- **Posts List**
  - URL: https://launch.jumpstartscaling.com/admin/posts
  - Component: `PostList.tsx`

- **Post Editor**
  - URL: https://launch.jumpstartscaling.com/admin/posts/edit
  - Component: `PostEditor.tsx`

---

### 👥 **Leads Management**
- **Leads List**
  - URL: https://launch.jumpstartscaling.com/admin/leads
  - Component: `LeadList.tsx`

---

### 🔍 **SEO Tools**

#### **Articles**
- URL: https://launch.jumpstartscaling.com/admin/seo/articles
- Component: `ArticleEditor.tsx`

#### **Campaigns**
- URL: https://launch.jumpstartscaling.com/admin/seo/campaigns
- Component: `CampaignManager.tsx`

#### **Headlines**
- URL: https://launch.jumpstartscaling.com/admin/seo/headlines
- Manage SEO headlines

#### **Fragments**
- URL: https://launch.jumpstartscaling.com/admin/seo/fragments
- Manage SEO content fragments

---

### 🎨 **Media Management**
- **Media Templates**
  - URL: https://launch.jumpstartscaling.com/admin/media/templates
  - Component: `ImageTemplateEditor.tsx`

---

### 📍 **Locations**
- **Location Browser**
  - URL: https://launch.jumpstartscaling.com/admin/locations
  - Component: `LocationBrowser.tsx`

---

### ⚙️ **Settings**
- **General Settings**
  - URL: https://launch.jumpstartscaling.com/admin/settings
  - Platform configuration

---

## 🗄️ **Directus Admin**
- **Directus Dashboard**
  - URL: https://spark.jumpstartscaling.com/admin
  - Login: `somescreenname@gmail.com`
  - Password: `Idk@2025lol`

---

## 📊 **Data Files Available**

All JSON files are now in the Directus container at `/directus/data/`:

1. ✅ `avatar_intelligence.json` (5.4K) - 10 avatars with business niches
2. ✅ `avatar_variants.json` (8.5K) - Male/female/neutral versions
3. ✅ `geo_intelligence.json` (2.1K) - Geographic clusters
4. ✅ `spintax_dictionaries.json` (1.1K) - Content variations
5. ✅ `cartesian_patterns.json` (2.1K) - Title/hook formulas
6. ✅ `offer_blocks_universal.json` (14.1K) - 10 universal offer blocks
7. ✅ `offer_blocks_avatar_personalized.json` (72.3K) - Avatar-specific offers
8. ✅ `offer_blocks_cartesian_engine.json` (1.1K) - Cartesian offer blocks
9. ✅ `master_meta.json` (2.3K) - Global settings

---

## 🚀 **Quick Links**

| Feature | URL |
|---------|-----|
| **Command Station** | https://launch.jumpstartscaling.com/admin |
| **Jumpstart Test** | https://launch.jumpstartscaling.com/admin/sites/jumpstart |
| **Content Factory** | https://launch.jumpstartscaling.com/admin/factory |
| **WordPress Import** | https://launch.jumpstartscaling.com/admin/sites/import |
| **Directus Backend** | https://spark.jumpstartscaling.com/admin |

---

## ✅ **Verification**

All pages are built and deployed. To verify:

```bash
# Check Command Station
curl -k https://launch.jumpstartscaling.com/admin | grep "Mission Control"

# Check Jumpstart Wizard
curl -k https://launch.jumpstartscaling.com/admin/sites/jumpstart | grep "Jumpstart"

# Check Directus
curl -k https://spark.jumpstartscaling.com/admin | grep "Directus"
```

**Everything is LIVE!** 🎉
