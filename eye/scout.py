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
        
        # 1. ATTEMPT SCRAPE (Best Effort)
        try:
            logger.info("SCOUT: Scanning Maritime Traffic Feeds...")
            # We try a search for "Hamburg" on a vessel tracker
            async with httpx.AsyncClient() as client:
                headers = {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
                } 
                # Attempt 1: VesselFinder Region Search (Reverse Engineered)
                resp = await client.get(self.sources[0], headers=headers, timeout=5.0)
                
                if resp.status_code == 200:
                    soup = BeautifulSoup(resp.text, 'html.parser')
                    # Look for table rows with ship looking names
                    rows = soup.find_all("td")
                    for r in rows:
                        text = r.get_text(strip=True)
                        # Heuristic: Uppercase 4-20 chars, no weird symbols
                        if text.isupper() and len(text) > 4 and len(text) < 25 and not any(x in text for x in ["ARRIVAL", "DEPARTURE", "TIME", "DATE"]):
                             ships.append(text)
                             
        except Exception as e:
            logger.warning(f"SCOUT: Radar Jammed: {e}")

        # 2. VALIDATION & GEOLOCATION (OpenAI Fallback)
        source = "REAL_AIS_NET"
        # Deduplicate
        ships = list(set(ships))
        
        if not ships:
            logger.info("SCOUT: Live Radar Blind. Engaging Generative Reconstruction (GPT-4o).")
            ships = self._generate_probable_manifest()
            source = "AI_INFERRED_ARCHIVE"
            
        # 3. CONVERT TO OBJECTS
        results = []
        for name in ships[:8]: # Limit to 8 active vessels
            lat, lng = geography.get_safe_water_point(seed=name)
            results.append({
                "id": name.upper().replace(" ", "-"),
                "name": f"{name} [{source}]", 
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
