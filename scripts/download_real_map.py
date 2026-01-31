"""
OVERPASS API: Download REAL Hamburg Water Polygons from OpenStreetMap.
This fetches actual river/water bodies, NOT flood zones.

Query: waterway=riverbank AND natural=water in Hamburg Port area
"""
import requests
import json

# Overpass API endpoint
OVERPASS_URL = "https://overpass-api.de/api/interpreter"

# Bounding box for Hamburg Port area (Rethe, Kattwyk, Elbe)
# Format: south, west, north, east
BBOX = "53.45,9.85,53.55,10.05"

# Overpass QL query for water polygons
# This gets: riverbanks (polygonal water), natural=water, and waterway=river
QUERY = f"""
[out:json][timeout:60];
(
  // Riverbank polygons (actual water)
  way["waterway"="riverbank"]({BBOX});
  relation["waterway"="riverbank"]({BBOX});
  
  // Natural water bodies (lakes, harbors, basins)
  way["natural"="water"]({BBOX});
  relation["natural"="water"]({BBOX});
  
  // Harbor basins and docks
  way["waterway"="dock"]({BBOX});
  way["landuse"="basin"]({BBOX});
  
);
out body;
>;
out skel qt;
"""

print("=" * 60)
print("OVERPASS API: Downloading REAL water polygons from OSM")
print("=" * 60)
print(f"Bounding Box: {BBOX}")
print("Querying: waterway=riverbank, natural=water, waterway=dock")
print()

try:
    response = requests.post(OVERPASS_URL, data={"data": QUERY}, timeout=120)
    response.raise_for_status()
    
    data = response.json()
    elements = data.get("elements", [])
    
    # Separate nodes and ways
    nodes = {e["id"]: (e["lat"], e["lon"]) for e in elements if e["type"] == "node"}
    ways = [e for e in elements if e["type"] == "way"]
    
    print(f"✓ Downloaded {len(nodes)} nodes, {len(ways)} ways")
    
    # Convert ways to polygons
    water_polygons = []
    
    for way in ways:
        node_ids = way.get("nodes", [])
        if len(node_ids) < 3:
            continue
            
        # Build coordinate list
        coords = []
        for nid in node_ids:
            if nid in nodes:
                lat, lng = nodes[nid]
                coords.append((lat, lng))
        
        if len(coords) >= 3:
            water_polygons.append(coords)
    
    print(f"✓ Extracted {len(water_polygons)} water polygon rings")
    
    # Save to data directory
    output_path = "eye/data/water_polygons.json"
    with open(output_path, "w") as f:
        json.dump(water_polygons, f, indent=2)
    
    print(f"✓ Saved to {output_path}")
    
    # Also save a sample for verification
    if water_polygons:
        sample = water_polygons[0][:5]
        print(f"\n  Sample coordinates (first polygon, first 5 points):")
        for pt in sample:
            print(f"    Lat: {pt[0]:.6f}, Lng: {pt[1]:.6f}")
    
    print("\n" + "=" * 60)
    print("✓ COMPLETE: Real OSM water data installed!")
    print("  Ships will now spawn only in actual water bodies.")
    print("=" * 60)
    
except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
