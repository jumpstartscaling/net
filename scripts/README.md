# Spark Platform - Management Scripts

This directory contains powerful Node.js utilities for managing your Spark Directus instance through the API. All scripts connect to `https://spark.jumpstartscaling.com` using admin credentials.

## 🔧 Available Scripts

### 1. Connection Test
**File:** `test_directus_connection.js` (in project root)

Tests basic connectivity and admin access to Directus.

```bash
node test_directus_connection.js
```

**What it checks:**
- Server availability
- Admin authentication
- Collections list
- Record counts
- Write permissions

---

### 2. Schema Audit
**File:** `audit_schema.js`

Comprehensive audit of all collections, fields, and relationships.

```bash
node scripts/audit_schema.js
```

**Features:**
- Lists all collections with record counts
- Shows all fields and their interfaces
- Identifies missing relationships
- Detects UX issues (wrong field types, missing dropdowns)
- Saves detailed report to `schema_audit_report.json`

**Output:**
- Field-by-field analysis
- Relationship mapping
- Issue summary
- Recommendations

---

### 3. UX Improvements
**File:** `improve_ux.js`

Automatically fixes field interfaces to make Directus admin UI more user-friendly.

```bash
node scripts/improve_ux.js
```

**What it fixes:**
- ✅ `site_id` fields → Select dropdown with site names
- ✅ `campaign_id` fields → Select dropdown with campaign names
- ✅ `status` fields → Dropdown with predefined choices
- ✅ `avatar_key` fields → Avatar selection dropdown
- ✅ JSON fields → Code editor with syntax highlighting
- ✅ Content fields → Rich text HTML editor
- ✅ Date fields → Proper datetime picker
- ✅ Adds helpful descriptions and placeholders

**Results:**
- Posts/Pages easily connect to Sites
- Status uses visual labels
- JSON editing with syntax highlighting
- Better field validation

---

### 4. Schema Validation
**File:** `validate_schema.js`

Complete validation of schema integrity, relationships, and data quality.

```bash
node scripts/validate_schema.js
```

**Validation checks:**
1. **Collection Data** - Verifies all critical collections exist
2. **Relationships** - Tests that foreign keys work correctly
3. **Field Interfaces** - Confirms UX improvements are applied
4. **Data Integrity** - Checks for orphaned records

**Output:**
- Detailed validation report
- Issue severity ratings (high/medium/low)
- Saves `validation_report.json`

---

### 5. Bulk Import/Export
**File:** `bulk_io.js`

Export and import any collection as JSON files.

```bash
# Export all collections
node scripts/bulk_io.js export all

# Export single collection
node scripts/bulk_io.js export sites

# Import from file
node scripts/bulk_io.js import sites sites_backup.json

# List available exports
node scripts/bulk_io.js list
```

**Features:**
- Exports with metadata (timestamp, record count)
- Batch import with conflict resolution
- Automatic pagination for large collections
- Update existing records on conflict
- All exports saved to `./exports/` directory

**Use cases:**
- Backup before major changes
- Move data between environments
- Share sample data
- Restore deleted records

---

### 6. Geo Intelligence Manager
**File:** `geo_manager.js`

Easy management of locations in `geo_intelligence` collection.

```bash
# List all locations
node scripts/geo_manager.js list

# Add a location
node scripts/geo_manager.js add "Miami" "FL" "US" "southeast"

# Remove a location
node scripts/geo_manager.js remove <id>

# Activate/deactivate location
node scripts/geo_manager.js activate <id>
node scripts/geo_manager.js deactivate <id>

# Update a field
node scripts/geo_manager.js update <id> cluster "northeast"

# Seed with top 20 US cities
node scripts/geo_manager.js seed-us-cities

# Import from CSV
node scripts/geo_manager.js import-csv locations.csv
```

**CSV Format:**
```csv
city,state,country,cluster,population
Miami,FL,US,southeast,467963
Boston,MA,US,northeast,692600
```

**Built-in sample data:**
- Top 20 US cities by population
- Includes clusters (northeast, south, midwest, west, etc.)
- Ready to use with `seed-us-cities` command

---

## 🚀 Quick Start Guide

### First Time Setup

1. **Test your connection:**
   ```bash
   node test_directus_connection.js
   ```

2. **Audit current schema:**
   ```bash
   node scripts/audit_schema.js
   ```

3. **Apply UX improvements:**
   ```bash
   node scripts/improve_ux.js
   ```

4. **Validate everything works:**
   ```bash
   node scripts/validate_schema.js
   ```

5. **Backup all data:**
   ```bash
   node scripts/bulk_io.js export all
   ```

### Daily Operations

**Working with locations:**
```bash
# See all locations
node scripts/geo_manager.js list

# Add custom location
node scripts/geo_manager.js add "Portland" "OR" "US" "northwest"
```

