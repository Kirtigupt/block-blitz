/**
 * Capture screenshots of key screens across viewports
 */
const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:5173';
const ARTIFACT_DIR = 'C:\\Users\\kirti\\.gemini\\antigravity\\brain\\3ac25ba8-43d2-4529-867b-c5d5adc7cb54';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();

  // 1. Welcome Screen Desktop (1280x800)
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(APP_URL, { waitUntil: 'networkidle2' });
  await sleep(400);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'audit_welcome_desktop.png') });

  // 2. Welcome Screen Mobile (375x667)
  await page.setViewport({ width: 375, height: 667 });
  await sleep(300);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'audit_welcome_mobile.png') });

  // 3. Campaign Level Map Desktop (1280x800)
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(APP_URL, { waitUntil: 'networkidle2' });
  await sleep(300);
  await page.click('.welcome-play-now-btn');
  await sleep(300);
  const guestBtn = await page.$('.guest-continue-btn');
  if (guestBtn) await guestBtn.click();
  await sleep(500);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'audit_level_map_desktop.png') });

  // 4. Campaign Level Map Mobile (375x667)
  await page.setViewport({ width: 375, height: 667 });
  await sleep(300);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'audit_level_map_mobile.png') });

  // 5. Active Gameplay Desktop (1280x800)
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(APP_URL, { waitUntil: 'networkidle2' });
  await sleep(300);
  await page.click('.welcome-play-now-btn');
  await sleep(300);
  const gBtn = await page.$('.guest-continue-btn');
  if (gBtn) await gBtn.click();
  await sleep(400);
  await page.click('.dock-launch-btn');
  await sleep(300);
  const startBtn = await page.$('.intro-start-btn');
  if (startBtn) await startBtn.click();
  await sleep(500);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'audit_gameplay_desktop.png') });

  // 6. Active Gameplay Mobile (375x667)
  await page.setViewport({ width: 375, height: 667 });
  await sleep(400);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'audit_gameplay_mobile.png') });

  // 7. Active Gameplay Tablet (768x1024)
  await page.setViewport({ width: 768, height: 1024 });
  await sleep(400);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'audit_gameplay_tablet.png') });

  console.log('Screenshots captured successfully.');
  await browser.close();
})();
