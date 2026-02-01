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
        
        # Note: Previous logs said Port 3001
        url = "http://localhost:3000"
        print(f"Navigating to {url}...")
        
        try:
            await page.goto(url)
        except:
             # Try other port if 3000 busy
            print("Port 3000 failed, trying 3001...")
            await page.goto("http://localhost:3001")
            
        await page.wait_for_timeout(3000)

        # 1. Enter Future Mode (+8h to ensure ships are active)
        print("Moving Slider to Future (+8h)...")
        slider = page.locator("input[type='range']")
        await slider.fill("8") 
        await slider.dispatch_event("change")
        await page.wait_for_timeout(4000)

        # 2. Check for Ships
        # We need to find Markers.
        # "PREDICTED: MSC ANNA" should be in the DOM if we find markers.
        markers = await page.locator(".leaflet-marker-icon").count()
        print(f"Total Markers: {markers}")
        
        if markers > 2: # At least bridges + bridge markers + simulated ships
            print("SUCCESS: Markers detected in Future Mode.")
        else:
            print("FAILURE: No Markers/Ships found.")

        # 3. Screenshot
        await page.screenshot(path="c:\\Users\\maxim\\HackatonJanuary\\audit_future_ships.png")
        print("Screenshot saved to audit_future_ships.png")
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