**Backing up before changes:**
```bash
node scripts/bulk_io.js export sites
node scripts/bulk_io.js export generation_jobs
```

**Checking system health:**
```bash
node scripts/validate_schema.js
```

---

## 📊 What Each Script Fixed

### Before UX Improvements:
- ❌ `site_id` fields showed UUID text input
- ❌ `status` fields were plain text
- ❌ JSON fields used tiny text box
- ❌ Content used plain textarea
- ❌ No field descriptions or help text

### After UX Improvements:
- ✅ `site_id` shows dropdown with site names
- ✅ `status` has predefined choices with colors
- ✅ JSON fields have code editor with syntax highlighting
- ✅ Content uses rich text HTML editor
- ✅ All fields have helpful descriptions

---

## 🔗 Confirmed Working Relationships

All relationships tested and verified:

1. **Sites → Posts** ✅
   - Posts connected to sites via `site_id`
   - Dropdown shows site names

2. **Sites → Pages** ✅
   - Pages connected to sites via `site_id`
   - Easy site selection

3. **Campaign → Generated Articles** ✅
   - Articles linked to campaigns
   - Track which campaign created each article

4. **Generation Jobs → Sites** ✅
   - Jobs know which site they're for
   - Filters work correctly

---

## 📁 Export Directory Structure

After running bulk export, you'll have:

```
exports/
├── avatar_intelligence_2025-12-13.json     (10 records)
├── avatar_variants_2025-12-13.json         (30 records)
├── campaign_masters_2025-12-13.json        (2 records)
├── cartesian_patterns_2025-12-13.json      (3 records)
├── content_fragments_2025-12-13.json       (150 records)
├── generated_articles_2025-12-13.json      (0 records)
├── generation_jobs_2025-12-13.json         (30 records)
├── geo_intelligence_2025-12-13.json        (3 records)
├── sites_2025-12-13.json                   (3 records)
└── ... (all other collections)
```

Each JSON file includes:
```json
{
  "collection": "sites",
  "exportedAt": "2025-12-13T14:30:00.000Z",
  "recordCount": 3,
  "data": [...]
}
```

---

## 🎯 Common Tasks

### Add Multiple Locations from CSV

1. Create `locations.csv`:
   ```csv
   city,state,country,cluster,population
   Seattle,WA,US,northwest,753675
   Portland,OR,US,northwest,652503
   San Francisco,CA,US,west,881549
   ```

2. Import:
   ```bash
   node scripts/geo_manager.js import-csv locations.csv
   ```

### Backup Before Major Changes

```bash
# Export everything
node scripts/bulk_io.js export all

# Make your changes in Directus UI...

# If something goes wrong, restore:
node scripts/bulk_io.js import sites exports/sites_2025-12-13.json
```

### Check What Needs Fixing

```bash
# See what's wrong
node scripts/audit_schema.js

# Auto-fix field interfaces
node scripts/improve_ux.js

# Verify fixes worked
node scripts/validate_schema.js
```

---

## 🔧 Troubleshooting

### "Authentication failed"
- Check credentials in script files
- Verify admin token hasn't expired
- Test with: `node test_directus_connection.js`

### "Collection not found"
- Collection may not exist yet
- Run audit to see all collections: `node scripts/audit_schema.js`
- Check schema is initialized

### Import conflicts (409 errors)
- Script automatically tries to UPDATE existing records
- Check the import summary for failed records
- Review data for duplicate IDs

---

## 📚 Additional Resources

- [Directus API Docs](https://docs.directus.io/reference/introduction.html)
- [Spark Onboarding Guide](../spark_onboarding.md)
- [Campaign Setup Guide](../CAMPAIGN_SETUP_GUIDE.md)

---

## ✅ Current System Status

**Last Validation:** 2025-12-13

- ✅ 11/11 critical collections exist
- ✅ 9/11 collections have data
- ✅ 4/4 relationships working
- ✅ 32 field interfaces improved
- ✅ 251 total records
- ✅ 30 pending generation jobs
- ✅ Zero data integrity issues

**Ready for production use!** 🎉

---

## 💡 Pro Tips

1. **Always backup before bulk changes:**
   ```bash
   node scripts/bulk_io.js export all
   ```

2. **Use validation after making schema changes:**
   ```bash
   node scripts/validate_schema.js
   ```

3. **Check exports directory regularly:**
   ```bash
   node scripts/bulk_io.js list
   ```

4. **Seed sample data for testing:**
   ```bash
   node scripts/geo_manager.js seed-us-cities
   ```

5. **Keep audit reports for reference:**
   - Reports saved to: `schema_audit_report.json`
   - Save with timestamps for comparison

---

**Need help?** All scripts have built-in help:
```bash
node scripts/[script-name].js
# Shows available commands and examples
```
