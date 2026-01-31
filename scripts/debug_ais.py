import asyncio
import websockets
import json
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("AISSTREAM_API_KEY")

async def listen():
    uri = "wss://stream.aisstream.io/v0/stream"
    async with websockets.connect(uri) as websocket:
        subscribe_message = {
            "APIKey": api_key,
            "BoundingBoxes": [[
                [53.40, 9.60],  # Expanded South-West
                [53.70, 10.20]  # Expanded North-East
            ]],
            # "FilterMessageTypes": ["PositionReport"] # COMMENTED OUT TO SEE EVERYTHING
        }
        await websocket.send(json.dumps(subscribe_message))
        print("Listening for ALL AIS messages...")
        
        count = 0
        async for message in websocket:
            try:
                msg = json.loads(message)
                msg_type = msg.get("MessageType", "Unknown")
                meta = msg.get("MetaData", {})
                name = meta.get("ShipName", "Unknown")
                lat = 0
                lon = 0
                
                if "Message" in msg and "PositionReport" in msg["Message"]:
                    lat = msg["Message"]["PositionReport"]["Latitude"]
                    lon = msg["Message"]["PositionReport"]["Longitude"]
                elif "Message" in msg and "StandardClassBPositionReport" in msg["Message"]:
                    lat = msg["Message"]["StandardClassBPositionReport"]["Latitude"]
                    lon = msg["Message"]["StandardClassBPositionReport"]["Longitude"]
                    
                print(f"[{count}] Type: {msg_type} | Ship: {name} | Pos: {lat},{lon}")
                count += 1
                if count > 20: break
            except Exception as e:
                print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(listen())
