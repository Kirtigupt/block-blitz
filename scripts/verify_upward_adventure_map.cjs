const puppeteer = require('puppeteer-core');
const assert = require('assert');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const FRONTEND_URL = 'http://127.0.0.1:5173';
const ARTIFACT_DIR = path.resolve('C:/Users/kirti/.gemini/antigravity/brain/3ac25ba8-43d2-4529-867b-c5d5adc7cb54');

const VIEWPORTS = [
  { name: 'Ultra Small Mobile', width: 320, height: 640 },
  { name: 'Compact Mobile', width: 375, height: 667 },
  { name: 'Modern Mobile', width: 390, height: 844 },
  { name: 'Tablet Portrait', width: 768, height: 1024 },
  { name: 'Desktop Standard', width: 1280, height: 800 }
];

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

(async () => {
  console.log('========================================================================');
  console.log('BLOCK BLITZ — UPWARD ADVENTURE MAP COMPREHENSIVE VERIFICATION');
  console.log('========================================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  let allPassed = true;

  try {
    for (const vp of VIEWPORTS) {
      console.log(`\n--- Auditing ${vp.name} (${vp.width}x${vp.height}) ---`);
      const page = await browser.newPage();
      await page.setViewport({ width: vp.width, height: vp.height });

      // Navigate to Block Blitz
      await page.goto(FRONTEND_URL, { waitUntil: 'networkidle0' });
      await sleep(350);

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
      await sleep(500);

      // 2. Audit Vertical Progression & Positioning
      const mapAudit = await page.evaluate(() => {
        const doc = document.documentElement;
        const scrollContainer = document.querySelector('.adventure-scroll-container');
        const containerRect = scrollContainer ? scrollContainer.getBoundingClientRect() : { top: 0, left: 0 };
        const scrollTop = scrollContainer ? scrollContainer.scrollTop : 0;

        const nodes = Array.from(document.querySelectorAll('.adv-trail-node'));
        const citadelBanner = document.querySelector('.zenith-citadel-banner');
        const basecampBanner = document.querySelector('.expedition-basecamp-banner');

        const levelNodesMap = {};
        nodes.forEach((node) => {
          const lvl = parseInt(node.getAttribute('data-level'), 10);
          if (lvl) {
            const rect = node.getBoundingClientRect();
            levelNodesMap[lvl] = {
              absY: (rect.top - containerRect.top) + scrollTop,
              rectTop: rect.top,
              width: node.offsetWidth,
              height: node.offsetHeight
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
          hasCitadelBanner: !!citadelBanner,
          hasBasecampBanner: !!basecampBanner,
          citadelAbsY: citadelRect ? (citadelRect.top - containerRect.top) + scrollTop : null,
          basecampAbsY: basecampRect ? (basecampRect.top - containerRect.top) + scrollTop : null,
          level1AbsY: levelNodesMap[1]?.absY,
          level2AbsY: levelNodesMap[2]?.absY,
          level10AbsY: levelNodesMap[10]?.absY,
          level50AbsY: levelNodesMap[50]?.absY,
          level100AbsY: levelNodesMap[100]?.absY,
          containerScrollTop: scrollTop,
          containerScrollHeight: scrollContainer ? scrollContainer.scrollHeight : 0,
          containerClientHeight: scrollContainer ? scrollContainer.clientHeight : 0
        };
      });

      // Assertions
      console.log(`  ✓ Total adventure nodes rendered: ${mapAudit.totalNodes} / 100`);
      assert.strictEqual(mapAudit.totalNodes, 100, 'All 100 levels must be rendered on the map');

      console.log(`  ✓ Zero horizontal overflow: ${!mapAudit.hasHorizontalScroll} (doc ${mapAudit.docScrollWidth}px <= ${mapAudit.docClientWidth}px)`);
      assert(!mapAudit.hasHorizontalScroll, 'No horizontal overflow allowed');

      // Verify Upward Order:
      // AbsY of Level 100 MUST BE SMALLER (closer to 0 / summit) than Level 50, which is smaller than Level 10, which is smaller than Level 1!
      console.log(`  ✓ Level 100 absY: ${Math.round(mapAudit.level100AbsY)}px`);
      console.log(`  ✓ Level 50 absY:  ${Math.round(mapAudit.level50AbsY)}px`);
      console.log(`  ✓ Level 10 absY:  ${Math.round(mapAudit.level10AbsY)}px`);
      console.log(`  ✓ Level 2 absY:   ${Math.round(mapAudit.level2AbsY)}px`);
      console.log(`  ✓ Level 1 absY:   ${Math.round(mapAudit.level1AbsY)}px`);

      assert(mapAudit.level100AbsY < mapAudit.level50AbsY, 'Level 100 must be positioned ABOVE Level 50');
      assert(mapAudit.level50AbsY < mapAudit.level10AbsY, 'Level 50 must be positioned ABOVE Level 10');
      assert(mapAudit.level10AbsY < mapAudit.level2AbsY, 'Level 10 must be positioned ABOVE Level 2');
      assert(mapAudit.level2AbsY < mapAudit.level1AbsY, 'Level 2 must be positioned ABOVE Level 1');

      console.log('  ✓ UPWARD PROGRESSION VERIFIED: Level 1 is at bottom, Levels ascend sequentially to Level 100 at top!');

      // Verify Citadel & Basecamp
      assert(mapAudit.hasCitadelBanner, 'Zenith Citadel Banner must be present');
      assert(mapAudit.hasBasecampBanner, 'Expedition Basecamp Banner must be present');
      assert(mapAudit.citadelAbsY < mapAudit.level100AbsY, 'Zenith Citadel must sit at the very summit above Level 100');
      assert(mapAudit.basecampAbsY > mapAudit.level1AbsY, 'Expedition Basecamp must sit at ground zero below Level 1');
      console.log('  ✓ Zenith Citadel sits at summit above Level 100; Basecamp sits at bottom below Level 1');

      // 3. Test Interactive Dock Selection
      const dockAudit = await page.evaluate(() => {
        const level1Node = document.querySelector('.adv-trail-node[data-level="1"]');
        if (level1Node) level1Node.click();
        const dock = document.querySelector('.adventure-bottom-dock');
        const stageNum = dock ? dock.querySelector('.dock-crest-num')?.textContent : null;
        const playBtn = dock ? dock.querySelector('.dock-action-button') : null;
        return {
          dockHeight: dock ? dock.getBoundingClientRect().height : 0,
          stageNum,
          playBtnDisabled: playBtn ? playBtn.disabled : true,
          playBtnText: playBtn ? playBtn.textContent : ''
        };
      });

      console.log(`  ✓ Launch Dock selected stage: ${dockAudit.stageNum}, Play button active: ${!dockAudit.playBtnDisabled}`);
      assert.strictEqual(dockAudit.stageNum, '1', 'Dock displays Stage 1');
      assert(!dockAudit.playBtnDisabled, 'Stage 1 play button is active');

      // 4. Capture Screenshots
      if (vp.name === 'Modern Mobile') {
        // Screenshot bottom (Level 1 & Basecamp view)
        const mobileBottomShot = path.join(ARTIFACT_DIR, 'upward_adventure_map_mobile_bottom_390x844.png');
        await page.screenshot({ path: mobileBottomShot });
        console.log(`  ✓ Saved screenshot: ${mobileBottomShot}`);

        // Scroll to top to capture Zenith Citadel & Level 100
        await page.evaluate(() => {
          const container = document.querySelector('.adventure-scroll-container');
          if (container) container.scrollTo({ top: 0, behavior: 'instant' });
        });
        await sleep(350);
        const mobileTopShot = path.join(ARTIFACT_DIR, 'upward_adventure_map_mobile_summit_390x844.png');
        await page.screenshot({ path: mobileTopShot });
        console.log(`  ✓ Saved screenshot: ${mobileTopShot}`);
      } else if (vp.name === 'Desktop Standard') {
        // Desktop bottom view (Level 1 & Basecamp)
        const desktopBottomShot = path.join(ARTIFACT_DIR, 'upward_adventure_map_desktop_bottom_1280x800.png');
        await page.screenshot({ path: desktopBottomShot });
        console.log(`  ✓ Saved screenshot: ${desktopBottomShot}`);

        // Scroll to summit to capture Zenith Citadel & Level 100
        await page.evaluate(() => {
          const container = document.querySelector('.adventure-scroll-container');
          if (container) container.scrollTo({ top: 0, behavior: 'instant' });
        });
        await sleep(350);
        const desktopTopShot = path.join(ARTIFACT_DIR, 'upward_adventure_map_desktop_summit_1280x800.png');
        await page.screenshot({ path: desktopTopShot });
        console.log(`  ✓ Saved screenshot: ${desktopTopShot}`);
      }

      await page.close();
    }

    console.log('\n========================================================================');
    console.log('ALL UPWARD ADVENTURE MAP TESTS PASSED WITH 100% ACCURACY! ✓');
    console.log('========================================================================\n');
  } catch (err) {
    console.error('✗ Verification failed:', err);
    allPassed = false;
  } finally {
    await browser.close();
  }

  process.exit(allPassed ? 0 : 1);
})();
