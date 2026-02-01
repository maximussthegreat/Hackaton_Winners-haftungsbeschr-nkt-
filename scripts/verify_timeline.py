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
        
        # 1. Verify Slider Range
        slider = page.locator("input[type='range']")
        min_val = await slider.get_attribute("min")
        max_val = await slider.get_attribute("max")
        val = await slider.input_value()
        
        print(f"Slider Range: {min_val} to {max_val}. Current: {val}")
        if min_val == "-24" and max_val == "24" and val == "0":
            print("SUCCESS: 48h Timeline Configured.")
        else:
            print("FAILURE: Slider configuration incorrect.")

        # 2. Verify Traffic Nodes (History Mode)
        # Drag slider to -12
        print("Simulating History (-12h)...")
        await slider.evaluate("el => el.value = -12")
        await slider.dispatch_event("change")
        await page.wait_for_timeout(2000)
        
        # Check for Traffic Sensor Popup or Circle
        # We can try to click the traffic toggle just in case
        # Default logic: !showTraffic && roadSegments... 
        # But wait, showTraffic is default likely false or true depending on previous state.
        # Let's explicitly set Traffic OFF to see Nodes.
        # Ensure we are in history mode (we are).
        
        # Capture Screenshot
        await page.screenshot(path="c:\\Users\\maxim\\HackatonJanuary\\audit_timeline.png")
        print("Screenshot saved to audit_timeline.png")
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
