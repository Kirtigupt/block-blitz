const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACTS_DIR = 'C:/Users/kirti/.gemini/antigravity/brain/3ac25ba8-43d2-4529-867b-c5d5adc7cb54';

const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  await sleep(400);

  // Set unlocked level to 12 so we can see completed levels, current level 12, and locked levels!
  await page.evaluate(() => {
    localStorage.setItem('block_blitz_unlocked_level_guest', '12');
    localStorage.setItem('block_blitz_current_level_guest', '12');
    localStorage.setItem('block_blitz_completed_levels_guest', JSON.stringify([1,2,3,4,5,6,7,8,9,10,11]));
  });

  await page.reload({ waitUntil: 'networkidle0' });
  await sleep(400);

  // Click Welcome Play Now
  await page.waitForSelector('.welcome-play-now-btn', { timeout: 5000 });
  await page.click('.welcome-play-now-btn');
  await sleep(300);

  const guestBtn = await page.$('.guest-continue-btn');
  if (guestBtn) await guestBtn.click();
  await page.waitForSelector('.adventure-map-screen', { timeout: 6000 });
  await sleep(500);

  // 1. Capture All Realms view centered on Level 12
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'inspect_map_all_realms_mobile_390.png')
  });

  // 2. Select Chapter 2
  await page.evaluate(() => {
    const ch2Btn = Array.from(document.querySelectorAll('.mobile-chapter-switcher-bar .ch-pill-item, .desktop-chapter-pills-bar .ch-pill-item'))
      .find(el => el.textContent.includes('CH 2'));
    if (ch2Btn) ch2Btn.click();
  });
  await sleep(500);
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'inspect_map_ch2_mobile_390.png')
  });

  // 3. Desktop view 1280x800
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });
  await sleep(400);
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'inspect_map_desktop_1280.png')
  });

  await browser.close();
  console.log('Map inspection screenshots captured!');
})();
