import httpx
from loguru import logger

class SentinelAPI:
    def __init__(self):
        self.mobilithek_url = "https://mobilithek.info/api/v1" # Mock
        self.pegel_url = "https://pegelonline.wsv.de/webservices/rest-api/v2/stations/HAMBURG ST. PAULI/W"
        self.client = httpx.AsyncClient()

    async def get_traffic_data(self):
        # Mocking Mobilithek response for demo stability
        # In production, this would use the real MDS/DATEX II feed
        return {
            "rethe_bridge": "green",
            "kohlbrand_bridge": "green",
            "cattwyk_bridge": "green"
        }

    async def get_water_level(self):
        try:
            resp = await self.client.get(self.pegel_url + ".json")
            if resp.status_code == 200:
                data = resp.json()
                return {"level": data.get("value"), "trend": data.get("trend")}
        except Exception as e:
            logger.error(f"Failed to fetch Pegel data: {e}")
            return None
        return None
