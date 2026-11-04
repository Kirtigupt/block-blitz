const puppeteer = require('puppeteer-core');
const assert = require('assert');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:5173';
const ARTIFACT_DIR = 'C:\\Users\\kirti\\.gemini\\antigravity\\brain\\3ac25ba8-43d2-4529-867b-c5d5adc7cb54';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const VIEWPORTS = [
  { width: 320, height: 640, name: 'Small Mobile (320px)' },
  { width: 375, height: 667, name: 'iPhone SE (375px)' },
  { width: 390, height: 844, name: 'iPhone 14 (390px)' },
  { width: 768, height: 1024, name: 'Tablet (768px)' },
  { width: 1280, height: 800, name: 'Desktop Laptop (1280px)' }
];

async function run() {
  console.log('========================================================================');
  console.log('BLOCK BLITZ — ADVENTURE MAP TOP-TO-BOTTOM PROGRESSION AUDIT');
  console.log('========================================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  page.on('pageerror', (err) => {
    console.error('  [Browser Uncaught Error]:', err.message);
  });

  for (const vp of VIEWPORTS) {
    console.log(`------------------------------------------------------------------------`);
    console.log(`>>> TESTING VIEWPORT: ${vp.name} (${vp.width}x${vp.height}) <<<`);
    console.log(`------------------------------------------------------------------------`);

    await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 2 });
    await page.goto(APP_URL, { waitUntil: 'networkidle0' });

    // Clean session
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload({ waitUntil: 'networkidle0' });
    await sleep(350);

    // Welcome -> Guest -> Level Map
    const playBtn = await page.$('.welcome-play-now-btn');
    if (playBtn) await playBtn.click();
    await sleep(250);
    const guestBtn = await page.$('.guest-continue-btn');
    if (guestBtn) await guestBtn.click();
    await sleep(400);

    // 1. Verify zero horizontal overflow on Map screen
    const overflowCheck = await page.evaluate(() => {
      const doc = document.documentElement;
      const mapContainer = document.querySelector('.adventure-scroll-container');
      return {
        docScrollWidth: doc.scrollWidth,
        docClientWidth: doc.clientWidth,
        hasDocScroll: doc.scrollWidth > doc.clientWidth,
        containerScrollWidth: mapContainer ? mapContainer.scrollWidth : 0,
        containerClientWidth: mapContainer ? mapContainer.clientWidth : 0,
        hasContainerHorizScroll: mapContainer ? mapContainer.scrollWidth > mapContainer.clientWidth : false
      };
    });

    console.log(`  [Overflow Check] Document: ${overflowCheck.docScrollWidth}px / ${overflowCheck.docClientWidth}px; Container: ${overflowCheck.containerScrollWidth}px / ${overflowCheck.containerClientWidth}px`);
    assert.strictEqual(overflowCheck.hasDocScroll, false, `${vp.name}: Document must have zero horizontal overflow`);
    assert.strictEqual(overflowCheck.hasContainerHorizScroll, false, `${vp.name}: Map container must have zero horizontal overflow`);
    console.log(`  ✓ Zero horizontal overflow on map screen`);

    // 2. Audit sequential TOP-TO-BOTTOM progression of all 100 levels
    const levelPositions = await page.evaluate(() => {
      const nodes = Array.from(document.querySelectorAll('.adventure-mosaic-grid .adv-trail-node'));
      const container = document.querySelector('.adventure-scroll-container');
      const containerRect = container.getBoundingClientRect();
      const scrollTop = container.scrollTop;

      return nodes.map((node) => {
        const level = parseInt(node.getAttribute('data-level'), 10);
        const rect = node.getBoundingClientRect();
        // Calculate absolute Y coordinate relative to the scroll container's content
        const absoluteTop = rect.top - containerRect.top + scrollTop;
        return {
          level,
          absoluteTop,
          left: rect.left,
          isBoss: node.classList.contains('boss-stone'),
          isCurrent: node.classList.contains('current-unlocked'),
          isCompleted: node.classList.contains('completed'),
          isLocked: node.classList.contains('locked-stone')
        };
      });
    });

    assert.strictEqual(levelPositions.length, 100, `Must render exactly 100 level nodes (found ${levelPositions.length})`);
    console.log(`  ✓ Found all 100 level nodes`);

    // Verify Level 1 is at the TOP and Level 100 is at the BOTTOM
    const lvl1 = levelPositions.find((l) => l.level === 1);
    const lvl2 = levelPositions.find((l) => l.level === 2);
    const lvl10 = levelPositions.find((l) => l.level === 10);
    const lvl11 = levelPositions.find((l) => l.level === 11);
    const lvl50 = levelPositions.find((l) => l.level === 50);
    const lvl100 = levelPositions.find((l) => l.level === 100);

    assert(lvl1, 'Level 1 must exist');
    assert(lvl100, 'Level 100 must exist');

    console.log(`  [Progression Coordinates] Lvl 1: ${Math.round(lvl1.absoluteTop)}px | Lvl 2: ${Math.round(lvl2.absoluteTop)}px | Lvl 10: ${Math.round(lvl10.absoluteTop)}px | Lvl 11: ${Math.round(lvl11.absoluteTop)}px | Lvl 100: ${Math.round(lvl100.absoluteTop)}px`);

    assert(lvl2.absoluteTop > lvl1.absoluteTop, `Level 2 (${lvl2.absoluteTop}px) must appear below Level 1 (${lvl1.absoluteTop}px)`);
    assert(lvl10.absoluteTop > lvl2.absoluteTop, `Level 10 (${lvl10.absoluteTop}px) must appear below Level 2 (${lvl2.absoluteTop}px)`);
    assert(lvl11.absoluteTop > lvl10.absoluteTop, `Level 11 (${lvl11.absoluteTop}px) must appear below Level 10 (${lvl10.absoluteTop}px)`);
    assert(lvl50.absoluteTop > lvl11.absoluteTop, `Level 50 (${lvl50.absoluteTop}px) must appear below Level 11 (${lvl11.absoluteTop}px)`);
    assert(lvl100.absoluteTop > lvl50.absoluteTop, `Level 100 (${lvl100.absoluteTop}px) must appear below Level 50 (${lvl50.absoluteTop}px)`);

    // Verify strictly increasing top-to-bottom sequence across all 100 levels
    let violations = 0;
    for (let i = 0; i < levelPositions.length - 1; i++) {
      const curr = levelPositions[i];
      const next = levelPositions[i + 1];
      if (next.absoluteTop <= curr.absoluteTop) {
        console.error(`  [Violation] Level ${next.level} (top: ${next.absoluteTop}) is not below Level ${curr.level} (top: ${curr.absoluteTop})`);
        violations++;
      }
    }
    assert.strictEqual(violations, 0, `All 100 levels must progress sequentially from top to bottom (found ${violations} violations)`);
    console.log(`  ✓ Verified 100% strictly sequential top-to-bottom vertical progression (0 violations across 100 levels)`);

    // 3. Verify Grand Finale Sovereign Trophy Monument is at the bottom below Level 100
    const finalePosition = await page.evaluate(() => {
      const trophyBanner = document.querySelector('.grand-finale-banner');
      const lvl100Node = document.querySelector('.adv-trail-node[data-level="100"]');
      const container = document.querySelector('.adventure-scroll-container');
      const containerRect = container.getBoundingClientRect();
      const scrollTop = container.scrollTop;

      const trophyRect = trophyBanner ? trophyBanner.getBoundingClientRect() : null;
      const lvl100Rect = lvl100Node ? lvl100Node.getBoundingClientRect() : null;

      return {
        hasFinale: Boolean(trophyBanner),
        lvl100Top: lvl100Rect ? lvl100Rect.top - containerRect.top + scrollTop : 0,
        trophyTop: trophyRect ? trophyRect.top - containerRect.top + scrollTop : 0
      };
    });

    assert(finalePosition.hasFinale, 'Grand Finale Sovereign Champion Trophy Monument must exist');
    assert(finalePosition.trophyTop > finalePosition.lvl100Top, `Grand Finale Trophy (${finalePosition.trophyTop}px) must appear below Level 100 (${finalePosition.lvl100Top}px)`);
    console.log(`  ✓ Sovereign Champion Trophy Monument is positioned at the BOTTOM below Level 100`);

    // 4. Verify Departure Terminal is at the TOP above Level 1
    const departureCheck = await page.evaluate(() => {
      const depBanner = document.querySelector('.adventure-departure-banner');
      const lvl1Node = document.querySelector('.adv-trail-node[data-level="1"]');
      const container = document.querySelector('.adventure-scroll-container');
      const containerRect = container.getBoundingClientRect();
      const scrollTop = container.scrollTop;

      const depRect = depBanner ? depBanner.getBoundingClientRect() : null;
      const lvl1Rect = lvl1Node ? lvl1Node.getBoundingClientRect() : null;

      return {
        hasDepBanner: Boolean(depBanner),
        depTop: depRect ? depRect.top - containerRect.top + scrollTop : 0,
        lvl1Top: lvl1Rect ? lvl1Rect.top - containerRect.top + scrollTop : 0
      };
    });

    assert(departureCheck.hasDepBanner, 'Adventure Departure Banner must exist at top');
    assert(departureCheck.depTop < departureCheck.lvl1Top, `Departure Banner (${departureCheck.depTop}px) must appear above Level 1 (${departureCheck.lvl1Top}px)`);
    console.log(`  ✓ Departure Terminal Banner is positioned at the TOP above Level 1`);

    // 5. Verify Boss Milestones (Levels 10, 20, 30, 40, 50, 60, 70, 80, 90, 100)
    const bossCheck = await page.evaluate(() => {
      const bossNodes = Array.from(document.querySelectorAll('.adv-trail-node.boss-stone'));
      const bossLevels = bossNodes.map((n) => parseInt(n.getAttribute('data-level'), 10));
      return {
        count: bossNodes.length,
        levels: bossLevels
      };
    });

    console.log(`  [Boss Milestone Check] Found ${bossCheck.count} boss nodes at levels: ${bossCheck.levels.join(', ')}`);
    assert(bossCheck.count >= 10, 'All 10 milestone boss stages must be styled as boss nodes');
    [10, 20, 30, 40, 50, 60, 70, 80, 90, 100].forEach((bossLvl) => {
      assert(bossCheck.levels.includes(bossLvl), `Level ${bossLvl} must be a boss milestone`);
    });
    console.log(`  ✓ Verified all 10 milestone boss nodes have distinctive boss styling`);

    // 6. Verify Current Level Prominence (Beacon rings, Pointer, and auto-positioning)
    const currentProminenceCheck = await page.evaluate(() => {
      const beacon = document.querySelector('.adv-beacon-rings');
      const pointer = document.querySelector('.adventure-pointer-marker');
      const currentNode = document.querySelector('.adv-trail-node.current-unlocked');
      const container = document.querySelector('.adventure-scroll-container');
      const scrollTop = container ? container.scrollTop : -1;

      return {
        hasBeacon: Boolean(beacon),
        hasPointer: Boolean(pointer),
        currentLevelNum: currentNode ? parseInt(currentNode.getAttribute('data-level'), 10) : null,
        scrollTop
      };
    });

    assert(currentProminenceCheck.hasBeacon, 'Current level must have animated radar beacon rings');
    assert(currentProminenceCheck.hasPointer, 'Current level must have 3D "YOU" hero pointer marker');
    assert.strictEqual(currentProminenceCheck.currentLevelNum, 1, 'Guest starts on Level 1 as current unlocked level');
    console.log(`  ✓ Current unlocked level is prominently highlighted with radar beacon and 3D pointer pin`);

    // Capture screenshot on 390x844 and 1280x800
    if (vp.name.includes('390px') || vp.name.includes('1280px')) {
      const mapShotPath = path.join(ARTIFACT_DIR, `top_to_bottom_adventure_map_${vp.width}x${vp.height}.png`);
      await page.screenshot({ path: mapShotPath });
      console.log(`  📸 Captured Adventure Map Screenshot: ${mapShotPath}`);
    }

    // 7. Test Auto-Positioning with Simulated Progression to Level 15
    console.log(`  [Progression Auto-Positioning Test] Simulating user at Level 15 in Chapter 2...`);
    await page.evaluate(() => {
      localStorage.setItem('block_blitz_unlocked_level_guest', '15');
      localStorage.setItem('block_blitz_current_level_guest', '15');
      localStorage.setItem(
        'block_blitz_completed_levels_guest',
        JSON.stringify([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14])
      );
    });
    await page.reload({ waitUntil: 'networkidle0' });
    await sleep(400);

    // Open map as guest with level 15 progress
    const playBtn2 = await page.$('.welcome-play-now-btn');
    if (playBtn2) await playBtn2.click();
    await sleep(250);
    const guestBtn2 = await page.$('.guest-continue-btn');
    if (guestBtn2) await guestBtn2.click();
    await sleep(900); // Allow timer (200ms) + smooth scroll (~500ms) to complete

    const autoScrollCheck = await page.evaluate(() => {
      const container = document.querySelector('.adventure-scroll-container');
      const node15 = document.querySelector('.adv-trail-node[data-level="15"]');
      const containerRect = container.getBoundingClientRect();
      const nodeRect = node15 ? node15.getBoundingClientRect() : null;

      // Check if node 15 is within visible vertical viewport of the scroll container
      const isVisible =
        nodeRect &&
        nodeRect.top >= containerRect.top &&
        nodeRect.bottom <= containerRect.bottom;

      return {
        scrollTop: container ? container.scrollTop : 0,
        node15TopInView: nodeRect ? Math.round(nodeRect.top) : null,
        containerTop: Math.round(containerRect.top),
        containerBottom: Math.round(containerRect.bottom),
        isVisible
      };
    });

    console.log(`  [Auto-Scroll Result for Stage 15] Container scrollTop: ${autoScrollCheck.scrollTop}px, nodeTop: ${autoScrollCheck.node15TopInView}px, container: [${autoScrollCheck.containerTop}px - ${autoScrollCheck.containerBottom}px], Stage 15 in view: ${autoScrollCheck.isVisible}`);
    assert(autoScrollCheck.scrollTop > 200, 'Map must have scrolled down to reach Level 15');
    assert(autoScrollCheck.isVisible, 'Level 15 must be smoothly centered within the visible container viewport');
    console.log(`  ✓ On opening map, view automatically positioned directly near current unlocked Level 15!`);

    // Capture screenshot of stage 15 centered view
    if (vp.name.includes('390px')) {
      const lvl15ShotPath = path.join(ARTIFACT_DIR, `auto_scroll_stage15_mobile_390x844.png`);
      await page.screenshot({ path: lvl15ShotPath });
      console.log(`  📸 Captured Auto-Scroll Stage 15 Screenshot: ${lvl15ShotPath}`);
    }
  }

  await browser.close();
  console.log('\n========================================================================');
  console.log('ALL TOP-TO-BOTTOM ADVENTURE MAP TESTS PASSED WITH 100% SUCCESS! ✓');
  console.log('========================================================================\n');
}

run().catch((err) => {
  console.error('\n✗ Test Failed:', err);
  process.exit(1);
});
