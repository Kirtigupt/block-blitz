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

  // 1. Mobile Gameplay HUD (390x844)
  console.log('--- Capturing Mobile (390x844) ---');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.goto(APP_URL, { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload({ waitUntil: 'networkidle0' });
  await sleep(400);

  // Play Now -> Guest
  const playBtn = await page.$('.welcome-play-now-btn');
  if (playBtn) await playBtn.click();
  await sleep(300);
  const guestBtn = await page.$('.guest-continue-btn');
  if (guestBtn) await guestBtn.click();
  await sleep(400);

  // Capture Adventure Map Mobile
  const mapPathMobile = path.join(ARTIFACT_DIR, 'redesigned_map_mobile_390x844.png');
  await page.screenshot({ path: mapPathMobile });
  console.log('✓ Captured Adventure Map Mobile:', mapPathMobile);

  // Click Dock Play Level 1 button to open Mission Briefing
  const dockPlayBtn = await page.$('.dock-launch-btn');
  if (dockPlayBtn) await dockPlayBtn.click();
  await sleep(400);

  // Capture Mission Briefing Mobile
  const briefingPathMobile = path.join(ARTIFACT_DIR, 'redesigned_briefing_mobile_390x844.png');
  await page.screenshot({ path: briefingPathMobile });
  console.log('✓ Captured Mission Briefing Mobile:', briefingPathMobile);

  // Click Launch Mission to start level
  const startMissionBtn = await page.$('.intro-start-btn');
  if (startMissionBtn) await startMissionBtn.click();
  await sleep(600);

  // Capture Mobile Gameplay Header, Scoreboard & Objective HUD
  const hudPathMobile = path.join(ARTIFACT_DIR, 'redesigned_hud_gameplay_mobile_390x844.png');
  await page.screenshot({ path: hudPathMobile });
  console.log('✓ Captured Gameplay HUD Mobile:', hudPathMobile);

  // 2. Desktop Gameplay HUD (1280x800)
  console.log('\n--- Capturing Desktop (1280x800) ---');
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });
  await page.reload({ waitUntil: 'networkidle0' });
  await sleep(400);

  // Open Level Map from header
  const mapIconBtn = await page.$('.hud-stage-crest');
  if (mapIconBtn) await mapIconBtn.click();
  await sleep(400);

  // Capture Desktop Adventure Map
  const mapPathDesktop = path.join(ARTIFACT_DIR, 'redesigned_map_desktop_1280x800.png');
  await page.screenshot({ path: mapPathDesktop });
  console.log('✓ Captured Adventure Map Desktop:', mapPathDesktop);

  // Click Dock Play Level 1 to open Mission Briefing
  const dockPlayBtnDesktop = await page.$('.dock-launch-btn');
  if (dockPlayBtnDesktop) await dockPlayBtnDesktop.click();
  await sleep(400);

  // Capture Desktop Mission Briefing
  const briefingPathDesktop = path.join(ARTIFACT_DIR, 'redesigned_briefing_desktop_1280x800.png');
  await page.screenshot({ path: briefingPathDesktop });
  console.log('✓ Captured Mission Briefing Desktop:', briefingPathDesktop);

  // Click Launch Mission
  const startMissionBtnDesktop = await page.$('.intro-start-btn');
  if (startMissionBtnDesktop) await startMissionBtnDesktop.click();
  await sleep(600);

  // Capture Desktop Gameplay Header, Scoreboard & Objective HUD
  const hudPathDesktop = path.join(ARTIFACT_DIR, 'redesigned_hud_gameplay_desktop_1280x800.png');
  await page.screenshot({ path: hudPathDesktop });
  console.log('✓ Captured Gameplay HUD Desktop:', hudPathDesktop);

  await browser.close();
  console.log('\nAll showcase screenshots successfully captured!');
}

capture().catch((err) => {
  console.error('Failed to capture screenshots:', err);
  process.exit(1);
});
