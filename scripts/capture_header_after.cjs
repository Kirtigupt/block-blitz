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

  // 1. Mobile 390x844
  await page.setViewport({ width: 390, height: 844 });
  await page.goto(APP_URL, { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload({ waitUntil: 'networkidle0' });
  await sleep(400);

  // Welcome -> Map -> Start Level 1
  const playBtn = await page.$('.welcome-play-now-btn');
  if (playBtn) {
    await playBtn.click();
    await sleep(300);
    const guestBtn = await page.$('.guest-continue-btn');
    if (guestBtn) await guestBtn.click();
    await sleep(400);
  }

  const launchBtn = await page.$('.adventure-play-btn, .dock-action-button');
  if (launchBtn) {
    await launchBtn.click();
    await sleep(300);
  }

  const introStartBtn = await page.$('.intro-start-btn');
  if (introStartBtn) {
    await introStartBtn.click();
    await sleep(500);
  }

  await page.waitForSelector('.hud-gameplay-header', { timeout: 6000 });
  await sleep(400);

  const mobileAfter = path.join(ARTIFACT_DIR, 'after_header_mobile_390x844.png');
  await page.screenshot({ path: mobileAfter });
  console.log('Saved:', mobileAfter);

  // 2. Desktop 1280x800
  await page.setViewport({ width: 1280, height: 800 });
  await sleep(400);

  const desktopAfter = path.join(ARTIFACT_DIR, 'after_header_desktop_1280x800.png');
  await page.screenshot({ path: desktopAfter });
  console.log('Saved:', desktopAfter);

  await browser.close();
  console.log('All after screenshots successfully saved!');
}

capture().catch((err) => {
  console.error(err);
  process.exit(1);
});
