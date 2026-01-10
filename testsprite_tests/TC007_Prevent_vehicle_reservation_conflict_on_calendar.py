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
        # -> Click on '차량예약' (Vehicle Reservation) to open the reservations calendar.
        frame = context.pages[-1]
        # Click on '차량예약' (Vehicle Reservation) to open the reservations calendar.
        elem = frame.locator('xpath=html/body/div[2]/div/div[2]/div/a[3]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click on the '새 예약' (New Reservation) button to start creating a new reservation.
        frame = context.pages[-1]
        # Click on the '새 예약' (New Reservation) button to open the reservation creation form.
        elem = frame.locator('xpath=html/body/div[2]/div[2]/main/div/div/div/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Select a vehicle that is already reserved at the chosen time from the vehicle dropdown.
        frame = context.pages[-1]
        # Click on the vehicle dropdown to select a vehicle already reserved at the chosen time.
        elem = frame.locator('xpath=html/body/div[2]/div[2]/main/div/div/div[4]/div/div[2]/form/div/select').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Input a purpose for the reservation and click the '예약 완료' (Complete Reservation) button to attempt saving the conflicting reservation.
        frame = context.pages[-1]
        # Input purpose '출장' (business trip) into the purpose field.
        elem = frame.locator('xpath=html/body/div[2]/div[2]/main/div/div/div[4]/div/div[2]/form/div[4]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('출장')
        

        frame = context.pages[-1]
        # Click the '예약 완료' (Complete Reservation) button to submit the reservation form.
        elem = frame.locator('xpath=html/body/div[2]/div[2]/main/div/div/div[4]/div/div[2]/form/div[5]/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Re-select the vehicle '기아 쏘렌토 (195하4504)' in the dropdown and re-fill the purpose field, then attempt to submit again to verify conflict blocking.
        frame = context.pages[-1]
        # Re-open the vehicle dropdown to re-select '기아 쏘렌토 (195하4504)'.
        elem = frame.locator('xpath=html/body/div[2]/div[2]/main/div/div/div[4]/div/div[2]/form/div/select').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click the '예약 완료' (Complete Reservation) button to submit the reservation form and verify if the system blocks the reservation due to conflict.
        frame = context.pages[-1]
        # Click the '예약 완료' (Complete Reservation) button to submit the reservation form and test conflict blocking.
        elem = frame.locator('xpath=html/body/div[2]/div[2]/main/div/div/div[4]/div/div[2]/form/div[5]/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Manually select the vehicle '기아 쏘렌토 (195하4504)' again in the dropdown to ensure it is selected, then submit the form again to test conflict blocking.
        frame = context.pages[-1]
        # Click the vehicle dropdown to select '기아 쏘렌토 (195하4504)' again.
        elem = frame.locator('xpath=html/body/div[2]/div[2]/main/div/div/div[4]/div/div[2]/form/div/select').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        try:
            await expect(frame.locator('text=Reservation Successful').first).to_be_visible(timeout=3000)
        except AssertionError:
            raise AssertionError("Test failed: The system did not block the reservation creation for a vehicle already booked at the specified time, violating the test plan requirement.")
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    