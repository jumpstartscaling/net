#!/usr/bin/env python3
"""
Add CoreProvider wrapper to all Astro admin pages that use React components
"""
import os
import re
from pathlib import Path

# Pages to fix
pages_dir = Path("/Users/christopheramaya/Downloads/spark/frontend/src/pages/admin")

def fix_astro_page(file_path):
    """Add CoreProvider wrapper to an Astro page"""
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Skip if already has CoreProvider
    if 'CoreProvider' in content:
        print(f"  ⏭️  {file_path.name} (already has CoreProvider)")
        return False
    
    # Skip if no client:load or client:only
    if 'client:load' not in content and 'client:only' not in content:
        print(f"  ⏭️  {file_path.name} (no React components)")
        return False
    
    # Add import
    import_pattern = r'(---\n)(import.*?from.*?;\n)'
    if re.search(import_pattern, content):
        # Add after existing imports
        content = re.sub(
            r'(import.*?from.*?;\n)(\n---)',
            r'\1import { CoreProvider } from \'@/components/providers/CoreProviders\';\n\2',
            content,
            count=1
        )
    
    # Find all React components with client directives
    # Pattern: <ComponentName client:load /> or client:only="react"
    component_pattern = r'<(\w+)\s+(client:(?:load|only(?:="react")?)\s*/?>)'
    
    matches = list(re.finditer(component_pattern, content))
    
    if not matches:
        print(f"  ⏭️  {file_path.name} (no matching components)")
        return False
    
    # Wrap all components in CoreProvider
    # Find the first component
    first_match = matches[0]
    first_component_start = first_match.start()
    
    # Find the last component
    last_match = matches[-1]
    last_component_end = last_match.end()
    
    # Insert CoreProvider before first component
    before = content[:first_component_start]
    components = content[first_component_start:last_component_end]
    after = content[last_component_end:]
    
    # Add proper indentation
    indent = '    '  # Assuming 4-space indent
    
    # Wrap components
    wrapped = f'{indent}<CoreProvider client:load>\n{indent}  {components}\n{indent}</CoreProvider>'
    
    new_content = before + wrapped + after
    
    # Write back
    with open(file_path, 'w') as f:
        f.write(new_content)
    
    print(f"  ✅ {file_path.name}")
    return True

# Process all .astro files
fixed_count = 0
for astro_file in pages_dir.rglob('*.astro'):
    if astro_file.is_file():
        if fix_astro_page(astro_file):
            fixed_count += 1

print(f"\n✅ Fixed {fixed_count} pages")
