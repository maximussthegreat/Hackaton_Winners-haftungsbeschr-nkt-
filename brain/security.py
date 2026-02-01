from datetime import datetime
import random

class SecurityService:
    def __init__(self):
        self.last_check = 0
        
        # MOCK DATA: NINA (Federal Office for Civil Protection) & Police Hamburg
        self.mock_feed = [
            {
                "source": "NINA",
                "category": "Weather",
                "text": "Sturmflutwarnung: Elbegebiet. Pegelstand +2.5m erwartet.",
                "relevant_to_port": True,
                "impact": "HIGH"
            },
            {
                "source": "POLIZEI_HH",
                "category": "Traffic",
                "text": "Versammlung/Demo in Altona. Verkehrsbehinderungen erwartet.",
                "relevant_to_port": False,
                "impact": "LOW"
            },
            {
                "source": "NINA",
                "category": "Chemical",
                "text": "Rauchentwicklung in Wilhelmsburg. Fenster schließen.",
                "relevant_to_port": True,
                "impact": "MEDIUM"
            },
            {
                "source": "POLIZEI_HH",
                "category": "Security",
                "text": "Verdächtiges Gepäckstück am Hauptbahnhof. Bereich gesperrt.",
                "relevant_to_port": False,
                "impact": "LOW"
            },
            {
                "source": "HPA_INTERNAL",
                "category": "Infrastructure",
                "text": "Kattwykbrücke: Wartungsarbeiten verlängert bis 14:00.",
                "relevant_to_port": True,
                "impact": "HIGH"
            }
        ]

    def check_alerts(self):
        """
        Simulates fetching and analyzing alerts.
        In production, this would hit API endpoints and use LLM to classify 'relevant_to_port'.
        """
        # Return a random relevant alert occasionally
        if random.random() < 0.3:
            alert = random.choice(self.mock_feed)
            alert["timestamp"] = datetime.now().isoformat()
            return alert
        return None
