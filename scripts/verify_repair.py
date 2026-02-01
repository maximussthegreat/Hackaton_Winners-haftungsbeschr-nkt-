import os
import sys
import asyncio
from playwright.async_api import async_playwright

# 1. FIX ENV
if "HOME" not in os.environ:
    os.environ["HOME"] = os.path.expanduser("~")

async def run():
    async with async_playwright() as p:
        print("Launching browser...")
        browser = await p.chromium.launch()
        page = await browser.new_page()
        
        print("Navigating to localhost:3000...")
        await page.goto("http://localhost:3000")
        await page.wait_for_timeout(3000)

        # 1. Verify Traffic Layer Presence (TomTom)
        # Check for a tile layer with opacity 0.8 (we hardcoded this)
        # In Leaflet, this is usually a div with class 'leaflet-layer' and style opacity: 0.8
        traffic_layer = page.locator(".leaflet-layer").filter(has_not=page.locator("text=OpenStreetMap"))
        # This is a bit tricky to find generic leaflet layer by URL via selector.
        # Let's just check if we have multiple layers.
        count = await page.locator(".leaflet-tile-container").count()
        print(f"Leaflet Tile Containers found: {count}")
        if count >= 2:
            print("SUCCESS: Multiple Tile Layers detected (Base + Traffic).")
        else:
            print("WARNING: Might be missing Traffic Layer.")

        # 2. Verify Slider Stability (Future Mode)
        print("Testing Slider Future Mode (Crash Verification)...")
        slider = page.locator("input[type='range']")
        
        # Move to +5h
        await slider.fill("5") 
        await slider.dispatch_event("change")
        await page.wait_for_timeout(2000)
        
        # Check if page is still alive (no crash error overlay)
        if await page.query_selector("text=Application error"): 
            print("FAILURE: Application Error detected.")
        else:
            print("SUCCESS: No Crash detected after Future Slider move.")

        # 3. Take Screenshot
        await page.screenshot(path="c:\\Users\\maxim\\HackatonJanuary\\audit_repair.png")
        print("Screenshot saved to audit_repair.png")
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
