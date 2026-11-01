import puppeteer from 'puppeteer-core';

async function check() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  const rows = await page.$$('tr');
  for (const r of rows) {
    const txt = await r.evaluate(e => e.innerText);
    if (txt.includes('ORD-2026-PP01')) {
      await r.click();
      break;
    }
  }
  await page.waitForSelector('h2', { timeout: 5000 });
  const text = await page.$eval('body', el => el.innerText);
  console.log('Case insensitive match:', text.toLowerCase().includes('automated synthesis'));
  const match = text.match(/automated synthesis/i);
  console.log('Matched text in DOM:', match ? match[0] : 'null');
  await browser.close();
}
check();
