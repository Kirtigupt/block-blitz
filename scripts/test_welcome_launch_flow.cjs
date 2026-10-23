/**
 * Dedicated Browser Verification for BLOCK BLITZ Initial Launch Flow
 * Tests:
 * 1. Startup & Reload displays Welcome Landing Screen first (both guest and logged-in).
 * 2. Level map is not shown on startup.
 * 3. Guest click "Play Now" -> Displays Auth Modal.
 * 4. Authenticated user click "Play Now" -> Directly navigates to Level Map without login prompt.
 * 5. Authentication restores user progression and navigates to Level Map.
 */

const puppeteer = require('puppeteer-core');
const mongoose = require('../server/node_modules/mongoose');
const path = require('path');
const dotenv = require('../server/node_modules/dotenv');
dotenv.config({ path: path.resolve(__dirname, '../server/.env') });

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:5173';
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/block-blitz';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

let passed = 0;
let total = 0;
const consoleErrors = [];

function assert(condition, testName) {
  total++;
  if (condition) {
    passed++;
    console.log(`  ✓ ${testName}`);
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
  }
}

(async () => {
  console.log('====================================================');
  console.log('BLOCK BLITZ WELCOME LAUNCH FLOW BROWSER VERIFICATION');
  console.log('====================================================');

  await mongoose.connect(MONGO_URI);
  const usersCol = mongoose.connection.db.collection('users');

  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: 'new',
      defaultViewport: { width: 1280, height: 800 },
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
    });

    const page = await browser.newPage();

    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => consoleErrors.push(err.message));

    // Clear any previous token in localStorage
    await page.goto(APP_URL, { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload({ waitUntil: 'networkidle0' });

    // -------------------------------------------------------------------------
    // TEST 1: Initial Launch (Guest)
    // -------------------------------------------------------------------------
    console.log('\n[Test 1: Guest Initial App Launch]');
    await page.waitForSelector('.welcome-landing-screen', { timeout: 5000 });
    const isWelcomeVisible = await page.$('.welcome-landing-screen') !== null;
    assert(isWelcomeVisible, 'Welcome Landing Screen is displayed first on fresh app open');

    const gameTitleText = await page.$eval('.welcome-landing-game-title', el => el.textContent.trim());
    assert(gameTitleText === 'BLOCK BLITZ', `Shows game title "BLOCK BLITZ" (found: "${gameTitleText}")`);

    const hasPlayNowBtn = await page.$('.welcome-play-now-btn') !== null;
    assert(hasPlayNowBtn, 'Prominent "Play Now" button is present on Welcome Landing Screen');

    const isLevelMapHidden = await page.$('.campaign-map-screen') === null;
    assert(isLevelMapHidden, 'Level map is NOT displayed immediately on startup');

    // -------------------------------------------------------------------------
    // TEST 2: Guest clicks "Play Now" -> Displays Auth Modal
    // -------------------------------------------------------------------------
    console.log('\n[Test 2: Guest clicks "Play Now"]');
    await page.click('.welcome-play-now-btn');
    await page.waitForSelector('.auth-card', { timeout: 5000 });
    assert(await page.$('.auth-card') !== null, 'Clicking "Play Now" without session opens Sign Up / Login modal');

    // Close AuthModal using X button to verify return to Welcome screen
    await page.click('.close-btn');
    await page.waitForSelector('.welcome-landing-screen', { timeout: 3000 });
    assert(await page.$('.welcome-landing-screen') !== null, 'Closing Auth modal returns cleanly to Welcome Landing Screen');

    // -------------------------------------------------------------------------
    // TEST 3: User Authentication via "Play Now"
    // -------------------------------------------------------------------------
    console.log('\n[Test 3: Authentication and Cloud Progression Restoration]');
    const testPilotName = `pilot_launch_${Date.now()}`;
    const testPilotEmail = `${testPilotName}@test.blitz`;
    const testPilotPassword = 'password123';

    await page.click('.welcome-play-now-btn');
    await page.waitForSelector('.auth-card', { timeout: 5000 });

    // Switch to Create Account tab
    const tabs = await page.$$('.auth-tab');
    for (const tab of tabs) {
      const text = await (await tab.getProperty('textContent')).jsonValue();
      if (text.includes('Create Account')) {
        await tab.click();
        break;
      }
    }
    await sleep(200);

    await page.type('#auth-username', testPilotName);
    await page.type('#auth-email', testPilotEmail);
    await page.type('#auth-password', testPilotPassword);
    await page.click('.auth-submit-btn');

    // Wait for Onboarding or Level Map
    await page.waitForSelector('.campaign-map-screen', { timeout: 8000 });
    assert(await page.$('.campaign-map-screen') !== null, 'Navigated to Level Map after successful registration');

    const isWelcomeDismissed = await page.$('.welcome-landing-screen') === null;
    assert(isWelcomeDismissed, 'Welcome Landing Screen is dismissed after authentication');

    // Dismiss onboarding modal if visible
    if (await page.$('.onboarding-primary-btn') !== null) {
      await page.click('.onboarding-primary-btn');
      await sleep(400);
    }

    // Verify token exists in storage
    const storedToken = await page.evaluate(() => localStorage.getItem('block_blitz_token'));
    assert(Boolean(storedToken), 'Authentication session token is securely stored in localStorage');

    // -------------------------------------------------------------------------
    // TEST 4: App Reload with Active Authenticated Session
    // -------------------------------------------------------------------------
    console.log('\n[Test 4: App Reload with Active Session]');
    await page.reload({ waitUntil: 'networkidle0' });
    await sleep(400);

    // Verify Welcome Landing Screen is ALWAYS displayed first on reload!
    await page.waitForSelector('.welcome-landing-screen', { timeout: 5000 });
    assert(await page.$('.welcome-landing-screen') !== null, 'Welcome Landing Screen is ALWAYS displayed first on page reload');

    const isLevelMapHiddenOnReload = await page.$('.campaign-map-screen') === null;
    assert(isLevelMapHiddenOnReload, 'Level map is NOT displayed immediately on reload');

    // Check that personalized pilot name is displayed
    const userBadgeText = await page.$eval('.welcome-landing-badge.user-badge', el => el.textContent.trim());
    assert(userBadgeText.includes(testPilotName), `Displays authenticated user badge ("${userBadgeText}")`);

    const greetingText = await page.$eval('.welcome-pilot-greeting', el => el.textContent.trim());
    assert(greetingText.includes(testPilotName), `Displays personalized welcome greeting ("${greetingText}")`);

    // -------------------------------------------------------------------------
    // TEST 5: Authenticated User clicks "Play Now" -> Navigates DIRECTLY to Map
    // -------------------------------------------------------------------------
    console.log('\n[Test 5: Authenticated "Play Now" Direct Navigation]');
    await page.click('.welcome-play-now-btn');

    // Verify it navigates directly to the Level Map without asking for login
    await page.waitForSelector('.campaign-map-screen', { timeout: 5000 });
    assert(await page.$('.campaign-map-screen') !== null, 'Navigated directly to Level Map');

    const wasAuthPrompted = await page.$('.auth-card') !== null;
    assert(!wasAuthPrompted, 'Did NOT ask user to log in again (no auth modal)');

    // -------------------------------------------------------------------------
    // TEST 6: Account Progression Sync Verification (Existing Migrated User)
    // -------------------------------------------------------------------------
    console.log('\n[Test 6: Existing Migrated Account Progression Check]');
    // Test login via UI using migrated account "prog_user_5028"
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.reload({ waitUntil: 'networkidle0' });

    // Open Auth modal from Welcome Screen
    await page.waitForSelector('.welcome-play-now-btn', { timeout: 5000 });
    await page.click('.welcome-play-now-btn');
    await page.waitForSelector('.auth-card', { timeout: 5000 });

    // Sign into migrated account "prog_user_5028"
    await page.type('#auth-username', 'prog_user_5028');
    await page.type('#auth-password', 'password123');
    await page.click('.auth-submit-btn');

    // Navigates directly to Level Map
    await page.waitForSelector('.campaign-map-screen', { timeout: 8000 });
    assert(await page.$('.campaign-map-screen') !== null, 'Navigated to Level Map after signing into existing migrated account');

    // Check Level 2 is unlocked on Level Map
    const activeStageBadge = await page.$eval('.campaign-stat-pill.stage-pill .stat-val', el => el.textContent.trim());
    assert(activeStageBadge === 'LVL 2', `Existing user progression restored: active stage is "${activeStageBadge}"`);

    // Reload page to verify Welcome Screen reflects restored Level 2 progression
    await page.reload({ waitUntil: 'networkidle0' });
    await page.waitForSelector('.welcome-landing-screen', { timeout: 5000 });
    await sleep(300);

    const unlockedStat = await page.$$eval('.welcome-stat-value', els => els.map(e => e.textContent.trim()));
    assert(unlockedStat[0] === 'LVL 2', `Welcome Landing Screen shows restored UNLOCKED LVL 2 (found: "${unlockedStat[0]}")`);

    // Click "Play Now" to enter Level Map directly
    await page.click('.welcome-play-now-btn');
    await page.waitForSelector('.campaign-map-screen', { timeout: 5000 });
    assert(await page.$('.campaign-map-screen') !== null, 'Directly entered Level Map with Level 2 progress intact without auth prompt');

    // Cleanup disposable test account
    await usersCol.deleteOne({ username: testPilotName });

  } catch (err) {
    console.error('Test execution error:', err);
    assert(false, `Execution exception: ${err.message}`);
  } finally {
    if (browser) await browser.close();
    await mongoose.disconnect();
  }

  console.log('\n====================================================');
  console.log(`RESULTS: ${passed} / ${total} assertions passed`);
  if (consoleErrors.length > 0) {
    console.log(`Console Errors encountered: ${consoleErrors.length}`);
    consoleErrors.forEach(e => console.log('  !', e));
  } else {
    console.log('Browser Console: Clean (0 errors)');
  }
  console.log('====================================================');

  process.exit(passed === total ? 0 : 1);
})();
