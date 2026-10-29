const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:5173';
const ARTIFACT_DIR = 'C:\\Users\\kirti\\.gemini\\antigravity\\brain\\3ac25ba8-43d2-4529-867b-c5d5adc7cb54';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  try {
    // 1. Level Complete Modal screenshot (at 390x844 mobile and 1280x800 desktop)
    for (const vp of [{ name: 'mobile', width: 390, height: 844 }, { name: 'desktop', width: 1280, height: 800 }]) {
      await page.setViewport({ width: vp.width, height: vp.height });
      await page.goto(APP_URL, { waitUntil: 'networkidle0' });
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      await page.reload({ waitUntil: 'networkidle0' });
      await sleep(300);

      // Welcome -> Guest -> Level Map -> Start Level 1
      const playBtn = await page.$('.welcome-play-now-btn');
      if (playBtn) await playBtn.click();
      await sleep(250);
      const guestBtn = await page.$('.guest-continue-btn');
      if (guestBtn) await guestBtn.click();
      await sleep(350);

      const launchBtn = await page.$('.adventure-play-btn, .dock-action-button');
      if (launchBtn) await launchBtn.click();
      await sleep(250);

      const introStartBtn = await page.$('.intro-start-btn');
      if (introStartBtn) await introStartBtn.click();
      await sleep(400);

      // Trigger exit modal first
      await page.keyboard.press('Escape');
      await sleep(300);
      await page.screenshot({ path: path.join(ARTIFACT_DIR, `modal_exit_${vp.name}.png`) });
      console.log(`Saved screenshot: modal_exit_${vp.name}.png`);

      // Resume by clicking "CONTINUE PLAYING"
      const resumeBtn = await page.$('.exit-btn-continue');
      if (resumeBtn) await resumeBtn.click();
      await sleep(300);

      // Now trigger Level Complete Modal via mock or state
      // Let's trigger level complete by placing pieces or triggering level complete state
      await page.evaluate(() => {
        // Find React fiber or dispatch level completion
        const event = new KeyboardEvent('keydown', { key: 'Escape' });
      });
    }

    console.log('Modal inspection script completed.');
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
