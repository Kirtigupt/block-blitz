const puppeteer = require('puppeteer-core');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:5173';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function inspect() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(APP_URL, { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload({ waitUntil: 'networkidle0' });
  await sleep(400);

  // Welcome -> Play -> Guest -> Launch Level 1
  const playBtn = await page.$('.welcome-play-now-btn');
  if (playBtn) await playBtn.click();
  await sleep(300);
  const guestBtn = await page.$('.guest-continue-btn');
  if (guestBtn) await guestBtn.click();
  await sleep(400);

  const launchBtn = await page.$('.adventure-play-btn, .dock-action-button');
  if (launchBtn) await launchBtn.click();
  await sleep(300);

  const introStartBtn = await page.$('.intro-start-btn');
  if (introStartBtn) await introStartBtn.click();
  await sleep(500);

  await page.waitForSelector('.hud-gameplay-header', { timeout: 6000 });

  const metrics = await page.evaluate(() => {
    const wrapper = document.querySelector('.game-wrapper');
    const header = document.querySelector('.game-header');
    const headerTop = document.querySelector('.header-top');
    const brand = document.querySelector('.header-brand-group');
    const logo = document.querySelector('.logo-badge');
    const stage = document.querySelector('.level-badge-pill');
    const actions = document.querySelector('.header-actions');
    const account = document.querySelector('.header-group-account');
    const authBtn = document.querySelector('.auth-cta-btn, .user-pill-btn');
    const tools = document.querySelector('.header-tools-cluster');
    const board = document.querySelector('.score-board');
    const obj = document.querySelector('.level-objective-panel');
    const grid = document.querySelector('.grid-container');
    const tray = document.querySelector('.block-tray-container');

    const rect = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width), height: Math.round(r.height), top: Math.round(r.top) };
    };

    return {
      wrapper: rect(wrapper),
      header: rect(header),
      headerTop: rect(headerTop),
      brand: rect(brand),
      logo: rect(logo),
      stage: rect(stage),
      actions: rect(actions),
      account: rect(account),
      authBtn: rect(authBtn),
      tools: rect(tools),
      board: rect(board),
      obj: rect(obj),
      grid: rect(grid),
      tray: rect(tray)
    };
  });

  console.log('Current 1280x800 Metrics:', JSON.stringify(metrics, null, 2));
  await browser.close();
}

inspect().catch(console.error);
