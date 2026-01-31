import asyncio
import time
import math
import random
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

app = FastAPI(title="SENTINEL: The Eye")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DreamEngine:
    """
    A Synthetic Intelligence module that generates realistic, 
    physics-based port data when visual feed is unavailable.
    """
    def __init__(self):
        self.start_time = time.time()
        
    def dream(self):
        # Generate deterministic "Chaos" based on time
        t = time.time() - self.start_time
        
        # 1. Traffic Logic: Generate simulated truck positions on Rethe Bridge
        # Bridge coords approx: 53.5005, 9.9705. Length approx 0.004 deg lat
        trucks = []
        traffic_count = int(5 + 5 * math.sin(t * 0.2)) # 0 to 10 trucks
        for i in range(traffic_count):
            # Move trucks south to north
            progress = (t + i * 10) % 100 / 100.0
            lat = 53.4990 + (0.0030 * progress)
            lng = 9.9705 + (0.0005 * math.sin(progress * 10)) # Slight wobble
            trucks.append({"id": f"T-{i}", "lat": lat, "lng": lng})

        # 2. Ship Logic: Vessels in the Elbe
        ships = []
        if math.sin(t * 0.05) > 0.8: # Occasional ship passing
            progress = (t * 0.5) % 1.0
            # Elbe path W to E
            lat = 53.5040
            lng = 9.960 + (0.020 * progress)
            ships.append({"id": "HMM-HAMBURG", "lat": lat, "lng": lng, "type": "container"})
            
        # 3. Anomaly Confidence
        confidence = 0.85 + (random.random() * 0.14)
        
        return {
            "node_id": "rethe",
            "class": "bridge_closed" if not ships else "bridge_open", # Open bridge if ship passing
            "confidence": round(confidence, 4),
            "traffic_flow": len(trucks),
            "trucks": trucks,
            "ships": ships,
            "timestamp": time.time(),
            "source": "SYNTHETIC_GPS_V2"
        }

# Global instances
dream_engine = DreamEngine()
last_state = {}

@app.on_event("startup")
async def startup_event():
    logger.info("The Eye is opening (Dream Mode)...")
    asyncio.create_task(dream_loop())

async def dream_loop():
    while True:
        # Generate synthetic reality at 1Hz
        global last_state
        last_state = dream_engine.dream()
        logger.info(f"Dream Stream: {last_state}")
        await asyncio.sleep(1)

@app.get("/")
def health_check():
    return {"status": "active", "mode": "dreaming", "current_state": last_state}

@app.get("/status")
def get_bridge_status(node_id: str):
    return last_state

