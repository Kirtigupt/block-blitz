const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:5173';
const ARTIFACT_DIR = 'C:\\Users\\kirti\\.gemini\\antigravity\\brain\\3ac25ba8-43d2-4529-867b-c5d5adc7cb54';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const VIEWPORTS = [
  { name: 'Mobile 320x640', width: 320, height: 640 },
  { name: 'Mobile 360x740', width: 360, height: 740 },
  { name: 'Mobile 375x667', width: 375, height: 667 },
  { name: 'Mobile 390x844', width: 390, height: 844 },
  { name: 'Mobile 430x932', width: 430, height: 932 },
  { name: 'Tablet 768x1024', width: 768, height: 1024 },
  { name: 'Desktop 1024x768', width: 1024, height: 768 },
  { name: 'Desktop 1280x800', width: 1280, height: 800 }
];

async function inspectHUD() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Initial load
  await page.setViewport({ width: 390, height: 844 });
  await page.goto(APP_URL, { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload({ waitUntil: 'networkidle0' });
  await sleep(400);

  // Welcome -> Map -> Start Level 1
  const playBtn = await page.$('.welcome-play-now-btn');
  if (playBtn) {
    await playBtn.click();
    await sleep(300);
    const guestBtn = await page.$('.guest-continue-btn');
    if (guestBtn) await guestBtn.click();
    await sleep(400);
  }

  const launchBtn = await page.$('.adventure-play-btn, .dock-action-button');
  if (launchBtn) {
    await launchBtn.click();
    await sleep(300);
  }

  const introStartBtn = await page.$('.intro-start-btn');
  if (introStartBtn) {
    await introStartBtn.click();
    await sleep(500);
  }

  await page.waitForSelector('.hud-gameplay-header', { timeout: 6000 });
  await sleep(400);

  console.log('--- HUD VIEWPORT INSPECTION REPORT ---');

  for (const vp of VIEWPORTS) {
    await page.setViewport({ width: vp.width, height: vp.height });
    await sleep(300);

    const metrics = await page.evaluate(() => {
      const doc = document.documentElement;
      const body = document.body;
      const scrollW = Math.max(doc.scrollWidth, body.scrollWidth);
      const innerW = window.innerWidth;
      const hasHorizontalOverflow = scrollW > innerW + 1;

      const header = document.querySelector('.hud-gameplay-header');
      const cmdBar = document.querySelector('.hud-command-bar');
      const scoreboard = document.querySelector('.hero-scoreboard-console');
      const missionHud = document.querySelector('.mission-control-hud');
      const grid = document.querySelector('.grid-container');
      const tray = document.querySelector('.block-tray');

      const getRect = (el) => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { top: Math.round(r.top), bottom: Math.round(r.bottom), width: Math.round(r.width), height: Math.round(r.height) };
      };

      return {
        innerW,
        innerH: window.innerHeight,
        scrollW,
        hasHorizontalOverflow,
        header: getRect(header),
        cmdBar: getRect(cmdBar),
        scoreboard: getRect(scoreboard),
        missionHud: getRect(missionHud),
        grid: getRect(grid),
        tray: getRect(tray)
      };
    });

    console.log(`\n[${vp.name}]:`);
    console.log(`  Horizontal overflow: ${metrics.hasHorizontalOverflow ? 'FAIL (' + metrics.scrollW + 'px > ' + metrics.innerW + 'px)' : 'PASS (No overflow)'}`);
    console.log(`  Command bar: w=${metrics.cmdBar?.width}px, h=${metrics.cmdBar?.height}px`);
    console.log(`  Scoreboard: w=${metrics.scoreboard?.width}px, h=${metrics.scoreboard?.height}px`);
    console.log(`  Mission HUD: w=${metrics.missionHud?.width}px, h=${metrics.missionHud?.height}px`);
    console.log(`  Grid: w=${metrics.grid?.width}px, h=${metrics.grid?.height}px (top=${metrics.grid?.top}px)`);
    console.log(`  Tray: w=${metrics.tray?.width}px, h=${metrics.tray?.height}px (bottom=${metrics.tray?.bottom}px vs windowH=${metrics.innerH}px)`);

    // Capture screenshots for representative sizes
    if (vp.width === 320 || vp.width === 390 || vp.width === 768 || vp.width === 1280) {
      const ssPath = path.join(ARTIFACT_DIR, `hud_inspection_${vp.width}x${vp.height}.png`);
      await page.screenshot({ path: ssPath });
      console.log(`  Screenshot saved: ${ssPath}`);
    }
  }

  await browser.close();
  console.log('\nHUD Viewport Inspection Completed!');
}

inspectHUD().catch(err => {
  console.error('Inspection failed:', err);
  process.exit(1);
});
