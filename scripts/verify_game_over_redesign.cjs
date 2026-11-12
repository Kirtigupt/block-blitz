const puppeteer = require('puppeteer-core');
const assert = require('assert');
const path = require('path');
const { createServer } = require('vite');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\kirti\\.gemini\\antigravity\\brain\\3ac25ba8-43d2-4529-867b-c5d5adc7cb54';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const VIEWPORTS = [
  { width: 320, height: 640, name: 'Small Mobile (320px)', suffix: '320x640' },
  { width: 375, height: 667, name: 'iPhone SE (375px)', suffix: '375x667' },
  { width: 390, height: 844, name: 'Modern Mobile (390px)', suffix: '390x844' },
  { width: 768, height: 1024, name: 'Tablet (768px)', suffix: '768x1024' },
  { width: 1280, height: 800, name: 'Desktop Laptop (1280px)', suffix: '1280x800' }
];

async function run() {
  console.log('========================================================================');
  console.log('BLOCK BLITZ — GAME OVER / LEVEL FAILED UI REDESIGN COMPREHENSIVE AUDIT');
  console.log('========================================================================\n');

  const vite = await createServer({
    server: { port: 5195, host: '127.0.0.1' },
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

  page.on('pageerror', (err) => {
    console.error('  [Browser Error]:', err.message);
  });

  try {
    // ------------------------------------------------------------------------
    // SECTION 1: VIEWPORT AUDIT (STANDARD FAILURE SCENARIO)
    // ------------------------------------------------------------------------
    for (const vp of VIEWPORTS) {
      console.log(`\n------------------------------------------------------------------------`);
      console.log(`>>> VIEWPORT AUDIT: ${vp.name} (${vp.width}x${vp.height}) <<<`);
      console.log(`------------------------------------------------------------------------`);

      await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 2 });
      await page.goto(APP_URL, { waitUntil: 'networkidle0' });

      // Clean storage and trigger Game Over on Stage 1
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      await page.reload({ waitUntil: 'networkidle0' });
      await sleep(300);

      await page.evaluate(() => {
        window.__triggerGameOverForTest(1, false);
      });
      await sleep(400);

      await page.waitForSelector('.level-failed-card.failed-portal-chassis', { timeout: 5000 });

      const metrics = await page.evaluate(() => {
        const doc = document.documentElement;
        const card = document.querySelector('.level-failed-card.failed-portal-chassis');
        const corners = document.querySelectorAll('.cyber-frame-corner');
        const beacon = document.querySelector('.telemetry-distress-beacon');
        const chTag = document.querySelector('.distress-telemetry-banner .telemetry-ch-tag');
        const sigil = document.querySelector('.failure-sigil-apparatus');
        const title = document.querySelector('.level-failed-title');
        const stageStrip = document.querySelector('.failed-stage-strip');
        const objTerminal = document.querySelector('.failed-objective-terminal');
        const objQuote = document.querySelector('.obj-directive-quote');
        const deficitBadge = document.querySelector('.obj-deficit-badge');
        const meterFill = document.querySelector('.failed-meter-fill');
        const scoreBox = document.querySelector('.hero-attempt-score-chassis');
        const scoreNum = document.querySelector('.final-score-number');
        const statsRibbon = document.querySelector('.telemetry-stats-ribbon');
        const retryBtn = document.querySelector('.play-again-btn.primary-retry-trigger');
        const mapBtn = document.querySelector('.game-over-map-btn.secondary-map-trigger');

        const cardRect = card ? card.getBoundingClientRect() : null;

        return {
          hasCard: !!card,
          cornerCount: corners.length,
          hasBeacon: !!beacon,
          chTagText: chTag ? chTag.textContent.trim() : '',
          hasSigil: !!sigil,
          titleText: title ? title.textContent.trim() : '',
          stageStripText: stageStrip ? stageStrip.textContent.trim() : '',
          hasObjTerminal: !!objTerminal,
          objQuoteText: objQuote ? objQuote.textContent.trim() : '',
          deficitText: deficitBadge ? deficitBadge.textContent.trim() : '',
          hasMeterFill: !!meterFill,
          hasScoreBox: !!scoreBox,
          scoreText: scoreNum ? scoreNum.textContent.trim() : '',
          hasStatsRibbon: !!statsRibbon,
          hasRetryBtn: !!retryBtn,
          retryBtnText: retryBtn ? retryBtn.textContent.trim() : '',
          hasMapBtn: !!mapBtn,
          mapBtnText: mapBtn ? mapBtn.textContent.trim() : '',
          cardWidth: cardRect ? cardRect.width : 0,
          cardHeight: cardRect ? cardRect.height : 0,
          hasHorizontalOverflow: doc.scrollWidth > doc.clientWidth
        };
      });

      console.log(`  Title: "${metrics.titleText}"`);
      console.log(`  Chapter: "${metrics.chTagText}"`);
      console.log(`  Stage: "${metrics.stageStripText}"`);
      console.log(`  Objective: "${metrics.objQuoteText}" [${metrics.deficitText}]`);
      console.log(`  Attempt Score: "${metrics.scoreText}"`);
      console.log(`  Retry Button: "${metrics.retryBtnText.slice(0, 35)}..."`);
      console.log(`  Map Button: "${metrics.mapBtnText}"`);
      console.log(`  Card Size: ${Math.round(metrics.cardWidth)}px x ${Math.round(metrics.cardHeight)}px`);
      console.log(`  Horizontal Overflow: ${metrics.hasHorizontalOverflow ? 'FAIL' : 'NONE (PASS)'}`);

      assert.strictEqual(metrics.hasCard, true, 'Failed portal chassis rendered');
      assert.strictEqual(metrics.cornerCount, 0, 'Clean modern chassis without harsh cyber corner brackets');
      assert.strictEqual(metrics.hasBeacon, true, 'Distress beacon present');
      assert.strictEqual(metrics.hasSigil, true, 'Failure sigil apparatus present');
      assert.strictEqual(metrics.titleText, 'LEVEL 1 FAILED', 'Title matches LEVEL 1 FAILED');
      assert.strictEqual(metrics.hasObjTerminal, true, 'Tactical objective terminal present');
      assert.ok(metrics.deficitText.length > 0, 'Deficit badge present');
      assert.strictEqual(metrics.hasScoreBox, true, 'Hero attempt score chassis present');
      assert.strictEqual(metrics.hasStatsRibbon, true, 'Telemetry statistics ribbon present');
      assert.strictEqual(metrics.hasRetryBtn, true, 'Primary retry trigger present');
      assert.strictEqual(metrics.hasMapBtn, true, 'Secondary map trigger present');
      assert.strictEqual(metrics.hasHorizontalOverflow, false, 'Zero horizontal overflow');

      console.log(`  ✓ All UI assertions passed for ${vp.name}`);

      // Capture screenshots for mobile and desktop
      if (vp.suffix === '390x844') {
        const shotPath = path.join(ARTIFACT_DIR, 'level_failed_redesign_mobile_390x844.png');
        await page.screenshot({ path: shotPath });
        console.log(`  📸 Saved showcase screenshot: level_failed_redesign_mobile_390x844.png`);
      } else if (vp.suffix === '1280x800') {
        const shotPath = path.join(ARTIFACT_DIR, 'level_failed_redesign_desktop_1280x800.png');
        await page.screenshot({ path: shotPath });
        console.log(`  📸 Saved showcase screenshot: level_failed_redesign_desktop_1280x800.png`);
      }
    }

    // ------------------------------------------------------------------------
    // SECTION 2: CELEBRATORY PERSONAL RECORD ACHIEVEMENT SCENARIO
    // ------------------------------------------------------------------------
    console.log(`\n------------------------------------------------------------------------`);
    console.log(`>>> TESTING CELEBRATORY PERSONAL RECORD ACHIEVEMENT (STAGE 5) <<<`);
    console.log(`------------------------------------------------------------------------`);

    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
    await page.evaluate(() => {
      window.__triggerGameOverForTest(5, true);
    });
    await sleep(400);

    const recordMetrics = await page.evaluate(() => {
      const recordTrophy = document.querySelector('.personal-record-celebration-trophy');
      const heroText = document.querySelector('.record-hero-text')?.textContent.trim();
      const subText = document.querySelector('.record-sub-text')?.textContent.trim();
      const score = document.querySelector('.final-score-number')?.textContent.trim();
      return {
        hasRecordTrophy: !!recordTrophy,
        heroText,
        subText,
        score
      };
    });

    console.log(`  Celebratory Trophy Present: ${recordMetrics.hasRecordTrophy}`);
    console.log(`  Record Hero Text: "${recordMetrics.heroText}"`);
    console.log(`  Record Sub Text: "${recordMetrics.subText}"`);
    assert.strictEqual(recordMetrics.hasRecordTrophy, true, 'Celebratory personal record trophy rendered');
    assert.strictEqual(recordMetrics.heroText, 'NEW ALL-TIME PERSONAL RECORD!', 'Hero record text verified');

    const recordShotPath = path.join(ARTIFACT_DIR, 'level_failed_new_record_mobile_390x844.png');
    await page.screenshot({ path: recordShotPath });
    console.log(`  📸 Saved personal record screenshot: level_failed_new_record_mobile_390x844.png`);

    // ------------------------------------------------------------------------
    // SECTION 3: INTERACTIVE FLOW VERIFICATION (RETRY & LEVEL MAP BUTTONS)
    // ------------------------------------------------------------------------
    console.log(`\n------------------------------------------------------------------------`);
    console.log(`>>> TESTING INTERACTION: RETRY LEVEL & RETURN TO LEVEL MAP <<<`);
    console.log(`------------------------------------------------------------------------`);

    // Test 1: Clicking Retry Level
    console.log('\n[Interaction 1]: Clicking RETRY LEVEL...');
    await page.click('.primary-retry-trigger');
    await sleep(400);

    const retryState = await page.evaluate(() => {
      const modal = document.querySelector('.level-failed-card');
      const grid = document.querySelector('.grid-container');
      const tray = document.querySelector('.block-tray');
      return {
        modalDismissed: !modal,
        gridActive: !!grid,
        trayActive: !!tray
      };
    });

    console.log(`  Modal Dismissed: ${retryState.modalDismissed}`);
    console.log(`  Grid Active: ${retryState.gridActive}`);
    console.log(`  Tray Active: ${retryState.trayActive}`);
    assert.strictEqual(retryState.modalDismissed, true, 'Game Over modal dismissed on retry');
    assert.strictEqual(retryState.gridActive, true, 'Game grid active and ready for play');
    console.log(`  ✓ Retry level interaction verified successfully`);

    // Test 2: Triggering Game Over again, then clicking LEVEL MAP
    console.log('\n[Interaction 2]: Triggering Game Over and clicking LEVEL MAP...');
    await page.evaluate(() => {
      window.__triggerGameOverForTest(2, false);
    });
    await sleep(400);

    await page.waitForSelector('.secondary-map-trigger', { timeout: 5000 });
    await page.click('.secondary-map-trigger');
    await sleep(500);

    const mapState = await page.evaluate(() => {
      const modal = document.querySelector('.level-failed-card');
      const map = document.querySelector('.campaign-map-screen') || document.querySelector('.adventure-map-screen');
      return {
        modalDismissed: !modal,
        mapActive: !!map
      };
    });

    console.log(`  Modal Dismissed: ${mapState.modalDismissed}`);
    console.log(`  Map Active: ${mapState.mapActive}`);
    assert.strictEqual(mapState.modalDismissed, true, 'Game Over modal dismissed on Level Map click');
    assert.strictEqual(mapState.mapActive, true, 'Adventure Map mounted cleanly');
    console.log(`  ✓ Return to Level Map interaction verified successfully`);

    console.log('\n========================================================================');
    console.log('ALL GAME OVER / LEVEL FAILED AUDITS PASSED WITH 100% SUCCESS! ✓');
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
