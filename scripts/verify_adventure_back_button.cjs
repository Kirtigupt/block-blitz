const puppeteer = require('puppeteer-core');
const assert = require('assert');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:5173';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function run() {
  console.log('====================================================');
  console.log('BLOCK BLITZ — ADVENTURE SCREEN BACK BUTTON TEST');
  console.log('====================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 }); // Mobile test

  try {
    // 1. Start from fresh session
    await page.goto(APP_URL, { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload({ waitUntil: 'networkidle0' });
    await page.waitForSelector('.welcome-landing-screen', { timeout: 6000 });

    console.log('[Test 1] Navigating from Welcome Landing Screen into Adventure Level Map:');
    await page.click('.welcome-play-now-btn');
    await sleep(300);
    const guestBtn = await page.$('.guest-continue-btn');
    if (guestBtn) await guestBtn.click();
    await page.waitForSelector('.adventure-map-screen, .campaign-map-screen', { timeout: 6000 });
    console.log('  ✓ Arrived at Adventure Level Map');

    // 2. Inspect the back button
    console.log('\n[Test 2] Inspecting Back Arrow button attributes:');
    const backBtnInfo = await page.evaluate(() => {
      const btn = document.querySelector('.adventure-back-btn, .campaign-back-btn');
      if (!btn) return null;
      const rect = btn.getBoundingClientRect();
      return {
        ariaLabel: btn.getAttribute('aria-label'),
        title: btn.getAttribute('title'),
        width: rect.width,
        height: rect.height,
        visible: rect.width > 0 && rect.height > 0
      };
    });

    assert.ok(backBtnInfo, 'Back arrow button exists in the Adventure header');
    assert.strictEqual(backBtnInfo.ariaLabel, 'Back to Welcome', `Back button has accessible label: "${backBtnInfo.ariaLabel}"`);
    console.log(`  ✓ Accessible label confirmed: "${backBtnInfo.ariaLabel}"`);

    assert.ok(backBtnInfo.width >= 38 && backBtnInfo.height >= 38, `Back button meets mobile touch targets (actual: ${backBtnInfo.width}x${backBtnInfo.height}px >= 38px)`);
    console.log(`  ✓ Touch-friendly dimensions: ${backBtnInfo.width}px x ${backBtnInfo.height}px`);

    // 3. Click back arrow -> Must navigate directly to Welcome Landing Page
    console.log('\n[Test 3] Clicking Back Arrow:');
    await page.click('.adventure-back-btn, .campaign-back-btn');
    await sleep(400);

    const navResult = await page.evaluate(() => {
      const welcome = document.querySelector('.welcome-landing-screen');
      const map = document.querySelector('.adventure-map-screen, .campaign-map-screen');

      const topElement = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);
      const isWelcomeForeground = !!welcome && (welcome === topElement || welcome.contains(topElement));

      return {
        hasWelcomeScreen: !!welcome,
        hasMapScreen: !!map,
        isWelcomeForeground
      };
    });

    assert.ok(navResult.hasWelcomeScreen, 'Navigates directly to Welcome Landing Page');
    assert.strictEqual(navResult.hasMapScreen, false, 'Level Map screen is closed');
    assert.ok(navResult.isWelcomeForeground, 'Welcome Landing Page is in the active foreground');
    console.log('  ✓ Successfully navigated directly to Welcome Landing Page');

    // 4. Test keyboard Escape key in Adventure screen
    console.log('\n[Test 4] Testing keyboard Escape shortcut on Adventure screen:');
    // Re-enter Adventure screen
    await page.click('.welcome-play-now-btn');
    await sleep(300);
    const guestBtn2 = await page.$('.guest-continue-btn');
    if (guestBtn2) await guestBtn2.click();
    await page.waitForSelector('.adventure-map-screen, .campaign-map-screen', { timeout: 6000 });

    // Press Escape
    await page.keyboard.press('Escape');
    await sleep(400);

    const escResult = await page.evaluate(() => {
      return !!document.querySelector('.welcome-landing-screen');
    });
    assert.ok(escResult, 'Pressing Escape on Adventure screen also returns directly to Welcome Landing Page');
    console.log('  ✓ Escape key returns directly to Welcome Landing Page');

    console.log('\n====================================================');
    console.log('ALL ADVENTURE BACK BUTTON CHECKS PASSED! ✓');
    console.log('====================================================\n');
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error('\n❌ Verification Failed:', err);
  process.exit(1);
});
