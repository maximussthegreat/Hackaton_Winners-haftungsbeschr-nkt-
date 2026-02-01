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
        url = "http://localhost:3001"
        print(f"Navigating to {url}...")
        
        try:
            await page.goto(url)
        except:
            print("Port 3001 failed, trying 3000...")
            await page.goto("http://localhost:3000")
            
        await page.wait_for_timeout(5000)

        # 1. Enter Future Mode (+5h)
        print("Moving Slider to Future (+5h)...")
        slider = page.locator("input[type='range']")
        await slider.fill("5") 
        await slider.dispatch_event("change")
        await page.wait_for_timeout(3000)

        # 2. Check for Traffic Particle Canvas
        # Leaflet overlay pane usually contains SVGs (paths) and Canvases (Tiles).
        # Our particle canvas is appended to overlayPane.
        # We look for a CANVAS element that is NOT a tile (tiles usually have specialized classes)
        # Or just count canvases. Leaflet usually uses SVGs for vectors.
        # But 'leaflet-zoom-animated' is the class we gave it.
        canvases = page.locator("canvas.leaflet-zoom-animated")
        count = await canvases.count()
        print(f"Traffic/Weather Canvases found: {count}")
        
        if count >= 1:
            print("SUCCESS: Dynamic Canvas Layer detected.")
        else:
            print("WARNING: No Particle Canvas found.")

        # 3. Check for Ghost Ships
        # We need to find Markers. Leaflet markers are usually img with class 'leaflet-marker-icon'
        # or divs (DivIcon). Our ships are DivIcons.
        # Check Popup content? Hard to click all.
        # Let's just check marker count.
        markers = await page.locator(".leaflet-marker-icon").count()
        print(f"Total Markers: {markers}")
        
        # 4. Screenshot
        await page.screenshot(path="c:\\Users\\maxim\\HackatonJanuary\\audit_visuals.png")
        print("Screenshot saved to audit_visuals.png")
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
