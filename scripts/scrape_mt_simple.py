import requests
import json
import time

# Target: Hamburg Port Area
# This is a known internal API endpoint for MarineTraffic (might be outdated/blocked)
# Bounding Box approx for Hamburg:
# min_lat=53.4, max_lat=53.6, min_lon=9.8, max_lon=10.0
url = "https://www.marinetraffic.com/getData/get_assets"

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Referer": "https://www.marinetraffic.com/en/ais/home/centerx:9.982/centery:53.498/zoom:12",
    "X-Requested-With": "XMLHttpRequest"
}

params = {
    "v": "4",
    "min_lat": "53.48",
    "max_lat": "53.58",
    "min_lon": "9.85",
    "max_lon": "10.00",
    "sat": "1" # Terrestrial only
}

print(f"Attempting to contact: {url}")
try:
    s = requests.Session()
    # First visit home to get cookies
    s.get("https://www.marinetraffic.com/en/ais/home/centerx:9.982/centery:53.498/zoom:12", headers=headers)
    
    # Then hit API
    r = s.get(url, headers=headers, params=params, timeout=10)
    
    print(f"Status: {r.status_code}")
    if r.status_code == 200:
        data = r.json()
        print("✅ SUCCESS! Data received.")
        print(json.dumps(data, indent=2)[:500]) # Print first 500 chars
        
        # Save to file
        with open("eye/data/ships_live.json", "w") as f:
            json.dump(data, f, indent=2)
            
    elif r.status_code == 403:
        print("❌ BLOCKED (403 Forbidden). Cloudflare is active.")
    else:
        print(f"❌ Failed: {r.text[:200]}")

except Exception as e:
    print(f"❌ Error: {e}")
