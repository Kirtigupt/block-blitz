const puppeteer = require('puppeteer-core');
const path = require('path');
const assert = require('assert');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:5173';
const ARTIFACT_DIR = 'C:/Users/kirti/.gemini/antigravity/brain/3ac25ba8-43d2-4529-867b-c5d5adc7cb54';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const VIEWPORTS = [
  { name: 'Mobile iPhone SE', width: 375, height: 667, tag: '375x667' },
  { name: 'Mobile iPhone 12/13/14', width: 390, height: 844, tag: '390x844' },
  { name: 'Tablet Portrait', width: 768, height: 1024, tag: '768x1024' },
  { name: 'Small Desktop / Tablet Landscape', width: 1024, height: 768, tag: '1024x768' },
  { name: 'Desktop Standard', width: 1280, height: 800, tag: '1280x800' }
];

async function runFullVerification() {
  console.log('========================================================================');
  console.log('BLOCK BLITZ — FULL REDESIGN VERIFICATION (LANDING & LEVEL MAP)');
  console.log('========================================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  let totalAssertions = 0;

  try {
    // ----------------------------------------------------------------------
    // TEST SECTION 1: LANDING PAGE ON ALL 5 VIEWPORTS (GUEST & AUTHENTICATED)
    // ----------------------------------------------------------------------
    console.log('>>> [SECTION 1] LANDING PAGE VERIFICATION ACROSS 5 VIEWPORTS <<<');

    for (const vp of VIEWPORTS) {
      console.log(`\n--- Testing Landing Page on ${vp.name} (${vp.tag}) ---`);
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
      await sleep(250);

      // Screenshot Guest Landing Page
      const guestShot = path.join(ARTIFACT_DIR, `landing_guest_${vp.tag}.png`);
      await page.screenshot({ path: guestShot });
      console.log(`  📸 Guest screenshot saved: landing_guest_${vp.tag}.png`);

      // Verify Guest Subtext: "Already have an account? Sign in"
      const guestSubtextCheck = await page.evaluate(() => {
        const subtext = document.querySelector('.welcome-auth-subtext.auth-logged-out');
        const signinBtn = document.querySelector('.welcome-signin-link-btn');
        return {
          hasSubtext: !!subtext && subtext.innerText.includes('Already have an account?'),
          hasSigninBtn: !!signinBtn && signinBtn.innerText.trim() === 'Sign in'
        };
      });

      assert(guestSubtextCheck.hasSubtext, `${vp.name}: Guest subtext displays 'Already have an account?'`);
      totalAssertions++;
      assert(guestSubtextCheck.hasSigninBtn, `${vp.name}: 'Sign in' button link is present and accessible`);
      totalAssertions++;

      // Verify Layout: zero horizontal overflow
      const layoutCheck = await page.evaluate(() => {
        const doc = document.documentElement;
        const playBtn = document.querySelector('.welcome-play-now-btn');
        const rect = playBtn ? playBtn.getBoundingClientRect() : null;
        return {
          scrollWidth: doc.scrollWidth,
          clientWidth: doc.clientWidth,
          playBtnHeight: rect ? rect.height : 0
        };
      });

      assert(layoutCheck.scrollWidth <= layoutCheck.clientWidth, `${vp.name}: Zero horizontal overflow on Landing Page`);
      totalAssertions++;
      assert(layoutCheck.playBtnHeight >= 44, `${vp.name}: PLAY NOW button meets touch target height (actual: ${layoutCheck.playBtnHeight}px)`);
      totalAssertions++;

      // Clicking "Sign in" opens the AuthModal
      await page.click('.welcome-signin-link-btn');
      await page.waitForSelector('.auth-card', { timeout: 5000 });
      const authCardVisible = await page.$('.auth-card');
      assert(!!authCardVisible, `${vp.name}: Clicking 'Sign in' link opens AuthModal`);
      totalAssertions++;

      // Close auth modal by clicking close button
      await page.click('.close-btn');
      await sleep(200);

      // Clicking PLAY NOW as guest opens AuthModal
      await page.click('.welcome-play-now-btn');
      await page.waitForSelector('.auth-card', { timeout: 5000 });
      const authFromPlayVisible = await page.$('.auth-card');
      assert(!!authFromPlayVisible, `${vp.name}: Clicking PLAY NOW as guest opens AuthModal`);
      totalAssertions++;

      await page.close();
    }

    // Test Authenticated Landing Page
    console.log('\n--- Testing Authenticated Landing Page (Real Name Display) ---');
    const authPage = await browser.newPage();
    await authPage.setViewport({ width: 1280, height: 800 });
    await authPage.goto(APP_URL, { waitUntil: 'networkidle2' });

    const testUser = {
      username: `Pilot_${Date.now().toString().slice(-5)}`,
      email: `pilot_${Date.now()}@test.com`,
      password: 'Password123!'
    };

    const regRes = await authPage.evaluate(async (u) => {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(u)
      });
      return await res.json();
    }, testUser);

    assert(regRes && regRes.token, 'Authenticated test user registered successfully');
    totalAssertions++;

    await authPage.evaluate((tok) => {
      localStorage.setItem('block_blitz_token', tok);
    }, regRes.token);

    await authPage.reload({ waitUntil: 'networkidle2' });
    await authPage.waitForSelector('.welcome-landing-screen', { timeout: 6000 });
    await authPage.waitForSelector('.welcome-auth-subtext.auth-logged-in', { timeout: 6000 });

    const authLandingCheck = await authPage.evaluate((expectedName) => {
      const subtext = document.querySelector('.welcome-auth-subtext.auth-logged-in');
      const highlight = document.querySelector('.welcome-user-highlight');
      return {
        hasSubtext: !!subtext,
        text: subtext ? subtext.innerText.replace(/\s+/g, ' ').trim() : '',
        usernameDisplayed: highlight ? highlight.innerText.trim() : ''
      };
    }, testUser.username);

    console.log('  Debug auth text:', JSON.stringify(authLandingCheck.text), 'expected:', JSON.stringify(testUser.username));
    assert(authLandingCheck.hasSubtext, 'Authenticated Landing Page renders auth-logged-in greeting');
    totalAssertions++;
    assert(authLandingCheck.usernameDisplayed === testUser.username, `Authenticated greeting displays actual username: "${authLandingCheck.usernameDisplayed}" === "${testUser.username}"`);
    totalAssertions++;
    assert(authLandingCheck.text.includes('Welcome back') && authLandingCheck.text.includes(testUser.username), 'Full greeting text matches "Welcome back, [user]!"');
    totalAssertions++;

    // Verify Switch Account button is displayed below welcome message
    const hasSwitchAccount = (await authPage.$('.welcome-switch-account-btn')) !== null;
    assert(hasSwitchAccount, 'Switch Account button is visible below "Welcome back, [user]!" greeting');
    totalAssertions++;

    // Screenshot Authenticated Landing Page
    const authShot = path.join(ARTIFACT_DIR, 'landing_auth_1280x800.png');
    await authPage.screenshot({ path: authShot });
    console.log('  📸 Authenticated screenshot saved: landing_auth_1280x800.png');

    // ----------------------------------------------------------------------
    // TEST SECTION 2: CAMPAIGN LEVEL MAP ON ALL 5 VIEWPORTS
    // ----------------------------------------------------------------------
    console.log('\n>>> [SECTION 2] CAMPAIGN LEVEL MAP VERIFICATION ACROSS 5 VIEWPORTS <<<');

    // Click PLAY NOW as authenticated user to enter Level Map
    await authPage.click('.welcome-play-now-btn');
    await authPage.waitForSelector('.campaign-map-screen', { timeout: 6000 });
    const mapOpened = await authPage.$('.campaign-map-screen');
    assert(!!mapOpened, 'Clicking PLAY NOW as authenticated user opens Campaign Level Map');
    totalAssertions++;

    for (const vp of VIEWPORTS) {
      console.log(`\n--- Auditing Level Map on ${vp.name} (${vp.tag}) ---`);
      await authPage.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 1 });
      await sleep(300);

      // Screenshot Level Map on this viewport
      const mapShot = path.join(ARTIFACT_DIR, `map_${vp.tag}.png`);
      await authPage.screenshot({ path: mapShot });
      console.log(`  📸 Level Map screenshot saved: map_${vp.tag}.png`);

      // Verify Level Map Layout & Sizing
      const mapLayoutCheck = await authPage.evaluate(() => {
        const doc = document.documentElement;
        const screen = document.querySelector('.campaign-map-screen');
        const dock = document.querySelector('.compact-action-dock');
        const dockRect = dock ? dock.getBoundingClientRect() : null;
        const tiles = document.querySelectorAll('.level-tile-stone');
        const container = document.querySelector('.campaign-grid-container');

        return {
          scrollWidth: doc.scrollWidth,
          clientWidth: doc.clientWidth,
          tilesCount: tiles.length,
          dockHeight: dockRect ? dockRect.height : 0,
          containerPaddingBottom: container ? window.getComputedStyle(container).paddingBottom : '0px'
        };
      });

      assert(mapLayoutCheck.scrollWidth <= mapLayoutCheck.clientWidth, `${vp.name}: Zero horizontal overflow on Level Map`);
      totalAssertions++;
      assert(mapLayoutCheck.tilesCount > 0, `${vp.name}: Level tiles rendered in grid (count: ${mapLayoutCheck.tilesCount})`);
      totalAssertions++;
      assert(mapLayoutCheck.dockHeight > 0 && mapLayoutCheck.dockHeight <= 95, `${vp.name}: Compact action dock is sleek without dominating screen (height: ${Math.round(mapLayoutCheck.dockHeight)}px)`);
      totalAssertions++;

      // Check Desktop vs Mobile chapter controls
      const isMobile = vp.width <= 768;
      const navCheck = await authPage.evaluate((mobile) => {
        const desktopPills = document.querySelector('.desktop-chapter-pills-bar');
        const mobileSwitcher = document.querySelector('.mobile-chapter-switcher-bar');
        return {
          desktopVisible: desktopPills && window.getComputedStyle(desktopPills).display !== 'none',
          mobileVisible: mobileSwitcher && window.getComputedStyle(mobileSwitcher).display !== 'none'
        };
      }, isMobile);

      if (isMobile) {
        assert(navCheck.mobileVisible, `${vp.name}: Mobile chapter switcher bar is visible`);
        totalAssertions++;
        assert(!navCheck.desktopVisible, `${vp.name}: Desktop pills bar is hidden on mobile`);
        totalAssertions++;
      } else {
        assert(navCheck.desktopVisible, `${vp.name}: Desktop chapter pills bar is visible`);
        totalAssertions++;
        assert(!navCheck.mobileVisible, `${vp.name}: Mobile switcher bar is hidden on desktop`);
        totalAssertions++;
      }
    }

    // ----------------------------------------------------------------------
    // TEST SECTION 3: CHAPTER NAVIGATION & 100 STAGES COVERAGE
    // ----------------------------------------------------------------------
    console.log('\n>>> [SECTION 3] CHAPTER FILTERING & 100 STAGES COVERAGE <<<');
    await authPage.setViewport({ width: 1280, height: 800 });

    // Click "All Stages" tab (filter: 0)
    await authPage.evaluate(() => {
      const allBtn = document.querySelector('.ch-pill-item');
      if (allBtn) allBtn.click();
    });
    await sleep(250);

    const allStagesCount = await authPage.evaluate(() => {
      return document.querySelectorAll('.level-tile-stone').length;
    });
    assert(allStagesCount === 100, `All Stages view renders exactly 100 level tiles (actual: ${allStagesCount})`);
    totalAssertions++;

    // Click Chapter 2 pill
    await authPage.evaluate(() => {
      const chPills = document.querySelectorAll('.ch-pill-item');
      // Index 2 is Chapter 2
      if (chPills[2]) chPills[2].click();
    });
    await sleep(250);

    const ch2Check = await authPage.evaluate(() => {
      const tiles = document.querySelectorAll('.level-tile-stone');
      const headerName = document.querySelector('.header-strip-name');
      return {
        count: tiles.length,
        headerName: headerName ? headerName.innerText : ''
      };
    });
    assert(ch2Check.count === 10, `Chapter 2 view renders exactly 10 level tiles (actual: ${ch2Check.count})`);
    totalAssertions++;
    assert(ch2Check.headerName === 'Neon Boulevard', `Chapter 2 header displays 'Neon Boulevard' (actual: "${ch2Check.headerName}")`);
    totalAssertions++;

    // ----------------------------------------------------------------------
    // TEST SECTION 4: TILE STATES, SELECTION, AND LAUNCH FLOW
    // ----------------------------------------------------------------------
    console.log('\n>>> [SECTION 4] TILE STATES, LOCK ENFORCEMENT & LAUNCH FLOW <<<');

    // Switch back to Chapter 1 (Level 1 is unlocked, Level 2..10 are locked for fresh user)
    await authPage.evaluate(() => {
      const chPills = document.querySelectorAll('.ch-pill-item');
      if (chPills[1]) chPills[1].click();
    });
    await sleep(250);

    // Verify Tile States in Chapter 1:
    // Level 1: unlocked / current ("YOU")
    // Level 10: boss-stone
    // Levels 2..10: locked-stone
    const tileStates = await authPage.evaluate(() => {
      const lvl1 = document.querySelector('.level-tile-stone:first-child');
      const lvl10 = document.querySelector('.level-tile-stone:last-child');
      const lockedTiles = document.querySelectorAll('.level-tile-stone.locked-stone');

      return {
        lvl1HasCurrent: lvl1 ? lvl1.classList.contains('current-unlocked') : false,
        lvl10HasBoss: lvl10 ? lvl10.classList.contains('boss-stone') : false,
        lockedCount: lockedTiles.length
      };
    });

    assert(tileStates.lvl1HasCurrent, 'Level 1 tile is marked with current-unlocked state');
    totalAssertions++;
    assert(tileStates.lvl10HasBoss, 'Level 10 tile is marked as a Chapter Boss stage');
    totalAssertions++;
    assert(tileStates.lockedCount === 9, `9 locked tiles present in Chapter 1 for fresh user (actual: ${tileStates.lockedCount})`);
    totalAssertions++;

    // Click locked level 5: should show locked feedback and button disabled
    await authPage.evaluate(() => {
      const tiles = document.querySelectorAll('.level-tile-stone');
      if (tiles[4]) tiles[4].click(); // Level 5
    });
    await sleep(200);

    const lockedActionCheck = await authPage.evaluate(() => {
      const btn = document.querySelector('.dock-action-button');
      const toast = document.querySelector('.locked-feedback-toast');
      const title = document.querySelector('.dock-stage-title');
      return {
        isDisabled: btn ? btn.disabled : false,
        btnText: btn ? btn.innerText.trim() : '',
        hasToast: !!toast && toast.innerText.includes('Stage 5 is locked'),
        dockTitle: title ? title.innerText : ''
      };
    });

    assert(lockedActionCheck.isDisabled, 'Action button is disabled when locked level is selected');
    totalAssertions++;
    assert(lockedActionCheck.btnText === 'LOCKED', `Action button displays 'LOCKED' (actual: "${lockedActionCheck.btnText}")`);
    totalAssertions++;
    assert(lockedActionCheck.hasToast, 'Locked feedback toast appears when locked level is tapped');
    totalAssertions++;

    // Select Level 1 (unlocked): button becomes enabled "START LEVEL"
    await authPage.evaluate(() => {
      const lvl1 = document.querySelector('.level-tile-stone:first-child');
      if (lvl1) lvl1.click();
    });
    await sleep(200);

    const unlockedActionCheck = await authPage.evaluate(() => {
      const btn = document.querySelector('.dock-action-button');
      const title = document.querySelector('.dock-stage-title');
      return {
        isDisabled: btn ? btn.disabled : true,
        btnText: btn ? btn.innerText.trim() : '',
        dockTitle: title ? title.innerText : ''
      };
    });

    assert(!unlockedActionCheck.isDisabled, 'Action button is enabled when Level 1 is selected');
    totalAssertions++;
    assert(unlockedActionCheck.btnText.includes('START LEVEL'), `Action button displays 'START LEVEL' (actual: "${unlockedActionCheck.btnText}")`);
    totalAssertions++;
    assert(unlockedActionCheck.dockTitle.includes('Apprentice Heights'), `Dock displays chapter info (actual: "${unlockedActionCheck.dockTitle}")`);
    totalAssertions++;

    // Click "START LEVEL" -> enters level intro / active gameplay
    await authPage.click('.dock-action-button');
    await authPage.waitForSelector('.level-intro-card, .grid-container, .game-container', { timeout: 6000 });
    const gameBoardVisible = await authPage.$('.level-intro-card, .grid-container, .game-container');
    assert(!!gameBoardVisible, 'Clicking START LEVEL successfully opens the active level intro or gameplay screen');
    totalAssertions++;

    await authPage.close();

    console.log('\n========================================================================');
    console.log(`FINAL RESULTS: ${totalAssertions} / ${totalAssertions} assertions passed`);
    console.log('ALL VERIFICATIONS PASSED WITH ZERO FAILURES! ✓');
    console.log('========================================================================\n');
  } catch (err) {
    console.error('\n❌ VERIFICATION FAILED:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runFullVerification();
