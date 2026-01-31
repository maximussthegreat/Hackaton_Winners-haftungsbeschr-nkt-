import time

class OracleService:
    """
    Project Oracle: 24h Predictive Intelligence Engine.
    Simulates future port states based on scheduled variables.
    """
    def generate_forecast(self, scheduled_ships):
        """
        Input: List of ship objects with 'eta' timestamps.
        Output: Chronological timeline of events.
        """
        timeline = []
        
        # Sort by earliest arrival
        sorted_ships = sorted(scheduled_ships, key=lambda x: x.get('eta', 0))
        
        for ship in sorted_ships:
            eta = ship.get('eta')
            if not eta: continue
            
            # 1. EVENT: Ship Arrival
            arrival_time = time.strftime("%H:%M", time.localtime(eta))
            timeline.append({
                "time": arrival_time,
                "type": "ARRIVAL",
                "risk": "MODERATE",
                "message": f"Vessel {ship['name']} entering Rethe Channel."
            })
            
            # 2. EVENT: Bridge Closure Logic (10 mins before)
            close_time = time.strftime("%H:%M", time.localtime(eta - 600))
            timeline.append({
                "time": close_time,
                "type": "INFRASTRUCTURE",
                "risk": "HIGH",
                "message": f"BRIDGE CLOSURE SEQUENCE initiated for {ship['name']}."
            })
            
            # 3. EVENT: Traffic Impact
            timeline.append({
                "time": close_time,
                "type": "TRAFFIC",
                "risk": "CRITICAL",
                "message": "Hohe Schaar Straße BLOCKED. Traffic routing to A7 suspended."
            })
            
            # 4. EVENT: Re-opening (20 mins after arrival)
            open_time = time.strftime("%H:%M", time.localtime(eta + 1200))
            timeline.append({
                "time": open_time,
                "type": "INFRASTRUCTURE",
                "risk": "LOW",
                "message": "Bridge Operations normalizing. Traffic flow resuming."
            })
            
            # 5. EVENT: The "Megamax Ripple Effect" (Report Section 5.1/3.2)
            # If ULCS, predict landside congestion
            s_name = ship['name'].upper()
            if "TRIUMPH" in s_name or "NUBA" in s_name or "ALGE" in s_name:
                logistics_time = time.strftime("%H:%M", time.localtime(eta + 7200)) # +2 Hours
                timeline.append({
                    "time": logistics_time,
                    "type": "LOGISTICS",
                    "risk": "HIGH",
                    "message": f"MEGAMAX DISCHARGE: High Truck Volume appearing at CTB Gate. {ship['name']} Ripple Effect."
                })

        # Add overall summary
        forecast = {
            "generated_at": time.strftime("%H:%M"),
            "window": "24 Hours",
            "total_ships": len(scheduled_ships),
            "timeline": sorted(timeline, key=lambda x: x['time'])
        }
        
        return forecast

oracle = OracleService()
