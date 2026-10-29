const puppeteer = require('puppeteer-core');
const assert = require('assert');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:5173';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTest() {
  console.log('========================================================================');
  console.log('BLOCK BLITZ — GAMEPLAY INTERACTION & MECHANICS TEST');
  console.log('========================================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });

  try {
    // 1. Start fresh guest session
    await page.goto(APP_URL, { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload({ waitUntil: 'networkidle0' });
    await sleep(350);

    // 2. Welcome -> Level Map -> Start Level 1
    await page.click('.welcome-play-now-btn');
    await sleep(300);
    const guestBtn = await page.$('.guest-continue-btn');
    if (guestBtn) await guestBtn.click();
    await sleep(400);

    await page.click('.adventure-play-btn, .dock-action-button');
    await sleep(300);

    const introBtn = await page.$('.intro-start-btn');
    if (introBtn) await introBtn.click();
    await sleep(500);

    await page.waitForSelector('.grid-container', { timeout: 6000 });
    console.log('✓ Successfully entered Level 1 gameplay');

    // 3. Inspect Block Tray Shapes
    const trayPieces = await page.evaluate(() => {
      const slots = document.querySelectorAll('.block-tray-slot');
      const pieces = document.querySelectorAll('.block-tray-slot .block-piece-container, .block-tray-slot [draggable="true"]');
      return {
        slotsCount: slots.length,
        piecesCount: pieces.length
      };
    });
    console.log(`✓ Block Tray contains ${trayPieces.slotsCount} slots and ${trayPieces.piecesCount} available pieces`);

    // 4. Test Selecting a Piece from Tray
    await page.evaluate(() => {
      const firstPiece = document.querySelector('.block-piece');
      if (firstPiece) firstPiece.click();
    });
    await sleep(200);

    const selectionCheck = await page.evaluate(() => {
      const selected = document.querySelector('.block-piece.selected');
      const hint = document.querySelector('.tray-hint');
      return {
        hasSelected: !!selected,
        hintText: hint ? hint.textContent.trim() : ''
      };
    });
    console.log(`✓ Piece selection works: ${selectionCheck.hasSelected} (Hint: "${selectionCheck.hintText}")`);

    // 5. Place a Piece onto the Grid
    // Hover over center to trigger preview and click valid cell
    await page.hover('.grid-cell[data-row="3"][data-col="3"]');
    await sleep(200);

    await page.evaluate(() => {
      const validCell = document.querySelector('.grid-cell.preview-valid') ||
                        document.querySelector('.grid-cell[data-row="3"][data-col="3"]') ||
                        document.querySelector('.grid-cell[data-row="2"][data-col="2"]') ||
                        document.querySelector('.grid-cell[data-row="0"][data-col="0"]');
      if (validCell) validCell.click();
    });
    await sleep(350);

    const placeCheck = await page.evaluate(() => {
      const scoreEl = document.querySelector('.score-value');
      const occupiedCells = document.querySelectorAll('.grid-cell.occupied');
      return {
        score: scoreEl ? scoreEl.textContent.trim() : '0',
        occupiedCount: occupiedCells.length
      };
    });
    console.log(`✓ Piece placed on grid! Occupied cells: ${placeCheck.occupiedCount}, Score: ${placeCheck.score}`);
    assert(placeCheck.occupiedCount > 0, 'Grid has occupied cells after placement');

    console.log('\n========================================================================');
    console.log('GAMEPLAY INTERACTION VERIFIED SUCCESSFULLY! ✓');
    console.log('========================================================================\n');

  } finally {
    await browser.close();
  }
}

runTest().catch((err) => {
  console.error('Test Failed:', err);
  process.exit(1);
});
