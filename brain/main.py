import asyncio
import httpx
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
conflict_engine = ConflictEngine()
economics_engine = EconomicsEngine()
risk_engine = RiskEngine()
sentinel_api = SentinelAPI()
voice_agent = VoiceAgent()

# State
current_state = {
    "simulation_active": False,
    "trucks_rerouted": 0,
    "savings": {"fuel_saved_l": 0, "co2_saved_kg": 0, "money_saved_eur": 0},
    "visual_truth": {"status": "scanning", "confidence": 0.0},
    "system_logs": []
}

async def poll_eyes():
    """Background task to fetch visual truth from The Eye"""
    async with httpx.AsyncClient() as client:
        while True:
            try:
                # Poll The Eye
                resp = await client.get("http://localhost:8001/status?node_id=rethe")
                if resp.status_code == 200:
                    data = resp.json()
                    current_state["visual_truth"] = data
                    
                    # Log to system console
                    if data.get("class") == "bridge_closed":
                         add_log("EYE_CONTACT", "Visual Verification: BRIDGE CLOSED (Confidence: 98%)")
                    else:
                         # Occasional heartbeat
                         if len(current_state["system_logs"]) == 0 or "Scanning" not in current_state["system_logs"][-1]:
                             add_log("EYE_SCAN", "Scanning Rethe Bridge... (Visual Feed Stable)")
                             
            except Exception as e:
                logger.error(f"Could not connect to Eye: {e}")
                add_log("ERROR", "Connection to Eye Service lost. Retrying...")
            
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
    
    conflict_engine.update_api_state(node_id, api_val)
    conflict_engine.update_visual_state(node_id, vis_val)
    
    is_conflict = conflict_engine.check_conflict(node_id)
    return {"verified": is_conflict, "action": "override" if is_conflict else "none"}

@app.post("/simulate/sensor_failure")
def trigger_simulation():
    logger.warning("SIMULATION STARTED: Sensor Failure at Rethe Bridge")
    current_state["simulation_active"] = True
    
    # Calculate mock savings
    savings = economics_engine.calculate_savings(trucks_rerouted=42, time_saved_hours=3.0)
    current_state["savings"] = savings
    current_state["trucks_rerouted"] = 42
    
    # Calculate risk
    risk = risk_engine.calculate_risk(blocked_nodes=["rethe_bridge"])
    
    # Generate speech
    speech = voice_agent.generate_climax_speech(savings)
    
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

