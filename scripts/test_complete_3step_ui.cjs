const puppeteer = require('puppeteer-core');
const assert = require('assert');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:5173';
const ARTIFACT_DIR = 'C:\\Users\\kirti\\.gemini\\antigravity\\brain\\3ac25ba8-43d2-4529-867b-c5d5adc7cb54';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  console.log('========================================================================');
  console.log('BLOCK BLITZ — FULL 3-STEP LEVEL COMPLETION & LEADERBOARD UI AUDIT');
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
    for (const testVp of [
      { width: 390, height: 844, name: 'Mobile (390x844)', suffix: '390x844' },
      { width: 1280, height: 800, name: 'Desktop (1280x800)', suffix: '1280x800' }
    ]) {
      console.log(`\n------------------------------------------------------------------------`);
      console.log(`>>> TESTING 3-STEP COMPLETION FLOW ON ${testVp.name} <<<`);
      console.log(`------------------------------------------------------------------------`);

      await page.setViewport({ width: testVp.width, height: testVp.height });
      await page.goto(APP_URL, { waitUntil: 'networkidle0' });

      // Register or login a test user so we have authentic data
      const ts = Date.now();
      const testUser = `blitz_master_${ts.toString().slice(-4)}`;
      await page.evaluate(async (uname) => {
        localStorage.clear();
        sessionStorage.clear();
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
      }, testUser);

      await page.reload({ waitUntil: 'networkidle0' });
      await sleep(350);

      // Welcome -> Level Map -> Start Level 1
      await page.click('.welcome-play-now-btn');
      await sleep(300);
      await page.click('.adventure-play-btn, .dock-action-button');
      await sleep(300);
      const introStart = await page.$('.intro-start-btn');
      if (introStart) await introStart.click();
      await sleep(400);

      // -----------------------------------------------------------------------
      // STEP 1: LEVEL COMPLETED SCREEN
      // -----------------------------------------------------------------------
      console.log('\n[STEP 1] Level Completed Screen:');
      await page.evaluate(() => {
        window.__triggerLevelCompleteForTest(1);
      });
      await sleep(350);

      await page.waitForSelector('.level-complete-card', { timeout: 5000 });
      const step1Metrics = await page.evaluate(() => {
        const title = document.querySelector('.level-complete-title');
        const stars = document.querySelectorAll('.victory-star-slot');
        const bonus = document.querySelector('.bonus-val');
        const score = document.querySelector('.total-val');
        const btn = document.querySelector('.complete-leaderboard-btn');
        const doc = document.documentElement;

        return {
          titleText: title ? title.textContent.trim() : '',
          starCount: stars.length,
          bonusText: bonus ? bonus.textContent.trim() : '',
          scoreText: score ? score.textContent.trim() : '',
          btnText: btn ? btn.textContent.trim() : '',
          hasOverflow: doc.scrollWidth > doc.clientWidth
        };
      });

      console.log(`  Title: "${step1Metrics.titleText}"`);
      console.log(`  Stars: ${step1Metrics.starCount} stars rendered`);
      console.log(`  Bonus: "${step1Metrics.bonusText}", Score: "${step1Metrics.scoreText}"`);
      console.log(`  Button: "${step1Metrics.btnText}"`);

      assert.strictEqual(step1Metrics.titleText, 'LEVEL COMPLETED!', 'Step 1 has LEVEL COMPLETED! heading');
      assert.strictEqual(step1Metrics.starCount, 3, 'Step 1 renders 3-star rating cluster');
      assert.ok(step1Metrics.btnText.includes('VIEW LEADERBOARD'), 'Step 1 has VIEW LEADERBOARD button');
      assert.strictEqual(step1Metrics.hasOverflow, false, 'Step 1 has zero horizontal overflow');
      console.log(`  ✓ Step 1 verified with zero overflow`);

      const shot1Path = path.join(ARTIFACT_DIR, `step1_level_completed_${testVp.suffix}.png`);
      await page.screenshot({ path: shot1Path });
      console.log(`  📸 Saved screenshot: step1_level_completed_${testVp.suffix}.png`);

      // Click "VIEW LEADERBOARD"
      console.log('\n  Clicking VIEW LEADERBOARD...');
      await page.click('.complete-leaderboard-btn');
      await sleep(600); // Allow backend fetch to resolve

      // -----------------------------------------------------------------------
      // STEP 2: LEADERBOARD SCREEN
      // -----------------------------------------------------------------------
      console.log('\n[STEP 2] Leaderboard Screen:');
      await page.waitForSelector('.completion-leaderboard-card', { timeout: 5000 });

      const step2Metrics = await page.evaluate(() => {
        const title = document.querySelector('.completion-flow-header .level-complete-title');
        const podiumCols = document.querySelectorAll('.podium-col');
        const goldUsername = document.querySelector('.podium-gold .podium-username');
        const highlightBanner = document.querySelector('.current-player-highlight-strip');
        const myUsername = document.querySelector('.highlight-username');
        const tableRows = document.querySelectorAll('.standings-row');
        const continueBtn = document.querySelector('.leaderboard-continue-btn');
        const doc = document.documentElement;

        return {
          titleText: title ? title.textContent.trim() : '',
          podiumColCount: podiumCols.length,
          top1User: goldUsername ? goldUsername.textContent.trim() : '',
          hasHighlightBanner: !!highlightBanner,
          highlightUser: myUsername ? myUsername.textContent.trim() : '',
          rowCount: tableRows.length,
          continueBtnText: continueBtn ? continueBtn.textContent.trim() : '',
          hasOverflow: doc.scrollWidth > doc.clientWidth
        };
      });

      console.log(`  Title: "${step2Metrics.titleText}"`);
      console.log(`  Podium: ${step2Metrics.podiumColCount} pedestals (Top 1: "${step2Metrics.top1User}")`);
      console.log(`  Highlight Banner: User "${step2Metrics.highlightUser}", Rows: ${step2Metrics.rowCount}`);
      console.log(`  Button: "${step2Metrics.continueBtnText}"`);

      assert.strictEqual(step2Metrics.titleText, 'GLOBAL LEADERBOARD', 'Step 2 has GLOBAL LEADERBOARD heading');
      assert.strictEqual(step2Metrics.podiumColCount, 3, 'Step 2 renders top 3 podium pedestals');
      assert.strictEqual(step2Metrics.hasHighlightBanner, true, 'Step 2 highlights current player');
      assert.ok(step2Metrics.continueBtnText.includes('CONTINUE'), 'Step 2 has CONTINUE button');
      assert.strictEqual(step2Metrics.hasOverflow, false, 'Step 2 has zero horizontal overflow');
      console.log(`  ✓ Step 2 verified with zero overflow`);

      const shot2Path = path.join(ARTIFACT_DIR, `step2_leaderboard_${testVp.suffix}.png`);
      await page.screenshot({ path: shot2Path });
      console.log(`  📸 Saved screenshot: step2_leaderboard_${testVp.suffix}.png`);

      // Click "CONTINUE"
      console.log('\n  Clicking CONTINUE...');
      await page.click('.leaderboard-continue-btn');
      await sleep(400);

      // -----------------------------------------------------------------------
      // STEP 3: NEXT LEVEL UNLOCKED SCREEN
      // -----------------------------------------------------------------------
      console.log('\n[STEP 3] Next Level Unlocked Screen:');
      await page.waitForSelector('.completion-unlock-card', { timeout: 5000 });

      const step3Metrics = await page.evaluate(() => {
        const title = document.querySelector('.completion-unlock-card .level-complete-title');
        const unlockIcon = document.querySelector('.unlock-hero-svg');
        const previewTitle = document.querySelector('.unlocked-preview-title');
        const previewChapter = document.querySelector('.unlocked-chapter-tag');
        const goMapBtn = document.querySelector('.unlock-go-map-btn');
        const doc = document.documentElement;

        return {
          titleText: title ? title.textContent.trim() : '',
          hasUnlockIcon: !!unlockIcon,
          nextTitle: previewTitle ? previewTitle.textContent.trim() : '',
          nextChapter: previewChapter ? previewChapter.textContent.trim() : '',
          goMapBtnText: goMapBtn ? goMapBtn.textContent.trim() : '',
          hasOverflow: doc.scrollWidth > doc.clientWidth
        };
      });

      console.log(`  Title: "${step3Metrics.titleText}"`);
      console.log(`  Unlock Icon Present: ${step3Metrics.hasUnlockIcon}`);
      console.log(`  Next Level: "${step3Metrics.nextTitle}" (${step3Metrics.nextChapter})`);
      console.log(`  Button: "${step3Metrics.goMapBtnText}"`);

      assert.strictEqual(step3Metrics.titleText, 'NEXT LEVEL UNLOCKED!', 'Step 3 has NEXT LEVEL UNLOCKED! heading');
      assert.strictEqual(step3Metrics.hasUnlockIcon, true, 'Step 3 renders padlock unlock animation');
      assert.strictEqual(step3Metrics.nextTitle, 'Line Breaker', 'Step 3 shows Level 2 Line Breaker title');
      assert.ok(step3Metrics.goMapBtnText.includes('GO TO ADVENTURE MAP'), 'Step 3 has GO TO ADVENTURE MAP button');
      assert.strictEqual(step3Metrics.hasOverflow, false, 'Step 3 has zero horizontal overflow');
      console.log(`  ✓ Step 3 verified with zero overflow`);

      const shot3Path = path.join(ARTIFACT_DIR, `step3_next_level_unlocked_${testVp.suffix}.png`);
      await page.screenshot({ path: shot3Path });
      console.log(`  📸 Saved screenshot: step3_next_level_unlocked_${testVp.suffix}.png`);

      // Click "GO TO ADVENTURE MAP"
      console.log('\n  Clicking GO TO ADVENTURE MAP...');
      await page.click('.unlock-go-map-btn');
      await sleep(400);

      // -----------------------------------------------------------------------
      // VERIFY ADVENTURE MAP & MANUAL NEXT LEVEL LAUNCH
      // -----------------------------------------------------------------------
      console.log('\n[STEP 4] Adventure Map Navigation & Manual Next Level Selection:');
      await page.waitForSelector('.adventure-map-screen', { timeout: 5000 });

      const mapMetrics = await page.evaluate(() => {
        const modal = document.querySelector('.level-complete-card');
        const mapScreen = document.querySelector('.adventure-map-screen, .campaign-map-screen');
        const dockTitle = document.querySelector('.dock-stage-name, .dock-stage-title, .dock-meta-title');
        const dockLevel = document.querySelector('.dock-stage-num, .dock-level-badge, .dock-meta-stage');
        const dockPlayBtn = document.querySelector('.adventure-play-btn, .dock-action-button');
        const introModal = document.querySelector('.level-intro-card');

        return {
          isModalDismissed: !modal,
          isMapMounted: !!mapScreen,
          dockLevelText: dockLevel ? dockLevel.textContent.trim() : '',
          dockTitleText: dockTitle ? dockTitle.textContent.trim() : '',
          playBtnText: dockPlayBtn ? dockPlayBtn.textContent.trim() : '',
          isGameNotAutoStarted: !introModal
        };
      });

      console.log(`  Modal Dismissed: ${mapMetrics.isModalDismissed}`);
      console.log(`  Map Screen Mounted: ${mapMetrics.isMapMounted}`);
      console.log(`  Selected Level in Dock: "${mapMetrics.dockLevelText}" - "${mapMetrics.dockTitleText}"`);
      console.log(`  Game Not Auto-started: ${mapMetrics.isGameNotAutoStarted}`);

      assert.strictEqual(mapMetrics.isModalDismissed, true, 'Completion modal dismissed');
      assert.strictEqual(mapMetrics.isMapMounted, true, 'Adventure map screen is mounted and visible');
      assert.strictEqual(mapMetrics.isGameNotAutoStarted, true, 'Game was NOT automatically started');
      console.log('  ✓ Verified: Game did not auto-start, player is on Adventure Map');

      // Now manually start the newly unlocked level from the map
      console.log('  Manually launching next level from Adventure Map dock...');
      await page.click('.adventure-play-btn, .dock-action-button');
      await sleep(350);

      // Verify Level 2 Intro Screen opens
      await page.waitForSelector('.level-intro-card', { timeout: 5000 });
      const nextIntroTitle = await page.evaluate(() => {
        const el = document.querySelector('.intro-title-text');
        return el ? el.textContent.trim() : '';
      });
      console.log(`  Newly Opened Mission Briefing: "${nextIntroTitle}"`);
      assert.strictEqual(nextIntroTitle, 'Line Breaker', 'Mission briefing for Level 2 Line Breaker mounted');

      // Click START LEVEL to launch active match
      await page.click('.intro-start-btn');
      await sleep(400);

      const level2GameMounted = await page.evaluate(() => {
        return !!document.querySelector('.grid-container');
      });
      assert.strictEqual(level2GameMounted, true, 'Level 2 active game board mounted successfully');
      console.log('  ✓ Complete flow from gameplay -> complete -> leaderboard -> unlock -> map -> next level launch verified successfully!');
    }

    assert.strictEqual(pageErrors.length, 0, `Zero uncaught browser errors (actual: ${pageErrors.length})`);

    console.log(`\n========================================================================`);
    console.log('ALL 3-STEP COMPLETION, LEADERBOARD & UNLOCK UI CHECKS PASSED 100%! ✓');
    console.log('========================================================================\n');

  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error('\n✗ UI Test Failed:', err);
  process.exit(1);
});
