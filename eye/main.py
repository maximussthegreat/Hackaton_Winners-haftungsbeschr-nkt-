import asyncio
import time
import math
import random
import json
import websockets
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

# Global State Container for Real Ships
real_ships_buffer = {}

def update_ship_state(ship):
    real_ships_buffer[ship["id"]] = ship

class DreamEngine:
    """
    Real-time AIS tracking via AisStream.io WebSocket.
    Uses free API key (User needs to provide their own or use demo key).
    """
    def __init__(self):
        self.start_time = time.time() # Initialize start_time for simulation fallback
        self.uri = "wss://stream.aisstream.io/v0/stream"
        self.api_key = "602517822b3b0816996894c489710777017686d1" # Free key placeholder (Note: If this key is invalid, connection closes)
        # Bounding Box for Hamburg Port Area
        self.bounding_boxes = [[
            [53.480, 9.900], # SW
            [53.560, 10.050] # NE
        ]]

    async def connect_and_stream(self):
        while True:
            try:
                async with websockets.connect(self.uri) as websocket:
                    logger.info("Connected to AisStream WebSocket")
                    subscribe_message = {
                        "APIKey": self.api_key,
                        "BoundingBoxes": self.bounding_boxes,
                        "FiltersShipMMSI": [], 
                        "FilterMessageTypes": ["PositionReport"]
                    }
                    await websocket.send(json.dumps(subscribe_message))
                    
                    async for message in websocket:
                        try:
                            data = json.loads(message)
                            if "Message" not in data:
                                continue
                                
                            if "PositionReport" in data["Message"]:
                                report = data["Message"]["PositionReport"]
                                meta = data["MetaData"]
                                
                                ship = {
                                    "id": meta["ShipName"].strip(),
                                    "lat": report["Latitude"],
                                    "lng": report["Longitude"],
                                    "type": "real_vessel",
                                }
                                update_ship_state(ship)
                                
                        except Exception as e:
                            logger.error(f"AIS Message Error: {e}")
            except Exception as e:
                logger.warning(f"AisStream Connection Failed (Retrying in 5s): {e}")
                await asyncio.sleep(5)

    def dream(self):
        # ... (Hybrid Logic) ...
        t = time.time() - self.start_time
        
        # 1. Traffic Logic (still synthetic for now, until TomTom key)
        trucks = []
        traffic_count = int(5 + 5 * math.sin(t * 0.2)) 
        for i in range(traffic_count):
            progress = (t + i * 10) % 100 / 100.0
            lat = 53.4990 + (0.0030 * progress)
            lng = 9.9705 + (0.0005 * math.sin(progress * 10))
            trucks.append({"id": f"T-{i}", "lat": lat, "lng": lng})

        # 2. Ship Logic: PREFER REAL DATA
        current_ships = list(real_ships_buffer.values())
        
        # Fallback if no real ships tracked 
        if not current_ships:
             if math.sin(t * 0.05) > 0.8: 
                progress = (t * 0.5) % 1.0
                lat = 53.5040
                lng = 9.960 + (0.020 * progress)
                current_ships.append({"id": "SIM-VESSEL", "lat": lat, "lng": lng, "type": "simulated"})

        confidence = 0.98 if current_ships else 0.85
        
        return {
            "node_id": "rethe",
            "class": "bridge_open" if len(current_ships) > 0 else "bridge_closed", 
            "confidence": confidence,
            "traffic_flow": len(trucks),
            "trucks": trucks,
            "ships": current_ships,
            "timestamp": time.time(),
            "source": "HYBRID_AIS_Live"
        }

# Global instances
dream_engine = DreamEngine()
last_state = {}

@app.on_event("startup")
async def startup_event():
    logger.info("The Eye is opening (Hybrid Mode)...")
    asyncio.create_task(dream_engine.connect_and_stream())
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

