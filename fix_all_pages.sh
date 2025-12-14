#!/bin/bash
# Fix all admin pages by adding CoreProvider wrapper

cd /Users/christopheramaya/Downloads/spark/frontend/src/pages/admin

# List of files to fix (from user's list)
files=(
  "collections/avatar-variants.astro"
  "collections/spintax-dictionaries.astro"
  "collections/cartesian-patterns.astro"
  "collections/campaign-masters.astro"
  "collections/content-fragments.astro"
  "collections/headline-inventory.astro"
  "collections/offer-blocks.astro"
  "collections/generation-jobs.astro"
  "seo/articles/index.astro"
  "leads/index.astro"
  "settings.astro"
  "content/work_log.astro"
  "media/templates.astro"
  "content-factory.astro"
  "index.astro"
  "sites/jumpstart.astro"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Fixing $file..."
    
    # Add import if not present
    if ! grep -q "CoreProvider" "$file"; then
      # Add import after the last import line
      sed -i '' '/^import.*from/a\
import { CoreProvider } from '\''@/components/providers/CoreProviders'\'';
' "$file"
      
      echo "  ✅ Added CoreProvider import"
    fi
  else
    echo "  ⚠️  File not found: $file"
  fi
done

echo ""
echo "✅ All files processed!"
echo "⚠️  Note: Component wrapping must be done manually for each file"
