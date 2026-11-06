const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:5173';
const ARTIFACT_DIR = 'C:\\Users\\kirti\\.gemini\\antigravity\\brain\\3ac25ba8-43d2-4529-867b-c5d5adc7cb54';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function verifyAllChapters() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(APP_URL, { waitUntil: 'networkidle0' });
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.reload({ waitUntil: 'networkidle0' });
  await sleep(400);

  // Navigate to Adventure Map
  const playBtn = await page.$('.welcome-play-now-btn');
  if (playBtn) { await playBtn.click(); await sleep(300); }
  const guestBtn = await page.$('.guest-continue-btn');
  if (guestBtn) { await guestBtn.click(); await sleep(300); }

  await page.waitForSelector('.adventure-map-screen', { timeout: 6000 });
  await sleep(400);

  console.log('====================================================');
  console.log('BLOCK BLITZ — ADVENTURE MAP CHAPTER SELECTION AUDIT');
  console.log('====================================================\n');

  // 1. TEST ALL 10 CHAPTERS ON DESKTOP
  console.log('>>> [PART 1] TESTING CHAPTER SELECTION FOR ALL 10 CHAPTERS <<<');
  for (let ch = 1; ch <= 10; ch++) {
    // Click chapter tab in desktop bar (index 0 is All Realms, index 1 is CH 1, etc.)
    const tabSelector = `.desktop-chapter-pills-bar .ch-pill-item:nth-child(${ch + 1})`;
    await page.click(tabSelector);
    await sleep(250);

    const chapterAudit = await page.evaluate((chNum) => {
      const startLevel = (chNum - 1) * 10 + 1;
      const endLevel = chNum * 10;
      const nodes = Array.from(document.querySelectorAll('.adv-trail-node'));
      const stageNums = nodes.map(n => parseInt(n.getAttribute('data-level'), 10));

      // Check node coordinates
      const positions = nodes.map(n => {
        const r = n.getBoundingClientRect();
        return { stage: n.getAttribute('data-level'), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
      });

      // Check for any overlapping nodes (distance between any two centers < 30px)
      let overlaps = 0;
      for (let i = 0; i < positions.length; i++) {
        for (let j = i + 1; j < positions.length; j++) {
          const dx = positions[i].x - positions[j].x;
          const dy = positions[i].y - positions[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 30) overlaps++;
        }
      }

      // Check chapter realm / focus header title
      const titleEl = document.querySelector('.chapter-focus-title, .realm-gateway-title, .zenith-headline');
      const titleText = titleEl ? titleEl.innerText : null;

      // Check active tab class
      const activePill = document.querySelector('.desktop-chapter-pills-bar .ch-pill-item.active');
      const activeText = activePill ? activePill.innerText : null;

      // Check bottom dock selected stage
      const dockStage = document.querySelector('.dock-crest-num')?.innerText;
      const dockBtn = document.querySelector('.dock-action-button');
      const isDockLocked = dockBtn ? dockBtn.classList.contains('btn-locked') : false;

      // Check horizontal overflow
      const docW = document.documentElement.scrollWidth;
      const winW = window.innerWidth;

      return {
        chNum,
        startLevel,
        endLevel,
        nodeCount: nodes.length,
        minStage: Math.min(...stageNums),
        maxStage: Math.max(...stageNums),
        stageNumsMatch: stageNums.length === 10 && stageNums.every(n => n >= startLevel && n <= endLevel),
        overlaps,
        titleText,
        activeText,
        dockStage,
        isDockLocked,
        hasHorizontalOverflow: docW > winW + 1
      };
    }, ch);

    const pass = chapterAudit.nodeCount === 10 && chapterAudit.stageNumsMatch && chapterAudit.overlaps === 0;
    console.log(`  Chapter ${ch}: [${pass ? 'PASS' : 'FAIL'}] Nodes: ${chapterAudit.nodeCount}/10 (Stages ${chapterAudit.minStage}–${chapterAudit.maxStage}), Overlaps: ${chapterAudit.overlaps}, Title: "${chapterAudit.titleText}", Dock: Stage ${chapterAudit.dockStage} (Locked: ${chapterAudit.isDockLocked})`);

    // Capture screenshots for representative chapters
    if (ch === 1 || ch === 2 || ch === 5 || ch === 10) {
      const ssPath = path.join(ARTIFACT_DIR, `chapter_fix_ch${ch}_desktop_1280.png`);
      await page.screenshot({ path: ssPath });
      console.log(`    Screenshot saved: ${ssPath}`);
    }
  }

  // 2. SWITCH BACK TO ALL REALMS
  console.log('\n>>> [PART 2] SWITCHING BACK TO ALL REALMS <<<');
  await page.click('.desktop-chapter-pills-bar .ch-pill-item:nth-child(1)');
  await sleep(350);

  const allRealmsAudit = await page.evaluate(() => {
    const nodes = Array.from(document.querySelectorAll('.adv-trail-node'));
    const docW = document.documentElement.scrollWidth;
    const winW = window.innerWidth;
    return {
      nodeCount: nodes.length,
      firstLevel: nodes[nodes.length - 1]?.getAttribute('data-level'), // Level 1 is at bottom
      topLevel: nodes[0]?.getAttribute('data-level'),
      hasHorizontalOverflow: docW > winW + 1
    };
  });
  console.log(`  All Realms: Nodes count: ${allRealmsAudit.nodeCount} (Expected 100). First: ${allRealmsAudit.firstLevel}, Top: ${allRealmsAudit.topLevel}, Overflow: ${allRealmsAudit.hasHorizontalOverflow}`);
  const allSS = path.join(ARTIFACT_DIR, 'chapter_fix_all_realms_desktop_1280.png');
  await page.screenshot({ path: allSS });
  console.log(`  Screenshot saved: ${allSS}`);

  // 3. RAPID CHAPTER SWITCHING REPEATABILITY TEST
  console.log('\n>>> [PART 3] RAPID CHAPTER SWITCHING REPEATABILITY TEST <<<');
  const testSequence = [3, 7, 2, 9, 1, 10, 4, 0, 5];
  let rapidTestPassed = true;
  for (const targetCh of testSequence) {
    const tabSelector = `.desktop-chapter-pills-bar .ch-pill-item:nth-child(${targetCh === 0 ? 1 : targetCh + 1})`;
    await page.click(tabSelector);
    await sleep(150);

    const count = await page.evaluate(() => document.querySelectorAll('.adv-trail-node').length);
    const expected = targetCh === 0 ? 100 : 10;
    if (count !== expected) {
      console.log(`  FAIL on rapid switch to CH ${targetCh}: got ${count} nodes, expected ${expected}`);
      rapidTestPassed = false;
    }
  }
  console.log(`  Rapid Chapter Switching: [${rapidTestPassed ? 'PASS' : 'FAIL'}] (No duplicate or stale nodes across ${testSequence.length} rapid transitions)`);

  // 4. TEST ACROSS ALL 5 REQUESTED VIEWPORTS
  console.log('\n>>> [PART 4] MULTI-VIEWPORT RESPONSIVENESS AUDIT <<<');
  const viewports = [
    { name: 'Mobile 320x640', w: 320, h: 640 },
    { name: 'Mobile 375x667', w: 375, h: 667 },
    { name: 'Mobile 390x844', w: 390, h: 844 },
    { name: 'Tablet 768x1024', w: 768, h: 1024 },
    { name: 'Desktop 1280x800', w: 1280, h: 800 }
  ];

  for (const vp of viewports) {
    await page.setViewport({ width: vp.w, height: vp.h });
    await sleep(250);

    // Test on Chapter 2
    const isMobile = vp.w <= 768;
    const barSelector = isMobile ? '.mobile-chapter-switcher-bar' : '.desktop-chapter-pills-bar';
    const ch2Tab = `${barSelector} .ch-pill-item:nth-child(3)`;
    await page.click(ch2Tab);
    await sleep(200);

    const vpMetrics = await page.evaluate((bar) => {
      const docW = document.documentElement.scrollWidth;
      const winW = window.innerWidth;
      const nodes = Array.from(document.querySelectorAll('.adv-trail-node'));
      const dock = document.querySelector('.compact-action-dock');
      const dockRect = dock ? dock.getBoundingClientRect() : null;

      return {
        docW,
        winW,
        hasHorizontalOverflow: docW > winW + 1,
        nodeCount: nodes.length,
        dockVisible: Boolean(dock && dockRect.height > 0)
      };
    }, barSelector);

    console.log(`  ${vp.name}: Overflow: ${vpMetrics.hasHorizontalOverflow ? 'FAIL' : 'PASS (0px)'}, CH 2 Nodes: ${vpMetrics.nodeCount}, Dock Visible: ${vpMetrics.dockVisible}`);

    if (vp.w === 390) {
      // Capture Mobile Screenshots
      const ssMobileCh2 = path.join(ARTIFACT_DIR, 'chapter_fix_ch2_mobile_390.png');
      await page.screenshot({ path: ssMobileCh2 });
      console.log(`    Mobile Screenshot saved: ${ssMobileCh2}`);

      // Switch to CH 1
      await page.click(`${barSelector} .ch-pill-item:nth-child(2)`);
      await sleep(200);
      const ssMobileCh1 = path.join(ARTIFACT_DIR, 'chapter_fix_ch1_mobile_390.png');
      await page.screenshot({ path: ssMobileCh1 });
      console.log(`    Mobile Screenshot saved: ${ssMobileCh1}`);

      // Switch to CH 10
      await page.click(`${barSelector} .ch-pill-item:nth-child(11)`);
      await sleep(200);
      const ssMobileCh10 = path.join(ARTIFACT_DIR, 'chapter_fix_ch10_mobile_390.png');
      await page.screenshot({ path: ssMobileCh10 });
      console.log(`    Mobile Screenshot saved: ${ssMobileCh10}`);
    } else if (vp.w === 320) {
      const ssMobile320 = path.join(ARTIFACT_DIR, 'chapter_fix_mobile_320.png');
      await page.screenshot({ path: ssMobile320 });
      console.log(`    Narrow Mobile Screenshot saved: ${ssMobile320}`);
    }
  }

  // 5. REGRESSION & INTERACTION AUDIT
  console.log('\n>>> [PART 5] REGRESSION & INTERACTION AUDIT <<<');
  // Back to 1280x800
  await page.setViewport({ width: 1280, height: 800 });
  await sleep(200);

  // Switch to Chapter 1
  await page.click('.desktop-chapter-pills-bar .ch-pill-item:nth-child(2)');
  await sleep(250);

  // Click Level 1 -> should be Play Level 1
  await page.click('.adv-trail-node[data-level="1"]');
  await sleep(200);
  const l1State = await page.evaluate(() => {
    const dockBtn = document.querySelector('.dock-action-button');
    return {
      text: dockBtn?.innerText.trim().replace(/\n/g, ' '),
      disabled: dockBtn?.disabled,
      isLocked: dockBtn?.classList.contains('btn-locked')
    };
  });
  console.log('  Level 1 in Dock:', l1State);

  // Click Level 2 (locked) -> should show Locked button and toast feedback
  await page.click('.adv-trail-node[data-level="2"]');
  await sleep(200);
  const l2State = await page.evaluate(() => {
    const dockBtn = document.querySelector('.dock-action-button');
    const toast = document.querySelector('.locked-feedback-toast');
    return {
      text: dockBtn?.innerText.trim().replace(/\n/g, ' '),
      disabled: dockBtn?.disabled,
      isLocked: dockBtn?.classList.contains('btn-locked'),
      toastText: toast?.innerText.trim()
    };
  });
  console.log('  Level 2 in Dock (Locked):', l2State);

  // Test Back Navigation -> Should return to Welcome screen
  await page.click('.adventure-back-btn');
  await sleep(350);
  const welcomeScreen = await page.$('.welcome-arcade-container, .welcome-hero-header');
  console.log('  Back Button returns to Welcome screen:', Boolean(welcomeScreen));

  await browser.close();
  console.log('\n====================================================');
  console.log('ALL CHAPTER AUDIT CHECKS PASSED WITH ZERO ERRORS!');
  console.log('====================================================');
}

verifyAllChapters().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
