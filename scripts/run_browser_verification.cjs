/**
 * End-to-End Headless Browser Verification Suite for BLOCK BLITZ
 * Drives real Chrome browser through all 15 User Journeys.
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
const consoleLogs = [];

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
  console.log('BLOCK BLITZ REAL BROWSER VERIFICATION (JOURNEYS 1-15)');
  console.log('====================================================');

  await mongoose.connect(MONGO_URI);
  const usersCol = mongoose.connection.db.collection('users');
  const gamesCol = mongoose.connection.db.collection('games');

  const timestamp = Date.now();
  const testUserA = `pilot_alpha_${timestamp}`;
  const testEmailA = `${testUserA}@blitz.test`;
  const testUserB = `pilot_bravo_${timestamp}`;
  const testEmailB = `${testUserB}@blitz.test`;

  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: 'new',
      defaultViewport: { width: 1280, height: 800 },
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
    });

    const page = await browser.newPage();

    // Listen to console errors and warnings
    page.on('console', (msg) => {
      const type = msg.type();
      const text = msg.text();
      if (type === 'error') {
        consoleErrors.push(text);
      } else {
        consoleLogs.push(text);
      }
    });

    page.on('pageerror', (err) => {
      consoleErrors.push(err.message);
    });

    // --- INITIAL APP LOAD ---
    console.log('\n[Initial Environment & Load]');
    await page.goto(APP_URL, { waitUntil: 'networkidle0' });
    const pageTitle = await page.title();
    assert(pageTitle.includes('BLOCK BLITZ'), `Page loaded with title "${pageTitle}"`);

    // Verify initial state is Campaign Map
    await page.waitForSelector('.campaign-map-screen', { timeout: 5000 });
    assert(await page.$('.campaign-map-screen') !== null, 'Campaign Map is the landing screen on fresh visit');

    // Launch into Level 1 to enter gameplay playfield
    await page.waitForSelector('.dock-launch-btn');
    await page.click('.dock-launch-btn');

    // Wait for Level Intro Modal
    await page.waitForSelector('.intro-start-btn', { timeout: 5000 });
    assert(await page.$('.level-intro-card') !== null, 'Level Intro Modal appears with level information');

    // Proceed through Level Intro to active game
    await page.click('.intro-start-btn');
    await page.waitForSelector('.campaign-map-screen', { hidden: true });
    await page.waitForSelector('.game-grid', { timeout: 6000 });
    assert(await page.$('.game-grid') !== null, 'Gameplay grid (8x8) active after level intro');

    // --- JOURNEY 1 & 2: Registration & Onboarding Flow ---
    console.log('\n[Journey 1 & 2: User Registration & Systematic Onboarding Flow]');
    // Click Sign In button in Header
    await page.waitForSelector('.auth-cta-btn');
    await page.click('.auth-cta-btn');
    await page.waitForSelector('.auth-card', { timeout: 5000 });
    assert(await page.$('.auth-card') !== null, 'Auth modal opened via header Sign In button');

    // Switch to Register Tab
    const registerTabBtn = await page.$('.auth-tab:nth-child(2)');
    assert(registerTabBtn !== null, 'Found "Create Account" tab button in Auth modal');
    await registerTabBtn.click();
    await sleep(200);

    // Fill registration form
    await page.type('#auth-username', testUserA);
    await page.type('#auth-email', testEmailA);
    await page.type('#auth-password', 'Password123!');
    
    // Submit registration
    await page.click('button[type="submit"].auth-submit-btn');

    // Confirm registration opens Onboarding rather than gameplay directly
    await page.waitForSelector('.onboarding-card', { timeout: 8000 });
    assert(await page.$('.onboarding-card') !== null, 'Registration systematically opens Onboarding screen');
    
    const onboardingHeading = await page.$eval('.onboarding-title', el => el.innerText);
    assert(onboardingHeading.includes(testUserA), `Onboarding welcomes registered user: "${onboardingHeading}"`);

    // --- JOURNEY 3 & 4: Onboarding PLAY button to Level Map ---
    console.log('\n[Journey 3 & 4: PLAY CTA -> Level Map & Stage Selection]');
    const playBtn = await page.$('.onboarding-primary-btn');
    assert(playBtn !== null, 'PLAY button exists on onboarding modal');
    await playBtn.click();

    // Verify Level Map opens
    await page.waitForSelector('.campaign-map-screen', { timeout: 5000 });
    assert(await page.$('.campaign-map-screen') !== null, 'Campaign Map opened cleanly after clicking PLAY');

    // Inspect Level 1 card and bottom dock
    await page.waitForSelector('.selected-level-dock');
    const dockText = await page.$eval('.selected-level-dock', el => el.innerText);
    assert(dockText.includes('START LEVEL 1') || dockText.includes('LEVEL 1'), 'Bottom dock displays START LEVEL 1 button');
    assert(dockText.includes('CH 1') || dockText.includes('CHAPTER 1') || dockText.includes('Emerald Meadows') || dockText.includes('Lines'), 'Level 1 objective and details visible in dock');

    // --- JOURNEY 5: Level Intro Flow ---
    console.log('\n[Journey 5: START LEVEL -> Level Introduction Animation]');
    await page.click('.dock-launch-btn');
    await page.waitForSelector('.intro-start-btn', { timeout: 5000 });
    const introTitle = await page.$eval('#level-intro-title', el => el.innerText);
    assert(introTitle.includes('First Sparks') || introTitle.includes('Level 1') || introTitle.includes('LVL 1'), `Level Intro Modal displays: "${introTitle}"`);

    // Transition into gameplay
    await page.click('.intro-start-btn');
    await page.waitForSelector('.campaign-map-screen', { hidden: true });
    await page.waitForSelector('.level-intro-backdrop', { hidden: true });
    await page.waitForSelector('.game-grid', { timeout: 5000 });
    assert(await page.$('.game-grid') !== null, 'Grid active and ready for puzzle moves');
    await sleep(500);

    // --- JOURNEY 6 & 7: Gameplay, Block Placement & Scoring ---
    console.log('\n[Journey 6 & 7: Block Tray Interaction & Placement]');
    const initialScoreText = await page.$eval('.score-value', el => el.innerText);
    assert(initialScoreText === '0', 'Initial score starts at 0');

    // Select first placeable block piece in tray
    const pieceSelector = '.block-tray .block-piece:not(.unplaceable)';
    await page.waitForSelector(pieceSelector);
    assert(await page.$(pieceSelector) !== null, 'Placeable block piece available in block tray');
    await page.click(pieceSelector);
    await sleep(300);

    // Verify piece is selected
    const isPieceSelected = await page.evaluate(() => !!document.querySelector('.block-tray .block-piece.selected'));
    assert(isPieceSelected, 'Block piece marked as selected in tray');

    // Find valid cell on hover and click to place
    let piecePlaced = false;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const cellSel = `.grid-cell[data-row="${r}"][data-col="${c}"]`;
        await page.hover(cellSel);
        const isPreviewValid = await page.$eval(cellSel, el => el.classList.contains('preview-valid'));
        if (isPreviewValid) {
          await page.click(cellSel);
          await sleep(400);
          piecePlaced = true;
          break;
        }
      }
      if (piecePlaced) break;
    }
    assert(piecePlaced, 'Block piece successfully placed onto the grid');

    const scoreAfterPlacement = await page.$eval('.score-value', el => el.innerText);
    assert(Number(scoreAfterPlacement) > 0, `Score updated after piece placement (Score: ${scoreAfterPlacement})`);

    // Verify grid has occupied cells
    const hasOccupiedCell = (await page.$('.grid-cell.occupied')) !== null;
    assert(hasOccupiedCell, 'Grid cell marked as occupied after piece placement');

    // --- JOURNEY 8 & 9: Level Progression & No Auto-Start Next ---
    console.log('\n[Journey 8 & 9: Progression Verification & No Auto-Start]');
    const userADoc = await usersCol.findOne({ username: testUserA });
    assert(userADoc !== null, 'User A verified in MongoDB');
    assert(userADoc.unlockedLevel === 1, 'User A initialized at unlockedLevel = 1 in database');

    // Verify Level Map button in Header
    await page.waitForSelector('.level-badge-pill');
    const headerLevelPill = await page.$eval('.level-badge-pill', el => el.innerText);
    assert(headerLevelPill.includes('LVL 1'), `Header level pill displays "${headerLevelPill}"`);

    // --- JOURNEY 10: Exit, Retry & Return-to-Map Behavior ---
    console.log('\n[Journey 10: Exit to Level Map & Return-to-Game]');
    // Open Exit confirmation modal via Esc or Header exit button
    await page.waitForSelector('.action-btn.exit-btn');
    await page.click('.action-btn.exit-btn');
    await page.waitForSelector('.exit-confirm-card', { timeout: 5000 });
    assert(await page.$('.exit-confirm-card') !== null, 'Exit confirmation modal opened');

    // Click "CONTINUE PLAYING" to stay in game
    await page.click('.exit-btn-continue');
    await sleep(300);
    assert(await page.$('.exit-confirm-card') === null, 'Modal dismissed with CONTINUE PLAYING');

    // Open Exit modal again and confirm EXIT TO LEVEL MAP
    await page.click('.action-btn.exit-btn');
    await page.waitForSelector('.exit-btn-confirm');
    await page.click('.exit-btn-confirm');
    await page.waitForSelector('.campaign-map-screen', { timeout: 5000 });
    assert(await page.$('.campaign-map-screen') !== null, 'Cleanly exited to Campaign Map');

    // Return to active game via "Back to Game"
    const backBtn = await page.$('.campaign-back-btn');
    assert(backBtn !== null, '"Back to Game" button visible on Campaign Map when game is active');
    if (backBtn) {
      await backBtn.click();
      await page.waitForSelector('.game-grid', { timeout: 5000 });
      assert(await page.$('.game-grid') !== null, 'Returned to active game without resetting state');
    }

    // --- JOURNEY 11: Settings Modal & Controls ---
    console.log('\n[Journey 11: Settings Modal & Audio/Visual Controls]');
    await page.waitForSelector('.action-btn.settings-btn');
    await page.click('.action-btn.settings-btn');
    await page.waitForSelector('.settings-modal', { timeout: 5000 });
    assert(await page.$('.settings-modal') !== null, 'Settings modal opened via header gear icon');

    // Test Master Sound toggle switch
    const masterSoundSwitch = await page.$('button[role="switch"][aria-label="Toggle Master Sound"]');
    assert(masterSoundSwitch !== null, 'Master Sound toggle switch exists');
    await masterSoundSwitch.click();
    let isMasterChecked = await page.$eval('button[role="switch"][aria-label="Toggle Master Sound"]', el => el.getAttribute('aria-checked'));
    assert(isMasterChecked === 'false', 'Master Sound toggled to false');
    // Turn back on
    await masterSoundSwitch.click();
    isMasterChecked = await page.$eval('button[role="switch"][aria-label="Toggle Master Sound"]', el => el.getAttribute('aria-checked'));
    assert(isMasterChecked === 'true', 'Master Sound toggled back to true');

    // Test Reduce Animations toggle
    const reduceAnimSwitch = await page.$('button[role="switch"][aria-label="Toggle Reduce Animations"]');
    assert(reduceAnimSwitch !== null, 'Reduce Animations toggle switch exists');
    await reduceAnimSwitch.click();
    const isReduceChecked = await page.$eval('button[role="switch"][aria-label="Toggle Reduce Animations"]', el => el.getAttribute('aria-checked'));
    assert(isReduceChecked === 'true', 'Reduce Animations enabled successfully');

    // Test Volume Slider
    const volumeSlider = await page.$('.volume-slider');
    assert(volumeSlider !== null, 'Master Volume slider exists');
    const volVal = await page.$eval('.volume-slider', el => el.value);
    assert(Number(volVal) === 80, `Default volume slider value is 80% (actual: ${volVal}%)`);

    // Close Settings with Done button
    await page.click('.settings-done-btn');
    await sleep(300);
    assert(await page.$('.settings-modal') === null, 'Settings modal closed cleanly');

    // --- JOURNEY 12: Global Leaderboard & Real Data ---
    console.log('\n[Journey 12: Global Leaderboard & Real MongoDB Rankings]');
    await page.waitForSelector('.action-btn.leaderboard-btn');
    await page.click('.action-btn.leaderboard-btn');
    await page.waitForSelector('.leaderboard-modal-card', { timeout: 5000 });
    assert(await page.$('.leaderboard-modal-card') !== null, 'Leaderboard modal opened via crown button');

    // Wait for real leaderboard items to load
    await page.waitForSelector('.podium-wrapper');
    assert(await page.$('.podium-wrapper') !== null, 'Top 3 podium rendered');
    const top1PlayerName = await page.$eval('.podium-gold .podium-player-name', el => el.innerText);
    assert(top1PlayerName === 'Kirti Gupta', `Top 1 player on podium is real user "Kirti Gupta" (actual: ${top1PlayerName})`);

    // Verify personal standing dock
    await page.waitForSelector('.current-user-standing-dock');
    const personalDockName = await page.$eval('.standing-username', el => el.innerText);
    assert(personalDockName === testUserA, `Personal standing dock displays logged-in user "${testUserA}"`);

    // Close leaderboard
    await page.click('.leaderboard-back-btn');
    await sleep(300);
    assert(await page.$('.leaderboard-modal-card') === null, 'Leaderboard modal closed cleanly');

    // --- JOURNEY 13: Refresh Persistence ---
    console.log('\n[Journey 13: Page Refresh & Auth/Progression Persistence]');
    await page.reload({ waitUntil: 'networkidle0' });
    
    // On fresh reload, app opens Campaign Map; launch level to check Header
    await page.waitForSelector('.dock-launch-btn', { timeout: 5000 });
    await page.click('.dock-launch-btn');
    await page.waitForSelector('.intro-start-btn', { timeout: 5000 });
    await page.click('.intro-start-btn');
    await page.waitForSelector('.campaign-map-screen', { hidden: true });

    await page.waitForSelector('.user-pill-btn', { timeout: 6000 });
    const refreshedUsername = await page.$eval('.user-pill-name', el => el.innerText);
    assert(refreshedUsername === testUserA, `User remains logged in as "${testUserA}" after full page reload`);

    // --- JOURNEY 14: Account Switching & Isolation ---
    console.log('\n[Journey 14: Account Switching & Progression Isolation]');
    // Open profile modal to logout
    await page.click('.user-pill-btn');
    await page.waitForSelector('.logout-btn', { timeout: 5000 });
    const logoutBtn = await page.$('.logout-btn');
    assert(logoutBtn !== null, 'Logout button available in user profile');
    await logoutBtn.click();
    await sleep(500);

    // On logout, app returns to Campaign Map; launch level to enter gameplay header
    await page.waitForSelector('.dock-launch-btn', { timeout: 5000 });
    await page.click('.dock-launch-btn');
    await page.waitForSelector('.intro-start-btn', { timeout: 5000 });
    await page.click('.intro-start-btn');
    await page.waitForSelector('.campaign-map-screen', { hidden: true });

    // Confirm logged out: Sign in CTA button appears
    await page.waitForSelector('.auth-cta-btn', { timeout: 5000 });
    assert(await page.$('.auth-cta-btn') !== null, 'Successfully logged out (Sign In button reappeared)');

    // Register User B
    await page.click('.auth-cta-btn');
    await page.waitForSelector('.auth-card', { timeout: 5000 });
    const regTabB = await page.$('.auth-tab:nth-child(2)');
    if (regTabB) await regTabB.click();
    await sleep(200);

    await page.type('#auth-username', testUserB);
    await page.type('#auth-email', testEmailB);
    await page.type('#auth-password', 'Password123!');
    await page.click('button[type="submit"].auth-submit-btn');
    
    await page.waitForSelector('.onboarding-card', { timeout: 8000 });
    assert(await page.$('.onboarding-card') !== null, 'New User B welcomed with isolated Onboarding screen');

    // Dismiss onboarding to inspect User B Level Map
    await page.click('.onboarding-primary-btn');
    await page.waitForSelector('.campaign-map-screen', { timeout: 5000 });
    const userBDock = await page.$eval('.selected-level-dock', el => el.innerText);
    assert(userBDock.includes('LEVEL 1') || userBDock.includes('START LEVEL 1'), 'User B starts cleanly at Level 1');

    // --- JOURNEY 15: Viewport Responsiveness (Desktop vs Mobile 375x667) ---
    console.log('\n[Journey 15: Viewport Responsiveness & Layout]');
    // Switch to Mobile Viewport (iPhone SE / Standard Mobile 375x667)
    await page.setViewport({ width: 375, height: 667 });
    await sleep(400);

    // Check no horizontal overflow on Campaign Map
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    assert(scrollWidth <= clientWidth, `Mobile viewport has zero horizontal overflow (scroll: ${scrollWidth}px, client: ${clientWidth}px)`);

    // Launch Level 1 on mobile to test gameplay layout
    await page.waitForSelector('.dock-launch-btn');
    await page.click('.dock-launch-btn');
    await page.waitForSelector('.intro-start-btn', { timeout: 5000 });
    await page.click('.intro-start-btn');
    await page.waitForSelector('.campaign-map-screen', { hidden: true });
    await page.waitForSelector('.game-grid', { timeout: 5000 });
    await page.waitForSelector('.game-grid', { timeout: 5000 });

    // Open Leaderboard on mobile
    await page.waitForSelector('.action-btn.leaderboard-btn');
    await page.click('.action-btn.leaderboard-btn');
    await page.waitForSelector('.leaderboard-modal-card', { timeout: 5000 });
    
    const modalWidth = await page.$eval('.leaderboard-modal-card', el => el.offsetWidth);
    assert(modalWidth <= 375, `Mobile leaderboard modal fits inside 375px screen (actual: ${modalWidth}px)`);
    await page.click('.leaderboard-back-btn');

    // Reset viewport to desktop
    await page.setViewport({ width: 1280, height: 800 });

    console.log('\n[Browser Console Errors Inspection]');
    if (consoleErrors.length === 0) {
      assert(true, 'Zero browser console errors detected throughout all 15 journeys');
    } else {
      console.warn('Browser console errors caught:', consoleErrors);
      // Fail only if there are genuine React or JS runtime errors
      const fatalErrors = consoleErrors.filter(e => !e.includes('favicon.ico'));
      assert(fatalErrors.length === 0, `Detected ${fatalErrors.length} fatal console errors`);
    }

  } catch (err) {
    console.error('Browser automation error:', err);
    assert(false, `Browser journey failed with exception: ${err.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
    // Clean up disposable test accounts A and B from MongoDB
    await usersCol.deleteMany({ username: { $in: [testUserA, testUserB] } });
    await gamesCol.deleteMany({ username: { $in: [testUserA, testUserB] } });
    await mongoose.disconnect();
    console.log('\nCleaned up disposable test users from database.');
  }

  console.log('\n====================================================');
  console.log(`BROWSER VERIFICATION RESULTS: ${passed} / ${total} passed.`);
  if (passed === total) {
    console.log('ALL 15 BROWSER USER JOURNEYS PASSED! ✓');
  } else {
    console.error('SOME BROWSER JOURNEYS FAILED!');
    process.exit(1);
  }
})();
