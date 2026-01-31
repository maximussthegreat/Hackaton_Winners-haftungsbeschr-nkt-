import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
from eye.scraper import WebcamScraper
from eye.vision import VisionEngine

app = FastAPI(title="SENTINEL: The Eye")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global instances
scraper = WebcamScraper(headless=True)
vision = VisionEngine()

# State store
last_state = {"node_id": "rethe", "class": "unknown", "confidence": 0.0, "timestamp": 0}

@app.on_event("startup")
async def startup_event():
    scraper.start()
    asyncio.create_task(monitoring_loop())

@app.on_event("shutdown")
def shutdown_event():
    scraper.stop()

async def monitoring_loop():
    while True:
        try:
            # Monitoring "Webcam 44" (Mock URL for now)
            # In real demo, this would be the actual HPA URL
            frame = scraper.get_frame("https://www.hafen-hamburg.de/en/experience/webcam-teufelsbrueck/")
            
            if frame:
                 # TODO: Convert PNG bytes to OpenCV format for vision
                 # Currently scraper returns bytes. We need to decode.
                 import cv2
                 import numpy as np
                 nparr = np.frombuffer(frame, np.uint8)
                 img_np = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

                 result = vision.process_frame(img_np)
                 last_state.update(result)
                 logger.info(f"Monitor Loop: {result}")
            
        except Exception as e:
            logger.error(f"Monitoring loop error: {e}")
        
        await asyncio.sleep(5) # 0.2Hz for safety in dev, 1Hz in prod

@app.get("/")
def health_check():
    return {"status": "active", "service": "eye", "current_state": last_state}

@app.get("/status")
def get_bridge_status(node_id: str):
    return last_state

