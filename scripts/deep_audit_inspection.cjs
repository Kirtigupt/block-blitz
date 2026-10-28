/**
 * Deep Audit Inspection Script for BLOCK BLITZ
 * Evaluates UI/UX, responsiveness, text clipping, horizontal overflow,
 * modal states, button hit areas, and visual consistency across all viewports.
 */

const puppeteer = require('puppeteer-core');
const path = require('path');
const dotenv = require('../server/node_modules/dotenv');
dotenv.config({ path: path.resolve(__dirname, '../server/.env') });

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:5173';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const VIEWPORTS = [
  { name: 'Desktop (1440x900)', width: 1440, height: 900 },
  { name: 'Desktop (1280x800)', width: 1280, height: 800 },
  { name: 'Tablet iPad Air (820x1180)', width: 820, height: 1180 },
  { name: 'Tablet iPad Portrait (768x1024)', width: 768, height: 1024 },
  { name: 'Tablet Landscape (1024x768)', width: 1024, height: 768 },
  { name: 'Mobile iPhone 12/13/14 (390x844)', width: 390, height: 844 },
  { name: 'Mobile iPhone SE (375x667)', width: 375, height: 667 },
  { name: 'Mobile Compact (360x740)', width: 360, height: 740 }
];

async function runAudit() {
  console.log('====================================================');
  console.log('BLOCK BLITZ COMPREHENSIVE DEEP AUDIT');
  console.log('====================================================');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  const issues = [];
  const warnings = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      issues.push(`Console Error: "${msg.text()}"`);
    } else if (msg.type() === 'warn') {
      warnings.push(`Console Warning: "${msg.text()}"`);
    }
  });

  page.on('pageerror', (err) => {
    issues.push(`Page Uncaught Exception: "${err.message}"`);
  });

  // Helper to check horizontal overflow and clipping on current page
  async function checkLayout(screenName, vp) {
    const metrics = await page.evaluate(() => {
      const doc = document.documentElement;
      const body = document.body;
      const scrollWidth = Math.max(doc.scrollWidth, body.scrollWidth);
      const clientWidth = doc.clientWidth;
      const hasHorizontalScroll = scrollWidth > clientWidth + 1;

      // Find any elements wider than window
      const overflowingElements = [];
      const allEls = document.querySelectorAll('*');
      for (const el of allEls) {
        const rect = el.getBoundingClientRect();
        if (rect.right > clientWidth + 2 && rect.width > 20) {
          overflowingElements.push({
            tag: el.tagName,
            className: el.className,
            id: el.id,
            right: rect.right,
            width: rect.width
          });
        }
      }

      return {
        scrollWidth,
        clientWidth,
        hasHorizontalScroll,
        overflowCount: overflowingElements.length,
        sampleOverflow: overflowingElements.slice(0, 3)
      };
    });

    if (metrics.hasHorizontalScroll) {
      issues.push(
        `[Horizontal Overflow] on ${screenName} at ${vp.name}: scrollWidth (${metrics.scrollWidth}px) > clientWidth (${metrics.clientWidth}px). Elements: ${JSON.stringify(
          metrics.sampleOverflow
        )}`
      );
    }
    return metrics;
  }

  // Helper to check button hit areas and accessibility
  async function checkButtonHitAreas(screenName, vp) {
    const smallButtons = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button, [role="button"]'));
      return btns
        .map((b) => {
          const rect = b.getBoundingClientRect();
          const visible = rect.width > 0 && rect.height > 0 && window.getComputedStyle(b).display !== 'none';
          return {
            text: (b.innerText || b.getAttribute('aria-label') || b.title || '').trim().slice(0, 25),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            visible
          };
        })
        .filter((b) => b.visible && (b.width < 30 || b.height < 30));
    });

    if (smallButtons.length > 0) {
      warnings.push(
        `[Small Touch Target] on ${screenName} at ${vp.name}: ${smallButtons.length} interactive elements < 30px (e.g. ${JSON.stringify(
          smallButtons.slice(0, 3)
        )})`
      );
    }
  }

  try {
    // ---------------------------------------------------------
    // SCREEN 1: Welcome Landing Screen across all Viewports
    // ---------------------------------------------------------
    console.log('\n--- Auditing Welcome Landing Screen ---');
    for (const vp of VIEWPORTS) {
      await page.setViewport({ width: vp.width, height: vp.height });
      await page.goto(APP_URL, { waitUntil: 'networkidle2' });
      await sleep(250);

      const isWelcomeVisible = await page.$('.welcome-landing-screen');
      if (!isWelcomeVisible) {
        issues.push(`Welcome Landing Screen failed to render at ${vp.name}`);
      }

      await checkLayout('Welcome Landing Screen', vp);
      await checkButtonHitAreas('Welcome Landing Screen', vp);
    }

    // ---------------------------------------------------------
    // SCREEN 2: Auth Modal across Viewports
    // ---------------------------------------------------------
    console.log('\n--- Auditing Auth Modal ---');
    for (const vp of [VIEWPORTS[0], VIEWPORTS[3], VIEWPORTS[5], VIEWPORTS[6]]) {
      await page.setViewport({ width: vp.width, height: vp.height });
      await page.goto(APP_URL, { waitUntil: 'networkidle2' });
      await sleep(200);

      // Click Sign In on welcome landing screen
      const signInBtn = await page.$('.welcome-signin-btn');
      if (signInBtn) {
        await signInBtn.click();
        await sleep(250);
        await checkLayout('Auth Modal', vp);

        // Switch to Create Account tab
        const tabs = await page.$$('.auth-tab');
        if (tabs.length >= 2) {
          await tabs[1].click();
          await sleep(200);
          await checkLayout('Auth Modal (Create Account Tab)', vp);
        }
      }
    }

    // ---------------------------------------------------------
    // SCREEN 3: Level Map across Viewports
    // ---------------------------------------------------------
    console.log('\n--- Auditing Campaign Level Map ---');
    for (const vp of VIEWPORTS) {
      await page.setViewport({ width: vp.width, height: vp.height });
      await page.goto(APP_URL, { waitUntil: 'networkidle2' });
      await sleep(200);

      // Click "Play Now" -> Auth modal -> Continue as Guest -> Level Map
      const playNowBtn = await page.$('.welcome-play-now-btn');
      if (playNowBtn) {
        await playNowBtn.click();
        await sleep(250);

        const guestBtn = await page.$('.guest-continue-btn');
        if (guestBtn) {
          await guestBtn.click();
          await sleep(400);

          await checkLayout('Campaign Level Map', vp);
          await checkButtonHitAreas('Campaign Level Map', vp);

          // Test Chapter Navigation Pill click
          const chTabs = await page.$$('.chapter-tab-pill');
          if (chTabs.length > 2) {
            await chTabs[1].click(); // Chapter 1
            await sleep(250);
            await checkLayout('Campaign Level Map (Chapter 1 Filtered)', vp);
          }
        }
      }
    }

    // ---------------------------------------------------------
    // SCREEN 4: Gameplay Screen & Game Board across Viewports
    // ---------------------------------------------------------
    console.log('\n--- Auditing Gameplay Board & Tray ---');
    for (const vp of VIEWPORTS) {
      await page.setViewport({ width: vp.width, height: vp.height });
      await page.goto(APP_URL, { waitUntil: 'networkidle2' });
      await sleep(200);

      // Launch Level 1
      await page.click('.welcome-play-now-btn');
      await sleep(250);
      const guestBtn = await page.$('.guest-continue-btn');
      if (guestBtn) await guestBtn.click();
      await sleep(300);

      // In Level Map, click start level
      const launchBtn = await page.$('.dock-launch-btn');
      if (launchBtn) {
        await launchBtn.click();
        await sleep(200);

        // Intro modal is up
        await checkLayout('Level Intro Modal', vp);

        // Let intro complete or click start
        const startIntroBtn = await page.$('.intro-start-btn');
        if (startIntroBtn) {
          await startIntroBtn.click();
        }
        await sleep(500);

        // Now in active gameplay
        await checkLayout('Active Gameplay Board', vp);
        await checkButtonHitAreas('Active Gameplay Board', vp);

        // Check if board grid and tray are visible within viewport
        const boardVisibility = await page.evaluate(() => {
          const grid = document.querySelector('.game-grid');
          const tray = document.querySelector('.block-tray');

          const gridRect = grid?.getBoundingClientRect();
          const trayRect = tray?.getBoundingClientRect();

          const vh = window.innerHeight;
          const vw = window.innerWidth;

          return {
            gridVisible: gridRect && gridRect.top >= 0 && gridRect.bottom <= vh,
            trayVisible: trayRect && trayRect.top >= 0 && trayRect.bottom <= vh,
            gridDimensions: gridRect ? { w: gridRect.width, h: gridRect.height } : null,
            trayDimensions: trayRect ? { w: trayRect.width, h: trayRect.height } : null,
            viewport: { vw, vh }
          };
        });

        if (!boardVisibility.trayVisible) {
          warnings.push(
            `[Vertical Fit] at ${vp.name}: Block Tray extends beyond viewport height (${boardVisibility.viewport.vh}px). Player may need to scroll to reach pieces.`
          );
        }
      }
    }

    // ---------------------------------------------------------
    // SCREEN 5: Modals (Settings, Leaderboard, Exit, How To Play)
    // ---------------------------------------------------------
    console.log('\n--- Auditing In-Game Modals ---');
    for (const vp of [VIEWPORTS[0], VIEWPORTS[3], VIEWPORTS[5]]) {
      await page.setViewport({ width: vp.width, height: vp.height });
      await page.goto(APP_URL, { waitUntil: 'networkidle2' });
      await sleep(200);

      // Open Level 1 to access in-game header
      await page.click('.welcome-play-now-btn');
      await sleep(200);
      const guestBtn = await page.$('.guest-continue-btn');
      if (guestBtn) await guestBtn.click();
      await sleep(300);
      const launchBtn = await page.$('.dock-launch-btn');
      if (launchBtn) await launchBtn.click();
      await sleep(300);
      const startIntroBtn = await page.$('.intro-start-btn');
      if (startIntroBtn) await startIntroBtn.click();
      await sleep(400);

      // Test 5A: Settings Modal
      const settingsBtn = await page.$('.settings-btn');
      if (settingsBtn) {
        await settingsBtn.click();
        await sleep(250);
        await checkLayout('Settings Modal', vp);
        // Close settings
        const closeBtn = await page.$('.settings-close-btn');
        if (closeBtn) await closeBtn.click();
        await sleep(200);
      }

      // Test 5B: Leaderboard Modal
      const leaderBtn = await page.$('.leaderboard-btn');
      if (leaderBtn) {
        await leaderBtn.click();
        await sleep(350);
        await checkLayout('Leaderboard Modal', vp);
        // Close leaderboard
        const closeBtn = await page.$('.leaderboard-close-btn');
        if (closeBtn) await closeBtn.click();
        await sleep(200);
      }

      // Test 5C: How To Play Modal
      const helpBtn = await page.$('.help-btn');
      if (helpBtn) {
        await helpBtn.click();
        await sleep(250);
        await checkLayout('How to Play Modal', vp);
        const gotItBtn = await page.$('.got-it-btn');
        if (gotItBtn) await gotItBtn.click();
        await sleep(200);
      }

      // Test 5D: Exit Confirmation Modal
      const exitBtn = await page.$('.exit-btn');
      if (exitBtn) {
        await exitBtn.click();
        await sleep(250);
        await checkLayout('Exit Confirm Modal', vp);
        const cancelExit = await page.$('.exit-btn-continue');
        if (cancelExit) await cancelExit.click();
        await sleep(200);
      }
    }

    // ---------------------------------------------------------
    // RESULTS & ANALYSIS
    // ---------------------------------------------------------
    console.log('\n====================================================');
    console.log('AUDIT FINDINGS SUMMARY');
    console.log('====================================================');
    console.log(`Confirmed Issues Found: ${issues.length}`);
    issues.forEach((iss, i) => console.log(`  [ISSUE ${i + 1}] ${iss}`));

    console.log(`\nPotential Warnings / UX Polish Items: ${warnings.length}`);
    warnings.forEach((w, i) => console.log(`  [WARN ${i + 1}] ${w}`));
  } catch (err) {
    console.error('Audit script exception:', err);
  } finally {
    await browser.close();
  }
}

runAudit();
