const puppeteer = require('puppeteer-core');
const path = require('path');

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

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  try {
    for (const vp of VIEWPORTS) {
      await page.setViewport({ width: vp.width, height: vp.height });
      await page.goto(APP_URL, { waitUntil: 'networkidle0' });
      await sleep(300);

      // Welcome -> Guest -> Level Map
      const playBtn = await page.$('.welcome-play-now-btn');
      if (playBtn) {
        await playBtn.click();
        await sleep(300);
        const guestBtn = await page.$('.guest-continue-btn');
        if (guestBtn) await guestBtn.click();
        await sleep(400);
      }

      // Launch Level 1 from Level Map
      const launchBtn = await page.$('.adventure-play-btn, .dock-action-button');
      if (launchBtn) {
        await launchBtn.click();
        await sleep(300);
      }

      // Click "START GAME" in Level Intro Modal if present
      const introStartBtn = await page.$('.intro-start-btn');
      if (introStartBtn) {
        await introStartBtn.click();
        await sleep(400);
      } else {
        // Wait for auto-dismiss timer
        await sleep(1500);
      }

      // Wait for grid to be rendered and visible
      await page.waitForSelector('.grid-container', { timeout: 6000 });
      await sleep(400);

      const shotPath = path.join(ARTIFACT_DIR, `gameplay_board_${vp.tag}.png`);
      await page.screenshot({ path: shotPath });
      console.log(`Saved screenshot: gameplay_board_${vp.tag}.png`);

      // Evaluate geometry and measurements
      const metrics = await page.evaluate(() => {
        const doc = document.documentElement;
        const grid = document.querySelector('.grid-container');
        const gridRect = grid ? grid.getBoundingClientRect() : null;
        const tray = document.querySelector('.block-tray-container');
        const trayRect = tray ? tray.getBoundingClientRect() : null;
        const header = document.querySelector('.game-header');
        const headerRect = header ? header.getBoundingClientRect() : null;
        const playfield = document.querySelector('.game-playfield');
        const playfieldRect = playfield ? playfield.getBoundingClientRect() : null;

        return {
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
          scrollWidth: doc.scrollWidth,
          clientWidth: doc.clientWidth,
          hasHorizontalScroll: doc.scrollWidth > doc.clientWidth,
          gridWidth: gridRect ? Math.round(gridRect.width) : 0,
          gridHeight: gridRect ? Math.round(gridRect.height) : 0,
          gridTop: gridRect ? Math.round(gridRect.top) : 0,
          trayHeight: trayRect ? Math.round(trayRect.height) : 0,
          trayTop: trayRect ? Math.round(trayRect.top) : 0,
          trayBottom: trayRect ? Math.round(trayRect.bottom) : 0,
          headerHeight: headerRect ? Math.round(headerRect.height) : 0,
          playfieldHeight: playfieldRect ? Math.round(playfieldRect.height) : 0
        };
      });

      console.log(`  [${vp.name}] Grid: ${metrics.gridWidth}x${metrics.gridHeight}px (top: ${metrics.gridTop}), Header: ${metrics.headerHeight}px, Tray: ${metrics.trayHeight}px (bottom: ${metrics.trayBottom} of ${metrics.viewportHeight}px), Overflow: ${metrics.hasHorizontalScroll}`);
    }
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
