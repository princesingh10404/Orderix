import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:3000';

async function testErrorDisplay() {
  console.log('Testing Error Display Handling in Frontend...');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setRequestInterception(true);

  // Intercept the next /api/orders/tinyfish/track call to simulate a realistic network or carrier failure
  let intercepted = false;
  page.on('request', req => {
    if (req.url().includes('/api/orders/tinyfish/track') && req.method() === 'POST') {
      intercepted = true;
      req.respond({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Carrier Portal Connection Timeout: The remote tracking website failed to respond.'
        })
      });
    } else {
      req.continue();
    }
  });

  await page.goto(APP_URL, { waitUntil: 'networkidle2' });

  // Select an order
  const rows = await page.$$('tr');
  for (const r of rows) {
    const txt = await r.evaluate(e => e.innerText);
    if (txt.includes('ORD-2026-PP01')) {
      await r.click();
      break;
    }
  }

  await page.waitForSelector('h2', { timeout: 5000 });

  // Click the live sync button
  const trackBtn = await page.evaluateHandle(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    return btns.find(b => b.innerText.includes('Sync Live with TinyFish') || b.innerText.includes('Track Live with TinyFish'));
  });

  await trackBtn.click();

  // Wait for the error banner to appear in DOM
  await page.waitForSelector('.bg-rose-950\\/40', { timeout: 5000 });
  const errorBannerText = await page.$eval('.bg-rose-950\\/40', el => el.innerText);

  console.log('✓ Error Banner successfully caught and rendered in UI:');
  console.log(`  "${errorBannerText}"`);

  const containsExpectedError = errorBannerText.includes('Carrier Portal Connection Timeout');
  console.log('✓ Matches intercepted error message:', containsExpectedError);

  await browser.close();

  if (!containsExpectedError) {
    throw new Error('Error message did not match expected display.');
  }

  console.log('✓ Step 7 Verification Complete: Errors are displayed cleanly with high-visibility styling.');
}

testErrorDisplay();

