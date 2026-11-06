const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:5173';
const ARTIFACT_DIR = 'C:\\Users\\kirti\\.gemini\\antigravity\\brain\\3ac25ba8-43d2-4529-867b-c5d5adc7cb54';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function captureFinalHUDShowcase() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // 1. Desktop 1280x800 View
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(APP_URL, { waitUntil: 'networkidle0' });
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.reload({ waitUntil: 'networkidle0' });
  await sleep(400);

  // Welcome -> Map -> Level 1
  const playBtn = await page.$('.welcome-play-now-btn');
  if (playBtn) { await playBtn.click(); await sleep(300); }
  const guestBtn = await page.$('.guest-continue-btn');
  if (guestBtn) { await guestBtn.click(); await sleep(300); }
  const launchBtn = await page.$('.adventure-play-btn, .dock-action-button');
  if (launchBtn) { await launchBtn.click(); await sleep(300); }
  const introStartBtn = await page.$('.intro-start-btn');
  if (introStartBtn) { await introStartBtn.click(); await sleep(400); }

  await page.waitForSelector('.hud-gameplay-header');
  await sleep(400);

  // Full desktop screenshot
  const desktopFull = path.join(ARTIFACT_DIR, 'final_hud_redesign_desktop_1280x800.png');
  await page.screenshot({ path: desktopFull });
  console.log('Saved:', desktopFull);

  // Cropped Desktop HUD
  const desktopHeaderEl = await page.$('.hud-gameplay-header');
  if (desktopHeaderEl) {
    const desktopCrop = path.join(ARTIFACT_DIR, 'final_hud_cockpit_desktop_crop.png');
    await desktopHeaderEl.screenshot({ path: desktopCrop });
    console.log('Saved:', desktopCrop);
  }

  // 2. Mobile 390x844 View
  await page.setViewport({ width: 390, height: 844 });
  await sleep(400);

  const mobileFull = path.join(ARTIFACT_DIR, 'final_hud_redesign_mobile_390x844.png');
  await page.screenshot({ path: mobileFull });
  console.log('Saved:', mobileFull);

  // Cropped Mobile HUD
  const mobileHeaderEl = await page.$('.hud-gameplay-header');
  if (mobileHeaderEl) {
    const mobileCrop = path.join(ARTIFACT_DIR, 'final_hud_cockpit_mobile_crop.png');
    await mobileHeaderEl.screenshot({ path: mobileCrop });
    console.log('Saved:', mobileCrop);
  }

  // 3. Stage 10 Boss HUD Showcase
  // Open map, navigate to stage 10
  await page.evaluate(() => {
    // Unlock level 10 in localStorage for showcase
    localStorage.setItem('block_blitz_unlocked_level', '10');
    localStorage.setItem('block_blitz_current_level', '10');
  });
  await page.reload({ waitUntil: 'networkidle0' });
  await sleep(400);

  const playBtn2 = await page.$('.welcome-play-now-btn');
  if (playBtn2) { await playBtn2.click(); await sleep(300); }
  const guestBtn2 = await page.$('.guest-continue-btn');
  if (guestBtn2) { await guestBtn2.click(); await sleep(300); }
  const launchBtn2 = await page.$('.adventure-play-btn, .dock-action-button');
  if (launchBtn2) { await launchBtn2.click(); await sleep(300); }
  const introStartBtn2 = await page.$('.intro-start-btn');
  if (introStartBtn2) { await introStartBtn2.click(); await sleep(400); }

  await page.waitForSelector('.hud-gameplay-header');
  await sleep(400);

  const bossCrop = path.join(ARTIFACT_DIR, 'final_hud_boss_stage10_mobile.png');
  const bossHeaderEl = await page.$('.hud-gameplay-header');
  if (bossHeaderEl) {
    await bossHeaderEl.screenshot({ path: bossCrop });
    console.log('Saved:', bossCrop);
  }

  await browser.close();
  console.log('All showcase screenshots successfully captured and saved!');
}

captureFinalHUDShowcase().catch(console.error);
