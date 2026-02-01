
import requests
import time
import sys

def verify_prediction():
    print("Testing /prediction/future endpoint...")
    try:
        resp = requests.get("http://127.0.0.1:8002/prediction/future")
        if resp.status_code != 200:
            print(f"FAILED: Status {resp.status_code}")
            return False
            
        data = resp.json()
        timeline = data.get("timeline", [])
        print(f"Timeline Length: {len(timeline)} hours")
        
        found_ships = False
        for i, snap in enumerate(timeline):
            ships = snap.get("ships", [])
            print(f"Hour +{i}: {len(ships)} ships")
            if len(ships) > 0:
                found_ships = True
                
        if found_ships:
            print("SUCCESS: Ships detected in future prediction.")
            return True
        else:
            print("FAILURE: No ships found in any future snapshot.")
            return False

    except Exception as e:
        print(f"ERROR: Could not connect: {e}")
        return False

if __name__ == "__main__":
    if verify_prediction():
        sys.exit(0)
    else:
        sys.exit(1)
