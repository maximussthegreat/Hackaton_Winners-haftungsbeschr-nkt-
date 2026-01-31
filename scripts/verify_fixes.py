import asyncio
import sys
import os

# Add project root to path
sys.path.append(os.getcwd())

async def test_fixes():
    print("--- TESTING TRAFFIC CORRECTION ---")
    from eye.traffic import TrafficService
    ts = TrafficService()
    # Mock result to avoid network call if possible, or just call it.
    # We'll call it. It handles errors gracefully.
    res = await ts.check_traffic()
    print(f"Traffic Result Type: {type(res)}")
    print(f"Traffic Result Keys: {res.keys() if isinstance(res, dict) else 'N/A'}")
    
    if isinstance(res, dict) and "incidents" in res and "verified_at" in res:
        print("✅ Traffic Service Fixed: Returns Dict")
    else:
        print("❌ Traffic Service Failed: Returns " + str(type(res)))

    print("\n--- TESTING SHIP STABILITY ---")
    from eye.geography import geography
    
    # Test Stability
    # 1. Same Seed -> Same Point
    pt1 = geography.get_safe_water_point("MSC GULSUN")
    pt2 = geography.get_safe_water_point("MSC GULSUN")
    
    print(f"Point 1: {pt1}")
    print(f"Point 2: {pt2}")
    
    if pt1 == pt2:
        print("✅ Geography Fixed: Stable Coordinates for Same Seed")
    else:
        print("❌ Geography Failed: Unstable Coordinates")
        
    # 2. Different Seed -> Different Point (High Probability)
    pt3 = geography.get_safe_water_point("HMM ALGECIRAS")
    print(f"Point 3 (Diff Seed): {pt3}")
    
    if pt1 != pt3:
        print("✅ Geography Fixed: Different Coordinates for Different Seed")
    else:
        print("⚠️ Warning: Seeds collided (Rare but possible)")

if __name__ == "__main__":
    asyncio.run(test_fixes())
