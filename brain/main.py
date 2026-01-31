import asyncio
import httpx
import os
import random
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
from brain.conflict import ConflictEngine
from brain.economics import EconomicsEngine
from brain.risk import RiskEngine
from brain.api import SentinelAPI
from brain.voice import VoiceAgent

app = FastAPI(title="SENTINEL: The Brain")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Engines
from brain.cognition import LLMService

# Replaced old engines with The Cognitive Core
llm_service = LLMService()
# conflict_engine = ConflictEngine() # Deprecated
# economics_engine = EconomicsEngine() # Deprecated
# risk_engine = RiskEngine() # Deprecated
sentinel_api = SentinelAPI()
voice_agent = VoiceAgent()

# State
current_state = {
    "simulation_active": False,
    "trucks_rerouted": 0,
    "savings": {"fuel_saved_l": 0, "co2_saved_kg": 0, "money_saved_eur": 0},
    "visual_truth": {"status": "scanning", "confidence": 0.0},
    "system_logs": [],
    "ai_thought": "Initializing Neural Link...",
    "risk_grade": "LOW"
}


# ...

from brain.prediction import PredictiveEngine
# ...
predictive_engine = PredictiveEngine()
# ...

async def poll_eyes():
    """Background task to fetch visual truth from The Eye"""
    async with httpx.AsyncClient() as client:
        nodes = ["rethe", "kattwyk"]
        while True:
            try:
                aggregated_ships = []
                aggregated_trucks = []
                tide_level = 0
                all_traffic_alerts = []
                
                for node in nodes:
                    resp = await client.get(f"http://127.0.0.1:8001/status?node_id={node}")
                    if resp.status_code == 200:
                        data = resp.json()
                        
                        # Aggregate Data
                        aggregated_trucks.extend(data.get("trucks", []))
                        # Ships are global, but we take latest set
                        if len(data.get("ships", [])) > len(aggregated_ships):
                            aggregated_ships = data.get("ships", [])
                        if "tide_level_m" in data:
                            tide_level = data["tide_level_m"]
                        if "traffic_alerts" in data:
                            all_traffic_alerts.extend(data["traffic_alerts"])

                # Update State for Cognition
                current_state["visual_truth"] = {
                    "ships": aggregated_ships,
                    "trucks": aggregated_trucks,
                    "tide": tide_level,
                    "traffic_alerts": list(set(all_traffic_alerts)), # Deduplicate
                    "nodes": nodes
                }

                # 3. ULTRATHINK: CALL THE LLM
                # We throttle this to save tokens (every ~10s or 5 loops)
                if random.random() < 0.2: 
                    thought = llm_service.analyze_situation(current_state)
                    
                    # LOG THE GRAND STRATEGY
                    if "reasoning" in thought:
                        add_log("SENTINEL AI", thought["reasoning"])
                    
                    if "ai_thought" in thought:
                         add_log("SENTINEL MIND", f"THOUGHT: {thought['ai_thought']}")
                         current_state["ai_thought"] = thought["ai_thought"] # Persist for UI
                         current_state["risk_grade"] = thought.get("risk_grade", "LOW") # Persist for UI

                    if thought.get("action") == "OPEN_BRIDGE":
                         add_log("COMMAND", "Directing Bridge Operators: OPEN.")
                    
                    # Trigger Voice if Script generated
                    if "voice_script" in thought:
                         # Here we would send to TTS
                         pass

            except Exception as e:
                logger.error(f"Could not connect to Eye: {e}")
            
            await asyncio.sleep(2)

def add_log(source: str, message: str):
    """Add a log entry to the rolling system console"""
    entry = f"[{source}] {message}"
    current_state["system_logs"].append(entry)
    if len(current_state["system_logs"]) > 10:
        current_state["system_logs"].pop(0)

@app.on_event("startup")
async def startup_event():
    logger.info("Brain Activation...")
    asyncio.create_task(poll_eyes())

@app.get("/")
def health_check():
    return {"status": "active", "service": "brain", "state": current_state}

@app.post("/conflict/verify")
def verify_conflict(data: dict):
    # node_id, api_state, visual_state
    node_id = data.get("node_id")
    api_val = data.get("api_state")
    vis_val = data.get("visual_state")
    
    # conflict_engine.update_api_state(node_id, api_val)
    # conflict_engine.update_visual_state(node_id, vis_val)
    
    is_conflict = (api_val != vis_val) # Simple boolean logic replacements
    return {"verified": is_conflict, "action": "override" if is_conflict else "none"}

@app.post("/simulate/sensor_failure")
def trigger_simulation():
    logger.warning("SIMULATION STARTED: Sensor Failure at Rethe Bridge")
    current_state["simulation_active"] = True
    
    # Calculate mock savings
    # engines deprecated - using hardcoded mock for simulation demo
    savings = {"fuel_saved_l": 120, "co2_saved_kg": 350, "money_saved_eur": 500}
    current_state["savings"] = savings
    current_state["trucks_rerouted"] = 42
    
    # Calculate risk
    risk = 100 # risk_engine.calculate_risk(blocked_nodes=["rethe_bridge"])
    
    # Generate speech
    speech = {"text": "Simulation Active. Rerouting traffic.", "audio": None} # voice_agent.generate_climax_speech(savings)
    
    add_log("ALERT", "CRITICAL ANOMALY DETECTED at Rethe Bridge")
    add_log("DECISION", "Calculated Risk Level: 100%. Initiating Protocol: ZERO_HOUR")
    add_log("ACTION", f"Broadcasting Reroute Instructions to {42} connected drivers.")
    
    return {
        "event": "CRITICAL_OVERRIDE",
        "message": "Anomaly contained. 42 units rerouted.",
        "metrics": savings,
        "risk_level": risk,
        "voice_response": speech
    }

@app.post("/voice/command")
def process_voice_command(command: dict):
    # {"text": "Antigravity, simulate sensor failure"}
    text = command.get("text", "")
    response = voice_agent.process_command(text)
    
    if response["action"] == "trigger_simulation":
        trigger_simulation()
        
    return response

if __name__ == "__main__":
    logger.info("Starting The Brain...")
    uvicorn.run(app, host="0.0.0.0", port=8002)

