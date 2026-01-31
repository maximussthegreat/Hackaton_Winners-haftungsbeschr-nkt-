import asyncio
import websockets
import json
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("AISSTREAM_API_KEY")

async def connect_ais_stream():
    print(f"Testing AisStream with Key: {api_key[:5]}...{api_key[-5:] if api_key else 'None'}")
    
    if not api_key:
        print("❌ Error: No API Key found.")
        return

    subscribe_message = {
        "APIKey": api_key,
        "BoundingBoxes": [[
            [53.45, 9.70], 
            [53.60, 10.10]
        ]],
        "FiltersShipMMSI": [],
        "FilterMessageTypes": ["PositionReport"]
    }

    uri = "wss://stream.aisstream.io/v0/stream"

    try:
        async with websockets.connect(uri) as websocket:
            print("✅ Connected to WebSocket! Sending subscription...")
            await websocket.send(json.dumps(subscribe_message))
            print("✅ Subscription sent. Waiting for messages (Timeout 15s)...")

            async for message in websocket:
                msg = json.loads(message)
                print(f"📩 RECEIVED: {json.dumps(msg)[:100]}...")
                
                # If we get one valid position report, we are good.
                if "Message" in msg and "PositionReport" in msg["Message"]:
                    repo = msg["Message"]["PositionReport"]
                    meta = msg["MetaData"]
                    print(f"🚢 SHIP FOUND: {meta['ShipName']} at ({repo['Latitude']}, {repo['Longitude']})")
                    break

    except Exception as e:
        print(f"❌ Connection Failed: {e}")

if __name__ == "__main__":
    # Run with timeout
    try:
        asyncio.wait_for(connect_ais_stream(), timeout=20.0)
        asyncio.run(connect_ais_stream())
    except Exception as e:
        print(f"Test ended: {e}")
