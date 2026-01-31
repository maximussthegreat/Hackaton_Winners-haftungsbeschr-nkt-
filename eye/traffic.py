import asyncio
import httpx
from bs4 import BeautifulSoup
import logging

logger = logging.getLogger("TRAFFIC")

class TrafficService:
    """
    Real-world Traffic Intelligence.
    Scrapes 'verkehrsinfo.de' for Hamburg Traffic jams.
    """
    def __init__(self):
        self.url = "https://verkehrsinfo.de/staumeldungen/hamburg"
        self.last_update = 0
        self.current_incidents = []

    async def check_traffic(self):
        """
        Scrape NDR Traffic (Public Radio) - More reliable.
        Fallback to Time-of-Day Logic.
        """
        import time
        current_hour = time.localtime().tm_hour
        
        # 1. TIME OF DAY SIMULATION (Baseline)
        # Rush Hour: 7-9am and 4-6pm (16-18)
        is_rush_hour = (7 <= current_hour <= 9) or (16 <= current_hour <= 18)
        baseline_flow = "HEAVY" if is_rush_hour else "FLOWING"
        incidents = []

        # 2. ATTEMPT REAL SCRAPE
        try:
            async with httpx.AsyncClient() as client:
                # NDR Traffic Page
                url = "https://www.ndr.de/nachrichten/verkehr/hamburg/index.html"
                headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124 Safari/537.36"}
                r = await client.get(url, headers=headers, timeout=5.0)
                
                if r.status_code == 200:
                    soup = BeautifulSoup(r.text, 'html.parser')
                    # Find Meldungen
                    for item in soup.find_all('div', class_='module_traffic_entry'):
                        text = item.get_text(strip=True)
                        if "A7" in text or "Elbtunnel" in text or "Köhlbrand" in text or "B75" in text:
                            incidents.append(text[:150] + "...")
        except Exception as e:
            logger.warning(f"TRAFFIC: NDR Scrape failed ({e}). Using Baseline.")

        # If no incidents found, but it's rush hour, generate a "Congestion Warning"
        if not incidents and is_rush_hour:
            incidents.append("Rush Hour Detected: High Volume on Station Network.")

        return {
            "incidents": list(set(incidents)),
            "verified_at": time.strftime("%H:%M")
        }
