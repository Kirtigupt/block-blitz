const puppeteer = require('puppeteer-core');
const assert = require('assert');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:5173';
const ARTIFACT_DIR = 'C:\\Users\\kirti\\.gemini\\antigravity\\brain\\3ac25ba8-43d2-4529-867b-c5d5adc7cb54';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const DESKTOP_VIEWPORTS = [
  { width: 768, height: 1024, name: '768x1024_tablet' },
  { width: 1024, height: 768, name: '1024x768_small_laptop' },
  { width: 1280, height: 800, name: '1280x800_laptop' },
  { width: 1366, height: 768, name: '1366x768_hd_laptop' },
  { width: 1440, height: 900, name: '1440x900_macbook' },
  { width: 1920, height: 1080, name: '1920x1080_desktop' }
];

async function run() {
  console.log('========================================================================');
  console.log('BLOCK BLITZ — DESKTOP / LAPTOP HUD LAYOUT AUDIT');
  console.log('========================================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  for (const vp of DESKTOP_VIEWPORTS) {
    console.log(`------------------------------------------------------------------------`);
    console.log(`>>> Testing Viewport: ${vp.name} (${vp.width}x${vp.height}) <<<`);
    console.log(`------------------------------------------------------------------------`);

    await page.setViewport({ width: vp.width, height: vp.height });
    await page.goto(APP_URL, { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload({ waitUntil: 'networkidle0' });
    await sleep(350);

    // Welcome -> Guest -> Level Map -> Start Level 1
    const playBtn = await page.$('.welcome-play-now-btn');
    if (playBtn) await playBtn.click();
    await sleep(250);
    const guestBtn = await page.$('.guest-continue-btn');
    if (guestBtn) await guestBtn.click();
    await sleep(350);

    const launchBtn = await page.$('.adventure-play-btn, .dock-action-button');
    if (launchBtn) await launchBtn.click();
    await sleep(250);

    const introStartBtn = await page.$('.intro-start-btn');
    if (introStartBtn) await introStartBtn.click();
    await sleep(400);

    await page.waitForSelector('.hud-gameplay-header', { timeout: 6000 });
    await sleep(250);

    const metrics = await page.evaluate(() => {
      const doc = document.documentElement;
      const top = document.querySelector('.header-top');
      const logo = document.querySelector('.logo-badge');
      const stage = document.querySelector('.level-badge-pill');
      const account = document.querySelector('.header-group-account');
      const tools = document.querySelector('.header-tools-cluster');
      const board = document.querySelector('.score-board');
      const obj = document.querySelector('.level-objective-panel');
      const grid = document.querySelector('.grid-container');
      const tray = document.querySelector('.block-tray-container');

      const r = (el) => {
        if (!el) return null;
        const b = el.getBoundingClientRect();
        return {
          left: Math.round(b.left),
          right: Math.round(b.right),
          top: Math.round(b.top),
          bottom: Math.round(b.bottom),
          width: Math.round(b.width),
          height: Math.round(b.height)
        };
      };

      const topR = r(top);
      const logoR = r(logo);
      const stageR = r(stage);
      const accR = r(account);
      const toolsR = r(tools);
      const boardR = r(board);
      const objR = r(obj);
      const gridR = r(grid);
      const trayR = r(tray);

      return {
        hasHScroll: doc.scrollWidth > doc.clientWidth,
        scrollW: doc.scrollWidth,
        clientW: doc.clientWidth,
        topR,
        logoR,
        stageR,
        accR,
        toolsR,
        boardR,
        objR,
        gridR,
        trayR,
        // Left section sequence: Logo -> Stage -> Account
        leftSequenceValid: logoR && stageR && accR ? (logoR.right <= stageR.left + 1 && stageR.right <= accR.left + 1) : false,
        // Separation between left section (Account) and right section (Tools)
        sectionSeparation: accR && toolsR ? Math.round(toolsR.left - accR.right) : 0,
        // Tools inside header-top
        toolsContained: topR && toolsR ? toolsR.right <= topR.right + 2 : false,
        // Top bar fits required height <= 48px
        headerHeightOk: topR ? topR.height <= 48 : false,
        // Tray bottom fits viewport height
        fitsViewportHeight: trayR ? trayR.bottom <= window.innerHeight + 10 : false
      };
    });

    console.log(`  [Overflow Check] scrollWidth: ${metrics.scrollW}px, clientWidth: ${metrics.clientW}px, hasScroll: ${metrics.hasHScroll}`);
    assert.strictEqual(metrics.hasHScroll, false, `${vp.name}: Must have zero horizontal scroll`);

    console.log(`  [Header Dimensions] Height: ${metrics.topR?.height}px, Width: ${metrics.topR?.width}px`);
    assert.strictEqual(metrics.headerHeightOk, true, `${vp.name}: Header height must be <= 48px`);

    console.log(`  [Left Section] Logo (r:${metrics.logoR?.right}) -> Stage (l:${metrics.stageR?.left}, r:${metrics.stageR?.right}) -> Account (l:${metrics.accR?.left}, r:${metrics.accR?.right})`);
    assert.strictEqual(metrics.leftSequenceValid, true, `${vp.name}: Left section must order Logo -> Stage -> Account`);

    console.log(`  [Separation] Left-to-Right separation: ${metrics.sectionSeparation}px`);
    assert.ok(metrics.sectionSeparation >= 15, `${vp.name}: Must have ample breathing room between Left and Right sections`);

    console.log(`  [Right Section] Tools cluster right edge: ${metrics.toolsR?.right}px <= Header right: ${metrics.topR?.right}px`);
    assert.strictEqual(metrics.toolsContained, true, `${vp.name}: Tools must not exceed header right edge`);

    console.log(`  [Vertical Fit] Tray bottom: ${metrics.trayR?.bottom}px vs Viewport height: ${vp.height}px`);
    assert.strictEqual(metrics.fitsViewportHeight, true, `${vp.name}: All gameplay elements must fit vertically`);

    // Capture screenshot if required by user
    if (['1024x768_small_laptop', '1280x800_laptop', '1366x768_hd_laptop', '1440x900_macbook'].includes(vp.name)) {
      const shotPath = path.join(ARTIFACT_DIR, `desktop_hud_${vp.width}x${vp.height}.png`);
      await page.screenshot({ path: shotPath });
      console.log(`  📸 Captured Screenshot: ${shotPath}`);
    }
  }

  // Also capture mobile 390x844 screenshot
  console.log(`\n------------------------------------------------------------------------`);
  console.log(`>>> Capturing Mobile Reference (390x844) <<<`);
  console.log(`------------------------------------------------------------------------`);
  await page.setViewport({ width: 390, height: 844 });
  await page.goto(APP_URL, { waitUntil: 'networkidle0' });
  await sleep(400);

  const playBtn = await page.$('.welcome-play-now-btn');
  if (playBtn) await playBtn.click();
  await sleep(250);
  const guestBtn = await page.$('.guest-continue-btn');
  if (guestBtn) await guestBtn.click();
  await sleep(350);
  const launchBtn = await page.$('.adventure-play-btn, .dock-action-button');
  if (launchBtn) await launchBtn.click();
  await sleep(250);
  const introStartBtn = await page.$('.intro-start-btn');
  if (introStartBtn) await introStartBtn.click();
  await sleep(400);

  const mobShotPath = path.join(ARTIFACT_DIR, 'desktop_hud_390x844.png');
  await page.screenshot({ path: mobShotPath });
  console.log(`  📸 Captured Mobile Screenshot: ${mobShotPath}`);

  await browser.close();
  console.log('\n========================================================================');
  console.log('ALL DESKTOP & LAPTOP AUDIT CHECKS PASSED 100%! ✓');
  console.log('========================================================================\n');
}

run().catch((err) => {
  console.error('Audit Failure:', err);
  process.exit(1);
});
