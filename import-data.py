#!/usr/bin/env python3
"""
Directus Data Import Script
Imports all JSON data files from the Directus container into the database
"""

import json
import requests
import subprocess

DIRECTUS_URL = "https://spark.jumpstartscaling.com"
TOKEN = "oGn-0AZjenB900pfzQYH8zCbFwGw7flU"
CONTAINER = "directus-i8cswkos04c4s08404ok0ws4-022108320046"

headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

def get_file_from_container(filename):
    """Get JSON file from Directus container"""
    cmd = f"ssh -i ~/.ssh/coolify_manual_key root@72.61.15.216 'docker exec {CONTAINER} cat /directus/data/{filename}'"
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if result.returncode == 0:
        return json.loads(result.stdout)
    else:
        print(f"❌ Error reading {filename}: {result.stderr}")
        return None

def import_avatar_intelligence():
    """Import avatar intelligence data"""
    print("📦 Importing avatar_intelligence...")
    data = get_file_from_container("avatar_intelligence.json")
    if not data:
        return
    
    avatars = data.get("avatars", {})
    count = 0
    
    for avatar_key, avatar_data in avatars.items():
        item = {
            "avatar_key": avatar_key,
            "base_name": avatar_data.get("base_name"),
            "wealth_cluster": avatar_data.get("wealth_cluster"),
            "business_niches": avatar_data.get("business_niches"),
            "data": avatar_data
        }
        
        response = requests.post(
            f"{DIRECTUS_URL}/items/avatar_intelligence",
            headers=headers,
            json=item,
            verify=False
        )
        
        if response.status_code in [200, 201]:
            count += 1
            print(f"  ✅ Imported: {avatar_key}")
        else:
            print(f"  ❌ Failed: {avatar_key} - {response.text}")
    
    print(f"✅ Imported {count} avatars\n")

def import_avatar_variants():
    """Import avatar variants data"""
    print("📦 Importing avatar_variants...")
    data = get_file_from_container("avatar_variants.json")
    if not data:
        return
    
    variants = data.get("variants", {})
    count = 0
    
    for avatar_key, variant_data in variants.items():
        for variant_type, variant_content in variant_data.items():
            item = {
                "avatar_key": avatar_key,
                "variant_type": variant_type,
                "data": variant_content
            }
            
            response = requests.post(
                f"{DIRECTUS_URL}/items/avatar_variants",
                headers=headers,
                json=item,
                verify=False
            )
            
            if response.status_code in [200, 201]:
                count += 1
            else:
                print(f"  ❌ Failed: {avatar_key}/{variant_type}")
    
    print(f"✅ Imported {count} variants\n")

def import_geo_intelligence():
    """Import geographic intelligence data"""
    print("📦 Importing geo_intelligence...")
    data = get_file_from_container("geo_intelligence.json")
    if not data:
        return
    
    clusters = data.get("clusters", {})
    count = 0
    
    for cluster_key, cluster_data in clusters.items():
        item = {
            "cluster_key": cluster_key,
            "data": cluster_data
        }
        
        response = requests.post(
            f"{DIRECTUS_URL}/items/geo_intelligence",
            headers=headers,
            json=item,
            verify=False
        )
        
        if response.status_code in [200, 201]:
            count += 1
            print(f"  ✅ Imported: {cluster_key}")
        else:
            print(f"  ❌ Failed: {cluster_key}")
    
    print(f"✅ Imported {count} clusters\n")

def import_spintax_dictionaries():
    """Import spintax dictionaries"""
    print("📦 Importing spintax_dictionaries...")
    data = get_file_from_container("spintax_dictionaries.json")
    if not data:
        return
    
    dictionaries = data.get("dictionaries", {})
    count = 0
    
    for category, dict_data in dictionaries.items():
        item = {
            "category": category,
            "data": dict_data
        }
        
        response = requests.post(
            f"{DIRECTUS_URL}/items/spintax_dictionaries",
            headers=headers,
            json=item,
            verify=False
        )
        
        if response.status_code in [200, 201]:
            count += 1
            print(f"  ✅ Imported: {category}")
        else:
            print(f"  ❌ Failed: {category}")
    
    print(f"✅ Imported {count} dictionaries\n")

def import_cartesian_patterns():
    """Import cartesian patterns"""
    print("📦 Importing cartesian_patterns...")
    data = get_file_from_container("cartesian_patterns.json")
    if not data:
        return
    
    patterns = data.get("patterns", {})
    count = 0
    
    for pattern_key, pattern_data in patterns.items():
        item = {
            "pattern_key": pattern_key,
            "pattern_type": pattern_data.get("type"),
            "data": pattern_data
        }
        
        response = requests.post(
            f"{DIRECTUS_URL}/items/cartesian_patterns",
            headers=headers,
            json=item,
            verify=False
        )
        
        if response.status_code in [200, 201]:
            count += 1
            print(f"  ✅ Imported: {pattern_key}")
        else:
            print(f"  ❌ Failed: {pattern_key}")
    
    print(f"✅ Imported {count} patterns\n")

def import_offer_blocks():
    """Import all offer blocks"""
    print("📦 Importing offer_blocks...")
    
    files = [
        ("offer_blocks_universal.json", "universal"),
        ("offer_blocks_avatar_personalized.json", "avatar_personalized"),
        ("offer_blocks_cartesian_engine.json", "cartesian")
    ]
    
    total_count = 0
    
    for filename, block_type in files:
        data = get_file_from_container(filename)
        if not data:
            continue
        
        blocks = data.get("blocks", [])
        
        for block in blocks:
            item = {
                "block_type": block_type,
                "avatar_key": block.get("avatar_key"),
                "data": block
            }
            
            response = requests.post(
                f"{DIRECTUS_URL}/items/offer_blocks",
                headers=headers,
                json=item,
                verify=False
            )
            
            if response.status_code in [200, 201]:
                total_count += 1
            else:
                print(f"  ❌ Failed: {block.get('id', 'unknown')}")
        
        print(f"  ✅ Imported {len(blocks)} {block_type} blocks")
    
    print(f"✅ Total imported: {total_count} offer blocks\n")

def main():
    """Main import function"""
    print("🚀 Starting Directus Data Import")
    print("=" * 50)
    print()
    
    # Disable SSL warnings
    import urllib3
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
    
    # Import all data
    import_avatar_intelligence()
    import_avatar_variants()
    import_geo_intelligence()
    import_spintax_dictionaries()
    import_cartesian_patterns()
    import_offer_blocks()
    
    print("=" * 50)
    print("🎉 Import Complete!")
    print()
    print("Verify by visiting:")
    print("  https://spark.jumpstartscaling.com/admin")
    print()

if __name__ == "__main__":
    main()
