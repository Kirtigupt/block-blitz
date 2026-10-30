const puppeteer = require('puppeteer-core');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:5173';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });
  await page.goto(APP_URL, { waitUntil: 'networkidle0' });
  await page.click('.welcome-play-now-btn');
  await sleep(300);
  const guestBtn = await page.$('.guest-continue-btn');
  if (guestBtn) await guestBtn.click();
  await sleep(400);
  await page.click('.adventure-play-btn, .dock-action-button');
  await sleep(400);
  const intro = await page.$('.intro-start-btn');
  if (intro) await intro.click();
  await sleep(500);

  const result = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    const off = all.filter(el => {
      const rect = el.getBoundingClientRect();
      return rect.right > 390 || rect.left < 0;
    }).map(el => ({
      tag: el.tagName,
      className: el.className,
      left: Math.round(el.getBoundingClientRect().left),
      right: Math.round(el.getBoundingClientRect().right),
      width: Math.round(el.getBoundingClientRect().width)
    }));
    return {
      docScrollWidth: document.documentElement.scrollWidth,
      docClientWidth: document.documentElement.clientWidth,
      bodyScrollWidth: document.body.scrollWidth,
      offendingElements: off
    };
  });

  console.log(JSON.stringify(result, null, 2));
  await browser.close();
}

run().catch(console.error);
