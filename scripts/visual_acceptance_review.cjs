const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:5173';
const ARTIFACT_DIR = 'C:\\Users\\kirti\\.gemini\\antigravity\\brain\\3ac25ba8-43d2-4529-867b-c5d5adc7cb54';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const VIEWPORTS = [
  { name: 'Mobile iPhone SE', width: 375, height: 667, tag: '375x667' },
  { name: 'Mobile iPhone 12/13/14', width: 390, height: 844, tag: '390x844' },
  { name: 'Tablet Portrait', width: 768, height: 1024, tag: '768x1024' },
  { name: 'Desktop Standard', width: 1280, height: 800, tag: '1280x800' }
];

async function runVisualAudit() {
  console.log('========================================================================');
  console.log('BLOCK BLITZ — PHASE 1 VISUAL ACCEPTANCE REVIEW');
  console.log('========================================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const report = {
    viewportsChecked: [],
    chaptersChecked: [],
    issuesFound: [],
    checksPassed: []
  };

  try {
    for (const vp of VIEWPORTS) {
      console.log(`\n------------------------------------------------------------------------`);
      console.log(`AUDITING VIEWPORT: ${vp.name} (${vp.tag})`);
      console.log(`------------------------------------------------------------------------`);
      await page.setViewport({ width: vp.width, height: vp.height });

      // 1. Visit Welcome landing page
      await page.goto(APP_URL, { waitUntil: 'networkidle0' });
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      await page.reload({ waitUntil: 'networkidle0' });
      await sleep(350);

      // Verify Welcome page rendered
      const welcomeScreen = await page.$('.welcome-landing-screen');
      if (!welcomeScreen) {
        report.issuesFound.push(`${vp.tag}: Welcome landing screen not found`);
      } else {
        report.checksPassed.push(`${vp.tag}: Welcome landing screen rendered successfully`);
      }

      // Click PLAY NOW -> Continue as Guest -> Navigate to Adventure Map
      const playNowBtn = await page.$('.welcome-play-now-btn');
      if (playNowBtn) {
        await playNowBtn.click();
        await sleep(300);
        const guestBtn = await page.$('.guest-continue-btn');
        if (guestBtn) {
          await guestBtn.click();
          await sleep(400);
        }
      }

      // Check Adventure Map rendered
      const mapScreen = await page.$('.adventure-map-screen');
      if (!mapScreen) {
        report.issuesFound.push(`${vp.tag}: Adventure Map screen not found`);
        continue;
      }

      // Check horizontal overflow
      const overflow = await page.evaluate(() => {
        const doc = document.documentElement;
        return {
          scrollWidth: doc.scrollWidth,
          clientWidth: doc.clientWidth,
          hasHorizontalScroll: doc.scrollWidth > doc.clientWidth
        };
      });

      if (overflow.hasHorizontalScroll) {
        report.issuesFound.push(`${vp.tag}: Horizontal scroll detected (${overflow.scrollWidth}px > ${overflow.clientWidth}px)`);
      } else {
        report.checksPassed.push(`${vp.tag}: Zero horizontal page scrolling (${overflow.scrollWidth}px == ${overflow.clientWidth}px)`);
      }

      // Screenshot 1: All Stages View (Initial / Top)
      const shotAllTop = path.join(ARTIFACT_DIR, `audit_${vp.tag}_all_stages_top.png`);
      await page.screenshot({ path: shotAllTop });
      console.log(`  📸 Screenshot saved: audit_${vp.tag}_all_stages_top.png`);

      // Scroll to bottom of scroll container to see base stages and dock
      await page.evaluate(() => {
        const container = document.querySelector('.adventure-scroll-container');
        if (container) container.scrollTop = container.scrollHeight;
      });
      await sleep(250);

      // Screenshot 2: All Stages View (Scrolled to bottom)
      const shotAllBottom = path.join(ARTIFACT_DIR, `audit_${vp.tag}_all_stages_bottom.png`);
      await page.screenshot({ path: shotAllBottom });
      console.log(`  📸 Screenshot saved: audit_${vp.tag}_all_stages_bottom.png`);

      // Check Dock visibility and dimensions
      const dockMetrics = await page.evaluate(() => {
        const dock = document.querySelector('.compact-action-dock');
        if (!dock) return null;
        const rect = dock.getBoundingClientRect();
        const titleEl = dock.querySelector('.dock-stage-title');
        const btn = dock.querySelector('.dock-action-button');
        const btnRect = btn ? btn.getBoundingClientRect() : null;

        return {
          dockHeight: rect.height,
          dockTop: rect.top,
          titleText: titleEl ? titleEl.textContent.trim() : '',
          btnText: btn ? btn.textContent.trim() : '',
          btnWidth: btnRect ? btnRect.width : 0,
          btnHeight: btnRect ? btnRect.height : 0
        };
      });

      if (!dockMetrics) {
        report.issuesFound.push(`${vp.tag}: Compact action dock not found`);
      } else {
        if (dockMetrics.dockHeight > 95) {
          report.issuesFound.push(`${vp.tag}: Dock height too large (${dockMetrics.dockHeight}px > 95px)`);
        } else {
          report.checksPassed.push(`${vp.tag}: Dock height within limit (${Math.round(dockMetrics.dockHeight)}px <= 95px)`);
        }
        if (dockMetrics.btnHeight < 40) {
          report.issuesFound.push(`${vp.tag}: Action button too small (${dockMetrics.btnHeight}px < 40px)`);
        } else {
          report.checksPassed.push(`${vp.tag}: Action button meets touch target (${Math.round(dockMetrics.btnWidth)}x${Math.round(dockMetrics.btnHeight)}px)`);
        }
      }

      // Check Chapter Navigation visibility
      const navVisibility = await page.evaluate((mobile) => {
        const desktopBar = document.querySelector('.desktop-chapter-pills-bar');
        const mobileBar = document.querySelector('.mobile-chapter-switcher-bar');
        const dStyle = desktopBar ? window.getComputedStyle(desktopBar).display : 'none';
        const mStyle = mobileBar ? window.getComputedStyle(mobileBar).display : 'none';
        return {
          desktopVisible: dStyle !== 'none',
          mobileVisible: mStyle !== 'none'
        };
      }, vp.width <= 768);

      if (vp.width <= 768) {
        if (!navVisibility.mobileVisible) report.issuesFound.push(`${vp.tag}: Mobile switcher bar should be visible`);
        if (navVisibility.desktopVisible) report.issuesFound.push(`${vp.tag}: Desktop pills bar should be hidden`);
      } else {
        if (!navVisibility.desktopVisible) report.issuesFound.push(`${vp.tag}: Desktop pills bar should be visible`);
        if (navVisibility.mobileVisible) report.issuesFound.push(`${vp.tag}: Mobile switcher bar should be hidden`);
      }

      // Check each chapter view on this viewport
      const chaptersToInspect = [1, 2, 5, 10];
      for (const chNum of chaptersToInspect) {
        await page.evaluate((ch) => {
          // Find the pill for this chapter
          const selector = window.innerWidth <= 768 ? '.mobile-chapter-switcher-bar .ch-pill-item' : '.desktop-chapter-pills-bar .ch-pill-item';
          const pills = document.querySelectorAll(selector);
          // index 0 is All, index ch is Chapter ch
          if (pills[ch]) pills[ch].click();
        }, chNum);
        await sleep(300);

        // Verify chapter view content
        const chViewData = await page.evaluate(() => {
          const headerName = document.querySelector('.header-strip-name');
          const tiles = document.querySelectorAll('.chapter-stage-tile');
          const container = document.querySelector('.chapter-view-container');
          return {
            headerText: headerName ? headerName.textContent.trim() : '',
            tilesCount: tiles.length,
            hasContainer: !!container
          };
        });

        const shotCh = path.join(ARTIFACT_DIR, `audit_${vp.tag}_ch${chNum}.png`);
        await page.screenshot({ path: shotCh });
        console.log(`  📸 Screenshot saved: audit_${vp.tag}_ch${chNum}.png (Chapter ${chNum}: "${chViewData.headerText}")`);

        if (chViewData.tilesCount !== 10) {
          report.issuesFound.push(`${vp.tag} Ch ${chNum}: Expected 10 tiles, found ${chViewData.tilesCount}`);
        } else {
          report.checksPassed.push(`${vp.tag} Ch ${chNum}: Exactly 10 stages displayed with header "${chViewData.headerText}"`);
        }
      }

      // Reset to All Stages
      await page.evaluate(() => {
        const selector = window.innerWidth <= 768 ? '.mobile-chapter-switcher-bar .ch-pill-item' : '.desktop-chapter-pills-bar .ch-pill-item';
        const pills = document.querySelectorAll(selector);
        if (pills[0]) pills[0].click();
      });
      await sleep(250);

      report.viewportsChecked.push(vp.name);
    }

    // -----------------------------------------------------------------------
    // INTERACTION AUDIT: Locked stages, current marker, launch flow
    // -----------------------------------------------------------------------
    console.log(`\n------------------------------------------------------------------------`);
    console.log(`INTERACTION AUDIT ON MOBILE (390x844)`);
    console.log(`------------------------------------------------------------------------`);
    await page.setViewport({ width: 390, height: 844 });
    await page.goto(APP_URL, { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload({ waitUntil: 'networkidle0' });
    await sleep(300);

    await page.click('.welcome-play-now-btn');
    await sleep(300);
    const guestBtn = await page.$('.guest-continue-btn');
    if (guestBtn) await guestBtn.click();
    await sleep(400);

    // 1. Verify Level 1 has pointer marker
    const lvl1HasPointer = await page.evaluate(() => {
      const tile = document.querySelector('.adventure-block[aria-label*="Level 1:"]');
      return !!tile && !!tile.querySelector('.adventure-pointer-marker');
    });
    if (!lvl1HasPointer) {
      report.issuesFound.push('Level 1 missing active origami pointer marker on fresh start');
    } else {
      report.checksPassed.push('Level 1 active origami pointer marker confirmed');
    }

    // 2. Click locked Level 10
    await page.evaluate(() => {
      const b10 = document.querySelector('.adventure-block[aria-label*="Level 10:"]');
      if (b10) b10.click();
    });
    await sleep(250);

    const lockedCheck = await page.evaluate(() => {
      const btn = document.querySelector('.dock-action-button');
      const toast = document.querySelector('.locked-feedback-toast');
      return {
        disabled: btn ? btn.disabled : false,
        btnText: btn ? btn.textContent.trim() : '',
        toastText: toast ? toast.textContent.trim() : null
      };
    });

    if (!lockedCheck.disabled) {
      report.issuesFound.push('Action button is NOT disabled when locked Level 10 is tapped');
    } else {
      report.checksPassed.push(`Action button disabled for locked level (Text: "${lockedCheck.btnText}")`);
    }

    if (!lockedCheck.toastText || !lockedCheck.toastText.includes('Stage 10 is locked')) {
      report.issuesFound.push(`Locked feedback toast missing or incorrect (Found: "${lockedCheck.toastText}")`);
    } else {
      report.checksPassed.push(`Locked feedback toast shown: "${lockedCheck.toastText}"`);
    }

    // Screenshot locked feedback state
    const shotLocked = path.join(ARTIFACT_DIR, 'audit_locked_feedback_390x844.png');
    await page.screenshot({ path: shotLocked });
    console.log('  📸 Screenshot saved: audit_locked_feedback_390x844.png');

    // 3. Click back to Level 1 and verify button enables
    await page.evaluate(() => {
      const b1 = document.querySelector('.adventure-block[aria-label*="Level 1:"]');
      if (b1) b1.click();
    });
    await sleep(200);

    const unlockedCheck = await page.evaluate(() => {
      const btn = document.querySelector('.dock-action-button');
      return {
        disabled: btn ? btn.disabled : true,
        btnText: btn ? btn.textContent.trim() : ''
      };
    });

    if (unlockedCheck.disabled) {
      report.issuesFound.push('Action button remains disabled when Level 1 is selected');
    } else {
      report.checksPassed.push(`Action button enabled for Level 1 (Text: "${unlockedCheck.btnText}")`);
    }

    // Click launch button -> Verify game board opens
    await page.click('.dock-action-button');
    await sleep(600);
    const gameBoardOpened = await page.evaluate(() => {
      return !!document.querySelector('.level-intro-card, .grid-container, .game-container, .game-board');
    });

    if (!gameBoardOpened) {
      report.issuesFound.push('Clicking action button failed to launch level into gameplay screen');
    } else {
      report.checksPassed.push('Clicking action button successfully launches the level');
    }

    console.log('\n========================================================================');
    console.log(`AUDIT SUMMARY: ${report.checksPassed.length} checks passed, ${report.issuesFound.length} issues found`);
    console.log('========================================================================');

    if (report.issuesFound.length > 0) {
      console.log('\nISSUES FOUND:');
      report.issuesFound.forEach((iss) => console.log(`  ❌ ${iss}`));
    } else {
      console.log('\nALL VISUAL AND INTERACTIVE ACCEPTANCE CRITERIA MET WITH ZERO DEFECTS! ✓');
    }

  } finally {
    await browser.close();
  }
}

runVisualAudit().catch((err) => {
  console.error('Audit execution error:', err);
  process.exit(1);
});
