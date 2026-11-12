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
  console.log('BLOCK BLITZ — LEVEL COMPLETION UI REDESIGN COMPREHENSIVE VERIFICATION');
  console.log('========================================================================\n');

  const vite = await createServer({
    server: { port: 5194, host: '127.0.0.1' },
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
    for (const vp of VIEWPORTS) {
      console.log(`\n------------------------------------------------------------------------`);
      console.log(`>>> VIEWPORT AUDIT: ${vp.name} (${vp.width}x${vp.height}) <<<`);
      console.log(`------------------------------------------------------------------------`);

      await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 2 });
      await page.goto(APP_URL, { waitUntil: 'networkidle0' });

      // Clean session and trigger Stage 1 complete
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      await page.reload({ waitUntil: 'networkidle0' });
      await sleep(300);

      await page.evaluate(() => {
        window.__triggerLevelCompleteForTest(1);
      });
      await sleep(400);

      await page.waitForSelector('.level-complete-card.achievement-portal-card', { timeout: 5000 });

      const auditMetrics = await page.evaluate(() => {
        const doc = document.documentElement;
        const card = document.querySelector('.level-complete-card.achievement-portal-card');
        const corners = document.querySelectorAll('.cyber-frame-corner');
        const beacon = document.querySelector('.telemetry-live-beacon');
        const crest = document.querySelector('.victory-crest-apparatus');
        const stars = document.querySelectorAll('.victory-star-slot');
        const gradeRibbon = document.querySelector('.triumph-grade-ribbon');
        const title = document.querySelector('.level-complete-title');
        const stageStrip = document.querySelector('.stage-identity-strip');
        const objCard = document.querySelector('.holographic-objective-card');
        const objQuote = document.querySelector('.obj-quote-label');
        const objBadge = document.querySelector('.obj-status-badge');
        const hub = document.querySelector('.rewards-performance-hub');
        const bonusChamber = document.querySelector('.reward-vault-chamber.bonus-chamber');
        const scoreChamber = document.querySelector('.reward-vault-chamber.score-chamber');
        const bonusVal = document.querySelector('.bonus-val');
        const scoreVal = document.querySelector('.total-val');
        const telemetryRibbon = document.querySelector('.performance-telemetry-ribbon');
        const triggerBtn = document.querySelector('.complete-continue-btn.command-leaderboard-trigger');
        const quickMapBtn = document.querySelector('.quick-map-direct-btn');

        const cardRect = card ? card.getBoundingClientRect() : null;

        return {
          hasCard: !!card,
          cornerCount: corners.length,
          hasBeacon: !!beacon,
          hasCrest: !!crest,
          starCount: stars.length,
          hasGradeRibbon: !!gradeRibbon,
          gradeText: gradeRibbon ? gradeRibbon.textContent.trim() : '',
          titleText: title ? title.textContent.trim() : '',
          stageText: stageStrip ? stageStrip.textContent.trim() : '',
          hasObjCard: !!objCard,
          objQuoteText: objQuote ? objQuote.textContent.trim() : '',
          objBadgeText: objBadge ? objBadge.textContent.trim() : '',
          hasRewardsHub: !!hub,
          hasBonusChamber: !!bonusChamber,
          hasScoreChamber: !!scoreChamber,
          bonusText: bonusVal ? bonusVal.textContent.trim() : '',
          scoreText: scoreVal ? scoreVal.textContent.trim() : '',
          hasTelemetryRibbon: !!telemetryRibbon,
          hasTriggerBtn: !!triggerBtn,
          triggerBtnText: triggerBtn ? triggerBtn.textContent.trim() : '',
          hasQuickMapBtn: !!quickMapBtn,
          cardWidth: cardRect ? cardRect.width : 0,
          cardHeight: cardRect ? cardRect.height : 0,
          hasHorizontalOverflow: doc.scrollWidth > doc.clientWidth
        };
      });

      console.log(`  Title: "${auditMetrics.titleText}"`);
      console.log(`  Stage Info: "${auditMetrics.stageText}"`);
      console.log(`  Achievement Stars: ${auditMetrics.starCount} nodes mounted`);
      console.log(`  Grade Ribbon: "${auditMetrics.gradeText}"`);
      console.log(`  Objective: "${auditMetrics.objQuoteText}" [${auditMetrics.objBadgeText}]`);
      console.log(`  Chambers: Bonus "${auditMetrics.bonusText}", Score "${auditMetrics.scoreText}"`);
      console.log(`  Trigger Button: "${auditMetrics.triggerBtnText.slice(0, 40)}..."`);
      console.log(`  Card Dimensions: ${Math.round(auditMetrics.cardWidth)}px x ${Math.round(auditMetrics.cardHeight)}px`);
      console.log(`  Horizontal Overflow: ${auditMetrics.hasHorizontalOverflow ? 'FAIL' : 'NONE (PASS)'}`);

      assert.strictEqual(auditMetrics.hasCard, true, 'Achievement portal card rendered');
      assert.strictEqual(auditMetrics.cornerCount, 0, 'Clean modern chassis without harsh cyber corner brackets');
      assert.strictEqual(auditMetrics.hasBeacon, true, 'Telemetry live beacon present');
      assert.strictEqual(auditMetrics.hasCrest, true, 'Victory crest apparatus present');
      assert.strictEqual(auditMetrics.starCount, 3, '3 constellation star nodes rendered');
      assert.strictEqual(auditMetrics.hasGradeRibbon, true, 'Tri-star grade ribbon present');
      assert.strictEqual(auditMetrics.titleText, 'LEVEL COMPLETED!', 'Title matches LEVEL COMPLETED!');
      assert.strictEqual(auditMetrics.hasObjCard, true, 'Holographic objective card present');
      assert.ok(auditMetrics.objBadgeText.includes('100% COMPLETE'), 'Objective status 100% complete');
      assert.strictEqual(auditMetrics.hasRewardsHub, true, 'Dual rewards performance hub present');
      assert.strictEqual(auditMetrics.hasBonusChamber, true, 'Bonus chamber present');
      assert.strictEqual(auditMetrics.hasScoreChamber, true, 'Score chamber present');
      assert.strictEqual(auditMetrics.hasTriggerBtn, true, '3D Leaderboard trigger button present');
      assert.ok(auditMetrics.triggerBtnText.includes('VIEW LEADERBOARD'), 'Trigger button has VIEW LEADERBOARD');
      assert.strictEqual(auditMetrics.hasHorizontalOverflow, false, 'Zero horizontal overflow on viewport');

      console.log(`  ✓ All UI assertions passed for ${vp.name}`);

      // Save screenshot for 390x844 and 1280x800
      if (vp.suffix === '390x844') {
        const shotPath = path.join(ARTIFACT_DIR, 'level_complete_redesign_mobile_390x844.png');
        await page.screenshot({ path: shotPath });
        console.log(`  📸 Saved showcase screenshot: level_complete_redesign_mobile_390x844.png`);
      } else if (vp.suffix === '1280x800') {
        const shotPath = path.join(ARTIFACT_DIR, 'level_complete_redesign_desktop_1280x800.png');
        await page.screenshot({ path: shotPath });
        console.log(`  📸 Saved showcase screenshot: level_complete_redesign_desktop_1280x800.png`);
      }
    }

    // ------------------------------------------------------------------------
    // THEMATIC MILESTONES: BOSS STAGE 10 & ZENITH STAGE 100
    // ------------------------------------------------------------------------
    console.log(`\n------------------------------------------------------------------------`);
    console.log(`>>> TESTING BOSS MILESTONE (STAGE 10) & CAMPAIGN FINALE (STAGE 100) <<<`);
    console.log(`------------------------------------------------------------------------`);

    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });

    // Boss Stage 10
    console.log('\n[Boss Stage 10]:');
    await page.evaluate(() => {
      window.__triggerLevelCompleteForTest(10);
    });
    await sleep(400);

    const bossMetrics = await page.evaluate(() => {
      const bossCore = document.querySelector('.victory-core-prism.boss-slayer-core');
      const stageText = document.querySelector('.stage-identity-strip')?.textContent.trim();
      const titleText = document.querySelector('.level-complete-title')?.textContent.trim();
      return {
        hasBossCore: !!bossCore,
        stageText,
        titleText
      };
    });

    console.log(`  Boss Core Present: ${bossMetrics.hasBossCore}`);
    console.log(`  Stage: "${bossMetrics.stageText}"`);
    assert.strictEqual(bossMetrics.hasBossCore, true, 'Boss slayer core prism rendered on Stage 10');
    const bossShotPath = path.join(ARTIFACT_DIR, 'level_complete_boss_stage10_390x844.png');
    await page.screenshot({ path: bossShotPath });
    console.log(`  📸 Saved boss screenshot: level_complete_boss_stage10_390x844.png`);

    // Campaign Zenith Stage 100
    console.log('\n[Campaign Zenith Finale Stage 100]:');
    await page.evaluate(() => {
      window.__triggerLevelCompleteForTest(100);
    });
    await sleep(400);

    const zenithMetrics = await page.evaluate(() => {
      const zenithCore = document.querySelector('.victory-core-prism.campaign-zenith-core');
      const titleText = document.querySelector('.level-complete-title')?.textContent.trim();
      const crownIcon = document.querySelector('.crown-glow');
      return {
        hasZenithCore: !!zenithCore,
        titleText,
        hasCrownIcon: !!crownIcon
      };
    });

    console.log(`  Zenith Core Present: ${zenithMetrics.hasZenithCore}`);
    console.log(`  Title: "${zenithMetrics.titleText}"`);
    console.log(`  Crown Icon Present: ${zenithMetrics.hasCrownIcon}`);
    assert.strictEqual(zenithMetrics.hasZenithCore, true, 'Campaign zenith core prism rendered on Stage 100');
    assert.strictEqual(zenithMetrics.titleText, 'Level 100 Cleared! Zenith Master!', 'Stage 100 champion title rendered');
    assert.strictEqual(zenithMetrics.hasCrownIcon, true, 'Imperial golden crown rendered');

    const zenithShotPath = path.join(ARTIFACT_DIR, 'level_complete_zenith_stage100_390x844.png');
    await page.screenshot({ path: zenithShotPath });
    console.log(`  📸 Saved campaign finale screenshot: level_complete_zenith_stage100_390x844.png`);

    console.log('\n========================================================================');
    console.log('ALL LEVEL COMPLETION REDESIGN AUDITS PASSED WITH 100% SUCCESS! ✓');
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
