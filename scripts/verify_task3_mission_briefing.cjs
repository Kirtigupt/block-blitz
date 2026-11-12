const puppeteer = require('puppeteer-core');
const assert = require('assert');
const path = require('path');
const { createServer } = require('vite');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\kirti\\.gemini\\antigravity\\brain\\3ac25ba8-43d2-4529-867b-c5d5adc7cb54';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const VIEWPORTS = [
  { width: 320, height: 640, name: 'Small Mobile (320x640)' },
  { width: 360, height: 800, name: 'Compact Android (360x800)' },
  { width: 375, height: 667, name: 'iPhone SE (375x667)' },
  { width: 390, height: 844, name: 'Modern iPhone (390x844)' },
  { width: 430, height: 932, name: 'Large iPhone Pro Max (430x932)' },
  { width: 768, height: 1024, name: 'Tablet Portrait (768x1024)' },
  { width: 1280, height: 800, name: 'Desktop Laptop (1280x800)' }
];

async function run() {
  console.log('========================================================================');
  console.log('BLOCK BLITZ — TASK 3: MISSION BRIEFING UI/UX AUDIT & VERIFICATION');
  console.log('========================================================================\n');

  const vite = await createServer({
    server: { port: 5193, host: '127.0.0.1' },
    logLevel: 'error'
  });
  await vite.listen();
  const APP_URL = `http://127.0.0.1:${vite.httpServer.address().port}`;

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
    // -------------------------------------------------------------------------
    // 1. TEST ALL 7 VIEWPORTS FOR STAGE 1
    // -------------------------------------------------------------------------
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
      await sleep(300);

      // Welcome -> Guest -> Level Map
      const playBtn = await page.$('.welcome-play-now-btn');
      if (playBtn) {
        await playBtn.click();
        await sleep(200);
        const guestBtn = await page.$('.guest-continue-btn');
        if (guestBtn) await guestBtn.click();
        await sleep(300);
      }

      // Launch Level 1 from Map dock to open Level Intro Modal
      const launchBtn = await page.$('.adventure-play-btn, .dock-action-button');
      assert.ok(launchBtn, 'Found level launch button on map');
      await launchBtn.click();
      await sleep(250);

      // Wait for Level Intro Modal
      await page.waitForSelector('.level-intro-card', { timeout: 5000 });
      await sleep(150);

      const metrics = await page.evaluate(() => {
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
        const mapBtn = document.querySelector('.intro-map-btn');
        const closeBtn = document.querySelector('.intro-close-icon-btn');
        const infoRibbon = document.querySelector('.intro-info-ribbon');

        const cardRect = card ? card.getBoundingClientRect() : null;
        const startRect = startBtn ? startBtn.getBoundingClientRect() : null;
        const mapRect = mapBtn ? mapBtn.getBoundingClientRect() : null;

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
          fitsViewportHeight: cardRect ? cardRect.bottom <= window.innerHeight + 1 : false,

          chapterText: chapterBadge ? chapterBadge.textContent.trim() : '',
          stageText: stagePill ? stagePill.textContent.trim() : '',
          title: titleText ? titleText.textContent.trim() : '',
          objDescription: objDesc ? objDesc.textContent.trim() : '',
          rewardText: rewardAmount ? rewardAmount.textContent.trim() : '',
          btnText: btnLabel ? btnLabel.textContent.trim() : (startBtn ? startBtn.textContent.trim() : ''),
          mapBtnText: mapBtn ? mapBtn.textContent.trim() : '',
          hasCloseBtn: !!closeBtn,
          hasInfoRibbon: !!infoRibbon,
          startBtnHeight: startRect ? Math.round(startRect.height) : 0,
          mapBtnHeight: mapRect ? Math.round(mapRect.height) : 0
        };
      });

      console.log(`  [Overflow Check] scrollWidth: ${metrics.scrollWidth}px, clientWidth: ${metrics.clientWidth}px`);
      assert.strictEqual(metrics.hasHorizontalScroll, false, `${vp.name}: Must have zero horizontal scroll`);
      console.log(`  ✓ Zero horizontal scroll at ${vp.width}px`);

      console.log(`  [Card Geometry] Size: ${metrics.cardWidth}x${metrics.cardHeight}px, Viewport Height: ${metrics.windowHeight}px`);
      assert.strictEqual(metrics.cardVisible, true, 'Intro card is visible');
      assert.ok(metrics.cardWidth <= vp.width, 'Card width fits viewport');
      assert.ok(metrics.cardHeight <= vp.height, 'Card height fits viewport without overflow');
      assert.strictEqual(metrics.fitsViewportHeight, true, 'Card fits within viewport bounds');

      console.log(`  [Header] Chapter: "${metrics.chapterText}", Stage: "${metrics.stageText}", Title: "${metrics.title}"`);
      assert.ok(metrics.chapterText.includes('CH 1') || metrics.chapterText.includes('Apprentice'), 'Chapter badge rendered');
      assert.ok(metrics.stageText.includes('01') || metrics.stageText.includes('Stage'), 'Stage pill rendered');
      assert.strictEqual(metrics.title, 'First Sparks', 'Level title rendered');

      console.log(`  [Objective & Reward] "${metrics.objDescription}" | Reward: +${metrics.rewardText} PTS`);
      assert.ok(metrics.objDescription.length > 5, 'Objective description rendered');
      assert.ok(metrics.rewardText.length > 0, 'Reward points rendered');
      assert.strictEqual(metrics.hasInfoRibbon, true, 'Telemetry info ribbon rendered');

      console.log(`  [Actions] Start: "${metrics.btnText}" (${metrics.startBtnHeight}px), Map: "${metrics.mapBtnText}" (${metrics.mapBtnHeight}px), CloseBtn: ${metrics.hasCloseBtn}`);
      assert.ok(metrics.btnText.includes('START'), 'Start button rendered');
      assert.ok(metrics.mapBtnText.includes('MAP'), 'Back to Map button rendered');
      assert.strictEqual(metrics.hasCloseBtn, true, 'Close X button rendered');
      assert.ok(metrics.startBtnHeight >= 42, 'Start button meets touch target height');
      assert.ok(metrics.mapBtnHeight >= 36, 'Back to Map button meets touch target height');

      // Save screenshot for 320x640, 390x844, 1280x800
      if ([320, 390, 1280].includes(vp.width)) {
        const shotName = `level_intro_${vp.width}x${vp.height}.png`;
        const shotPath = path.join(ARTIFACT_DIR, shotName);
        await page.screenshot({ path: shotPath });
        console.log(`  📸 Saved screenshot: ${shotName}`);
      }

      // Close modal to reset for next viewport
      const mapBtn = await page.$('.intro-map-btn');
      if (mapBtn) {
        await mapBtn.click();
        await sleep(200);
      }
    }

    // -------------------------------------------------------------------------
    // 2. TEST TACTICAL GRID HAZARDS & DIFFERENT OBJECTIVES (STAGE 5: Crossroads)
    // -------------------------------------------------------------------------
    console.log(`\n------------------------------------------------------------------------`);
    console.log(`>>> TESTING TACTICAL HAZARDS & OBJECTIVES (STAGE 5: CROSSROADS) <<<`);
    console.log(`------------------------------------------------------------------------`);

    await page.setViewport({ width: 390, height: 844 });
    await page.evaluate(() => {
      localStorage.setItem('block_blitz_unlocked_level_guest', '10');
      localStorage.setItem('block_blitz_current_level_guest', '5');
    });
    await page.reload({ waitUntil: 'networkidle0' });
    await sleep(300);

    // Welcome -> Guest -> Level Map
    const playBtn = await page.$('.welcome-play-now-btn');
    if (playBtn) {
      await playBtn.click();
      await sleep(200);
      const guestBtn = await page.$('.guest-continue-btn');
      if (guestBtn) await guestBtn.click();
      await sleep(300);
    }

    // Click Level 5 stone on map
    const stage5Stone = await page.$('.map-level-stone[data-level="5"], .level-node-5, [data-level="5"]');
    if (stage5Stone) {
      await stage5Stone.click();
      await sleep(250);
    }
    const launchStage5Btn = await page.$('.adventure-play-btn, .dock-action-button');
    if (launchStage5Btn) {
      await launchStage5Btn.click();
      await sleep(250);
    }

    await page.waitForSelector('.level-intro-card', { timeout: 5000 });
    const stage5Metrics = await page.evaluate(() => {
      const title = document.querySelector('.intro-title-text');
      const stagePill = document.querySelector('.intro-stage-pill');
      const hazard = document.querySelector('.intro-hazard-pill');
      const target = document.querySelector('.target-pill-val');
      const reward = document.querySelector('.intro-reward-amount');

      return {
        title: title ? title.textContent.trim() : '',
        stage: stagePill ? stagePill.textContent.trim() : '',
        hazard: hazard ? hazard.textContent.trim() : '',
        target: target ? target.textContent.trim() : '',
        reward: reward ? reward.textContent.trim() : ''
      };
    });

    console.log(`  [Stage 5 Title]: "${stage5Metrics.title}"`);
    console.log(`  [Stage 5 Stage]: "${stage5Metrics.stage}"`);
    console.log(`  [Stage 5 Hazard]: "${stage5Metrics.hazard}"`);
    console.log(`  [Stage 5 Target]: "${stage5Metrics.target}"`);
    console.log(`  [Stage 5 Reward]: "+${stage5Metrics.reward} PTS"`);

    assert.strictEqual(stage5Metrics.title, 'Crossroads', 'Stage 5 title rendered');
    assert.ok(stage5Metrics.stage.includes('05'), 'Stage 05 pill rendered');
    assert.ok(stage5Metrics.hazard.toUpperCase().includes('CROSS'), 'Hazard badge shows CROSS obstacle');
    assert.strictEqual(stage5Metrics.target, '4 LINES', 'Target shows 4 LINES');
    assert.strictEqual(stage5Metrics.reward, '750', 'Bonus reward shows 750 PTS');
    console.log(`  ✓ Stage 5 tactical hazard & line clearing objective verified`);

    const s5ShotPath = path.join(ARTIFACT_DIR, 'level_intro_stage5_hazard_390x844.png');
    await page.screenshot({ path: s5ShotPath });
    console.log(`  📸 Saved screenshot: level_intro_stage5_hazard_390x844.png`);

    // -------------------------------------------------------------------------
    // 3. TEST BOSS LEVEL BRIEFING (STAGE 10: Apprentice Pinnacle)
    // -------------------------------------------------------------------------
    console.log(`\n------------------------------------------------------------------------`);
    console.log(`>>> TESTING BOSS LEVEL BRIEFING (STAGE 10: APPRENTICE PINNACLE) <<<`);
    console.log(`------------------------------------------------------------------------`);

    // Close Stage 5 briefing via Close button
    const closeBtn = await page.$('.intro-close-icon-btn');
    if (closeBtn) {
      await closeBtn.click();
      await sleep(250);
    }

    // Select Level 10
    const stage10Stone = await page.$('[data-level="10"]');
    if (stage10Stone) {
      await stage10Stone.click();
      await sleep(250);
    }
    const launchStage10Btn = await page.$('.adventure-play-btn, .dock-action-button');
    if (launchStage10Btn) {
      await launchStage10Btn.click();
      await sleep(250);
    }

    await page.waitForSelector('.level-intro-card', { timeout: 5000 });
    const bossMetrics = await page.evaluate(() => {
      const bossPill = document.querySelector('.intro-stage-boss');
      const bossCrown = document.querySelector('.intro-boss-crown');
      const hazardPill = document.querySelector('.intro-hazard-pill');
      const title = document.querySelector('.intro-title-text');
      const reward = document.querySelector('.intro-reward-amount');
      const card = document.querySelector('.level-intro-card');

      return {
        isBossCard: card ? card.classList.contains('intro-card-boss') : false,
        isBossPillPresent: !!bossPill,
        hasCrownIcon: !!bossCrown,
        bossPillText: bossPill ? bossPill.textContent.trim() : '',
        hazardText: hazardPill ? hazardPill.textContent.trim() : '',
        titleText: title ? title.textContent.trim() : '',
        rewardValue: reward ? reward.textContent.trim() : ''
      };
    });

    console.log(`  [Boss Title]: "${bossMetrics.titleText}"`);
    console.log(`  [Boss Badge]: "${bossMetrics.bossPillText}" (Crown: ${bossMetrics.hasCrownIcon})`);
    console.log(`  [Boss Hazard]: "${bossMetrics.hazardText}"`);
    console.log(`  [Boss Reward]: "+${bossMetrics.rewardValue} PTS"`);

    assert.strictEqual(bossMetrics.isBossCard, true, 'Boss card has boss styling');
    assert.strictEqual(bossMetrics.isBossPillPresent, true, 'Boss badge rendered');
    assert.strictEqual(bossMetrics.hasCrownIcon, true, 'Boss crown icon rendered');
    assert.ok(bossMetrics.hazardText.toUpperCase().includes('SLASH'), 'Slash hazard badge rendered');
    assert.strictEqual(bossMetrics.rewardValue, '1,800', 'Boss reward is 1,800 PTS');
    console.log(`  ✓ Boss stage styling, crown icon, and hazard badges verified`);

    const bossShotPath = path.join(ARTIFACT_DIR, 'level_intro_stage10_boss_390x844.png');
    await page.screenshot({ path: bossShotPath });
    console.log(`  📸 Saved screenshot: level_intro_stage10_boss_390x844.png`);

    // -------------------------------------------------------------------------
    // 4. TEST INTERACTIONS: START MISSION & BACK TO MAP & KEYBOARD SHORTCUTS
    // -------------------------------------------------------------------------
    console.log(`\n------------------------------------------------------------------------`);
    console.log(`>>> TESTING INTERACTIONS: START MISSION, BACK TO MAP & KEYBOARD <<<`);
    console.log(`------------------------------------------------------------------------`);

    // [Test 4A]: BACK TO MAP button returns cleanly to Adventure Map
    console.log('  Testing Back to Map button...');
    const backToMapBtn = await page.$('.intro-map-btn');
    assert.ok(backToMapBtn, 'Back to Map button exists');
    await backToMapBtn.click();
    await sleep(300);

    const mapState = await page.evaluate(() => {
      const intro = document.querySelector('.level-intro-card');
      const map = document.querySelector('.campaign-map-screen, .adventure-map-screen, .adventure-bottom-dock');
      return {
        introDismissed: !intro,
        mapActive: !!map
      };
    });
    assert.strictEqual(mapState.introDismissed, true, 'Intro modal dismissed after clicking Back to Map');
    assert.strictEqual(mapState.mapActive, true, 'Adventure Map remains active and interactive');
    console.log('  ✓ Back to Map button verified');

    // [Test 4B]: Escape key closes modal and returns to map
    console.log('  Testing Escape key dismiss...');
    const reLaunchBtn = await page.$('.adventure-play-btn, .dock-action-button');
    if (reLaunchBtn) await reLaunchBtn.click();
    await sleep(250);
    await page.waitForSelector('.level-intro-card', { timeout: 5000 });

    await page.keyboard.press('Escape');
    await sleep(300);

    const escState = await page.evaluate(() => {
      const intro = document.querySelector('.level-intro-card');
      return !intro;
    });
    assert.strictEqual(escState, true, 'Escape key dismisses intro modal');
    console.log('  ✓ Escape key shortcut verified');

    // [Test 4C]: START MISSION button launches gameplay
    console.log('  Testing START MISSION button click...');
    const reLaunchForStart = await page.$('.adventure-play-btn, .dock-action-button');
    if (reLaunchForStart) await reLaunchForStart.click();
    await sleep(250);
    await page.waitForSelector('.level-intro-card', { timeout: 5000 });

    const startBtn = await page.$('.intro-start-btn');
    assert.ok(startBtn, 'Start button exists');
    await startBtn.click();
    await sleep(400);

    const gameState = await page.evaluate(() => {
      const intro = document.querySelector('.level-intro-card');
      const grid = document.querySelector('.grid-container');
      const tray = document.querySelector('.block-tray');
      return {
        introDismissed: !intro,
        gridActive: !!grid,
        trayActive: !!tray
      };
    });
    assert.strictEqual(gameState.introDismissed, true, 'Intro modal dismissed');
    assert.strictEqual(gameState.gridActive, true, 'Gameplay grid mounted');
    assert.strictEqual(gameState.trayActive, true, 'Block tray mounted');
    console.log('  ✓ START MISSION button successfully launches gameplay');

    assert.strictEqual(pageErrors.length, 0, `Zero uncaught browser errors (actual: ${pageErrors.length})`);

    console.log(`\n========================================================================`);
    console.log('ALL TASK 3 MISSION BRIEFING AUDITS PASSED WITH 100% SUCCESS! ✓');
    console.log('========================================================================\n');

  } finally {
    await browser.close();
    await vite.close();
  }
}

run().catch((err) => {
  console.error('\n✗ Verification Failed:', err);
  process.exit(1);
});
