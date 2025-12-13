# 🚨 CRITICAL: ONE LAST STEP TO FIX YOUR DEPLOYMENT

The system is fully deployed, but **Directus blocked access** to the new tables I created for you.

You see "Failed to get stats" or "Error" because the **API Token** doesn't have permission to read the new collections:
- `generated_articles` (SEO Articles)
- `campaign_masters` (SEO Campaigns)
- `headline_inventory`
- `content_fragments`
- `generation_jobs`

---

## 🛠️ HOW TO FIX IT (2 Minutes)

### 1. Log into Directus Admin
- **URL**: https://spark.jumpstartscaling.com/admin
- **Email**: `somescreenname@gmail.com`
- **Password**: `Idk@2025lol`

### 2. Go to Access Control
1. Click **Settings** (Generic gear icon ⚙️ at bottom left)
2. Click **Access Control** (Key icon 🔑)
3. Find the Role associated with your API Token (or the Public role if testing publicly)
   - *Note: If you don't know which role, edit the "Administrator" role or create a new role for the token.*

### 3. Grant Permissions to NEW Collections
You will see a list of collections. Find these 5 new ones (they might be greyed out):

1. **generated_articles** → Click the 🚫 icon to turn it into ✅ (All Access)
2. **campaign_masters** → Click 🚫 → ✅
3. **headline_inventory** → Click 🚫 → ✅
4. **content_fragments** → Click 🚫 → ✅
5. **generation_jobs** → Click 🚫 → ✅

**Make sure "Read" (Eye icon) is enabled for all of them.**

### 4. Verify API Token
Ensure your API Token `oGn-0AZjenB900pfzQYH8zCbFwGw7flU` is using this Role.
1. Go to **User Directory** (Users icon 👥)
2. Find the user attached to the token (or the token itself in Settings > Data Model? No, Settings > Access Control > Tokens?)
3. Actually, just check **Settings > Access Control > Roles**.
   - If you see a role named "API" or similar, check that one.
   - Or just grant **Public** read access if you want it open.

---

## 🔄 REFRESH
Once permissions are granted:
1. Reload https://launch.jumpstartscaling.com/admin/factory
2. It should show "0" instead of "Error" or "0" (ghost).

---

## 📊 STATUS CHECK
- **Database**: ✅ All schema created via SQL
- **Data**: ✅ Intelligence data imported
- **Code**: ✅ Updated to use `generated_articles`
- **Connectivity**: ✅ Fixed Internal URL for SSR
- **Permissions**: ❌ **NEEDS YOUR MANUAL ACTION**

**DO THIS NOW TO UNBLOCK THE API!**
