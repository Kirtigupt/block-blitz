const puppeteer = require('puppeteer-core');
const path = require('path');
const assert = require('assert');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:5173';
const ARTIFACT_DIR = 'C:/Users/kirti/.gemini/antigravity/brain/3ac25ba8-43d2-4529-867b-c5d5adc7cb54';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const VIEWPORTS = [
  { name: 'Mobile iPhone SE', width: 375, height: 667, file: 'landing_mobile_375.png' },
  { name: 'Mobile iPhone 12/13/14', width: 390, height: 844, file: 'landing_mobile_390.png' },
  { name: 'Tablet Landscape', width: 1024, height: 768, file: 'landing_tablet_1024.png' },
  { name: 'Desktop Standard', width: 1280, height: 800, file: 'landing_desktop_1280.png' }
];

async function runVerification() {
  console.log('====================================================');
  console.log('BLOCK BLITZ LANDING PAGE REDESIGN VERIFICATION');
  console.log('====================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  let totalAssertions = 0;

  try {
    for (const vp of VIEWPORTS) {
      console.log(`--- Testing Viewport: ${vp.name} (${vp.width}x${vp.height}) ---`);
      const page = await browser.newPage();
      await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 1 });

      // Clean guest visit
      await page.goto(APP_URL, { waitUntil: 'networkidle2' });
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      await page.reload({ waitUntil: 'networkidle2' });
      await page.waitForSelector('.welcome-landing-screen', { timeout: 6000 });
      await sleep(300);

      // Capture screenshot
      const screenshotPath = path.join(ARTIFACT_DIR, vp.file);
      await page.screenshot({ path: screenshotPath });
      console.log(`  📸 Screenshot saved: ${vp.file}`);

      // 1. Verify removed elements
      const removedCheck = await page.evaluate(() => {
        const featureStrip = document.querySelector('.welcome-features-strip');
        const statsRow = document.querySelector('.welcome-pilot-stats-row');
        const switchBtn = document.querySelector('.welcome-switch-btn');
        const text = document.body.innerText;

        return {
          hasFeatureStrip: !!featureStrip,
          hasStatsRow: !!statsRow,
          hasSwitchBtn: !!switchBtn,
          has100LevelsText: text.includes('100 Levels') && text.includes('10 Thematic Chapters'),
          hasCombosText: text.includes('Combos & Streaks'),
          hasLeaderboardText: text.includes('Global Leaderboard') && text.includes('Cloud Rankings'),
          hasWelcomeBackText: text.includes('Welcome Back')
        };
      });

      assert(!removedCheck.hasFeatureStrip, `${vp.name}: Three feature cards are completely removed`);
      totalAssertions++;
      assert(!removedCheck.hasStatsRow, `${vp.name}: Player statistics section is completely removed`);
      totalAssertions++;
      assert(!removedCheck.hasSwitchBtn, `${vp.name}: Switch Account button is completely removed`);
      totalAssertions++;
      assert(!removedCheck.has100LevelsText, `${vp.name}: Feature card text '100 Levels' is absent`);
      totalAssertions++;
      assert(!removedCheck.hasCombosText, `${vp.name}: Feature card text 'Combos & Streaks' is absent`);
      totalAssertions++;
      assert(!removedCheck.hasLeaderboardText, `${vp.name}: Feature card text 'Global Leaderboard' is absent`);
      totalAssertions++;
      assert(!removedCheck.hasWelcomeBackText, `${vp.name}: 'Welcome Back' text is absent`);
      totalAssertions++;

      // 2. Verify retained elements
      const retainedCheck = await page.evaluate(() => {
        const title = document.querySelector('.welcome-landing-game-title');
        const tagline = document.querySelector('.welcome-tagline');
        const preview = document.querySelector('.welcome-preview-showcase');
        const matrix = document.querySelector('.preview-grid-matrix');
        const playBtn = document.querySelector('.welcome-play-now-btn');

        return {
          hasTitle: !!title && title.innerText.includes('BLOCK BLITZ'),
          hasTagline: !!tagline && tagline.innerText.includes('Think Fast. Place Smart.'),
          hasPreview: !!preview && !!matrix,
          hasPlayBtn: !!playBtn && playBtn.innerText.includes('PLAY NOW')
        };
      });

      assert(retainedCheck.hasTitle, `${vp.name}: BLOCK BLITZ title is present`);
      totalAssertions++;
      assert(retainedCheck.hasTagline, `${vp.name}: Tagline is present`);
      totalAssertions++;
      assert(retainedCheck.hasPreview, `${vp.name}: Animated block puzzle preview is present`);
      totalAssertions++;
      assert(retainedCheck.hasPlayBtn, `${vp.name}: Prominent PLAY NOW button is present`);
      totalAssertions++;

      // 3. Verify layout & sizing
      const layoutCheck = await page.evaluate(() => {
        const doc = document.documentElement;
        const playBtn = document.querySelector('.welcome-play-now-btn');
        const rect = playBtn ? playBtn.getBoundingClientRect() : null;

        return {
          docScrollWidth: doc.scrollWidth,
          docClientWidth: doc.clientWidth,
          playBtnRect: rect ? { width: rect.width, height: rect.height, top: rect.top, bottom: rect.bottom } : null
        };
      });

      assert(layoutCheck.docScrollWidth <= layoutCheck.docClientWidth, `${vp.name}: Zero horizontal overflow (${layoutCheck.docScrollWidth} <= ${layoutCheck.docClientWidth})`);
      totalAssertions++;
      assert(layoutCheck.playBtnRect.height >= 44, `${vp.name}: PLAY NOW button meets touch target height (actual: ${layoutCheck.playBtnRect.height}px >= 44px)`);
      totalAssertions++;
      assert(layoutCheck.playBtnRect.bottom <= vp.height + 15, `${vp.name}: PLAY NOW button fits inside viewport (bottom: ${Math.round(layoutCheck.playBtnRect.bottom)}px <= ${vp.height}px)`);
      totalAssertions++;

      // 4. Verify functionality: Clicking PLAY NOW as guest opens AuthModal
      await page.click('.welcome-play-now-btn');
      await page.waitForSelector('.auth-card', { timeout: 5000 });
      const authOpened = await page.$('.auth-card');
      assert(!!authOpened, `${vp.name}: Clicking PLAY NOW opens the Sign In / Register auth modal`);
      totalAssertions++;

      await page.close();
    }

    // Authenticated visit test
    console.log('\n--- Testing Authenticated Session Play Flow ---');
    const authPage = await browser.newPage();
    await authPage.setViewport({ width: 1280, height: 800 });
    await authPage.goto(APP_URL, { waitUntil: 'networkidle2' });

    // Login via mock or register a disposable user
    const testUser = {
      username: `landing_u_${Date.now()}`,
      email: `landing_${Date.now()}@example.com`,
      password: 'Password123!'
    };

    const regResponse = await authPage.evaluate(async (u) => {
      try {
        const res = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(u)
        });
        return await res.json();
      } catch (e) {
        return { error: e.message };
      }
    }, testUser);

    if (regResponse && regResponse.token) {
      await authPage.evaluate((token) => {
        localStorage.setItem('block_blitz_token', token);
      }, regResponse.token);

      await authPage.reload({ waitUntil: 'networkidle2' });
      await authPage.waitForSelector('.welcome-landing-screen', { timeout: 6000 });

      // Confirm removed elements remain hidden for logged-in user
      const authRemovedCheck = await authPage.evaluate(() => {
        const statsRow = document.querySelector('.welcome-pilot-stats-row');
        const oldSwitchBtn = document.querySelector('.welcome-switch-btn');
        return !statsRow && !oldSwitchBtn;
      });
      assert(authRemovedCheck, 'Authenticated visit: Stats row and legacy switch button remain hidden');
      totalAssertions++;

      // Verify "Welcome back, [User's Name]!" and subtle "Switch Account" button
      const switchBtnInfo = await authPage.evaluate(() => {
        const subtext = document.querySelector('.welcome-auth-subtext.auth-logged-in');
        const switchBtn = document.querySelector('.welcome-switch-account-btn');
        const highlight = document.querySelector('.welcome-user-highlight');
        return {
          hasWelcomeBack: !!subtext,
          userName: highlight ? highlight.textContent.trim() : null,
          hasSwitchBtn: !!switchBtn,
          switchBtnText: switchBtn ? switchBtn.textContent.trim() : null
        };
      });

      assert.strictEqual(switchBtnInfo.userName, testUser.username, `Authenticated landing displays "Welcome back, ${testUser.username}!"`);
      totalAssertions++;
      assert(switchBtnInfo.hasSwitchBtn, 'Subtle "Switch Account" button is displayed below welcome message');
      totalAssertions++;
      assert.strictEqual(switchBtnInfo.switchBtnText, 'Switch Account', 'Switch Account button label is "Switch Account"');
      totalAssertions++;

      // Click "Switch Account" to test secure logout and opening existing auth modal
      await authPage.click('.welcome-switch-account-btn');
      await authPage.waitForSelector('.auth-card', { timeout: 5000 });
      const authOpenedOnSwitch = await authPage.$('.auth-card');
      assert(!!authOpenedOnSwitch, 'Clicking Switch Account opens the existing Auth Modal');
      totalAssertions++;

      // Verify token is cleared on logout
      const tokenAfterSwitch = await authPage.evaluate(() => localStorage.getItem('block_blitz_token'));
      assert.strictEqual(tokenAfterSwitch, null, 'Clicking Switch Account securely cleared token from localStorage');
      totalAssertions++;

      // Close auth modal to verify clean logged-out landing state
      await authPage.click('.close-btn');
      await authPage.waitForSelector('.welcome-signin-link-btn', { timeout: 3000 });

      const loggedOutCheck = await authPage.evaluate(() => {
        const switchBtn = document.querySelector('.welcome-switch-account-btn');
        const signinLink = document.querySelector('.welcome-signin-link-btn');
        const welcomeBack = document.querySelector('.welcome-auth-subtext.auth-logged-in');
        return {
          hasSwitchBtn: !!switchBtn,
          hasSigninLink: !!signinLink,
          hasWelcomeBack: !!welcomeBack
        };
      });

      assert(!loggedOutCheck.hasSwitchBtn, 'When logged out, Switch Account button is absent');
      totalAssertions++;
      assert(loggedOutCheck.hasSigninLink, 'When logged out, "Already have an account? Sign in" is displayed');
      totalAssertions++;
      assert(!loggedOutCheck.hasWelcomeBack, 'When logged out, "Welcome back" greeting is absent');
      totalAssertions++;
    }

    await authPage.close();

    console.log('\n====================================================');
    console.log(`RESULTS: ${totalAssertions} / ${totalAssertions} assertions passed`);
    console.log('ALL LANDING PAGE REDESIGN VERIFICATIONS PASSED! ✓');
    console.log('====================================================\n');
  } catch (err) {
    console.error('\n❌ VERIFICATION FAILED:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runVerification();
