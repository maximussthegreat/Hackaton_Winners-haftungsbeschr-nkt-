class EconomicsEngine:
    def __init__(self):
        self.diesel_price_eur = 1.75
        self.co2_per_liter = 2.64
        self.idling_consumption_lph = 3.0

    def calculate_savings(self, trucks_rerouted: int, time_saved_hours: float):
        fuel_saved_liters = trucks_rerouted * time_saved_hours * self.idling_consumption_lph
        money_saved_eur = fuel_saved_liters * self.diesel_price_eur
        co2_saved_kg = fuel_saved_liters * self.co2_per_liter

        return {
            "fuel_saved_l": round(fuel_saved_liters, 2),
            "money_saved_eur": round(money_saved_eur, 2),
            "co2_saved_kg": round(co2_saved_kg, 2)
        }
