import math
import time
from loguru import logger

class PredictiveEngine:
    """
    The 'Time Machine' of Sentinel.
    Forecasts future conflicts based on current trajectories.
    """
    def __init__(self):
        # Rethe Bridge Coordinates
        self.bridge_lat = 53.5005
        self.bridge_lng = 9.9705
        self.alert_threshold_minutes = 20.0
        
    def calculate_eta(self, ship):
        """
        Calculates ETA to Rethe Bridge in minutes.
        Simple Haversine distance / speed calculation.
        """
        # Distance (simplified Euclidean for short range, or Haversine)
        # 1 deg lat ~ 111km. 
        dy = (ship["lat"] - self.bridge_lat) * 111.0
        dx = (ship["lng"] - self.bridge_lng) * 111.0 * math.cos(math.radians(self.bridge_lat))
        dist_km = math.sqrt(dx*dx + dy*dy)
        
        # Speed. AIS reports speed in knots. 1 knot = 1.852 km/h.
        # Fallback 10 knots if static
        speed_knots = ship.get("sog", 10.0) 
        speed_kmh = speed_knots * 1.852
        
        if speed_kmh < 0.1: return 999.0 # Stationary
        
        hours = dist_km / speed_kmh
        minutes = hours * 60
        return minutes

    def forecast_conflict(self, visual_state):
        """
        Analyzes the visual state (ships) and predicts bridge closure.
        """
        ships = visual_state.get("ships", [])
        risk_score = 0.0
        nearest_eta = 999.0
        imminent_ship_id = None
        
        for ship in ships:
            # Check if ship is heading towards bridge? 
            # For hackathon, assume ALL ships in this ROI are relevant.
            eta = self.calculate_eta(ship)
            
            if eta < nearest_eta:
                nearest_eta = eta
                imminent_ship_id = ship.get("id", "Unknown")
        
        # Logic: If ship is < 20 mins away, Risk goes up.
        if nearest_eta < 5.0:
            risk_score = 1.0 # CRITICAL
        elif nearest_eta < self.alert_threshold_minutes:
            # Linear scaling from 0.0 to 1.0 between 20 mins and 5 mins
            # 20m -> 0.0, 5m -> 1.0
            risk_score = 1.0 - ((nearest_eta - 5.0) / (self.alert_threshold_minutes - 5.0))
            
        return {
            "prediction": "bridge_closure",
            "risk_score": max(0.0, min(1.0, risk_score)),
            "eta_minutes": nearest_eta,
            "trigger_ship": imminent_ship_id
        }
