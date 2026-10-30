const puppeteer = require('puppeteer-core');
const assert = require('assert');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:5173';
const ARTIFACT_DIR = 'C:\\Users\\kirti\\.gemini\\antigravity\\brain\\3ac25ba8-43d2-4529-867b-c5d5adc7cb54';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const VIEWPORTS = [
  { width: 320, height: 640, name: 'Ultra-Compact Mobile (320x640)' },
  { width: 375, height: 667, name: 'Standard iPhone SE (375x667)' },
  { width: 390, height: 844, name: 'Modern iPhone 12/13/14 (390x844)' },
  { width: 768, height: 1024, name: 'Tablet Portrait (768x1024)' },
  { width: 1280, height: 800, name: 'Desktop Standard (1280x800)' }
];

async function run() {
  console.log('========================================================================');
  console.log('BLOCK BLITZ — LEVEL INTRO SCREEN (MISSION BRIEFING) AUDIT & VERIFICATION');
  console.log('========================================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  const pageErrors = [];
  page.on('pageerror', (err) => {
    pageErrors.push(err.message);
    console.error('  [Browser Uncaught Error]:', err.message);
  });

  try {
    for (const vp of VIEWPORTS) {
      console.log(`\n------------------------------------------------------------------------`);
      console.log(`>>> TESTING VIEWPORT: ${vp.name} <<<`);
      console.log(`------------------------------------------------------------------------`);

      await page.setViewport({ width: vp.width, height: vp.height });

      // Clear storage
      await page.goto(APP_URL, { waitUntil: 'networkidle0' });
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      await page.reload({ waitUntil: 'networkidle0' });
      await sleep(350);

      // Welcome -> Guest -> Level Map
      const playBtn = await page.$('.welcome-play-now-btn');
      if (playBtn) {
        await playBtn.click();
        await sleep(250);
        const guestBtn = await page.$('.guest-continue-btn');
        if (guestBtn) await guestBtn.click();
        await sleep(350);
      }

      // Launch Level 1 from Map dock to open Level Intro Modal
      const launchBtn = await page.$('.adventure-play-btn, .dock-action-button');
      assert.ok(launchBtn, 'Found level launch button on map');
      await launchBtn.click();
      await sleep(300);

      // Wait for Level Intro Modal
      await page.waitForSelector('.level-intro-card', { timeout: 5000 });
      await sleep(200);

      // 1. Inspect Metrics & Responsive Layout
      const introMetrics = await page.evaluate(() => {
        const doc = document.documentElement;
        const body = document.body;
        const card = document.querySelector('.level-intro-card');
        const chapterBadge = document.querySelector('.intro-chapter-badge');
        const stagePill = document.querySelector('.intro-stage-pill');
        const titleText = document.querySelector('.intro-title-text');
        const objPanel = document.querySelector('.intro-objective-panel');
        const objDesc = document.querySelector('.intro-obj-description');
        const rewardBadge = document.querySelector('.intro-reward-badge');
        const rewardAmount = document.querySelector('.intro-reward-amount');
        const startBtn = document.querySelector('.intro-start-btn');
        const btnLabel = document.querySelector('.intro-btn-label');

        const cardRect = card ? card.getBoundingClientRect() : null;
        const btnRect = startBtn ? startBtn.getBoundingClientRect() : null;

        return {
          scrollWidth: Math.max(doc.scrollWidth, body.scrollWidth),
          clientWidth: doc.clientWidth,
          hasHorizontalScroll: Math.max(doc.scrollWidth, body.scrollWidth) > doc.clientWidth,
          cardVisible: !!card,
          cardWidth: cardRect ? Math.round(cardRect.width) : 0,
          cardHeight: cardRect ? Math.round(cardRect.height) : 0,
          cardTop: cardRect ? Math.round(cardRect.top) : 0,
          cardBottom: cardRect ? Math.round(cardRect.bottom) : 0,
          windowHeight: window.innerHeight,
          fitsViewportHeight: cardRect ? cardRect.bottom <= window.innerHeight : false,

          chapterText: chapterBadge ? chapterBadge.textContent.trim() : '',
          stageText: stagePill ? stagePill.textContent.trim() : '',
          title: titleText ? titleText.textContent.trim() : '',
          objDescription: objDesc ? objDesc.textContent.trim() : '',
          rewardText: rewardAmount ? rewardAmount.textContent.trim() : '',
          btnText: btnLabel ? btnLabel.textContent.trim() : (startBtn ? startBtn.textContent.trim() : ''),
          btnHeight: btnRect ? Math.round(btnRect.height) : 0
        };
      });

      console.log(`  [Overflow Check] scrollWidth: ${introMetrics.scrollWidth}px, clientWidth: ${introMetrics.clientWidth}px`);
      assert.strictEqual(introMetrics.hasHorizontalScroll, false, `${vp.name}: Must have zero horizontal scroll`);
      console.log(`  ✓ Zero horizontal scroll at ${vp.width}px`);

      console.log(`  [Card Geometry] Size: ${introMetrics.cardWidth}x${introMetrics.cardHeight}px, Viewport Height: ${introMetrics.windowHeight}px`);
      assert.strictEqual(introMetrics.cardVisible, true, 'Intro card is visible');
      assert.ok(introMetrics.cardWidth <= vp.width, 'Card width fits viewport');
      assert.ok(introMetrics.cardHeight <= vp.height, 'Card height fits viewport without overflow');
      assert.strictEqual(introMetrics.fitsViewportHeight, true, 'Card fits within viewport bounds');
      console.log(`  ✓ Mission card fits comfortably within ${vp.width}x${vp.height} (Height: ${introMetrics.cardHeight}px / ${vp.height}px)`);

      // 2. Information Hierarchy Verification
      console.log(`  [Chapter Badge]: "${introMetrics.chapterText}"`);
      assert.ok(introMetrics.chapterText.includes('CH 1') || introMetrics.chapterText.includes('APPRENTICE'), 'Chapter badge rendered properly');

      console.log(`  [Stage Pill]: "${introMetrics.stageText}"`);
      assert.ok(introMetrics.stageText.includes('01') || introMetrics.stageText.includes('STAGE'), 'Stage pill rendered properly');

      console.log(`  [Title]: "${introMetrics.title}"`);
      assert.strictEqual(introMetrics.title, 'First Sparks', 'Level title rendered with high prominence');

      console.log(`  [Objective]: "${introMetrics.objDescription}"`);
      assert.ok(introMetrics.objDescription.length > 5, 'Objective description rendered in highlighted panel');

      console.log(`  [Reward]: "+${introMetrics.rewardText} PTS"`);
      assert.ok(introMetrics.rewardText.length > 0, 'Bonus reward badge rendered with points value');

      console.log(`  [CTA Button]: "${introMetrics.btnText}" (Height: ${introMetrics.btnHeight}px)`);
      assert.strictEqual(introMetrics.btnText, 'START LEVEL', 'Start button has correct arcade label');
      assert.ok(introMetrics.btnHeight >= 44, 'Start button meets touch target height (>= 44px)');
      console.log(`  ✓ All information hierarchy sections verified`);

      // 3. Capture high-res screenshot
      const shotName = `level_intro_${vp.width}x${vp.height}.png`;
      const shotPath = path.join(ARTIFACT_DIR, shotName);
      await page.screenshot({ path: shotPath });
      console.log(`  📸 Saved screenshot: ${shotName}`);

      // 4. Test START LEVEL button click advances into gameplay
      const startBtn = await page.$('.intro-start-btn');
      assert.ok(startBtn, 'Start button exists');
      await startBtn.click();
      await sleep(350);

      // Verify gameplay grid is now visible and intro modal is dismissed
      const gameReady = await page.evaluate(() => {
        const grid = document.querySelector('.grid-container');
        const intro = document.querySelector('.level-intro-card');
        return {
          gridMounted: !!grid,
          introDismissed: !intro
        };
      });

      assert.strictEqual(gameReady.gridMounted, true, 'Active game board mounted');
      assert.strictEqual(gameReady.introDismissed, true, 'Level intro modal dismissed after clicking START LEVEL');
      console.log(`  ✓ START LEVEL button transitions seamlessly into gameplay`);
    }

    // -------------------------------------------------------------------------
    // TEST BOSS LEVEL & TACTICAL HAZARDS (e.g. Level 10 Apprentice Pinnacle)
    // -------------------------------------------------------------------------
    console.log(`\n------------------------------------------------------------------------`);
    console.log(`>>> TESTING BOSS LEVEL & TACTICAL HAZARDS (STAGE 10) <<<`);
    console.log(`------------------------------------------------------------------------`);

    await page.setViewport({ width: 390, height: 844 });
    // Unlock up to level 10 to inspect boss briefing
    await page.evaluate(() => {
      localStorage.setItem('block_blitz_unlocked_level_guest', '10');
      localStorage.setItem('block_blitz_current_level_guest', '10');
    });
    await page.reload({ waitUntil: 'networkidle0' });
    await sleep(350);

    // Play -> Guest
    const playBtn = await page.$('.welcome-play-now-btn');
    if (playBtn) {
      await playBtn.click();
      await sleep(250);
      const guestBtn = await page.$('.guest-continue-btn');
      if (guestBtn) await guestBtn.click();
      await sleep(350);
    }

    // Launch Level 10
    const launchBtn = await page.$('.adventure-play-btn, .dock-action-button');
    if (launchBtn) await launchBtn.click();
    await sleep(300);

    await page.waitForSelector('.level-intro-card', { timeout: 5000 });
    await sleep(200);

    const bossMetrics = await page.evaluate(() => {
      const bossPill = document.querySelector('.intro-stage-boss');
      const bossCrown = document.querySelector('.intro-boss-crown');
      const hazardPill = document.querySelector('.intro-hazard-pill');
      const title = document.querySelector('.intro-title-text');
      const reward = document.querySelector('.intro-reward-amount');

      return {
        isBossPillPresent: !!bossPill,
        hasCrownIcon: !!bossCrown,
        bossPillText: bossPill ? bossPill.textContent.trim() : '',
        hazardText: hazardPill ? hazardPill.textContent.trim() : '',
        titleText: title ? title.textContent.trim() : '',
        rewardValue: reward ? reward.textContent.trim() : ''
      };
    });

    console.log(`  [Boss Title]: "${bossMetrics.titleText}"`);
    console.log(`  [Boss Badge]: "${bossMetrics.bossPillText}" (Crown Icon: ${bossMetrics.hasCrownIcon})`);
    console.log(`  [Hazard]: "${bossMetrics.hazardText}"`);
    console.log(`  [Boss Reward]: "+${bossMetrics.rewardValue} PTS"`);

    assert.strictEqual(bossMetrics.isBossPillPresent, true, 'Boss badge is rendered');
    assert.strictEqual(bossMetrics.hasCrownIcon, true, 'Boss crown icon is rendered');
    assert.ok(bossMetrics.hazardText.includes('SLASH'), 'Tactical hazard pill displays slash hazard');
    assert.strictEqual(bossMetrics.rewardValue, '1,800', 'Boss reward bonus is 1,800 PTS');
    console.log(`  ✓ Boss stage styling, crown icon, and hazard badges verified`);

    const bossShotPath = path.join(ARTIFACT_DIR, 'level_intro_boss_390x844.png');
    await page.screenshot({ path: bossShotPath });
    console.log(`  📸 Saved screenshot: level_intro_boss_390x844.png`);

    // Dismiss boss modal
    const startBossBtn = await page.$('.intro-start-btn');
    if (startBossBtn) await startBossBtn.click();
    await sleep(350);

    // -------------------------------------------------------------------------
    // TEST KEYBOARD SHORTCUT (ENTER KEY LAUNCH)
    // -------------------------------------------------------------------------
    console.log(`\n------------------------------------------------------------------------`);
    console.log(`>>> TESTING KEYBOARD SHORTCUT (ENTER TO LAUNCH) <<<`);
    console.log(`------------------------------------------------------------------------`);

    // Exit to map from header
    const exitBtn = await page.$('.action-btn.exit-btn');
    if (exitBtn) {
      await exitBtn.click();
      await sleep(200);
      const confirmExit = await page.$('.exit-btn-confirm');
      if (confirmExit) await confirmExit.click();
      await sleep(350);
    }

    // Launch level again from map
    const launchAgain = await page.$('.adventure-play-btn, .dock-action-button');
    if (launchAgain) await launchAgain.click();
    await sleep(300);

    await page.waitForSelector('.level-intro-card', { timeout: 5000 });
    console.log('  Pressing Enter key to start level...');
    await page.keyboard.press('Enter');
    await sleep(350);

    const keyboardGameReady = await page.evaluate(() => {
      const grid = document.querySelector('.grid-container');
      const intro = document.querySelector('.level-intro-card');
      return !intro && !!grid;
    });

    assert.strictEqual(keyboardGameReady, true, 'Enter key launches game instantly');
    console.log(`  ✓ Keyboard shortcut (Enter) verified`);

    assert.strictEqual(pageErrors.length, 0, `Zero uncaught browser errors (actual: ${pageErrors.length})`);

    console.log(`\n========================================================================`);
    console.log('ALL LEVEL INTRO MISSION BRIEFING AUDITS PASSED WITH 100% SUCCESS! ✓');
    console.log('========================================================================\n');

  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error('\n✗ Verification Failed:', err);
  process.exit(1);
});
