# Jumpstart Error Fix - "Error: undefined"

## Problem Identified

**Location**: `JumpstartWizard.tsx` line 160-169

**Error**: `❌ Error: undefined` after "🚀 IGNITION! Registering Job in System..."

**Root Cause**: 
The `createItem('generation_jobs', ...)` call is failing because:
1. The `filters` field is trying to store the entire inventory (1456 posts) as JSON
2. This might exceed Directus field size limits
3. The error object doesn't have a `.message` property, so it logs "undefined"

**Problematic Code**:
```typescript
const job = await client.request(createItem('generation_jobs', {
    site_id: siteId,
    status: 'Pending',
    type: 'Refactor',
    target_quantity: inventory.total_posts,
    filters: {
        items: inventory.items, // ❌ TOO LARGE - 1456 posts!
        mode: 'refactor'
    }
}));
```

## Solution

### Option 1: Store Only Essential Data
Instead of storing all 1456 posts in the job record, store only:
- Post count
- WordPress site URL
- Filter criteria

The engine can fetch posts directly from WordPress when processing.

### Option 2: Batch Processing
Create multiple smaller jobs instead of one massive job.

### Option 3: Use Separate Table
Store the inventory in a separate `job_items` table with a foreign key to the job.

## Recommended Fix (Option 1)

```typescript
const job = await client.request(createItem('generation_jobs', {
    site_id: siteId,
    status: 'Pending',
    type: 'Refactor',
    target_quantity: inventory.total_posts,
    config: {
        wordpress_url: siteUrl,
        mode: 'refactor',
        batch_size: 5
    }
}));
```

Then update the engine to fetch posts directly from WordPress using the stored URL.

## Additional Fix: Better Error Logging

```typescript
} catch (e) {
    const errorMsg = e?.message || e?.error || JSON.stringify(e) || 'Unknown error';
    addLog(`❌ Error: ${errorMsg}`);
    console.error('Full error:', e); // Log full error to console
}
```

This will show the actual error message instead of "undefined".
