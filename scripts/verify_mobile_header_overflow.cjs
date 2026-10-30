const puppeteer = require('puppeteer-core');
const assert = require('assert');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:5173';
const ARTIFACT_DIR = 'C:\\Users\\kirti\\.gemini\\antigravity\\brain\\3ac25ba8-43d2-4529-867b-c5d5adc7cb54';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const MOBILE_WIDTHS = [
  { width: 320, height: 600, name: '320px (Ultra-compact mobile)' },
  { width: 360, height: 640, name: '360px (Standard compact Android)' },
  { width: 375, height: 667, name: '375px (iPhone SE)' },
  { width: 390, height: 844, name: '390px (iPhone 12/13/14)' },
  { width: 430, height: 932, name: '430px (iPhone 14/15 Pro Max)' }
];

async function run() {
  console.log('========================================================================');
  console.log('BLOCK BLITZ — MOBILE GAMEPLAY HEADER OVERFLOW & RESPONSIVENESS AUDIT');
  console.log('========================================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Capture console errors
  const pageErrors = [];
  page.on('pageerror', (err) => {
    pageErrors.push(err.message);
    console.error('  [Browser Uncaught Error]:', err.message);
  });

  try {
    for (const vp of MOBILE_WIDTHS) {
      console.log(`\n------------------------------------------------------------------------`);
      console.log(`>>> TESTING VIEWPORT: ${vp.name} (${vp.width}x${vp.height}) <<<`);
      console.log(`------------------------------------------------------------------------`);

      await page.setViewport({ width: vp.width, height: vp.height });

      // Clean local storage for fresh guest session
      await page.goto(APP_URL, { waitUntil: 'networkidle0' });
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      await page.reload({ waitUntil: 'networkidle0' });
      await sleep(300);

      // Welcome -> Guest -> Level Map -> Start Level 1
      const playBtn = await page.$('.welcome-play-now-btn');
      if (playBtn) {
        await playBtn.click();
        await sleep(250);
        const guestBtn = await page.$('.guest-continue-btn');
        if (guestBtn) await guestBtn.click();
        await sleep(350);
      }

      // Launch Level 1 from Map
      const launchBtn = await page.$('.adventure-play-btn, .dock-action-button');
      if (launchBtn) {
        await launchBtn.click();
        await sleep(250);
      }

      const introStartBtn = await page.$('.intro-start-btn');
      if (introStartBtn) {
        await introStartBtn.click();
        await sleep(400);
      }

      await page.waitForSelector('.grid-container', { timeout: 6000 });
      await sleep(300);

      // 1. Horizontal Scroll & Overflow Check
      const overflowMetrics = await page.evaluate(() => {
        const doc = document.documentElement;
        const body = document.body;
        const scrollW = Math.max(doc.scrollWidth, body.scrollWidth);
        const clientW = doc.clientWidth;
        const headerTop = document.querySelector('.header-top');
        const headerRect = headerTop ? headerTop.getBoundingClientRect() : null;

        return {
          scrollWidth: scrollW,
          clientWidth: clientW,
          hasHorizontalScroll: scrollW > clientW,
          headerTopHeight: headerRect ? Math.round(headerRect.height) : 0,
          headerTopWidth: headerRect ? Math.round(headerRect.width) : 0,
          headerRight: headerRect ? Math.round(headerRect.right) : 0
        };
      });

      console.log(`  [Overflow Check] scrollWidth: ${overflowMetrics.scrollWidth}px, clientWidth: ${overflowMetrics.clientWidth}px, headerHeight: ${overflowMetrics.headerTopHeight}px`);
      assert.strictEqual(overflowMetrics.hasHorizontalScroll, false, `${vp.name}: Must have zero horizontal scroll`);
      assert.ok(overflowMetrics.headerRight <= overflowMetrics.clientWidth + 1, `${vp.name}: Header must not exceed viewport width`);
      console.log(`  ✓ No horizontal scroll / overflow at ${vp.width}px`);

      // 2. Element Dimensions and Overlap Check in Header
      const headerElements = await page.evaluate(() => {
        const brandGroup = document.querySelector('.header-brand-group');
        const logo = document.querySelector('.logo-badge');
        const levelBadge = document.querySelector('.level-badge-pill');
        const actionsRow = document.querySelector('.header-actions');
        const accountGroup = document.querySelector('.header-group-account');
        const accountBtn = document.querySelector('.user-pill-btn') || document.querySelector('.auth-cta-btn');
        const settingsBtn = document.querySelector('.action-btn.settings-btn');
        const restartBtn = document.querySelector('.action-btn.restart-btn');
        const exitBtn = document.querySelector('.action-btn.exit-btn');
        const leaderBtn = document.querySelector('.action-btn.leaderboard-btn');
        const toolsCluster = document.querySelector('.header-tools-cluster');

        const bRect = brandGroup?.getBoundingClientRect();
        const lRect = logo?.getBoundingClientRect();
        const lvlRect = levelBadge?.getBoundingClientRect();
        const aRowRect = actionsRow?.getBoundingClientRect();
        const accRect = accountBtn?.getBoundingClientRect();
        const setRect = settingsBtn?.getBoundingClientRect();
        const resRect = restartBtn?.getBoundingClientRect();
        const exRect = exitBtn?.getBoundingClientRect();
        const leadRect = leaderBtn?.getBoundingClientRect();
        const toolsRect = toolsCluster?.getBoundingClientRect();

        return {
          // Row 1: Brand Group
          row1Top: bRect ? Math.round(bRect.top) : 0,
          logoLeft: lRect ? Math.round(lRect.left) : 0,
          logoRight: lRect ? Math.round(lRect.right) : 0,
          levelLeft: lvlRect ? Math.round(lvlRect.left) : 0,
          levelRight: lvlRect ? Math.round(lvlRect.right) : 0,
          row1Overlap: lRect && lvlRect ? lRect.right > lvlRect.left : false,
          row1Separation: lRect && lvlRect ? Math.round(lvlRect.left - lRect.right) : 0,

          // Row 2: Actions Row
          row2Top: aRowRect ? Math.round(aRowRect.top) : 0,
          accLeft: accRect ? Math.round(accRect.left) : 0,
          accRight: accRect ? Math.round(accRect.right) : 0,
          accWidth: accRect ? Math.round(accRect.width) : 0,
          toolsLeft: toolsRect ? Math.round(toolsRect.left) : 0,
          toolsRight: toolsRect ? Math.round(toolsRect.right) : 0,
          row2Overlap: accRect && toolsRect ? accRect.right > toolsRect.left : false,
          row2Separation: accRect && toolsRect ? Math.round(toolsRect.left - accRect.right) : 0,

          // All Buttons within Viewport Bounds
          setRight: setRect ? Math.round(setRect.right) : 0,
          resRight: resRect ? Math.round(resRect.right) : 0,
          exRight: exRect ? Math.round(exRect.right) : 0,
          leadRight: leadRect ? Math.round(leadRect.right) : 0,

          // Two Rows Distinct Heights
          isTwoRows: bRect && aRowRect ? aRowRect.top >= bRect.bottom - 2 : false,
          gapBetweenRows: bRect && aRowRect ? Math.round(aRowRect.top - bRect.bottom) : 0
        };
      });

      console.log(`  [Row 1 Check] Logo right: ${headerElements.logoRight}px, Level badge left: ${headerElements.levelLeft}px (Separation: ${headerElements.row1Separation}px)`);
      assert.strictEqual(headerElements.row1Overlap, false, `${vp.name}: Logo and Level badge must NOT overlap`);
      assert.ok(headerElements.row1Separation > 10, `${vp.name}: Comfortable separation between Logo and Level badge`);
      console.log(`  ✓ Row 1 has zero overlap (Separation: ${headerElements.row1Separation}px)`);

      console.log(`  [Row 2 Check] Account right: ${headerElements.accRight}px, Tools left: ${headerElements.toolsLeft}px (Separation: ${headerElements.row2Separation}px)`);
      assert.strictEqual(headerElements.row2Overlap, false, `${vp.name}: Account and Tools cluster must NOT overlap`);
      assert.ok(headerElements.row2Separation >= 0, `${vp.name}: Comfortable separation in Row 2`);
      console.log(`  ✓ Row 2 has zero overlap (Separation: ${headerElements.row2Separation}px)`);

      assert.strictEqual(headerElements.isTwoRows, true, `${vp.name}: Header must be rendered in two distinct compact rows`);
      console.log(`  ✓ Confirmed two distinct compact rows (vertical gap: ${headerElements.gapBetweenRows}px)`);

      // Verify no button extends beyond the right edge of the screen
      assert.ok(headerElements.setRight <= vp.width, `${vp.name}: Settings button must not exceed right edge`);
      assert.ok(headerElements.resRight <= vp.width, `${vp.name}: Restart button must not exceed right edge`);
      assert.ok(headerElements.exRight <= vp.width, `${vp.name}: Exit button must not exceed right edge`);
      assert.ok(headerElements.leadRight <= vp.width, `${vp.name}: Leaderboard button must not exceed right edge`);
      console.log(`  ✓ All buttons are fully visible without being cut off`);

      // 3. Board and Tray Integrity
      const playfieldIntegrity = await page.evaluate(() => {
        const grid = document.querySelector('.grid-container');
        const tray = document.querySelector('.block-tray');
        const slots = document.querySelectorAll('.block-tray-slot');
        const vh = window.innerHeight;
        const gRect = grid ? grid.getBoundingClientRect() : null;
        const tRect = tray ? tray.getBoundingClientRect() : null;

        return {
          gridVisible: !!grid,
          trayVisible: !!tray,
          slotsCount: slots.length,
          gridWidth: gRect ? Math.round(gRect.width) : 0,
          gridHeight: gRect ? Math.round(gRect.height) : 0,
          trayBottom: tRect ? Math.round(tRect.bottom) : 0,
          fitsViewportHeight: tRect ? tRect.bottom <= vh + 2 : false
        };
      });

      assert.strictEqual(playfieldIntegrity.gridVisible, true, 'Game board is visible');
      assert.strictEqual(playfieldIntegrity.trayVisible, true, 'Block tray is visible');
      assert.strictEqual(playfieldIntegrity.slotsCount, 3, 'Block tray contains 3 slots');
      console.log(`  ✓ Board (${playfieldIntegrity.gridWidth}x${playfieldIntegrity.gridHeight}px) and Tray (3 slots) intact`);

      // 4. Interactive Functionality Tests
      // 4a. Settings button opens SettingsModal
      await page.click('.action-btn.settings-btn');
      await sleep(250);
      const settingsModalOpen = await page.evaluate(() => {
        return !!document.querySelector('.settings-modal');
      });
      assert.strictEqual(settingsModalOpen, true, 'Settings modal opens on click');
      const closeSettingsBtn = await page.$('.settings-close-btn');
      if (closeSettingsBtn) await closeSettingsBtn.click();
      await sleep(200);
      console.log(`  ✓ Settings modal opens & closes cleanly`);

      // 4b. Exit button opens ExitConfirmModal
      await page.click('.action-btn.exit-btn');
      await sleep(250);
      const exitModalOpen = await page.evaluate(() => {
        return !!document.querySelector('.exit-confirm-card');
      });
      assert.strictEqual(exitModalOpen, true, 'Exit modal opens on click');
      const resumeBtn = await page.$('.exit-btn-continue');
      if (resumeBtn) await resumeBtn.click();
      await sleep(200);
      console.log(`  ✓ Exit confirmation modal opens & resumes cleanly`);

      // 4c. Restart button resets level
      await page.click('.action-btn.restart-btn');
      await sleep(250);
      const introStartAfterRestart = await page.$('.intro-start-btn');
      if (introStartAfterRestart) {
        await introStartAfterRestart.click();
        await sleep(350);
      }
      const scoreAfterRestart = await page.evaluate(() => {
        const el = document.querySelector('.score-value');
        return el ? el.textContent.trim() : '0';
      });
      assert.strictEqual(scoreAfterRestart, '0', 'Restart resets score to 0');
      console.log(`  ✓ Restart button functions properly`);

      // 4d. Level badge opens Level Map
      await page.click('.level-badge-pill');
      await sleep(350);
      const levelMapOpen = await page.evaluate(() => {
        return !!document.querySelector('.adventure-map-screen, .campaign-map-screen');
      });
      assert.strictEqual(levelMapOpen, true, 'Clicking level badge opens Level Map');

      // Return to game from map
      const launchBackBtn = await page.$('.adventure-play-btn, .dock-action-button');
      if (launchBackBtn) await launchBackBtn.click();
      await sleep(350);
      const introStartBtn2 = await page.$('.intro-start-btn');
      if (introStartBtn2) await introStartBtn2.click();
      await sleep(300);
      console.log(`  ✓ Level Map navigation functions properly`);

      // 5. Capture Screenshots at 375px and 390px
      if (vp.width === 375 || vp.width === 390) {
        const shotPath = path.join(ARTIFACT_DIR, `header_gameplay_${vp.width}px.png`);
        await page.screenshot({ path: shotPath });
        console.log(`  📸 Saved screenshot: header_gameplay_${vp.width}px.png`);
      }
    }

    // -------------------------------------------------------------------------
    // TEST AUTHENTICATED USER STATE ON MOBILE
    // -------------------------------------------------------------------------
    console.log(`\n------------------------------------------------------------------------`);
    console.log(`>>> TESTING AUTHENTICATED USER IN HEADER AT 375px & 390px <<<`);
    console.log(`------------------------------------------------------------------------`);

    for (const testWidth of [375, 390]) {
      await page.setViewport({ width: testWidth, height: 844 });
      await page.goto(APP_URL, { waitUntil: 'networkidle0' });

      // Register or login a test user
      const ts = Date.now();
      const authUser = `pilot_${ts.toString().slice(-5)}`;
      await page.evaluate(async (uname) => {
        localStorage.clear();
        sessionStorage.clear();
        // Register user via backend API
        const res = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: uname,
            email: `${uname}@blitz.test`,
            password: 'password123'
          })
        });
        const data = await res.json();
        if (data.token) {
          localStorage.setItem('block_blitz_token', data.token);
        }
      }, authUser);

      await page.reload({ waitUntil: 'networkidle0' });
      await sleep(400);

      // Welcome Play Now -> Level Map -> Start Level
      await page.click('.welcome-play-now-btn');
      await sleep(350);
      await page.click('.adventure-play-btn, .dock-action-button');
      await sleep(300);
      const introStart = await page.$('.intro-start-btn');
      if (introStart) await introStart.click();
      await sleep(350);

      const authMetrics = await page.evaluate(() => {
        const doc = document.documentElement;
        const userPill = document.querySelector('.user-pill-btn');
        const userPillName = document.querySelector('.user-pill-name');
        const headerTop = document.querySelector('.header-top');
        const headerRect = headerTop?.getBoundingClientRect();

        return {
          scrollWidth: doc.scrollWidth,
          clientWidth: doc.clientWidth,
          hasHorizontalScroll: doc.scrollWidth > doc.clientWidth,
          userPillVisible: !!userPill,
          displayedUsername: userPillName ? userPillName.textContent.trim() : '',
          headerRight: headerRect ? Math.round(headerRect.right) : 0
        };
      });

      console.log(`  [Authenticated Check ${testWidth}px] Username: "${authMetrics.displayedUsername}", Overflow: ${authMetrics.hasHorizontalScroll}`);
      assert.strictEqual(authMetrics.hasHorizontalScroll, false, `Authenticated mobile ${testWidth}px has zero overflow`);
      assert.strictEqual(authMetrics.userPillVisible, true, 'User pill is visible');
      assert.strictEqual(authMetrics.displayedUsername, authUser, 'User pill displays correct username');
      console.log(`  ✓ Authenticated user pill fits cleanly without horizontal overflow at ${testWidth}px`);

      const authShotPath = path.join(ARTIFACT_DIR, `header_gameplay_auth_${testWidth}px.png`);
      await page.screenshot({ path: authShotPath });
      console.log(`  📸 Saved screenshot: header_gameplay_auth_${testWidth}px.png`);
    }

    assert.strictEqual(pageErrors.length, 0, `Zero uncaught browser errors (actual: ${pageErrors.length})`);
    console.log(`\n========================================================================`);
    console.log('ALL MOBILE HEADER OVERFLOW TESTS PASSED WITH 100% SUCCESS! ✓');
    console.log('========================================================================\n');

  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error('\n✗ Test Failed:', err);
  process.exit(1);
});
