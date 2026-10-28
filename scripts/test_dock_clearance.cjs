const puppeteer = require('puppeteer-core');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 667 });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
  await page.click('.welcome-play-now-btn');
  await new Promise(r => setTimeout(r, 200));
  const guestBtn = await page.$('.guest-continue-btn');
  if (guestBtn) await guestBtn.click();
  // Wait for initial auto-scroll (150ms timeout in LevelMap) to completely finish
  await new Promise(r => setTimeout(r, 1000));

  // Now scroll to bottom
  await page.evaluate(() => {
    const container = document.querySelector('.campaign-grid-container');
    container.scrollTo({ top: container.scrollHeight, behavior: 'instant' });
  });

  await new Promise(r => setTimeout(r, 400));

  const info = await page.evaluate(() => {
    const container = document.querySelector('.campaign-grid-container');
    const dock = document.querySelector('.selected-level-dock');
    const cards = document.querySelectorAll('.level-card-item');
    const lastCard = cards[cards.length - 1];

    const dockRect = dock.getBoundingClientRect();
    const lastRect = lastCard.getBoundingClientRect();
    return {
      scrollTop: container.scrollTop,
      maxScroll: container.scrollHeight - container.clientHeight,
      dockTop: dockRect.top,
      lastBottom: lastRect.bottom,
      cleared: lastRect.bottom <= dockRect.top,
      distanceAboveDock: dockRect.top - lastRect.bottom
    };
  });
  console.log('Scroll diagnosis with instant scroll:', info);
  await browser.close();
})();
