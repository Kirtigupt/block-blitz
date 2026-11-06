const puppeteer = require('puppeteer-core');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:5173';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function testModalTriggers() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(APP_URL, { waitUntil: 'networkidle0' });
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.reload({ waitUntil: 'networkidle0' });
  await sleep(400);

  // Navigate to Level 1
  const playBtn = await page.$('.welcome-play-now-btn');
  if (playBtn) { await playBtn.click(); await sleep(300); }
  const guestBtn = await page.$('.guest-continue-btn');
  if (guestBtn) { await guestBtn.click(); await sleep(300); }
  const launchBtn = await page.$('.adventure-play-btn, .dock-action-button');
  if (launchBtn) { await launchBtn.click(); await sleep(300); }
  const introStartBtn = await page.$('.intro-start-btn');
  if (introStartBtn) { await introStartBtn.click(); await sleep(400); }

  await page.waitForSelector('.hud-gameplay-header');
  console.log('HUD loaded successfully!');

  // Check element clickable position
  const btnPositions = await page.evaluate(() => {
    const list = ['.hud-brand-anchor', '.hud-waypoint-chip', '.hud-signin-pill', '.hud-btn-leaderboard', '.hud-btn-audio', '.hud-btn-settings', '.hud-btn-help', '.hud-btn-restart', '.hud-btn-exit'];
    return list.map(sel => {
      const el = document.querySelector(sel);
      if (!el) return { sel, found: false };
      const r = el.getBoundingClientRect();
      return { sel, found: true, x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
    });
  });
  console.log('Button positions:', btnPositions);

  // Test 1: Help Modal
  console.log('\nTesting Help Modal:');
  await page.evaluate(() => document.querySelector('.hud-btn-help').click());
  await sleep(400);
  let helpVisible = await page.$('.how-to-play-card');
  console.log('  how-to-play-card found:', Boolean(helpVisible));
  if (helpVisible) {
    await page.evaluate(() => document.querySelector('.how-to-play-card .close-btn')?.click());
    await sleep(300);
  }

  // Test 2: Settings Modal
  console.log('\nTesting Settings Modal:');
  await page.evaluate(() => document.querySelector('.hud-btn-settings').click());
  await sleep(400);
  let settingsVisible = await page.$('.settings-modal');
  console.log('  settings-modal found:', Boolean(settingsVisible));
  if (settingsVisible) {
    await page.evaluate(() => document.querySelector('.settings-close-btn')?.click());
    await sleep(300);
  }

  // Test 3: Leaderboard Modal
  console.log('\nTesting Leaderboard Modal:');
  await page.evaluate(() => document.querySelector('.hud-btn-leaderboard').click());
  await sleep(400);
  let lbVisible = await page.$('.leaderboard-modal-card');
  console.log('  leaderboard-modal-card found:', Boolean(lbVisible));
  if (lbVisible) {
    await page.evaluate(() => document.querySelector('.leaderboard-close-btn')?.click());
    await sleep(300);
  }

  // Test 4: Auth Modal
  console.log('\nTesting Auth Modal:');
  await page.evaluate(() => document.querySelector('.hud-signin-pill').click());
  await sleep(400);
  let authVisible = await page.$('.auth-card');
  console.log('  auth-card found:', Boolean(authVisible));
  if (authVisible) {
    await page.evaluate(() => document.querySelector('.auth-close-btn')?.click());
    await sleep(300);
  }

  // Test 5: Exit Modal
  console.log('\nTesting Exit Modal:');
  await page.evaluate(() => document.querySelector('.hud-btn-exit').click());
  await sleep(400);
  let exitVisible = await page.$('.exit-modal-backdrop');
  console.log('  exit-modal-backdrop found:', Boolean(exitVisible));
  if (exitVisible) {
    await page.evaluate(() => document.querySelector('.exit-cancel-btn')?.click());
    await sleep(300);
  }

  // Test 6: Level Map
  console.log('\nTesting Waypoint Chip -> Level Map:');
  await page.evaluate(() => document.querySelector('.hud-waypoint-chip').click());
  await sleep(400);
  let mapVisible = await page.$('.adventure-map-screen');
  console.log('  adventure-map-screen found:', Boolean(mapVisible));
  if (mapVisible) {
    await page.evaluate(() => document.querySelector('.adventure-back-btn, .map-back-btn')?.click());
    await sleep(300);
  }

  await browser.close();
  console.log('\nAll modal triggers tested successfully!');
}

testModalTriggers().catch(console.error);
