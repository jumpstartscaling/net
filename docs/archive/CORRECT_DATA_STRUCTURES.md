# Intelligence Library - Correct Data Structure

## ✅ Actual Data Structures in Directus

### 1. Geo Intelligence
**Collections**: `geo_clusters` + `geo_locations`

**Structure**:
```json
{
  "geo_clusters": {
    "id": 1,
    "cluster_name": "The Growth Havens"
  },
  "geo_locations": [
    {
      "id": 1,
      "city": "Miami",
      "state": "FL",
      "neighborhood": "Coral Gables",
      "cluster": 1
    }
  ]
}
```

**Fields Needed**:
- `geo_clusters`: cluster_name
- `geo_locations`: city, state, zip_focus, neighborhood, cluster (FK)

**Status**: ✅ Collections exist, just need data imported

---

### 2. Spintax Dictionaries
**Collection**: `spintax_dictionaries`

**Structure**:
```json
{
  "category": "adjectives_quality",
  "words": ["Top-Rated", "Premier", "Elite"]
}
```

**Fields Needed**:
- category (string)
- words (json array)

**Status**: ⚠️ Need to check if `words` field exists (might be `data`)

---

### 3. Cartesian Patterns
**Collection**: `cartesian_patterns`

**Structure**:
```json
{
  "pattern_id": "geo_dominance",
  "category": "long_tail_seo_headlines",
  "formula": "{adjectives_quality} {{NICHE}} in {{CITY}}",
  "example_output": "Premier Marketing in Miami"
}
```

**Fields Needed**:
- pattern_id (string)
- category (string)
- formula (text)
- example_output (text) - optional

**Status**: ⚠️ Need to verify field names

---

## 🔧 What Needs to Be Fixed

### Option 1: Use Existing Data (Recommended)
The data already exists in `/backend/data/` JSON files. Just need to:
1. Run the schema init script to import it
2. Update frontend components to match actual field names

### Option 2: Manual Import
1. Go to Directus admin
2. Import the JSON data manually
3. Verify field names match

---

## 🚀 Quick Fix Command

```bash
cd /Users/christopheramaya/Downloads/spark/backend
npx ts-node scripts/init_schema.ts
```

This will:
- Create all collections
- Add all fields
- Import all data from JSON files

---

## ✅ Updated Components

I've updated `GeoIntelligenceManager.tsx` to work with the actual cluster/location structure.

Still need to verify:
- Spintax field name (`words` vs `data`)
- Cartesian field names
- Avatar Variants structure

---

## 📝 Next Steps

1. Run `init_schema.ts` to import data
2. Check Directus to see what fields actually exist
3. Update remaining components to match
4. Test all pages
