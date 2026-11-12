const puppeteer = require('puppeteer-core');
const assert = require('assert');
const path = require('path');
const fs = require('fs');
const { createServer } = require('vite');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\kirti\\.gemini\\antigravity\\brain\\3ac25ba8-43d2-4529-867b-c5d5adc7cb54';

const VIEWPORTS = [
  { name: 'Ultra Small Mobile', width: 320, height: 640 },
  { name: 'Compact Android', width: 360, height: 800 },
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'Modern iPhone', width: 390, height: 844 },
  { name: 'Large iPhone Max', width: 430, height: 932 },
  { name: 'Tablet Portrait', width: 768, height: 1024 },
  { name: 'Desktop Standard', width: 1280, height: 800 }
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

(async () => {
  console.log('========================================================================');
  console.log('BLOCK BLITZ — TASK 4: ADVENTURE MAP COMPREHENSIVE VERIFICATION SUITE');
  console.log('========================================================================\n');

  // 1. Start in-process Vite Server
  console.log('Starting in-process Vite dev server...');
  const vite = await createServer({
    server: { port: 5192, host: '127.0.0.1' },
    logLevel: 'error'
  });
  await vite.listen();
  const serverPort = vite.httpServer.address().port;
  const APP_URL = `http://127.0.0.1:${serverPort}`;
  console.log(`Vite dev server running in-process at ${APP_URL}\n`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  let allPassed = true;

  try {
    for (const vp of VIEWPORTS) {
      console.log(`------------------------------------------------------------------------`);
      console.log(`>>> AUDITING VIEWPORT: ${vp.name} (${vp.width}x${vp.height}) <<<`);
      console.log(`------------------------------------------------------------------------`);

      const page = await browser.newPage();
      await page.setViewport({ width: vp.width, height: vp.height });

      const pageErrors = [];
      page.on('pageerror', (err) => pageErrors.push(err.message));

      await page.goto(APP_URL, { waitUntil: 'networkidle0' });
      await sleep(300);

      // 1. Click "PLAY NOW" from Welcome Screen
      const playNowBtn = await page.waitForSelector('.welcome-play-now-btn', { timeout: 6000 });
      assert(playNowBtn, 'Welcome Play button found');
      await playNowBtn.click();
      await sleep(250);

      // Handle Guest Continue if Auth Modal appears
      const guestBtn = await page.$('.guest-continue-btn');
      if (guestBtn) await guestBtn.click();

      // Verify Adventure Map screen mounted
      await page.waitForSelector('.adventure-map-screen', { timeout: 6000 });
      await sleep(400);

      // 2. Comprehensive Map Metrics Audit
      const metrics = await page.evaluate(() => {
        const doc = document.documentElement;
        const scrollContainer = document.querySelector('.adventure-scroll-container');
        const containerRect = scrollContainer ? scrollContainer.getBoundingClientRect() : { top: 0, left: 0 };
        const scrollTop = scrollContainer ? scrollContainer.scrollTop : 0;

        const nodes = Array.from(document.querySelectorAll('.adv-trail-node'));
        const backBtn = document.querySelector('.adventure-back-btn, .campaign-back-btn');
        const citadelBanner = document.querySelector('.zenith-citadel-banner');
        const basecampBanner = document.querySelector('.expedition-basecamp-banner');
        const dock = document.querySelector('.adventure-bottom-dock');
        const header = document.querySelector('.adventure-top-header');

        const levelNodesMap = {};
        let minWidth = 999;
        let minHeight = 999;

        nodes.forEach((node) => {
          const lvl = parseInt(node.getAttribute('data-level'), 10);
          const rect = node.getBoundingClientRect();
          if (rect.width < minWidth) minWidth = rect.width;
          if (rect.height < minHeight) minHeight = rect.height;

          if (lvl) {
            levelNodesMap[lvl] = {
              absY: (rect.top - containerRect.top) + scrollTop,
              width: rect.width,
              height: rect.height,
              isBoss: node.classList.contains('boss-stone'),
              isApex: node.classList.contains('apex-sovereign-node'),
              isLocked: node.classList.contains('locked-stone')
            };
          }
        });

        const citadelRect = citadelBanner ? citadelBanner.getBoundingClientRect() : null;
        const basecampRect = basecampBanner ? basecampBanner.getBoundingClientRect() : null;

        const hasHorizontalScroll = doc.scrollWidth > doc.clientWidth ||
          (scrollContainer ? scrollContainer.scrollWidth > scrollContainer.clientWidth : false);

        return {
          hasHorizontalScroll,
          docScrollWidth: doc.scrollWidth,
          docClientWidth: doc.clientWidth,
          totalNodes: nodes.length,
          minNodeWidth: minWidth,
          minNodeHeight: minHeight,
          hasCitadelBanner: !!citadelBanner,
          hasBasecampBanner: !!basecampBanner,
          citadelAbsY: citadelRect ? (citadelRect.top - containerRect.top) + scrollTop : null,
          basecampAbsY: basecampRect ? (basecampRect.top - containerRect.top) + scrollTop : null,
          level1AbsY: levelNodesMap[1]?.absY,
          level2AbsY: levelNodesMap[2]?.absY,
          level10AbsY: levelNodesMap[10]?.absY,
          level50AbsY: levelNodesMap[50]?.absY,
          level100AbsY: levelNodesMap[100]?.absY,
          level10IsBoss: levelNodesMap[10]?.isBoss,
          level20IsBoss: levelNodesMap[20]?.isBoss,
          level100IsApex: levelNodesMap[100]?.isApex,
          level99IsLocked: levelNodesMap[99]?.isLocked,
          backBtnLabel: backBtn ? backBtn.getAttribute('aria-label') : null,
          dockHeight: dock ? dock.getBoundingClientRect().height : 0,
          headerHeight: header ? header.getBoundingClientRect().height : 0
        };
      });

      console.log(`  ✓ Total Adventure Nodes: ${metrics.totalNodes} / 100`);
      assert.strictEqual(metrics.totalNodes, 100, 'All 100 levels must be rendered on the map');

      console.log(`  ✓ Zero horizontal overflow: ${!metrics.hasHorizontalScroll} (${metrics.docScrollWidth}px <= ${metrics.docClientWidth}px)`);
      assert(!metrics.hasHorizontalScroll, 'No horizontal overflow allowed');

      console.log(`  ✓ Touch target minimum dimensions: ${metrics.minNodeWidth}x${metrics.minNodeHeight}px (>= 44px)`);
      assert(metrics.minNodeWidth >= 44 && metrics.minNodeHeight >= 44, 'Node dimensions must satisfy 44px mobile touch target');

      console.log(`  ✓ Back button accessible label: "${metrics.backBtnLabel}"`);
      assert.strictEqual(metrics.backBtnLabel, 'Back to Welcome', 'Back button must have label "Back to Welcome"');

      console.log(`  ✓ Action Dock height: ${Math.round(metrics.dockHeight)}px (<= 95px ceiling)`);
      assert(metrics.dockHeight <= 95, 'Dock height must be <= 95px');

      // Verify Upward Order
      console.log(`  ✓ Summit Citadel:     ${Math.round(metrics.citadelAbsY)}px`);
      console.log(`  ✓ Level 100 (Apex):   ${Math.round(metrics.level100AbsY)}px`);
      console.log(`  ✓ Level 50:           ${Math.round(metrics.level50AbsY)}px`);
      console.log(`  ✓ Level 10 (Boss):    ${Math.round(metrics.level10AbsY)}px`);
      console.log(`  ✓ Level 2:            ${Math.round(metrics.level2AbsY)}px`);
      console.log(`  ✓ Level 1 (Ground):   ${Math.round(metrics.level1AbsY)}px`);
      console.log(`  ✓ Basecamp Banner:    ${Math.round(metrics.basecampAbsY)}px`);

      assert(metrics.citadelAbsY < metrics.level100AbsY, 'Citadel sits above Level 100');
      assert(metrics.level100AbsY < metrics.level50AbsY, 'Level 100 is above Level 50');
      assert(metrics.level50AbsY < metrics.level10AbsY, 'Level 50 is above Level 10');
      assert(metrics.level10AbsY < metrics.level2AbsY, 'Level 10 is above Level 2');
      assert(metrics.level2AbsY < metrics.level1AbsY, 'Level 2 is above Level 1');
      assert(metrics.basecampAbsY > metrics.level1AbsY, 'Basecamp sits below Level 1');
      console.log('  ✓ UPWARD PROGRESSION VERIFIED: Level 1 at bottom, ascending to Level 100 at summit!');

      // Verify Boss and Apex designations
      assert(metrics.level10IsBoss, 'Stage 10 designated as Boss');
      assert(metrics.level20IsBoss, 'Stage 20 designated as Boss');
      assert(metrics.level100IsApex, 'Stage 100 designated as Sovereign Apex');
      assert(metrics.level99IsLocked, 'Stage 99 is in locked state');
      console.log('  ✓ Stage 10/20 boss styling and Stage 100 apex styling confirmed');

      // 3. Test Interactive Dock Selection & Locked Feedback
      // Tap locked stage 99
      await page.evaluate(() => {
        const node99 = document.querySelector('.adv-trail-node[data-level="99"]');
        if (node99) node99.click();
      });
      await sleep(150);

      const lockedTapResult = await page.evaluate(() => {
        const toast = document.querySelector('.locked-feedback-toast, .adventure-toast');
        const playBtn = document.querySelector('.dock-action-button');
        return {
          toastText: toast ? toast.textContent : null,
          playBtnDisabled: playBtn ? playBtn.disabled : false
        };
      });
      console.log(`  ✓ Locked node tap feedback: "${lockedTapResult.toastText}", Play button disabled: ${lockedTapResult.playBtnDisabled}`);
      assert(lockedTapResult.playBtnDisabled, 'Locked node play button must be disabled');

      // Tap playable stage 1
      await page.evaluate(() => {
        const node1 = document.querySelector('.adv-trail-node[data-level="1"]');
        if (node1) node1.click();
      });
      await sleep(150);

      const unlockedTapResult = await page.evaluate(() => {
        const dock = document.querySelector('.adventure-bottom-dock');
        const stageNum = dock ? dock.querySelector('.dock-crest-num')?.textContent : null;
        const playBtn = dock ? dock.querySelector('.dock-action-button') : null;
        return {
          stageNum,
          playBtnDisabled: playBtn ? playBtn.disabled : true,
          playBtnText: playBtn ? playBtn.textContent : ''
        };
      });
      console.log(`  ✓ Unlocked Stage 1 selection: stageNum "${unlockedTapResult.stageNum}", Button: "${unlockedTapResult.playBtnText.trim()}"`);
      assert.strictEqual(unlockedTapResult.stageNum, '1', 'Stage 1 selected in dock');
      assert(!unlockedTapResult.playBtnDisabled, 'Stage 1 play button is active');

      // 4. Test Mission Briefing Launch
      await page.click('.adventure-play-btn, .dock-action-button');
      await sleep(350);
      const missionBriefingModal = await page.$('.level-intro-card');
      assert(missionBriefingModal, 'Mission Briefing modal mounts upon clicking Play Level');
      console.log('  ✓ Mission Briefing launched successfully from Adventure Map');

      // Close Mission Briefing to return to map
      const introCloseBtn = await page.$('.intro-close-icon-btn');
      if (introCloseBtn) {
        await introCloseBtn.click();
        await sleep(250);
      } else {
        await page.keyboard.press('Escape');
        await sleep(250);
      }

      // 5. Capture High-Res Screenshots
      if (vp.name === 'Modern iPhone') {
        const bottomShot = path.join(ARTIFACT_DIR, 'task4_adventure_map_mobile_bottom_390x844.png');
        await page.screenshot({ path: bottomShot });
        console.log(`  ✓ Saved screenshot: ${bottomShot}`);

        // Scroll to summit
        await page.evaluate(() => {
          const container = document.querySelector('.adventure-scroll-container');
          if (container) container.scrollTo({ top: 0, behavior: 'instant' });
        });
        await sleep(350);
        const summitShot = path.join(ARTIFACT_DIR, 'task4_adventure_map_mobile_summit_390x844.png');
        await page.screenshot({ path: summitShot });
        console.log(`  ✓ Saved screenshot: ${summitShot}`);
      } else if (vp.name === 'Ultra Small Mobile') {
        const smallMobileShot = path.join(ARTIFACT_DIR, 'task4_adventure_map_mobile_320x640.png');
        await page.screenshot({ path: smallMobileShot });
        console.log(`  ✓ Saved screenshot: ${smallMobileShot}`);
      } else if (vp.name === 'Desktop Standard') {
        const desktopBottomShot = path.join(ARTIFACT_DIR, 'task4_adventure_map_desktop_bottom_1280x800.png');
        await page.screenshot({ path: desktopBottomShot });
        console.log(`  ✓ Saved screenshot: ${desktopBottomShot}`);

        // Scroll to summit
        await page.evaluate(() => {
          const container = document.querySelector('.adventure-scroll-container');
          if (container) container.scrollTo({ top: 0, behavior: 'instant' });
        });
        await sleep(350);
        const desktopSummitShot = path.join(ARTIFACT_DIR, 'task4_adventure_map_desktop_summit_1280x800.png');
        await page.screenshot({ path: desktopSummitShot });
        console.log(`  ✓ Saved screenshot: ${desktopSummitShot}`);
      }

      assert.strictEqual(pageErrors.length, 0, `Zero page errors during audit (errors: ${pageErrors.join('; ')})`);
      await page.close();
    }

    console.log('\n========================================================================');
    console.log('ALL TASK 4 ADVENTURE MAP AUDITS PASSED WITH 100% SUCCESS! ✓');
    console.log('========================================================================\n');
  } catch (err) {
    console.error('✗ Verification failed:', err);
    allPassed = false;
  } finally {
    await browser.close();
    await vite.close();
  }

  process.exit(allPassed ? 0 : 1);
})();
