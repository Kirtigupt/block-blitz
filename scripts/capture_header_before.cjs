const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:5173';
const ARTIFACT_DIR = 'C:\\Users\\kirti\\.gemini\\antigravity\\brain\\3ac25ba8-43d2-4529-867b-c5d5adc7cb54';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // 1. Mobile Before
  await page.setViewport({ width: 390, height: 844 });
  await page.goto(APP_URL, { waitUntil: 'networkidle0' });
  await page.click('.welcome-play-now-btn');
  await sleep(300);
  const guestBtn = await page.$('.guest-continue-btn');
  if (guestBtn) await guestBtn.click();
  await sleep(350);
  await page.click('.adventure-play-btn, .dock-action-button');
  await sleep(300);
  const introBtn = await page.$('.intro-start-btn');
  if (introBtn) await introBtn.click();
  await sleep(500);

  await page.waitForSelector('.game-header', { timeout: 6000 });
  const mobileShot = path.join(ARTIFACT_DIR, 'before_header_mobile_390x844.png');
  await page.screenshot({ path: mobileShot });
  console.log('Saved before mobile:', mobileShot);

  // 2. Desktop Before
  await page.setViewport({ width: 1280, height: 800 });
  await sleep(300);
  const desktopShot = path.join(ARTIFACT_DIR, 'before_header_desktop_1280x800.png');
  await page.screenshot({ path: desktopShot });
  console.log('Saved before desktop:', desktopShot);

  await browser.close();
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
