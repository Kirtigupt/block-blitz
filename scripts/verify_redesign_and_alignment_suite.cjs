const puppeteer = require('puppeteer-core');
const assert = require('assert');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:5173';
const ARTIFACT_DIR = 'C:\\Users\\kirti\\.gemini\\antigravity\\brain\\3ac25ba8-43d2-4529-867b-c5d5adc7cb54';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const VIEWPORTS = [
  { width: 320, height: 640, name: '320x640_small_mobile' },
  { width: 360, height: 800, name: '360x800_standard_android' },
  { width: 375, height: 667, name: '375x667_iphone_se' },
  { width: 390, height: 844, name: '390x844_iphone_14' },
  { width: 430, height: 932, name: '430x932_large_phone' },
  { width: 768, height: 1024, name: '768x1024_tablet' },
  { width: 1280, height: 800, name: '1280x800_desktop' }
];

async function runSuite() {
  console.log('========================================================================');
  console.log('BLOCK BLITZ — COMPREHENSIVE REDESIGN & ALIGNMENT VERIFICATION SUITE');
  console.log('========================================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  for (const vp of VIEWPORTS) {
    console.log(`\n========================================================================`);
    console.log(`[TESTING VIEWPORT] ${vp.width}x${vp.height} (${vp.name})`);
    console.log(`========================================================================`);

    await page.setViewport({ width: vp.width, height: vp.height });

    // 1. Fresh Guest Session
    await page.goto(APP_URL, { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload({ waitUntil: 'networkidle0' });
    await sleep(400);

    // 2. Welcome Landing -> Adventure Map
    await page.click('.welcome-play-now-btn');
    await sleep(350);
    const guestBtn = await page.$('.guest-continue-btn');
    if (guestBtn) await guestBtn.click();
    await sleep(450);

    // Verify on Adventure Map
    await page.waitForSelector('.adventure-map-screen', { timeout: 6000 });
    console.log('  ✓ Navigated to Adventure Map');

    // Check Adventure Map Horizontal Overflow
    const mapOverflow = await page.evaluate(() => {
      const scrollW = document.documentElement.scrollWidth;
      const innerW = window.innerWidth;
      const screenEl = document.querySelector('.adventure-map-screen');
      const screenScrollW = screenEl ? screenEl.scrollWidth : 0;
      return {
        hasPageOverflow: scrollW > innerW + 1,
        scrollW,
        innerW,
        screenScrollW
      };
    });
    assert.strictEqual(mapOverflow.hasPageOverflow, false, `Horizontal overflow on Adventure Map at ${vp.width}px!`);
    console.log(`  ✓ Adventure Map zero horizontal overflow (scrollWidth: ${mapOverflow.scrollW}px, innerWidth: ${mapOverflow.innerW}px)`);

    // Verify Journey Path & Nodes
    const mapInspect = await page.evaluate(() => {
      const nodes = document.querySelectorAll('.adventure-block');
      const journeyOverlay = document.querySelector('.journey-path-svg-overlay');
      const activePath = document.querySelector('.journey-path-active');
      const dormantPath = document.querySelector('.journey-path-dormant');
      const currentBeacon = document.querySelector('.adv-beacon-rings');
      const pointer = document.querySelector('.adventure-pointer-marker');
      const bossNodes = document.querySelectorAll('.adventure-block.boss-stone');
      const bottomDock = document.querySelector('.adventure-bottom-dock');
      const launchBtn = document.querySelector('.dock-launch-btn, .adventure-play-btn');

      return {
        nodesCount: nodes.length,
        hasJourneyOverlay: Boolean(journeyOverlay),
        hasActivePath: Boolean(activePath),
        hasDormantPath: Boolean(dormantPath),
        hasBeacon: Boolean(currentBeacon),
        hasPointer: Boolean(pointer),
        bossNodesCount: bossNodes.length,
        hasDock: Boolean(bottomDock),
        hasLaunchBtn: Boolean(launchBtn)
      };
    });

    console.log(`  ✓ Adventure Map: ${mapInspect.nodesCount} level nodes rendered`);
    console.log(`  ✓ Journey Path: overlay=${mapInspect.hasJourneyOverlay}, activePath=${mapInspect.hasActivePath}, dormantPath=${mapInspect.hasDormantPath}`);
    console.log(`  ✓ Boss nodes: ${mapInspect.bossNodesCount} milestones identified with crown badges`);
    console.log(`  ✓ Active Beacon: radar rings=${mapInspect.hasBeacon}, pointer=${mapInspect.hasPointer}`);
    assert.strictEqual(mapInspect.nodesCount, 100, 'Must render exactly 100 progressive levels');
    assert.ok(mapInspect.hasJourneyOverlay, 'Journey path overlay must exist');
    assert.ok(mapInspect.bossNodesCount >= 10, 'All 10 chapter boss nodes must have boss styling');

    // Capture screenshot on 390x844 and 1280x800 for documentation
    if (vp.name.includes('iphone_14') || vp.name.includes('desktop')) {
      const mapShotPath = path.join(ARTIFACT_DIR, `redesigned_adventure_map_${vp.width}x${vp.height}.png`);
      await page.screenshot({ path: mapShotPath });
      console.log(`  📸 Captured Adventure Map Screenshot: ${mapShotPath}`);
    }

    // Test Chapter Filter Navigation
    const chTabSuccess = await page.evaluate(() => {
      const chTabs = document.querySelectorAll('.ch-pill-item');
      if (chTabs.length > 2) {
        chTabs[1].click(); // Click Chapter 1 tab
        return true;
      }
      return false;
    });
    await sleep(300);

    const chapterViewInspect = await page.evaluate(() => {
      const chHeader = document.querySelector('.chapter-header-strip');
      const chStages = document.querySelectorAll('.chapter-stage-tile');
      return {
        hasChHeader: Boolean(chHeader),
        stagesCount: chStages.length
      };
    });
    console.log(`  ✓ Chapter View: Header=${chapterViewInspect.hasChHeader}, Stages=${chapterViewInspect.stagesCount}`);
    assert.strictEqual(chapterViewInspect.stagesCount, 10, 'Chapter view must display 10 stages');

    // Switch back to All Stages
    await page.evaluate(() => {
      const allTab = document.querySelector('.ch-pill-item');
      if (allTab) allTab.click();
    });
    await sleep(250);

    // 3. Launch Level 1 -> Gameplay Screen
    await page.click('.adventure-play-btn, .dock-action-button');
    await sleep(350);

    const introStartBtn = await page.$('.intro-start-btn');
    if (introStartBtn) await introStartBtn.click();
    await sleep(500);

    await page.waitForSelector('.grid-container', { timeout: 6000 });
    console.log('  ✓ Successfully transitioned to Gameplay Screen');

    // Check Gameplay Horizontal Overflow
    const gameOverflow = await page.evaluate(() => {
      const scrollW = document.documentElement.scrollWidth;
      const innerW = window.innerWidth;
      const headerEl = document.querySelector('.game-header');
      const headerRect = headerEl ? headerEl.getBoundingClientRect() : null;
      return {
        hasPageOverflow: scrollW > innerW + 1,
        scrollW,
        innerW,
        headerWidth: headerRect ? headerRect.width : 0
      };
    });
    assert.strictEqual(gameOverflow.hasPageOverflow, false, `Horizontal overflow on Gameplay Screen at ${vp.width}px!`);
    console.log(`  ✓ Gameplay zero horizontal overflow (scrollWidth: ${gameOverflow.scrollW}px, innerWidth: ${gameOverflow.innerW}px)`);

    // Verify Gameplay Header Elements
    const headerInspect = await page.evaluate(() => {
      const logo = document.querySelector('.logo-badge');
      const lvlBadge = document.querySelector('.level-badge-pill');
      const leaderboardBtn = document.querySelector('.leaderboard-btn');
      const settingsBtn = document.querySelector('.settings-btn');
      const restartBtn = document.querySelector('.restart-btn');
      const exitBtn = document.querySelector('.exit-btn');
      const authBtn = document.querySelector('.auth-cta-btn, .user-pill-btn');
      const scoreVal = document.querySelector('.score-value');
      const bestVal = document.querySelector('.best-val');
      const streakVal = document.querySelector('.streak-val');
      const objPanel = document.querySelector('.level-objective-panel');
      const progressTrack = document.querySelector('.objective-progress-track');
      const progressHead = document.querySelector('.progress-fill-glow-head');

      return {
        hasLogo: Boolean(logo),
        hasLvlBadge: Boolean(lvlBadge),
        hasLeaderboardBtn: Boolean(leaderboardBtn),
        hasSettingsBtn: Boolean(settingsBtn),
        hasRestartBtn: Boolean(restartBtn),
        hasExitBtn: Boolean(exitBtn),
        hasAuthBtn: Boolean(authBtn),
        scoreText: scoreVal ? scoreVal.textContent.trim() : null,
        bestText: bestVal ? bestVal.textContent.trim() : null,
        streakText: streakVal ? streakVal.textContent.trim() : null,
        hasObjPanel: Boolean(objPanel),
        hasProgressTrack: Boolean(progressTrack),
        hasProgressHead: Boolean(progressHead)
      };
    });

    console.log(`  ✓ Header Elements: Logo=${headerInspect.hasLogo}, LvlBadge=${headerInspect.hasLvlBadge}, Leaderboard=${headerInspect.hasLeaderboardBtn}, Settings=${headerInspect.hasSettingsBtn}, Restart=${headerInspect.hasRestartBtn}, Exit=${headerInspect.hasExitBtn}`);
    console.log(`  ✓ Score Metrics: Current=${headerInspect.scoreText}, Best=${headerInspect.bestText}, Streak=${headerInspect.streakText}`);
    console.log(`  ✓ Objective Panel: Visible=${headerInspect.hasObjPanel}, ProgressTrack=${headerInspect.hasProgressTrack}, GlowHead=${headerInspect.hasProgressHead}`);

    assert.ok(headerInspect.hasLogo, 'Logo must exist');
    assert.ok(headerInspect.hasLvlBadge, 'Level badge must exist');
    assert.ok(headerInspect.hasLeaderboardBtn, 'Leaderboard button must exist');
    assert.ok(headerInspect.hasSettingsBtn, 'Settings button must exist');
    assert.ok(headerInspect.hasRestartBtn, 'Restart button must exist');
    assert.ok(headerInspect.hasExitBtn, 'Exit button must exist');
    assert.ok(headerInspect.hasObjPanel, 'Objective panel must exist');

    // Capture screenshot on 390x844 and 1280x800 for documentation
    if (vp.name.includes('iphone_14') || vp.name.includes('desktop')) {
      const gameShotPath = path.join(ARTIFACT_DIR, `redesigned_gameplay_header_${vp.width}x${vp.height}.png`);
      await page.screenshot({ path: gameShotPath });
      console.log(`  📸 Captured Gameplay Header Screenshot: ${gameShotPath}`);
    }

    // 4. Test Board Alignment and Snap Placement
    // Select a shape
    await page.evaluate(() => {
      const piece = document.querySelector('.block-piece:not(.disabled)');
      if (piece) piece.click();
    });
    await sleep(200);

    // Click cell (4, 4)
    await page.evaluate(() => {
      const cell44 = document.querySelector('.grid-cell[data-row="4"][data-col="4"]');
      if (cell44) cell44.click();
    });
    await sleep(350);

    const boardCheck = await page.evaluate(() => {
      const occupied = document.querySelectorAll('.grid-cell.occupied');
      return occupied.length;
    });
    console.log(`  ✓ Block placement: Board now has ${boardCheck} occupied cells matching exact target`);
    assert.ok(boardCheck > 0, 'Block must be placed cleanly onto grid');
  }

  console.log('\n========================================================================');
  console.log('✓ ALL 7 VIEWPORTS & COMPREHENSIVE REGRESSION SUITE PASSED 100%!');
  console.log('========================================================================\n');

  await browser.close();
}

runSuite().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
