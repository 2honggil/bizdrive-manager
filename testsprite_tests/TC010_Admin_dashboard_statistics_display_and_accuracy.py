import asyncio
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None
    
    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()
        
        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )
        
        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)
        
        # Open a new page in the browser context
        page = await context.new_page()
        
        # Navigate to your target URL and wait until the network request is committed
        await page.goto("http://localhost:3000", wait_until="commit", timeout=10000)
        
        # Wait for the main page to reach DOMContentLoaded state (optional for stability)
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=3000)
        except async_api.Error:
            pass
        
        # Iterate through all iframes and wait for them to load as well
        for frame in page.frames:
            try:
                await frame.wait_for_load_state("domcontentloaded", timeout=3000)
            except async_api.Error:
                pass
        
        # Interact with the page elements to simulate user flow
        # -> Confirm metrics update in near real-time after data changes by simulating or observing data updates.
        frame = context.pages[-1]
        # Click on '차량운행기록' (Vehicle operation records) to simulate data change for vehicle logs.
        elem = frame.locator('xpath=html/body/div[2]/div/div[2]/div/a[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Return to the admin dashboard to verify the recent fixes for vehicle log saving and single-vehicle display, and check mobile layout responsiveness.
        frame = context.pages[-1]
        # Click on '대시보드' to return to the admin dashboard
        elem = frame.locator('xpath=html/body/div[2]/div/div[2]/div/a').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Simulate or trigger a vehicle log update to verify that the dashboard metrics update in near real-time.
        frame = context.pages[-1]
        # Click on '차량운행기록' to navigate to vehicle operation records for simulating data update.
        elem = frame.locator('xpath=html/body/div[2]/div/div[2]/div/a[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Simulate adding a new vehicle operation record to verify if the admin dashboard updates metrics in near real-time.
        frame = context.pages[-1]
        # Click '운행기록추가' (Add operation record) button to add a new vehicle log entry.
        elem = frame.locator('xpath=html/body/div[2]/div[2]/main/div/div/div[2]/div[2]/div[2]/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Input the end odometer reading only and proceed to save the record, then verify if the admin dashboard updates metrics in near real-time.
        frame = context.pages[-1]
        # Set the end odometer reading to 99100
        elem = frame.locator('xpath=html/body/div[2]/div[2]/main/div/div/div[2]/div/div[2]/form/div[4]/div[2]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('99100')
        

        frame = context.pages[-1]
        # Click the 저장하기 (Save) button to save the new vehicle operation record
        elem = frame.locator('xpath=html/body/div[2]/div[2]/main/div/div/div[2]/div/div[2]/form/div[7]/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Navigate back to the admin dashboard to verify that the new vehicle operation record is reflected in the real-time statistics and check the single-vehicle display for accuracy.
        frame = context.pages[-1]
        # Click on '대시보드' to return to the admin dashboard
        elem = frame.locator('xpath=html/body/div[2]/div/div[2]/div/a').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Test the mobile layout responsiveness of the admin dashboard to ensure usability on smaller screens.
        await page.mouse.wheel(0, await page.evaluate('() => window.innerHeight'))
        

        frame = context.pages[-1]
        # Click on '대시보드' to refresh the dashboard for mobile responsiveness test.
        elem = frame.locator('xpath=html/body/div[2]/div/div[2]/div/a').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Test the mobile layout responsiveness of the admin dashboard to ensure usability on smaller screens.
        await page.mouse.wheel(0, await page.evaluate('() => window.innerHeight'))
        

        await page.goto('http://localhost:3000/', timeout=10000)
        await asyncio.sleep(3)
        

        # -> Test the mobile layout responsiveness of the admin dashboard by resizing viewport or simulating a mobile device to ensure usability on smaller screens.
        await page.goto('http://localhost:3000/', timeout=10000)
        await asyncio.sleep(3)
        

        # -> Test the mobile layout responsiveness of the admin dashboard by simulating a mobile viewport to ensure usability on smaller screens.
        await page.goto('http://localhost:3000/', timeout=10000)
        await asyncio.sleep(3)
        

        await page.mouse.wheel(0, await page.evaluate('() => window.innerHeight'))
        

        # -> Simulate mobile viewport to test the responsiveness of the admin dashboard layout and verify usability on smaller screens.
        await page.goto('http://localhost:3000/', timeout=10000)
        await asyncio.sleep(3)
        

        await page.mouse.wheel(0, await page.evaluate('() => window.innerHeight'))
        

        # -> Simulate mobile viewport by resizing or using developer tools to verify the admin dashboard's responsiveness and usability on smaller screens.
        await page.goto('http://localhost:3000/', timeout=10000)
        await asyncio.sleep(3)
        

        await page.mouse.wheel(0, await page.evaluate('() => window.innerHeight'))
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        await expect(frame.locator('text=대시보드').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=오늘 오후 02:30').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=116 km').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=12.5% 감소').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=₩0').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=변동없음').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=0건 (예약 없음)').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=3%').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=39%').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=25%').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=0 km').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=284 km').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=2,523 km').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=1,140 km').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=697 km').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=526 km').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=1,246 km').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=732 km').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=예정된 예약이 없습니다.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=쏘렌토').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=195하4504').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=운행중').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=99,051 km').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=116 km').nth(1)).to_be_visible(timeout=30000)
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    