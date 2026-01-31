
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from brain.history import historian
import asyncio

# Hack to run async _ensure_data if needed, but get_24h_history uses blocking requests check
# defined in the file.

print("Generating History...")
data = historian.get_24h_history()
ships = data.get("ships", [])

print(f"Total Ships Generated: {len(ships)}")

if len(ships) > 0:
    print(f"Sample Ship 1: {ships[0]['id']} with {len(ships[0]['path'])} points.")
    
# Check distribution of path lengths
lengths = [len(s['path']) for s in ships]
if lengths:
    print(f"Avg Pts per Ship: {sum(lengths)/len(lengths)}")
    print(f"Min Pts: {min(lengths)}")
    print(f"Max Pts: {max(lengths)}")
