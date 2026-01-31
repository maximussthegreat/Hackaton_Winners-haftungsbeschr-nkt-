
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

try:
    print("Importing brain.history...")
    from brain import history
    print("Import successful.")
    
    print("Importing eye.geography...")
    from eye import geography
    print("Import successful.")

    print("Checking geography data...")
    print(f"Loaded {len(geography.geography.polygons)} polygons.")

except Exception as e:
    print(f"CRITICAL IMPORT ERROR: {e}")
    import traceback
    traceback.print_exc()
