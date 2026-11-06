const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:5173';
const ARTIFACT_DIR = 'C:\\Users\\kirti\\.gemini\\antigravity\\brain\\3ac25ba8-43d2-4529-867b-c5d5adc7cb54';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function captureChapterBug() {
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

  // Welcome -> Map
  const playBtn = await page.$('.welcome-play-now-btn');
  if (playBtn) { await playBtn.click(); await sleep(300); }
  const guestBtn = await page.$('.guest-continue-btn');
  if (guestBtn) { await guestBtn.click(); await sleep(300); }

  await page.waitForSelector('.adventure-map-screen', { timeout: 6000 });
  await sleep(400);

  // Take screenshot of All Realms (default)
  const defaultSS = path.join(ARTIFACT_DIR, 'chapter_bug_default_all.png');
  await page.screenshot({ path: defaultSS });
  console.log('Saved default All Realms screenshot:', defaultSS);

  // Click Chapter 1 tab
  console.log('Clicking Chapter 1 tab...');
  const ch1Btn = await page.$('.desktop-chapter-pills-bar .ch-pill-item:nth-child(2)');
  if (ch1Btn) {
    await ch1Btn.click();
    await sleep(400);
  }

  const ch1SS = path.join(ARTIFACT_DIR, 'chapter_bug_ch1_clicked.png');
  await page.screenshot({ path: ch1SS });
  console.log('Saved Chapter 1 clicked screenshot:', ch1SS);

  // Inspect DOM in Chapter 1 view
  const ch1DOM = await page.evaluate(() => {
    const container = document.querySelector('.chapter-view-container');
    const header = document.querySelector('.chapter-header-strip');
    const grid = document.querySelector('.chapter-stages-grid');
    const tiles = Array.from(document.querySelectorAll('.chapter-stage-tile'));

    const getR = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
    };

    return {
      container: getR(container),
      header: getR(header),
      grid: getR(grid),
      tilesCount: tiles.length,
      tilePositions: tiles.map(t => ({
        stage: t.getAttribute('data-level'),
        className: t.className,
        rect: getR(t),
        computedStyle: {
          position: window.getComputedStyle(t).position,
          top: window.getComputedStyle(t).top,
          left: window.getComputedStyle(t).left,
          transform: window.getComputedStyle(t).transform,
          width: window.getComputedStyle(t).width,
          height: window.getComputedStyle(t).height
        }
      }))
    };
  });

  console.log('Chapter 1 DOM inspection:\n', JSON.stringify(ch1DOM, null, 2));

  // Click Chapter 2 tab
  console.log('Clicking Chapter 2 tab...');
  const ch2Btn = await page.$('.desktop-chapter-pills-bar .ch-pill-item:nth-child(3)');
  if (ch2Btn) {
    await ch2Btn.click();
    await sleep(400);
  }

  const ch2SS = path.join(ARTIFACT_DIR, 'chapter_bug_ch2_clicked.png');
  await page.screenshot({ path: ch2SS });
  console.log('Saved Chapter 2 clicked screenshot:', ch2SS);

  await browser.close();
}

captureChapterBug().catch(console.error);
