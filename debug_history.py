import sys
import os
import json

# Add project root to path
sys.path.append(os.getcwd())

from brain.history import fetch_historical_movement
from brain.history import historian

def test_generation():
    print("1. Testing Raw Generation (fetch_historical_movement)...")
    raw_data = fetch_historical_movement() # List[Dict]
    
    open_count = 0
    traffic_spikes = 0
    
    print(f"   Generated {len(raw_data)} snapshots.")
    
    for snap in raw_data:
        bridges = snap.get("bridges", {})
        traffic = snap.get("traffic_density", 0)
        
        is_open = bridges.get("RETHE") == "OPEN" or bridges.get("KATTWYK") == "OPEN"
        
        if is_open:
            open_count += 1
        
        if traffic > 80:
            traffic_spikes += 1
            
    print(f"   -> Bridge Open Snapshots: {open_count}")
    print(f"   -> High Traffic Snapshots: {traffic_spikes}")
    
    if open_count == 0:
        print("FAIL: Raw generation has no bridge openings.")
        return

    print("\n2. Testing Historian Aggregation (get_24h_history)...")
    # Force reload/regen if needed (already generated above effectively)
    formatted_data = historian.get_24h_history()
    
    timeline = formatted_data.get("timeline", [])
    print(f"   Timeline length: {len(timeline)}")
    
    if not timeline:
        print("FAIL: Timeline missing from formatted output.")
    else:
        # Verify timeline data matches
        tl_open = sum(1 for t in timeline if t["bridges"].get("RETHE") == "OPEN" or t["bridges"].get("KATTWYK") == "OPEN")
        print(f"   -> Timeline 'OPEN' events: {tl_open}")
        
        if tl_open > 0:
            print("SUCCESS: Full pipeline verified.")
        else:
            print("FAIL: Timeline exists but lost Open events?")

if __name__ == "__main__":
    test_generation()
