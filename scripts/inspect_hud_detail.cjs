const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const ARTIFACT_DIR = 'C:/Users/kirti/.gemini/antigravity/brain/3ac25ba8-43d2-4529-867b-c5d5adc7cb54';

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: CHROME_PATH,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });

  // Go to game
  const playBtn = await page.$('.welcome-play-now-btn');
  if (playBtn) await playBtn.click();
  await new Promise(r => setTimeout(r, 400));

  const stageBtn = await page.$('.adventure-play-btn, .dock-action-button');
  if (stageBtn) await stageBtn.click();
  await new Promise(r => setTimeout(r, 400));

  const startBtn = await page.$('.intro-start-btn');
  if (startBtn) await startBtn.click();
  await new Promise(r => setTimeout(r, 500));

  // Inspect DOM details
  const metrics = await page.evaluate(() => {
    const q = sel => document.querySelector(sel);
    const r = el => el ? el.getBoundingClientRect() : null;
    const formatRect = rect => rect ? { left: Math.round(rect.left), top: Math.round(rect.top), width: Math.round(rect.width), height: Math.round(rect.height) } : null;

    const row1 = q('.hud-nav-left');
    const logo = q('.hud-brand-anchor');
    const stage = q('.hud-waypoint-chip');

    const row2 = q('.hud-nav-right');
    const account = q('.hud-identity-zone');
    const metaPod = q('.meta-pod');
    const matchPod = q('.match-pod');
    const btns = Array.from(document.querySelectorAll('.hud-nav-right .hud-tactile-btn')).map(b => ({
      cls: b.className,
      rect: formatRect(r(b))
    }));

    const scoreBoard = q('.hero-scoreboard-console');
    const heroScore = q('.hero-score-anchor');
    const bestPill = q('.best-score-pill');
    const streakPill = q('.streak-reactor-pill');

    const objPanel = q('.mission-control-hud');
    const objTaxonomy = q('.mission-taxonomy-row');
    const objCore = q('.mission-core-row');
    const objIcon = q('.directive-icon-pod');
    const objDesc = q('.directive-statement');
    const objText = q('.directive-text');
    const objCounter = q('.mission-counter-badge');
    const objTrack = q('.mission-conduit-track');

    return {
      row1: { rect: formatRect(r(row1)), logo: formatRect(r(logo)), stage: formatRect(r(stage)) },
      row2: { rect: formatRect(r(row2)), account: formatRect(r(account)), metaPod: formatRect(r(metaPod)), matchPod: formatRect(r(matchPod)), btns },
      scoreboard: {
        rect: formatRect(r(scoreBoard)),
        heroScore: formatRect(r(heroScore)),
        bestPill: formatRect(r(bestPill)),
        streakPill: formatRect(r(streakPill))
      },
      objective: {
        panel: formatRect(r(objPanel)),
        taxonomy: formatRect(r(objTaxonomy)),
        core: formatRect(r(objCore)),
        icon: formatRect(r(objIcon)),
        desc: formatRect(r(objDesc)),
        counter: formatRect(r(objCounter)),
        track: formatRect(r(objTrack)),
        textOverflow: objText ? {
          scrollWidth: objText.scrollWidth,
          clientWidth: objText.clientWidth,
          text: objText.textContent
        } : null
      }
    };
  });

  console.log(JSON.stringify(metrics, null, 2));

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'hud_detail_390px.png') });
  console.log('Saved hud_detail_390px.png');

  await browser.close();
})();
