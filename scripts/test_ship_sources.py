import httpx
import asyncio
from bs4 import BeautifulSoup

# Targets
targets = [
    {
        "name": "MyShipTracking (Hamburg Arrivals)",
        "url": "https://www.myshiptracking.com/ports-arrivals-departures/?pid=364",
        "selector": "td"
    },
    {
        "name": "VesselFinder (Hamburg Region)",
        "url": "https://www.vesselfinder.com/vessels?bbox=9.789,53.456,10.057,53.593", # BBox for Hamburg
        "selector": ".ship-link"
    }
]

async def test_sources():
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    
    for t in targets:
        print(f"\n--- Testing {t['name']} ---")
        try:
            async with httpx.AsyncClient() as client:
                r = await client.get(t['url'], headers=headers, follow_redirects=True, timeout=10.0)
                print(f"Status: {r.status_code}")
                
                if r.status_code == 200:
                    ships = []
                    soup = BeautifulSoup(r.text, 'html.parser')
                    
                    if "myshiptracking" in t['url']:
                        rows = soup.find_all("td")
                        for row in rows:
                            txt = row.get_text(strip=True)
                            if txt.isupper() and len(txt) > 3 and not any(x in txt for x in ["ARRIVAL", "DEPARTURE"]):
                                ships.append(txt)
                    
                    elif "vesselfinder" in t['url']:
                        # VesselFinder often protections but let's check class names
                        links = soup.select(".ship-link")
                        for l in links:
                            ships.append(l.get_text(strip=True))
                            
                    ships = list(set(ships))
                    print(f"Found {len(ships)} potential ships: {ships[:5]}")
                else:
                    print("Failed to access.")
                    
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_sources())
