import requests
import json
import os
from shapely.geometry import Polygon, Point
import logging

# Setup Logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("GEO-INT")

# 1. Define Area (Rethe / Kattwyk Bridge Box)
# MinLat, MinLon, MaxLat, MaxLon
BBOX = (53.4900, 9.9500, 53.5100, 9.9800)

OVERPASS_URL = "https://overpass-api.de/api/interpreter"

OVERPASS_QUERY = f"""
[out:json];
(
  way["natural"="water"]({BBOX[0]},{BBOX[1]},{BBOX[2]},{BBOX[3]});
  relation["natural"="water"]({BBOX[0]},{BBOX[1]},{BBOX[2]},{BBOX[3]});
  way["waterway"="riverbank"]({BBOX[0]},{BBOX[1]},{BBOX[2]},{BBOX[3]});
);
out body;
>;
out skel qt;
"""

def fetch_and_process():
    logger.info("📡 Contacting Overpass API (OpenStreetMap)...")
    try:
        response = requests.post(OVERPASS_URL, data={"data": OVERPASS_QUERY})
        response.raise_for_status()
        data = response.json()
        
        # Parse Nodes
        nodes = {n['id']: (n['lat'], n['lon']) for n in data['elements'] if n['type'] == 'node'}
        
        polygons = []
        
        for el in data['elements']:
            if el['type'] == 'way' and 'nodes' in el:
                # Construct coordinate list
                coords = []
                for nid in el['nodes']:
                    if nid in nodes:
                        coords.append(nodes[nid])
                
                if len(coords) > 2:
                    polygons.append(coords)

        if not polygons:
            logger.error("❌ No water polygons found!")
            return

        logger.info(f"✅ Retrieved {len(polygons)} water polygons.")
        
        # Save to file
        output_dir = "eye/data"
        os.makedirs(output_dir, exist_ok=True)
        
        with open(f"{output_dir}/water_polygons.json", "w") as f:
            json.dump(polygons, f)
            logger.info(f"💾 Saved {output_dir}/water_polygons.json")

    except Exception as e:
        logger.error(f"FATAL: {e}")

if __name__ == "__main__":
    fetch_and_process()
