const puppeteer = require('puppeteer-core');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:5173';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function inspectElements() {
  const browser = await puppeteer.launch({ executablePath: CHROME_PATH, headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });
  await page.goto(APP_URL, { waitUntil: 'networkidle0' });
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.reload({ waitUntil: 'networkidle0' });
  await sleep(400);

  const playBtn = await page.$('.welcome-play-now-btn');
  if (playBtn) { await playBtn.click(); await sleep(300); }
  const guestBtn = await page.$('.guest-continue-btn');
  if (guestBtn) { await guestBtn.click(); await sleep(300); }
  const launchBtn = await page.$('.adventure-play-btn, .dock-action-button');
  if (launchBtn) { await launchBtn.click(); await sleep(300); }
  const introStartBtn = await page.$('.intro-start-btn');
  if (introStartBtn) { await introStartBtn.click(); await sleep(400); }

  await page.waitForSelector('.hud-gameplay-header');

  const hudInfo = await page.evaluate(() => {
    const q = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { text: el.innerText.replace(/\n/g, ' '), w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), y: Math.round(r.y) };
    };
    return {
      brand: q('.hud-brand-anchor'),
      waypoint: q('.hud-waypoint-chip'),
      identity: q('.hud-identity-zone'),
      metaPod: q('.meta-pod'),
      matchPod: q('.match-pod'),
      heroScoreAnchor: q('.hero-score-anchor'),
      heroScoreNum: q('.hero-score-number'),
      bestScorePill: q('.best-score-pill'),
      streakReactorPill: q('.streak-reactor-pill'),
      missionTaxonomy: q('.mission-taxonomy-row'),
      missionCore: q('.mission-core-row'),
      conduitTrack: q('.mission-conduit-track')
    };
  });

  console.log('Mobile 390x844 Elements:\n', JSON.stringify(hudInfo, null, 2));

  // Switch to Desktop
  await page.setViewport({ width: 1280, height: 800 });
  await sleep(300);

  const desktopHudInfo = await page.evaluate(() => {
    const q = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { text: el.innerText.replace(/\n/g, ' '), w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), y: Math.round(r.y) };
    };
    return {
      brand: q('.hud-brand-anchor'),
      waypoint: q('.hud-waypoint-chip'),
      identity: q('.hud-identity-zone'),
      metaPod: q('.meta-pod'),
      matchPod: q('.match-pod'),
      heroScoreAnchor: q('.hero-score-anchor'),
      heroScoreNum: q('.hero-score-number'),
      bestScorePill: q('.best-score-pill'),
      streakReactorPill: q('.streak-reactor-pill'),
      missionTaxonomy: q('.mission-taxonomy-row'),
      missionCore: q('.mission-core-row'),
      conduitTrack: q('.mission-conduit-track')
    };
  });

  console.log('Desktop 1280x800 Elements:\n', JSON.stringify(desktopHudInfo, null, 2));

  await browser.close();
}
inspectElements().catch(console.error);
