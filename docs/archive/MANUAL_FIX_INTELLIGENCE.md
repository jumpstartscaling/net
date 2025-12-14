# Quick Fix: Add Intelligence Library Fields to Directus

## The Problem
The Intelligence Library pages show empty because the Directus collections are missing the required fields. The frontend components are trying to read fields that don't exist yet.

## Quick Solution (Manual)

Go to your Directus admin panel and add these fields:

### 1. Create `geo_intelligence` Collection (if it doesn't exist)
Settings → Data Model → Create Collection → Name: `geo_intelligence`

Then add these fields:
- `location_key` (String) - Unique identifier
- `city` (String) - City name
- `state` (String) - State code
- `county` (String) - County name (Optional)
- `zip_code` (String) - ZIP code (Optional)
- `population` (Integer) - Population count (Optional)
- `median_income` (Float) - Median income (Optional)
- `keywords` (Text) - Local keywords (Optional)
- `local_modifiers` (Text) - Local phrases (Optional)

### 2. Update `avatar_variants` Collection
Add these fields:
- `avatar_key` (String) - Avatar identifier
- `variant_type` (String) - Type: male, female, or neutral
- `pronoun` (String) - Pronoun set (e.g., he/him)
- `identity` (String) - Full name
- `tone_modifiers` (Text) - Tone adjustments (Optional)

### 3. Update `spintax_dictionaries` Collection
Add these fields:
- `category` (String) - Dictionary category
- `data` (JSON) - Array of terms
- `description` (Text) - Description (Optional)

### 4. Update `cartesian_patterns` Collection
Add these fields:
- `pattern_key` (String) - Pattern identifier
- `pattern_type` (String) - Pattern category
- `formula` (Text) - Pattern formula
- `example_output` (Text) - Example output (Optional)
- `description` (Text) - Description (Optional)

### 5. Update `generation_jobs` Collection (for Jumpstart fix)
Add this field:
- `config` (JSON) - Job configuration

## After Adding Fields

1. Hard refresh your browser: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
2. Visit the Intelligence Library pages
3. Start adding data!

## Automated Script (Alternative)

If you want to run the automated script, you need to set environment variables first:

```bash
export DIRECTUS_ADMIN_EMAIL="insanecorp@gmail.com"
export DIRECTUS_ADMIN_PASSWORD="Idk@ai2026yayhappy"
export DIRECTUS_PUBLIC_URL="https://spark.jumpstartscaling.com"

cd backend
npx ts-node scripts/add_intelligence_fields.ts
```

## Verification

After adding fields, test by:
1. Going to Directus → Content → `geo_intelligence`
2. Click "Create Item"
3. You should see all the new fields
4. Add a test location
5. Go to frontend → Intelligence Library → Geo Intelligence
6. You should see your test data!
