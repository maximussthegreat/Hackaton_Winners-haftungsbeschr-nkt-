from loguru import logger

class VoiceAgent:
    def __init__(self):
        self.context = []

    def process_command(self, command: str):
        logger.info(f"Voice Agent received: {command}")
        
        # Simple intent matching for demo
        clean_cmd = command.lower()
        
        if "antigravity" in clean_cmd and "sensor failure" in clean_cmd:
            return {
                "action": "trigger_simulation",
                "response_text": "Initiating Zero Hour protocol. Simulating sensor failure at Rethe Bridge."
            }
        
        if "report" in clean_cmd:
            return {
                "action": "report_status",
                "response_text": "All systems nominal. Eye of Hamburg is tracking 142 vessels."
            }
            
        return {
            "action": "unknown",
            "response_text": "Command not recognized. Please repeat."
        }

    def generate_climax_speech(self, savings: dict):
        text = (
            f"Anomaly contained. Sensor deviation at Rethe Hub verified visually. "
            f"42 units rerouted via Southern Bypass. "
            f"Projected savings: {savings['money_saved_eur']} Euros in idling costs. "
            f"{savings['co2_saved_kg']} kilograms of carbon prevented."
        )
        return text
