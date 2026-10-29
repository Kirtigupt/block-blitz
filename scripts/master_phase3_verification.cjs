/**
 * MASTER PHASE 3 QA VERIFICATION SUITE
 * Complete end-to-end audit for BLOCK BLITZ:
 * - Auth & Security
 * - Adventure Map (100 Levels / 10 Chapters)
 * - Gameplay & Board Placement Mechanics
 * - Level Progression & Completion Flow
 * - Multi-Account Isolation & Atlas Persistence
 * - Responsive Auditing across 4 Viewports (375x667, 390x844, 768x1024, 1280x800)
 */

const puppeteer = require('puppeteer-core');
const assert = require('assert');
const path = require('path');
const dotenv = require('../server/node_modules/dotenv');
dotenv.config({ path: path.resolve(__dirname, '../server/.env') });

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:5173';
const BACKEND_URL = 'http://localhost:5000';
const ARTIFACT_DIR = 'C:\\Users\\kirti\\.gemini\\antigravity\\brain\\3ac25ba8-43d2-4529-867b-c5d5adc7cb54';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let passed = 0;
let total = 0;

function check(condition, desc) {
  total++;
  if (condition) {
    passed++;
    console.log(`  ✓ ${desc}`);
  } else {
    console.error(`  ✗ FAIL: ${desc}`);
    throw new Error(`Assertion failed: ${desc}`);
  }
}

