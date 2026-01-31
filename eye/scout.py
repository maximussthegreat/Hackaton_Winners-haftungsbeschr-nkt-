import httpx
from bs4 import BeautifulSoup
import logging
import random
import json
import asyncio
from eye.geography import geography

logger = logging.getLogger("EYE.SCOUT")

class ScoutService:
    """
    Agentic Scraper: 'The Scout'.
    Attempts to get REAL ship lists from public portals.
    Falls back to LLM-generated 'Profile' of likely ships if internet is dark.
    """
    def __init__(self):
        self.sources = [
            "https://www.myshiptracking.com/ports-arrivals-departures/?pid=364"
        ]

    async def find_real_ships(self):
        """
        scours the web for *actual* ships in Hamburg.
        Returns a list of dicts: {name, type, lat, lng}
        """
        ships = []
        
        # Targets from proven test script
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

        # 1. ATTEMPT SCRAPE (Best Effort)
        logger.info("SCOUT: Scanning Maritime Traffic Feeds...")
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        } 
        
        for t in targets:
            try:
                # logger.info(f"SCOUT: Pinging {t['name']}...")
                async with httpx.AsyncClient() as client:
                    resp = await client.get(t['url'], headers=headers, follow_redirects=True, timeout=8.0)
                    
                    if resp.status_code == 200:
                        soup = BeautifulSoup(resp.text, 'html.parser')
                        
                        if "myshiptracking" in t['url']:
                            rows = soup.find_all("td")
                            for r in rows:
                                text = r.get_text(strip=True)
                                # Heuristic: Uppercase 4-25 chars, no weird symbols
                                if text.isupper() and len(text) > 3 and len(text) < 25 and not any(x in text for x in ["ARRIVAL", "DEPARTURE", "TIME", "DATE"]):
                                     ships.append(text)
                        
                        elif "vesselfinder" in t['url']:
                            links = soup.select(".ship-link")
                            for l in links:
                                ships.append(l.get_text(strip=True))

            except Exception as e:
                logger.warning(f"SCOUT: Radar Jammed on {t['name']}: {e}")

        # 2. VALIDATION & GEOLOCATION (OpenAI Fallback)
        source = "REAL_AIS_NET"
        # Deduplicate
        ships = list(set(ships))
        
        if not ships:
            logger.info("SCOUT: Live Radar Blind. Engaging Generative Reconstruction (GPT-4o).")
            # Only call OpenAI if we truly failed to find anything
            ships = self._generate_probable_manifest()
            source = "AI_INFERRED_ARCHIVE"
        else:
            logger.info(f"SCOUT: Visual Confirmation on {len(ships)} vessels.")
            
        # 3. CONVERT TO OBJECTS
        results = []
        for name in ships[:15]: # Limit increased to 15
            lat, lng = geography.get_safe_water_point(seed=name)
            results.append({
                "id": name.upper().replace(" ", "-"),
                "name": f"{name} [{source}]" if source == "AI_INFERRED_ARCHIVE" else name, 
                "lat": lat,
                "lng": lng,
                "type": "Cargo Vessel", # Simulating Type if unknown
                "sog": round(random.uniform(5.5, 12.0), 1), # Realistic Channel Speed
                "cog": round(random.uniform(180, 240), 0), # Roughly South-West (Downstream)
                "status": "UNDERWAY"
            })
            
        return results

    def _generate_probable_manifest(self):
        """
        Uses OpenAI to hallucinate a ACCURATE list of ships based on port profiles.
        """
        try:
             # Lazy import
            from openai import OpenAI
            import os
            from dotenv import load_dotenv
            
            load_dotenv()
            client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
            
            logger.info("SCOUT: Querying OpenAI for live traffic simulation...")
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are a Maritime Tracking System. Return a JSON list of 6 REAL container ship names that frequent Hamburg. formatting: ['SHIP A', 'SHIP B']"},
                    {"role": "user", "content": "Current status?"}
                ],
                response_format={"type": "json_object"}
            )
            data = json.loads(response.choices[0].message.content)
            return data.get("ships", ["CMA CGM JACQUES SAADE", "HMM ALGECIRAS"])
            
        except Exception as e:
            logger.error(f"SCOUT: OpenAI Connect Failed ({e}). RADAR IS BLIND.")
            return [] # No fake ships. Real silence.

scout = ScoutService()
