const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:5173';
const ARTIFACT_DIR = 'C:\\Users\\kirti\\.gemini\\antigravity\\brain\\3ac25ba8-43d2-4529-867b-c5d5adc7cb54';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // 1. Mobile (390x844) - Adventure Map Winding Trail
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.goto(APP_URL, { waitUntil: 'networkidle0' });
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.reload({ waitUntil: 'networkidle0' });
  await sleep(400);

  const playBtn = await page.$('.welcome-play-now-btn');
  if (playBtn) await playBtn.click();
  await sleep(250);
  const guestBtn = await page.$('.guest-continue-btn');
  if (guestBtn) await guestBtn.click();
  await sleep(400);

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'showcase_adventure_map_mobile_390x844.png') });
  console.log('Saved showcase_adventure_map_mobile_390x844.png');

  // 2. Mobile (390x844) - Mission Briefing Modal (Stage 1)
  const launchBtn = await page.$('.adventure-play-btn, .dock-action-button');
  if (launchBtn) await launchBtn.click();
  await sleep(350);
  await page.waitForSelector('.level-intro-card', { timeout: 4000 });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'showcase_mission_briefing_mobile_390x844.png') });
  console.log('Saved showcase_mission_briefing_mobile_390x844.png');

  // 3. Desktop (1280x800) - Adventure Map Winding Trail
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
  await page.goto(APP_URL, { waitUntil: 'networkidle0' });
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.reload({ waitUntil: 'networkidle0' });
  await sleep(400);

  const playBtnD = await page.$('.welcome-play-now-btn');
  if (playBtnD) await playBtnD.click();
  await sleep(250);
  const guestBtnD = await page.$('.guest-continue-btn');
  if (guestBtnD) await guestBtnD.click();
  await sleep(400);

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'showcase_adventure_map_desktop_1280x800.png') });
  console.log('Saved showcase_adventure_map_desktop_1280x800.png');

  // 4. Desktop (1280x800) - Mission Briefing Modal (Stage 1)
  const launchBtnD = await page.$('.adventure-play-btn, .dock-action-button');
  if (launchBtnD) await launchBtnD.click();
  await sleep(350);
  await page.waitForSelector('.level-intro-card', { timeout: 4000 });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'showcase_mission_briefing_desktop_1280x800.png') });
  console.log('Saved showcase_mission_briefing_desktop_1280x800.png');

  // 5. Boss Stage 10 Mission Briefing (Mobile 390x844)
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.evaluate(() => {
    localStorage.setItem('block_blitz_unlocked_level_guest', '10');
    localStorage.setItem('block_blitz_current_level_guest', '10');
  });
  await page.reload({ waitUntil: 'networkidle0' });
  await sleep(400);

  const playBtnB = await page.$('.welcome-play-now-btn');
  if (playBtnB) await playBtnB.click();
  await sleep(250);
  const guestBtnB = await page.$('.guest-continue-btn');
  if (guestBtnB) await guestBtnB.click();
  await sleep(400);

  const launchBtnB = await page.$('.adventure-play-btn, .dock-action-button');
  if (launchBtnB) await launchBtnB.click();
  await sleep(350);
  await page.waitForSelector('.level-intro-card', { timeout: 4000 });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'showcase_boss_briefing_mobile_390x844.png') });
  console.log('Saved showcase_boss_briefing_mobile_390x844.png');

  await browser.close();
  console.log('All showcase screenshots captured successfully!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
