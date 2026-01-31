
import requests
import json
import statistics

def verify_api():
    try:
        print("Fetching history...")
        res = requests.get("http://localhost:8002/history", timeout=10)
        if res.status_code != 200:
            print(f"Error: Status {res.status_code}")
            return
            
        data = res.json()
        ships = data.get("ships", [])
        print(f"Ships returned: {len(ships)}")
        
        all_lats = []
        all_lngs = []
        
        for s in ships:
            for p in s["path"]:
                all_lats.append(p["lat"])
                all_lngs.append(p["lng"])
                
        if not all_lngs:
            print("No path data found.")
            return

        min_lng = min(all_lngs)
        max_lng = max(all_lngs)
        avg_lng = statistics.mean(all_lngs)
        
        print(f"Longitude Range: {min_lng:.4f} to {max_lng:.4f}")
        print(f"Average Longitude: {avg_lng:.4f}")
        
        # Validation
        if avg_lng > 9.80:
            print("SUCCESS: Ships are mapped to Hamburg Port Area.")
        else:
            print("FAILURE: Ships are still in Wedel (West of 9.80).")

    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    verify_api()
