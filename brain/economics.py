class EconomicsEngine:
    def __init__(self):
        # --- EXTERNAL DATA SOURCE CONFIGURATION ---
        # Real-time fuel prices should be fetched from BunkerEx or Ship&Bunker API
        # API_ENDPOINT = "https://api.bunkerex.com/v1/prices"
        # API_KEY = os.getenv("BUNKER_API_KEY")
        
        self.market_data = self._fetch_live_market_data()
        
        self.diesel_price_eur = self.market_data["diesel_mgo_eur"]
        self.co2_per_liter = 2.64 # Constant physics
        self.idling_consumption_lph = 3.0
        
        # New: Megamax Economics (from Jan 2026 Report)
        self.megamax_hourly_charter_rate = 5000.0 
        self.dredging_op_cost_daily = 35000.0 

    def _fetch_live_market_data(self):
        """
        Simulates fetching live market data from Energy Exchanges (EEX/BunkerEx).
        In Simulation Mode (No API Key), returns pegged Jan 2026 values.
        """
        # [SIMULATION STUB]: In production, replace with httpx.get(API_ENDPOINT)
        return {
            "diesel_mgo_eur": 1.75, # Pegged MGO Price Hamburg
            "lng_eur_kwh": 0.08,    # LNG Spot Price
            "eua_carbon_price": 85.0 # EUR/ton CO2
        }

    def calculate_savings(self, trucks_rerouted: int, time_saved_hours: float):
        fuel_saved_liters = trucks_rerouted * time_saved_hours * self.idling_consumption_lph
        money_saved_eur = fuel_saved_liters * self.diesel_price_eur
        co2_saved_kg = fuel_saved_liters * self.co2_per_liter

        return {
            "fuel_saved_l": round(fuel_saved_liters, 2),
            "money_saved_eur": round(money_saved_eur, 2),
            "co2_saved_kg": round(co2_saved_kg, 2)
        }

    def calculate_tidal_delay_cost(self, draft_m: float, tide_level_m: float):
        """
        Calculates financial impact if a ship misses its tidal window.
        Based on 'The Tidal Constraint' (Report Section 3.2).
        """
        # Simple heuristic: If draft > 14.5 + tide, ship waits 12 (one tide cycle)
        safety_margin = 1.0
        required_depth = draft_m + safety_margin
        # Elbe depth approx 17m but let's say constraint is relevant relative to tide
        
        # If ship is DEEP (e.g. ONE TRIUMPH @ 16m), and Tide is LOW, it waits.
        if draft_m > 15.0 and tide_level_m < 1.0:
            delay_hours = 6.0 # Wait for High Water
            cost = delay_hours * self.megamax_hourly_charter_rate
            return {
                "status": "DELAYED",
                "reason": "TIDAL_WINDOW_MISSED",
                "cost_eur": cost,
                "delay_h": delay_hours
            }
        return {"status": "ON_TIME", "cost_eur": 0.0, "delay_h": 0}
