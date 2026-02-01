import os
import sys
import asyncio

# 1. FIX ENV
if "HOME" not in os.environ:
    os.environ["HOME"] = os.path.expanduser("~")

# 2. RUN
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        print("Launching browser...")
        browser = await p.chromium.launch()
        page = await browser.new_page()
        
        print("Navigating to localhost:3000...")
        await page.goto("http://localhost:3000")
        await page.wait_for_timeout(3000)
        
        # Click FUTURE button
        print("Activating Future Mode...")
        # Button text might be "🔮 FUTURE"
        future_btn = page.get_by_text("🔮 FUTURE")
        await future_btn.click()
        
        await page.wait_for_timeout(2000)
        
        # Check if overlay appeared
        overlay = page.locator("text=ORACLE 24H")
        if await overlay.is_visible():
            print("Future Overlay Visible!")
        else:
            print("Future Overlay NOT Found!")
            
        # Capture Screenshot
        output_path = "c:\\Users\\maxim\\HackatonJanuary\\audit_future.png"
        await page.screenshot(path=output_path)
        print(f"Screenshot saved to {output_path}")
        
        await browser.close()

if __name__ == "__main__":
    import asyncio
    asyncio.run(run())
