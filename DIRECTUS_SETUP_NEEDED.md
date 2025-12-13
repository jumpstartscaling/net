# 🔧 DIRECTUS SETUP - WHAT'S NEEDED

## ✅ **What's Already Done**

1. ✅ **Directus is running** and healthy
2. ✅ **Collections created**:
   - `sites` - WordPress sites
   - `posts` - Generated content
   - `pages` - Static pages  
   - `leads` - Lead capture
   - `avatar_intelligence` - Avatar data

3. ✅ **JSON Data Files** in container at `/directus/data/`:
   - avatar_intelligence.json (5.4K)
   - avatar_variants.json (8.5K)
   - geo_intelligence.json (2.1K)
   - spintax_dictionaries.json (1.1K)
   - cartesian_patterns.json (2.1K)
   - offer_blocks_universal.json (14.1K)
   - offer_blocks_avatar_personalized.json (72.3K)
   - offer_blocks_cartesian_engine.json (1.1K)
   - master_meta.json (2.3K)

4. ✅ **API Token**: `oGn-0AZjenB900pfzQYH8zCbFwGw7flU`

---

## ❌ **What Needs to Be Done in Directus UI**

The API token doesn't have permission to create fields, so you need to finish the schema setup manually.

### **Step 1: Log into Directus**
- URL: https://spark.jumpstartscaling.com/admin
- Email: `somescreenname@gmail.com`
- Password: `Idk@2025lol`

---

### **Step 2: Add Fields to Collections**

#### **For `sites` collection:**
1. Go to Settings → Data Model → `sites`
2. Add these fields:
   - `id` (UUID, Primary Key, Auto-generate)
   - `name` (String, Required)
   - `url` (String, Required)
   - `wp_username` (String)
   - `wp_app_password` (String, Hidden)
   - `status` (Dropdown: active, paused, archived)
   - `created_at` (Timestamp, Auto-create)

#### **For `posts` collection:**
1. Go to Settings → Data Model → `posts`
2. Add these fields:
   - `id` (UUID, Primary Key, Auto-generate)
   - `title` (String, Required)
   - `content` (WYSIWYG/Rich Text)
   - `excerpt` (Text)
   - `status` (Dropdown: draft, published)
   - `site_id` (Many-to-One relationship to `sites`)
   - `avatar_key` (String)
   - `created_at` (Timestamp, Auto-create)

#### **For `pages` collection:**
1. Go to Settings → Data Model → `pages`
2. Add these fields:
   - `id` (UUID, Primary Key, Auto-generate)
   - `title` (String, Required)
   - `slug` (String, Required, Unique)
   - `content` (WYSIWYG/Rich Text)
   - `site_id` (Many-to-One relationship to `sites`)
   - `status` (Dropdown: draft, published)

#### **For `leads` collection:**
1. Go to Settings → Data Model → `leads`
2. Add these fields:
   - `id` (UUID, Primary Key, Auto-generate)
   - `email` (String, Required)
   - `name` (String)
   - `phone` (String)
   - `source` (String)
   - `site_id` (Many-to-One relationship to `sites`)
   - `created_at` (Timestamp, Auto-create)

#### **For `avatar_intelligence` collection:**
1. Go to Settings → Data Model → `avatar_intelligence`
2. Add these fields:
   - `id` (Integer, Primary Key, Auto-increment)
   - `avatar_key` (String, Required, Unique)
   - `base_name` (String)
   - `wealth_cluster` (String)
   - `business_niches` (JSON)
   - `data` (JSON) - Full avatar data

---

### **Step 3: Import JSON Data**

#### **Option A: Via Directus UI (Recommended)**
1. Go to each collection
2. Click "Import" button
3. Upload the corresponding JSON file from your local `backend/data/` folder

#### **Option B: Via SSH (Advanced)**
```bash
# SSH into the server
ssh root@72.61.15.216

# Access the Directus container
docker exec -it directus-i8cswkos04c4s08404ok0ws4-022108320046 bash

# Files are at /directus/data/
ls -la /directus/data/

# Use Directus CLI or API to import
# (You'll need to write a custom import script)
```

---

### **Step 4: Set Permissions**

1. Go to Settings → Access Control → Public Role
2. Enable read access for:
   - `posts` (published only)
   - `pages` (published only)
   - `sites` (basic info only)

3. For the API token role:
   - Enable full CRUD access to all collections
   - This allows the frontend to create/read/update/delete

---

### **Step 5: Test the API**

After setup, test with:

```bash
# List sites
curl -H "Authorization: Bearer oGn-0AZjenB900pfzQYH8zCbFwGw7flU" \
  https://spark.jumpstartscaling.com/items/sites

# List posts
curl -H "Authorization: Bearer oGn-0AZjenB900pfzQYH8zCbFwGw7flU" \
  https://spark.jumpstartscaling.com/items/posts

# Create a test site
curl -X POST \
  -H "Authorization: Bearer oGn-0AZjenB900pfzQYH8zCbFwGw7flU" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Site", "url": "https://example.com", "status": "active"}' \
  https://spark.jumpstartscaling.com/items/sites
```

---

## 🎯 **After Setup is Complete**

Once the schema is set up and data is imported:

1. ✅ **Jumpstart Wizard** will be fully functional
   - https://launch.jumpstartscaling.com/admin/sites/jumpstart

2. ✅ **Command Station** will show real data
   - https://launch.jumpstartscaling.com/admin

3. ✅ **Content Factory** will generate with real avatars
   - https://launch.jumpstartscaling.com/admin/factory

4. ✅ **All admin pages** will connect to Directus

---

## 📚 **Quick Reference**

### **Directus Admin**
- URL: https://spark.jumpstartscaling.com/admin
- Email: `somescreenname@gmail.com`
- Password: `Idk@2025lol`

### **API Token**
```
oGn-0AZjenB900pfzQYH8zCbFwGw7flU
```

### **Collections Created**
- ✅ sites
- ✅ posts
- ✅ pages
- ✅ leads
- ✅ avatar_intelligence

### **Data Files Ready**
- ✅ All 9 JSON files in `/directus/data/`

---

## ⏭️ **Next Steps**

1. **Log into Directus UI** and add fields to collections (15 minutes)
2. **Import JSON data** via UI or API (5 minutes)
3. **Set permissions** for API token (5 minutes)
4. **Test the Jumpstart Wizard** (it will work!)

**Total time: ~25 minutes to complete setup** ⏱️
