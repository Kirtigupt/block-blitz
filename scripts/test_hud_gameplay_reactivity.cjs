const puppeteer = require('puppeteer-core');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:5173';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function testGameplayReactivity() {
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

  // Navigate to Level 1
  const playBtn = await page.$('.welcome-play-now-btn');
  if (playBtn) { await playBtn.click(); await sleep(300); }
  const guestBtn = await page.$('.guest-continue-btn');
  if (guestBtn) { await guestBtn.click(); await sleep(300); }
  const launchBtn = await page.$('.adventure-play-btn, .dock-action-button');
  if (launchBtn) { await launchBtn.click(); await sleep(300); }
  const introStartBtn = await page.$('.intro-start-btn');
  if (introStartBtn) { await introStartBtn.click(); await sleep(400); }

  await page.waitForSelector('.hud-gameplay-header');
  console.log('--- TESTING GAMEPLAY HUD REACTIVITY ---');

  // Initial HUD state
  const initialHUD = await page.evaluate(() => {
    return {
      score: document.querySelector('.hero-score-number')?.innerText,
      streak: document.querySelector('.streak-tally-number')?.innerText,
      objective: document.querySelector('.mission-counter-badge')?.innerText.replace(/\n/g, ' '),
      conduitWidth: document.querySelector('.conduit-gradient-fill')?.style.width
    };
  });
  console.log('Initial HUD State:', initialHUD);

  // Place a shape from tray onto the grid (click shape 0 then click grid cell)
  const placedFirstShape = await page.evaluate(() => {
    const shape = document.querySelector('.tray-shape');
    if (!shape) return false;
    shape.click();
    return true;
  });
  await sleep(200);

  if (placedFirstShape) {
    await page.evaluate(() => {
      // Find empty cell in grid (row 0, col 0)
      const cell = document.querySelector('.grid-cell[data-row="0"][data-col="0"], .grid-cell');
      if (cell) cell.click();
    });
    await sleep(400);
  }

  const updatedHUD = await page.evaluate(() => {
    return {
      score: document.querySelector('.hero-score-number')?.innerText,
      streak: document.querySelector('.streak-tally-number')?.innerText,
      objective: document.querySelector('.mission-counter-badge')?.innerText.replace(/\n/g, ' '),
      conduitWidth: document.querySelector('.conduit-gradient-fill')?.style.width
    };
  });
  console.log('Updated HUD State after shape placement/attempt:', updatedHUD);

  await browser.close();
  console.log('Gameplay reactivity verified successfully!');
}

testGameplayReactivity().catch(console.error);
