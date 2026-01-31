
import os
import requests
from datetime import datetime
import statistics

LOG_URL = "https://gdi.bsh.de/data/OpenData/ShipEmissions/ship_emissions_Wedel_AIS_shipdata/ship_emissions_Wedel_AIS_shipdata_20251016.log"
LOCAL_FILE = "history_data.log"

def analyze_log():
    # 1. Ensure File
    if not os.path.exists(LOCAL_FILE):
        print("Downloading log...")
        r = requests.get(LOG_URL)
        with open(LOCAL_FILE, "wb") as f:
            f.write(r.content)
            
    print(f"File Size: {os.path.getsize(LOCAL_FILE) / 1024 / 1024:.2f} MB")
    
    ship_names = {}
    positions = []
    
    with open(LOCAL_FILE, "r", encoding="utf-8", errors="ignore") as f:
        lines = f.readlines()
        print(f"Total Lines: {len(lines)}")
        
        for line in lines:
            parts = line.split(";")
            if len(parts) < 5: continue
            
            mmsi = parts[0]
            
            # Name
            if len(parts) > 3 and "Part A" in parts[2]:
                ship_names[mmsi] = parts[3].strip()
                
            # Position
            # Sample: ...;53.628715N;9.526228E;...
            if "N" in parts[4] and "E" in parts[5]:
                try:
                    lat = float(parts[4].replace("N", ""))
                    lng = float(parts[5].replace("E", ""))
                    positions.append((lat, lng))
                except:
                    pass

    print("--- ANALYSIS ---")
    print(f"Total Names Found: {len(ship_names)}")
    print(f"Total Positions Parsed: {len(positions)}")
    
    if positions:
        lats = [p[0] for p in positions]
        lngs = [p[1] for p in positions]
        
        print(f"Latitude Range: {min(lats):.4f} to {max(lats):.4f}")
        print(f"Longitude Range: {min(lngs):.4f} to {max(lngs):.4f}")
        print(f"Avg Lat: {statistics.mean(lats):.4f}")
        print(f"Avg Lng: {statistics.mean(lngs):.4f}")
        
        # HAMBURG PORT CENTER: 53.50, 9.97
        # WEDEL: 53.58, 9.70
        # If max Lng < 9.8, the ships NEVER reach the port view.
        
        ships_in_port = [p for p in positions if p[1] > 9.90]
        print(f"Positions East of 9.90 (Port Area): {len(ships_in_port)} / {len(positions)}")

if __name__ == "__main__":
    analyze_log()
