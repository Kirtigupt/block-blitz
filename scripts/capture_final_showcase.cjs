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

  // 1. Welcome -> Adventure Map
  const playBtn = await page.$('.welcome-play-now-btn');
  if (playBtn) await playBtn.click();
  await new Promise(r => setTimeout(r, 600));

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'final_adventure_map_mobile_390.png') });
  console.log('Captured final_adventure_map_mobile_390.png');

  // 2. Map -> Mission Briefing
  const stageBtn = await page.$('.adventure-play-btn, .dock-action-button');
  if (stageBtn) await stageBtn.click();
  await new Promise(r => setTimeout(r, 600));

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'final_mission_briefing_mobile_390.png') });
  console.log('Captured final_mission_briefing_mobile_390.png');

  // 3. Mission Briefing -> Gameplay Screen
  const startBtn = await page.$('.intro-start-btn');
  if (startBtn) await startBtn.click();
  await new Promise(r => setTimeout(r, 600));

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'final_gameplay_hud_mobile_390.png') });
  console.log('Captured final_gameplay_hud_mobile_390.png');

  await browser.close();
  console.log('All screenshots captured successfully!');
})();
