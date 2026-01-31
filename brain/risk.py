# Simulation placeholder for Epydemix logic
# "Bio-Risk" Congestion Contagion Model

class RiskEngine:
    def __init__(self):
        self.risk_level = 0.0 # 0.0 to 1.0

    def calculate_risk(self, blocked_nodes: list, weather_condition: str = "CLEAR"):
        """
        Calculates risk based on network blockages and weather.
        Weather codes from Jan 2026 Report:
        - FZDZ: Freezing Drizzle (Black Ice) -> CRITICAL
        - SHSNRA: Snow/Rain -> MODERATE
        - CLEAR: Normal -> LOW
        """
        base_risk = 0.1
        
        # 1. Congestion Risk
        congestion_risk = len(blocked_nodes) * 0.3
        
        # 2. Weather Multiplier (The "Hydrometeorological Constraint")
        weather_risk = 0.0
        if weather_condition == "FZDZ": # Black Ice
            weather_risk = 0.5 # Immediate +50% Risk
        elif weather_condition == "SHSNRA": # Slush
            weather_risk = 0.2
            
        self.risk_level = min(1.0, base_risk + congestion_risk + weather_risk)
        
        return self.risk_level
