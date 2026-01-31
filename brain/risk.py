# Simulation placeholder for Epydemix logic
# "Bio-Risk" Congestion Contagion Model

class RiskEngine:
    def __init__(self):
        self.risk_level = 0.0 # 0.0 to 1.0

    def calculate_risk(self, blocked_nodes: list):
        if not blocked_nodes:
            self.risk_level = 0.1
        else:
            # Simple simulation: Risk increases with blockage
            self.risk_level = min(1.0, len(blocked_nodes) * 0.3)
        
        return self.risk_level
