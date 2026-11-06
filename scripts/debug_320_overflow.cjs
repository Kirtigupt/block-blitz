const puppeteer = require('puppeteer-core');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:5173';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function findOverflow() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 320, height: 640 });
  await page.goto(APP_URL, { waitUntil: 'networkidle0' });
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.reload({ waitUntil: 'networkidle0' });
  await sleep(400);

  const playBtn = await page.$('.welcome-play-now-btn');
  if (playBtn) { await playBtn.click(); await sleep(300); }
  const guestBtn = await page.$('.guest-continue-btn');
  if (guestBtn) { await guestBtn.click(); await sleep(300); }
  const launchBtn = await page.$('.adventure-play-btn, .dock-action-button');
  if (launchBtn) { await launchBtn.click(); await sleep(300); }
  const introStartBtn = await page.$('.intro-start-btn');
  if (introStartBtn) { await introStartBtn.click(); await sleep(400); }

  await page.waitForSelector('.hud-gameplay-header');
  const overflowingElements = await page.evaluate(() => {
    const docW = window.innerWidth;
    const elements = Array.from(document.querySelectorAll('*'));
    const bad = [];
    for (const el of elements) {
      const rect = el.getBoundingClientRect();
      if (rect.right > docW + 1) {
        bad.push({
          tag: el.tagName,
          class: typeof el.className === 'string' ? el.className : el.className.baseVal,
          right: Math.round(rect.right),
          width: Math.round(rect.width)
        });
      }
    }
    return bad;
  });
  console.log('Overflowing elements at 320px:', JSON.stringify(overflowingElements, null, 2));
  await browser.close();
}
findOverflow().catch(console.error);