async function run() {
  console.log('========================================================================');
  console.log('BLOCK BLITZ — PHASE 3 MASTER QA & SYSTEM AUDIT VERIFICATION');
  console.log('========================================================================\n');

  // ---------------------------------------------------------------------------
  // SECTION 1: BACKEND HEALTH & AUTHENTICATION ENDPOINTS
  // ---------------------------------------------------------------------------
  console.log('>>> [SECTION 1] BACKEND API & SECURITY AUDIT <<<');

  // 1.1 Health check
  const healthRes = await fetch(`${BACKEND_URL}/api/health`);
  check(healthRes.status === 200, 'GET /api/health returns HTTP 200');
  const healthData = await healthRes.json();
  check(healthData.success === true, 'Health check reports success: true');

  // 1.2 Protected routes reject unauthenticated requests
  const unauthMe = await fetch(`${BACKEND_URL}/api/auth/me`);
  check(unauthMe.status === 401, 'GET /api/auth/me rejects unauthenticated request (401)');

  const unauthGame = await fetch(`${BACKEND_URL}/api/games`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ score: 100 })
  });
  check(unauthGame.status === 401, 'POST /api/games rejects unauthenticated request (401)');

  // 1.3 Registration validation
  const invalidReg = await fetch(`${BACKEND_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'ab', email: 'notanemail', password: '123' })
  });
  check(invalidReg.status === 400, 'POST /api/auth/register rejects invalid inputs (400)');

  // 1.4 Register test accounts
  const ts = Date.now();
  const user1 = `qa_pilot1_${ts}`;
  const user2 = `qa_pilot2_${ts}`;

  const reg1Res = await fetch(`${BACKEND_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: user1, email: `${user1}@test.com`, password: 'password123' })
  });
  const reg1Data = await reg1Res.json();
  check(reg1Res.status === 201 && reg1Data.token, `User 1 (${user1}) registers with valid JWT`);
  const token1 = reg1Data.token;

  const reg2Res = await fetch(`${BACKEND_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: user2, email: `${user2}@test.com`, password: 'password123' })
  });
  const reg2Data = await reg2Res.json();
  check(reg2Res.status === 201 && reg2Data.token, `User 2 (${user2}) registers with valid JWT`);
  const token2 = reg2Data.token;

  // 1.5 Login with invalid credentials
  const badLogin = await fetch(`${BACKEND_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usernameOrEmail: user1, password: 'wrongpassword' })
  });
  check(badLogin.status === 401, 'POST /api/auth/login rejects incorrect password (401)');

  // 1.6 Login with valid credentials
  const goodLogin = await fetch(`${BACKEND_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usernameOrEmail: user1, password: 'password123' })
  });
  check(goodLogin.status === 200, 'POST /api/auth/login succeeds with valid credentials (200)');
  const loginData = await goodLogin.json();
  check(loginData.user.username === user1, 'Authenticated user payload contains correct username');
  check(loginData.user.unlockedLevel === 1, 'New user starts with unlockedLevel = 1');

  // ---------------------------------------------------------------------------
  // SECTION 2: ACCOUNT ISOLATION & PROGRESSION RULES
  // ---------------------------------------------------------------------------
  console.log('\n>>> [SECTION 2] ACCOUNT ISOLATION & PROGRESSION RULES <<<');

  // User 1 completes level 1 legally
  const prog1Res = await fetch(`${BACKEND_URL}/api/auth/progression`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token1}` },
    body: JSON.stringify({ completedLevel: 1, currentLevel: 2 })
  });
  check(prog1Res.status === 200, 'User 1 completes Level 1 legally (200)');
  const prog1Data = await prog1Res.json();
  check(prog1Data.progression.unlockedLevel === 2, 'User 1 progression unlockedLevel is now 2');

  // User 2 progression is strictly unaffected
  const me2Res = await fetch(`${BACKEND_URL}/api/auth/me`, {
    headers: { 'Authorization': `Bearer ${token2}` }
  });
  const me2Data = await me2Res.json();
  check(me2Data.user.unlockedLevel === 1, 'User 2 unlockedLevel remains strictly 1 (isolated from User 1)');
  check(me2Data.user.completedLevels.length === 0, 'User 2 completedLevels remains strictly empty');

  // Illegal jump attempt by User 2 is rejected
  const illegalJump = await fetch(`${BACKEND_URL}/api/auth/progression`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token2}` },
    body: JSON.stringify({ completedLevel: 5, currentLevel: 6 })
  });
  check(illegalJump.status === 400, 'Server rejects skipping uncompleted levels (400)');

  // ---------------------------------------------------------------------------
  // SECTION 3: BROWSER UI & RESPONSIVE AUDIT ACROSS 4 VIEWPORTS
  // ---------------------------------------------------------------------------
  console.log('\n>>> [SECTION 3] BROWSER UI & RESPONSIVE AUDIT ACROSS 4 VIEWPORTS <<<');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  const VIEWPORTS = [
    { name: 'Small Mobile', width: 375, height: 667, tag: '375x667' },
    { name: 'Modern Mobile', width: 390, height: 844, tag: '390x844' },
    { name: 'Tablet Portrait', width: 768, height: 1024, tag: '768x1024' },
    { name: 'Desktop Standard', width: 1280, height: 800, tag: '1280x800' }
  ];

  try {
    for (const vp of VIEWPORTS) {
      console.log(`\n--- Auditing ${vp.name} (${vp.tag}) ---`);
      await page.setViewport({ width: vp.width, height: vp.height });

      // Clean session
      await page.goto(APP_URL, { waitUntil: 'networkidle0' });
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      await page.reload({ waitUntil: 'networkidle0' });
      await sleep(300);

      // 1. Welcome Screen
      const welcomeMetrics = await page.evaluate(() => {
        const doc = document.documentElement;
        const playBtn = document.querySelector('.welcome-play-now-btn');
        return {
          hasHorizontalScroll: doc.scrollWidth > doc.clientWidth,
          playBtnVisible: !!playBtn,
          playBtnHeight: playBtn ? playBtn.getBoundingClientRect().height : 0
        };
      });
      check(!welcomeMetrics.hasHorizontalScroll, `${vp.name}: Zero horizontal overflow on Welcome Screen`);
      check(welcomeMetrics.playBtnHeight >= 44, `${vp.name}: PLAY NOW button meets touch target height (>= 44px)`);

      // 2. Navigate to Adventure Map as Guest
      await page.click('.welcome-play-now-btn');
      await sleep(250);
      const guestBtn = await page.$('.guest-continue-btn');
      if (guestBtn) await guestBtn.click();
      await page.waitForSelector('.adventure-map-screen', { timeout: 6000 });
      await sleep(300);

      const mapMetrics = await page.evaluate(() => {
        const doc = document.documentElement;
        const backBtn = document.querySelector('.adventure-back-btn, .campaign-back-btn');
        const tiles = document.querySelectorAll('.adventure-block');
        const dock = document.querySelector('.adventure-bottom-dock');
        return {
          hasHorizontalScroll: doc.scrollWidth > doc.clientWidth,
          tilesCount: tiles.length,
          backBtnLabel: backBtn ? backBtn.getAttribute('aria-label') : null,
          dockHeight: dock ? dock.getBoundingClientRect().height : 0
        };
      });
      check(!mapMetrics.hasHorizontalScroll, `${vp.name}: Zero horizontal overflow on Adventure Map`);
      check(mapMetrics.tilesCount > 0, `${vp.name}: Stage tiles render on map (count: ${mapMetrics.tilesCount})`);
      check(mapMetrics.backBtnLabel === 'Back to Welcome', `${vp.name}: Back arrow has accessible label "Back to Welcome"`);
      check(mapMetrics.dockHeight <= 95, `${vp.name}: Action dock is sleek without covering content (<= 95px)`);

      // 3. Launch Gameplay Screen
      await page.click('.adventure-play-btn, .dock-action-button');
      await sleep(250);
      const startIntroBtn = await page.$('.intro-start-btn');
      if (startIntroBtn) await startIntroBtn.click();
      await page.waitForSelector('.grid-container', { timeout: 6000 });
      await sleep(400);

      const gameMetrics = await page.evaluate(() => {
        const doc = document.documentElement;
        const grid = document.querySelector('.grid-container');
        const tray = document.querySelector('.block-tray-container');
        const headerTop = document.querySelector('.header-top');
        const scoreBoard = document.querySelector('.score-board');
        const objectivePanel = document.querySelector('.level-objective-panel');

        return {
          hasHorizontalScroll: doc.scrollWidth > doc.clientWidth,
          gridVisible: !!grid,
          trayVisible: !!tray,
          scoreBoardVisible: !!scoreBoard,
          objectivePanelVisible: !!objectivePanel,
          headerTopHeight: headerTop ? headerTop.getBoundingClientRect().height : 0,
          trayBottom: tray ? tray.getBoundingClientRect().bottom : 0,
          viewportHeight: window.innerHeight
        };
      });

      check(!gameMetrics.hasHorizontalScroll, `${vp.name}: Zero horizontal overflow during active gameplay`);
      check(gameMetrics.gridVisible, `${vp.name}: 8x8 Grid container renders properly`);
      check(gameMetrics.trayVisible, `${vp.name}: Block tray renders properly`);
      check(gameMetrics.scoreBoardVisible && gameMetrics.objectivePanelVisible, `${vp.name}: Scoreboard and Objective panel render properly`);
      check(gameMetrics.headerTopHeight <= 48, `${vp.name}: Header controls stay sleek on a single row (<= 48px)`);
      check(gameMetrics.trayBottom <= gameMetrics.viewportHeight + 2, `${vp.name}: Board & Tray fit within viewport height without clipping`);

      // 4. Test Gameplay Mechanics on first viewport
      if (vp.tag === '390x844') {
        console.log('\n>>> [TESTING GAMEPLAY INTERACTIONS ON MODERN MOBILE] <<<');
        // Select piece
        await page.evaluate(() => {
          const piece = document.querySelector('.block-piece');
          if (piece) piece.click();
        });
        await sleep(200);

        const pieceSelected = await page.evaluate(() => {
          return !!document.querySelector('.block-piece.selected');
        });
        check(pieceSelected, 'Block tray piece selection works (piece is highlighted with selected aura)');

        // Place piece onto grid
        await page.hover('.grid-cell[data-row="3"][data-col="3"]');
        await sleep(200);

        await page.evaluate(() => {
          const cell = document.querySelector('.grid-cell.preview-valid') ||
                       document.querySelector('.grid-cell[data-row="3"][data-col="3"]') ||
                       document.querySelector('.grid-cell[data-row="0"][data-col="0"]');
          if (cell) cell.click();
        });
        await sleep(300);

        const afterPlacement = await page.evaluate(() => {
          const occupied = document.querySelectorAll('.grid-cell.occupied');
          const scoreEl = document.querySelector('.score-value');
          return {
            occupiedCount: occupied.length,
            scoreText: scoreEl ? scoreEl.textContent.trim() : '0'
          };
        });
        check(afterPlacement.occupiedCount > 0, `Piece successfully placed on grid (Occupied cells: ${afterPlacement.occupiedCount})`);

        // Test Escape to Pause / Exit modal
        await page.keyboard.press('Escape');
        await sleep(300);

        const hasExitModal = await page.evaluate(() => {
          return !!document.querySelector('.exit-confirm-card');
        });
        check(hasExitModal, 'Escape key triggers Exit Confirmation dialog');

        // Resume play
        const continueBtn = await page.$('.exit-btn-continue');
        if (continueBtn) await continueBtn.click();
        await sleep(250);

        const resumedModal = await page.evaluate(() => {
          return !document.querySelector('.exit-confirm-card');
        });
        check(resumedModal, 'Clicking "CONTINUE PLAYING" closes dialog and resumes match');
      }
    }

    console.log('\n========================================================================');
    console.log(`FINAL MASTER QA RESULT: ${passed} / ${total} CHECKS PASSED`);
    console.log('ALL PHASE 3 VERIFICATION CRITERIA MET WITH ZERO FAILURES! ✓');
    console.log('========================================================================\n');

  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error('\n✗ Master QA Suite encountered an error:', err.message);
  process.exit(1);
});
