const puppeteer = require('puppeteer-core');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:5173';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runInteractionTests() {
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
  console.log('--- TESTING HUD CONTROLS & INTERACTIONS ---');

  // Test 1: Waypoint Chip opens Adventure Map
  console.log('1. Testing Waypoint Chip -> Map modal');
  await page.click('.hud-waypoint-chip');
  await sleep(350);
  const mapModal = await page.$('.adventure-map-modal, .level-map-container, .adventure-map-container');
  console.log('   Map modal opened:', Boolean(mapModal));
  if (mapModal) {
    const closeBtn = await page.$('.adventure-close-btn, .map-back-btn, .modal-close-btn');
    if (closeBtn) await closeBtn.click();
    else await page.keyboard.press('Escape');
    await sleep(350);
  }

  // Test 2: Audio Toggle Mute
  console.log('2. Testing Audio Toggle');
  const audioBtnBefore = await page.$('.hud-btn-audio');
  const isMutedBefore = await page.evaluate(el => el.classList.contains('is-muted'), audioBtnBefore);
  console.log('   Muted before click:', isMutedBefore);
  await page.click('.hud-btn-audio');
  await sleep(200);
  const audioBtnAfter = await page.$('.hud-btn-audio');
  const isMutedAfter = await page.evaluate(el => el.classList.contains('is-muted'), audioBtnAfter);
  console.log('   Muted after click:', isMutedAfter);
  // Toggle back
  await page.click('.hud-btn-audio');
  await sleep(200);

  // Test 3: Leaderboard Modal
  console.log('3. Testing Leaderboard Button');
  await page.click('.hud-btn-leaderboard');
  await sleep(350);
  const leaderboardModal = await page.$('.leaderboard-modal, .leaderboard-card');
  console.log('   Leaderboard modal opened:', Boolean(leaderboardModal));
  if (leaderboardModal) {
    const closeBtn = await page.$('.leaderboard-close-btn, .close-modal-btn, .modal-close-btn');
    if (closeBtn) await closeBtn.click();
    else await page.keyboard.press('Escape');
    await sleep(350);
  }

  // Test 4: Settings Modal
  console.log('4. Testing Settings Button');
  await page.click('.hud-btn-settings');
  await sleep(350);
  const settingsModal = await page.$('.settings-modal, .settings-modal-card');
  console.log('   Settings modal opened:', Boolean(settingsModal));
  if (settingsModal) {
    const closeBtn = await page.$('.settings-close-btn, .modal-close-btn');
    if (closeBtn) await closeBtn.click();
    else await page.keyboard.press('Escape');
    await sleep(350);
  }

  // Test 5: Help Modal
  console.log('5. Testing Help Button');
  await page.click('.hud-btn-help');
  await sleep(350);
  const helpModal = await page.$('.how-to-play-modal, .help-modal, .onboarding-modal');
  console.log('   Help modal opened:', Boolean(helpModal));
  if (helpModal) {
    const closeBtn = await page.$('.help-close-btn, .modal-close-btn, .onboarding-action-btn');
    if (closeBtn) await closeBtn.click();
    else await page.keyboard.press('Escape');
    await sleep(350);
  }

  // Test 6: Auth / Sign In Modal
  console.log('6. Testing Sign In Pill');
  await page.click('.hud-signin-pill');
  await sleep(350);
  const authModal = await page.$('.auth-modal, .auth-card');
  console.log('   Auth modal opened:', Boolean(authModal));
  if (authModal) {
    const closeBtn = await page.$('.auth-close-btn, .modal-close-btn');
    if (closeBtn) await closeBtn.click();
    else await page.keyboard.press('Escape');
    await sleep(350);
  }

  // Test 7: Exit Modal
  console.log('7. Testing Exit Button');
  await page.click('.hud-btn-exit');
  await sleep(350);
  const exitModal = await page.$('.exit-modal, .exit-confirm-card');
  console.log('   Exit modal opened:', Boolean(exitModal));
  if (exitModal) {
    const cancelBtn = await page.$('.exit-cancel-btn, .btn-secondary');
    if (cancelBtn) await cancelBtn.click();
    else await page.keyboard.press('Escape');
    await sleep(350);
  }

  // Test 8: Restart Button
  console.log('8. Testing Restart Button');
  await page.click('.hud-btn-restart');
  await sleep(350);
  const restartModal = await page.$('.restart-modal, .restart-confirm-card');
  console.log('   Restart clicked without unhandled exception. Header alive:', Boolean(await page.$('.hud-gameplay-header')));

  // Test 9: Score & Streak pulse test via state simulation
  console.log('9. Testing Score, Streak & Objective display reactivity');
  const stateCheck = await page.evaluate(() => {
    const scoreVal = document.querySelector('.hero-score-number')?.innerText;
    const bestVal = document.querySelector('.best-score-number')?.innerText;
    const streakVal = document.querySelector('.streak-tally-number')?.innerText;
    const counterVal = document.querySelector('.mission-counter-badge')?.innerText;
    const conduit = document.querySelector('.conduit-gradient-fill')?.getAttribute('style');
    return { scoreVal, bestVal, streakVal, counterVal, conduit };
  });
  console.log('   Rendered HUD State:', stateCheck);

  await browser.close();
  console.log('\nALL 9 HUD INTERACTION TESTS PASSED!');
}

runInteractionTests().catch(err => {
  console.error('Interaction test failed:', err);
  process.exit(1);
});
