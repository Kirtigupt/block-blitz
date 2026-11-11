const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const ARTIFACT_DIR = 'C:/Users/kirti/.gemini/antigravity/brain/3ac25ba8-43d2-4529-867b-c5d5adc7cb54';

const VIEWPORTS = [
  { name: '320px', width: 320, height: 600 },
  { name: '360px', width: 360, height: 740 },
  { name: '375px', width: 375, height: 667 },
  { name: '390px', width: 390, height: 844 },
  { name: '430px', width: 430, height: 932 },
  { name: '768px', width: 768, height: 1024 },
  { name: '1280px', width: 1280, height: 800 }
];

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: CHROME_PATH,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  for (const vp of VIEWPORTS) {
    await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 2 });
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });

    // Click play if on welcome
    const playBtn = await page.$('.welcome-play-now-btn');
    if (playBtn) await playBtn.click();
    await new Promise(r => setTimeout(r, 400));

    // Open level
    const stageBtn = await page.$('.adventure-play-btn, .dock-action-button');
    if (stageBtn) await stageBtn.click();
    await new Promise(r => setTimeout(r, 400));

    const startBtn = await page.$('.intro-start-btn');
    if (startBtn) await startBtn.click();
    await new Promise(r => setTimeout(r, 500));

    // Check overflow and alignment
    const report = await page.evaluate(() => {
      const q = s => document.querySelector(s);
      const r = el => el ? el.getBoundingClientRect() : null;
      const fmt = rect => rect ? { l: Math.round(rect.left), t: Math.round(rect.top), w: Math.round(rect.width), h: Math.round(rect.height) } : null;

      const docEl = document.documentElement;
      const body = document.body;
      const hasHorizontalScroll = docEl.scrollWidth > docEl.clientWidth || body.scrollWidth > body.clientWidth;

      const row1 = q('.hud-nav-left');
      const logo = q('.hud-brand-anchor');
      const stage = q('.hud-waypoint-chip');

      const btns = Array.from(document.querySelectorAll('.hud-actions-cluster .hud-tactile-btn')).map(b => fmt(r(b)));
      
      // Calculate gaps between buttons
      const buttonGaps = [];
      for (let i = 0; i < btns.length - 1; i++) {
        buttonGaps.push(btns[i+1].l - (btns[i].l + btns[i].w));
      }

      const scoreBoard = fmt(r(q('.hero-scoreboard-console')));
      const heroScore = fmt(r(q('.hero-score-anchor')));
      const bestPill = fmt(r(q('.best-score-pill')));
      const streakPill = fmt(r(q('.streak-reactor-pill')));

      const objDesc = q('.directive-statement');
      const objText = q('.directive-text');
      const objCounter = fmt(r(q('.mission-counter-badge')));

      return {
        hasHorizontalScroll,
        scrollWidth: docEl.scrollWidth,
        clientWidth: docEl.clientWidth,
        logo: fmt(r(logo)),
        stage: fmt(r(stage)),
        buttonCount: btns.length,
        buttonWidths: btns.map(b => b.w),
        buttonGaps,
        scoreboard: { scoreBoard, heroScore, bestPill, streakPill },
        counterRightEdge: objCounter ? objCounter.l + objCounter.w : null,
        viewportWidth: window.innerWidth
      };
    });

    console.log('=== VIEWPORT ' + vp.name + ' (' + vp.width + 'x' + vp.height + ') ===');
    console.log('Horizontal Scroll: ' + (report.hasHorizontalScroll ? 'FAIL (OVERFLOW)' : 'PASS (NO OVERFLOW)') + ' (' + report.scrollWidth + ' <= ' + report.clientWidth + ')');
    console.log('Button Count: ' + report.buttonCount + ', Widths: [' + report.buttonWidths.join(', ') + '], Gaps: [' + report.buttonGaps.join(', ') + ']');
    console.log('Counter within viewport: ' + (report.counterRightEdge <= report.viewportWidth ? 'PASS' : 'FAIL') + ' (' + report.counterRightEdge + ' <= ' + report.viewportWidth + ')');

    if (vp.name === '390px') {
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'hud_mobile_390px_final.png') });
      console.log('Saved hud_mobile_390px_final.png');
    }
    if (vp.name === '360px') {
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'hud_mobile_360px_final.png') });
      console.log('Saved hud_mobile_360px_final.png');
    }
    if (vp.name === '320px') {
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'hud_mobile_320px_final.png') });
      console.log('Saved hud_mobile_320px_final.png');
    }
  }

  await browser.close();
  console.log('All viewports checked successfully!');
})();
