const puppeteer = require('puppeteer-core');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:5173';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 667 });
  await page.goto(APP_URL, { waitUntil: 'networkidle2' });
  await page.click('.welcome-play-now-btn');
  await new Promise(r => setTimeout(r, 200));
  const guestBtn = await page.$('.guest-continue-btn');
  if (guestBtn) await guestBtn.click();
  await new Promise(r => setTimeout(r, 400));

  // Check dock height vs bottom padding
  const result = await page.evaluate(() => {
    const dock = document.querySelector('.selected-level-dock');
    const container = document.querySelector('.campaign-grid-container');
    const dockRect = dock.getBoundingClientRect();
    const style = window.getComputedStyle(container);
    const bottomPadding = parseFloat(style.paddingBottom);

    // Scroll to bottom
    container.scrollTop = container.scrollHeight;

    // Check last card
    const cards = document.querySelectorAll('.level-card-item');
    const lastCard = cards[cards.length - 1];
    const lastCardRect = lastCard ? lastCard.getBoundingClientRect() : null;

    return {
      dockHeight: dockRect.height,
      bottomPadding,
      isOverlap: lastCardRect ? lastCardRect.bottom > dockRect.top : false,
      overlapAmount: lastCardRect ? Math.max(0, lastCardRect.bottom - dockRect.top) : 0
    };
  });

  console.log('Level map scroll result on 375x667:', result);
  await browser.close();
})();
