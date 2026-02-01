import httpx
import logging

logger = logging.getLogger("WEATHER")

class WeatherService:
    def __init__(self):
        self.base_url = "https://api.open-meteo.com/v1/forecast"
        self.lat = 53.55
        self.lon = 9.99
        self.cached_weather = {"condition": "CLEAR", "temp": 15.0}

    async def get_current_weather(self):
        """
        Fetches real weather from Open-Meteo.
        Returns: { condition: STR, temp: FLOAT }
        """
        try:
            params = {
                "latitude": self.lat,
                "longitude": self.lon,
                "current_weather": "true"
            }
            async with httpx.AsyncClient() as client:
                resp = await client.get(self.base_url, params=params, timeout=5.0)
                if resp.status_code == 200:
                    data = resp.json()
                    cw = data.get("current_weather", {})
                    code = cw.get("weathercode", 0)
                    temp = cw.get("temperature", 0)
                    
                    # Map WMO codes to our conditions
                    # 0=Clear, 1-3=Cloudy, 51-67=Rain, 71-77=Snow, 95-99=Storm
                    condition = "CLEAR"
                    if 1 <= code <= 3: condition = "CLOUDY"
                    elif 51 <= code <= 67: condition = "RAIN"
                    elif 80 <= code <= 82: condition = "RAIN"
                    elif 71 <= code <= 77: condition = "SNOW"
                    elif 45 <= code <= 48: condition = "FOG"
                    elif code >= 95: condition = "STORM"
                    
                    self.cached_weather = {"condition": condition, "temp": temp}
                    return self.cached_weather
        except Exception as e:
            logger.error(f"Weather fetch failed: {e}")
            return self.cached_weather # Return last known good
        
        return self.cached_weather
