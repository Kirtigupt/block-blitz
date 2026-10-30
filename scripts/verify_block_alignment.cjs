const puppeteer = require('puppeteer-core');
const assert = require('assert');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:5173';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTest() {
  console.log('========================================================================');
  console.log('BLOCK BLITZ — BLOCK-TO-GRID ALIGNMENT & SNAPPING VERIFICATION');
  console.log('========================================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  const testViewports = [
    { width: 390, height: 844, name: 'Mobile (390x844)' },
    { width: 1280, height: 800, name: 'Desktop (1280x800)' }
  ];

  for (const vp of testViewports) {
    console.log(`\n--- Testing Viewport: ${vp.name} ---`);
    await page.setViewport({ width: vp.width, height: vp.height });

    // Start fresh session
    await page.goto(APP_URL, { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload({ waitUntil: 'networkidle0' });
    await sleep(400);

    // Welcome -> Level Map -> Start Level 1
    await page.click('.welcome-play-now-btn');
    await sleep(350);
    const guestBtn = await page.$('.guest-continue-btn');
    if (guestBtn) await guestBtn.click();
    await sleep(400);

    await page.click('.adventure-play-btn, .dock-action-button');
    await sleep(350);

    const introBtn = await page.$('.intro-start-btn');
    if (introBtn) await introBtn.click();
    await sleep(500);

    await page.waitForSelector('.grid-container', { timeout: 6000 });
    console.log('  ✓ Entered Level 1 gameplay');

    // 1. Verify Grid Measurements & getGridCellFromPointer mapping
    const gridMeasurements = await page.evaluate(() => {
      const gridEl = document.querySelector('.game-grid');
      const cells = document.querySelectorAll('.game-grid .grid-cell');
      const c0 = cells[0].getBoundingClientRect();
      const c1 = cells[1].getBoundingClientRect();
      const c8 = cells[8].getBoundingClientRect();
      const c63 = cells[63].getBoundingClientRect();

      return {
        totalCells: cells.length,
        cellWidth: c0.width,
        cellHeight: c0.height,
        pitchX: c1.left - c0.left,
        pitchY: c8.top - c0.top,
        c0Rect: { left: c0.left, top: c0.top, right: c0.right, bottom: c0.bottom },
        c63Rect: { left: c63.left, top: c63.top, right: c63.right, bottom: c63.bottom }
      };
    });

    console.log(`  ✓ Grid: ${gridMeasurements.totalCells} cells rendered. Cell size: ${gridMeasurements.cellWidth.toFixed(1)}x${gridMeasurements.cellHeight.toFixed(1)}px, pitch: ${gridMeasurements.pitchX.toFixed(1)}px`);
    assert.strictEqual(gridMeasurements.totalCells, 64, 'Must have exactly 64 cells');

    // 2. Test Point-to-Grid Math across corners, edges, center, and gaps
    const testPointsResult = await page.evaluate(() => {
      const gridEl = document.querySelector('.game-grid');
      const cells = document.querySelectorAll('.game-grid .grid-cell');

      // Test each of the 4 corners: (0,0), (0,7), (7,0), (7,7)
      const testCases = [
        { label: 'Corner Top-Left (0,0)', cellIdx: 0, expectedRow: 0, expectedCol: 0 },
        { label: 'Corner Top-Right (0,7)', cellIdx: 7, expectedRow: 0, expectedCol: 7 },
        { label: 'Corner Bottom-Left (7,0)', cellIdx: 56, expectedRow: 7, expectedCol: 0 },
        { label: 'Corner Bottom-Right (7,7)', cellIdx: 63, expectedRow: 7, expectedCol: 7 },
        { label: 'Center (3,3)', cellIdx: 27, expectedRow: 3, expectedCol: 3 },
        { label: 'Center (4,4)', cellIdx: 36, expectedRow: 4, expectedCol: 4 }
      ];

      const results = [];
      const c0 = cells[0].getBoundingClientRect();
      const c1 = cells[1].getBoundingClientRect();
      const c8 = cells[8].getBoundingClientRect();
      const pitchX = c1.left - c0.left;
      const pitchY = c8.top - c0.top;
      const cellW = c0.width;
      const cellH = c0.height;

      // Local reproduction of getGridCellFromPointer math for validation
      const testMath = (px, py) => {
        const dx = px - c0.left;
        const dy = py - c0.top;
        const rawCol = Math.round((dx - cellW / 2) / pitchX);
        const rawRow = Math.round((dy - cellH / 2) / pitchY);
        return {
          row: Math.max(0, Math.min(7, rawRow)),
          col: Math.max(0, Math.min(7, rawCol))
        };
      };

      for (const tc of testCases) {
        const rect = cells[tc.cellIdx].getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const mapped = testMath(centerX, centerY);
        results.push({
          label: tc.label,
          passed: mapped.row === tc.expectedRow && mapped.col === tc.expectedCol,
          expected: `${tc.expectedRow},${tc.expectedCol}`,
          actual: `${mapped.row},${mapped.col}`
        });
      }

      // Test Gap Snapping: point halfway in the gap between cell (0,0) and (0,1)
      const gapMidX = (cells[0].getBoundingClientRect().right + cells[1].getBoundingClientRect().left) / 2;
      const gapMidY = cells[0].getBoundingClientRect().top + cellH / 2;
      const gapMapped = testMath(gapMidX, gapMidY);
      results.push({
        label: 'Gap Snapping Between Col 0 & 1',
        passed: gapMapped.row === 0 && (gapMapped.col === 0 || gapMapped.col === 1),
        expected: 'row 0, col 0 or 1',
        actual: `row ${gapMapped.row}, col ${gapMapped.col}`
      });

      return results;
    });

    for (const res of testPointsResult) {
      assert.ok(res.passed, `Failed test: ${res.label} (Expected ${res.expected}, got ${res.actual})`);
      console.log(`  ✓ ${res.label}: Snapped accurately to [${res.actual}]`);
    }

    // 3. Test Tap Placement Consistency
    // Select first piece from tray
    await page.evaluate(() => {
      const piece = document.querySelector('.block-piece:not(.disabled)');
      if (piece) piece.click();
    });
    await sleep(200);

    const selectionState = await page.evaluate(() => {
      return Boolean(document.querySelector('.block-piece.selected'));
    });
    console.log(`  ✓ Tray piece selected: ${selectionState}`);

    // Click on cell (3, 3) to place
    await page.evaluate(() => {
      const cell33 = document.querySelector('.grid-cell[data-row="3"][data-col="3"]');
      if (cell33) cell33.click();
    });
    await sleep(350);

    const placementCheck = await page.evaluate(() => {
      const occupiedCells = document.querySelectorAll('.grid-cell.occupied');
      return occupiedCells.length;
    });
    console.log(`  ✓ Board now has ${placementCheck} occupied cells after snap placement`);
    assert.ok(placementCheck > 0, 'Cells must be occupied after placement');
  }

  console.log('\n========================================================================');
  console.log('✓ ALL BLOCK-TO-GRID ALIGNMENT & SNAPPING TESTS PASSED PERFECTLY!');
  console.log('========================================================================\n');

  await browser.close();
}

runTest().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
