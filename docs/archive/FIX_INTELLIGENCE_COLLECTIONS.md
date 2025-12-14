# Fix Intelligence Library Collections

## Problem
The Intelligence Library pages don't work on launch because the Directus collections are missing the required fields.

## Collections Affected
1. `geo_intelligence` - Missing entirely or has wrong fields
2. `avatar_variants` - Has wrong field structure
3. `spintax_dictionaries` - Missing `data` field
4. `cartesian_patterns` - Missing proper fields

## Solution

Run the field migration script to add all missing fields:

```bash
cd backend
npx ts-node scripts/add_intelligence_fields.ts
```

## What It Does

The script will:
1. Connect to your Directus instance
2. Add missing fields to each collection:
   - **geo_intelligence**: location_key, city, state, county, zip_code, population, median_income, keywords, local_modifiers
   - **avatar_variants**: avatar_key, variant_type, pronoun, identity, tone_modifiers
   - **spintax_dictionaries**: category, data, description
   - **cartesian_patterns**: pattern_key, pattern_type, formula, example_output, description
   - **generation_jobs**: config field for Jumpstart fix

## After Running

1. Hard refresh your browser (Cmd+Shift+R or Ctrl+Shift+R)
2. Visit the Intelligence Library pages
3. They should now work and allow you to add data!

## Manual Alternative

If you prefer to add fields manually in Directus:

1. Go to Settings → Data Model
2. For each collection, add the fields listed above
3. Use the correct field types (string, text, json, integer, float)
