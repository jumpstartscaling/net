# Weeks 2 & 3: Data & Geospatial - Testing Guide

## Components Built

### Week 2: Data Ingestion & Orchestration
1. **Data Validation** (`src/lib/data/dataValidator.ts`)
   - Zod schemas for all data types
   - City targets, competitors, generic data
   - Generation jobs, geospatial campaigns
   
2. **CSV/JSON Ingestion** (`src/pages/api/god/data/ingest.ts`)
   - Papaparse integration
   - Bulk INSERT in transactions
   - Column mapping
   - Validate-only mode

3. **Pool Statistics** (`src/pages/api/god/pool/stats.ts`)
   - Connection monitoring
   - Saturation percentage
   - Health recommendations

### Week 3: Geospatial & Intelligence
4. **Geospatial Launcher** (`src/pages/api/god/geo/launch-campaign.ts`)
   - Turf.js point generation
   - Density-based sampling
   - BullMQ addBulk integration

5. **Shim Preview** (`src/pages/api/god/shim/preview.ts`)
   - SQL dry-run translation
   - Directus query preview

6. **Prompt Sandbox** (`src/pages/api/intelligence/prompts/test.ts`)
   - Cost estimation
   - Batch projections
   - Mock LLM responses

7. **Spintax Validator** (`src/pages/api/intelligence/spintax/validate.ts`)
   - Syntax checking
   - Sample generation
   - Error detection

---

## Testing Checklist

### Test 1: CSV Ingestion (1000 rows)
```bash
curl -X POST http://localhost:4321/api/god/data/ingest \
  -H "X-God-Token: YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "format": "csv",
    "tableName": "geo_locations",
    "data": "city_name,state,lat,lng\nAustin,TX,30.2672,-97.7431\nDallas,TX,32.7767,-96.7970",
    "validateOnly": false
  }'
```

**Expected:** Inserts 2 cities into geo_locations

---

### Test 2: Pool Statistics
```bash
curl http://localhost:4321/api/god/pool/stats \
  -H "X-God-Token: YOUR_TOKEN"
```

**Expected:** Returns total/idle/waiting connections + saturation %

---

### Test 3: Geospatial Campaign Launch
```bash
curl -X POST http://localhost:4321/api/god/geo/launch-campaign \
  -H "X-God-Token: YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "boundary": {
      "type": "Polygon",
      "coordinates": [[
        [-97.74, 30.27],
        [-97.74, 30.40],
        [-97.54, 30.40],
        [-97.54, 30.27],
        [-97.74, 30.27]
      ]]
    },
    "campaign_type": "local_article",
    "density": "medium",
    "site_id": "YOUR_SITE_UUID"
  }'
```

**Expected:** Generates ~50 points, inserts to database, queues jobs

---

### Test 4: Prompt Cost Estimation
```bash
curl -X POST http://localhost:4321/api/intelligence/prompts/test \
  -H "X-God-Token: YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Write about {topic} in {city}",
    "variables": {"topic": "restaurants", "city": "Austin"},
    "model": "gpt-4",
    "max_tokens": 1000
  }'
```

**Expected:** Returns mock response + cost for 100/1k/10k/100k batches

---

### Test 5: Spintax Validation
```bash
curl -X POST http://localhost:4321/api/intelligence/spintax/validate \
  -H "X-God-Token: YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pattern": "{Hello|Hi|Hey} {world|friend}!"
  }'
```

**Expected:** valid=true, 5 sample variations

---

### Test 6: Invalid Spintax
```bash
curl -X POST http://localhost:4321/api/intelligence/spintax/validate \
  -H "X-God-Token: YOUR_TOKEN"
 \
  -H "Content-Type: application/json" \
  -d '{
    "pattern": "{Hello|Hi} {world"
  }'
```

**Expected:** valid=false, errors array with unclosed_brace

---

## Success Criteria

- ✅ CSV with 1000+ rows ingests in <3 seconds
- ✅ Pool stats shows accurate saturation
- ✅ Geo campaign generates points inside boundary
- ✅ Cost estimates prevent expensive mistakes
- ✅ Spintax validator catches syntax errors

---

## Weeks 2 & 3 Complete! 🎉
