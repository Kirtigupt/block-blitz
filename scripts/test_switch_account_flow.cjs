const puppeteer = require('puppeteer-core');
const assert = require('assert');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:5173';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function run() {
  console.log('========================================================================');
  console.log('BLOCK BLITZ — SWITCH ACCOUNT FLOW VERIFICATION');
  console.log('========================================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 }); // Mobile viewport

  try {
    // -------------------------------------------------------------------------
    // STEP 1: Logged-out State
    // -------------------------------------------------------------------------
    console.log('[Step 1] Verifying Logged-Out Landing Page State:');
    await page.goto(APP_URL, { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload({ waitUntil: 'networkidle0' });
    await page.waitForSelector('.welcome-landing-screen', { timeout: 6000 });
    await sleep(300);

    const guestCheck = await page.evaluate(() => {
      const switchBtn = document.querySelector('.welcome-switch-account-btn');
      const authSubtext = document.querySelector('.welcome-auth-subtext.auth-logged-out');
      const signinBtn = document.querySelector('.welcome-signin-link-btn');
      const welcomeBackMsg = document.querySelector('.welcome-auth-subtext.auth-logged-in');

      return {
        hasSwitchBtn: !!switchBtn,
        hasAuthSubtext: !!authSubtext,
        hasSigninBtn: !!signinBtn,
        signinText: signinBtn ? signinBtn.textContent.trim() : null,
        hasWelcomeBackMsg: !!welcomeBackMsg
      };
    });

    assert.strictEqual(guestCheck.hasSwitchBtn, false, 'Switch Account button is NOT rendered when logged out');
    console.log('  ✓ Switch Account button is absent in logged out / guest mode');

    assert.strictEqual(guestCheck.hasWelcomeBackMsg, false, 'Welcome back message is NOT rendered when logged out');
    console.log('  ✓ "Welcome back" greeting is absent in logged out / guest mode');

    assert.ok(guestCheck.hasSigninBtn, '"Already have an account? Sign in" is displayed for guests');
    console.log('  ✓ "Already have an account? Sign in" is displayed for guests');

    // -------------------------------------------------------------------------
    // STEP 2: Register User A and verify Welcome Page Display
    // -------------------------------------------------------------------------
    console.log('\n[Step 2] Registering User A (Alice):');
    const userA = {
      username: `PilotA_${Date.now()}`,
      email: `pilota_${Date.now()}@test.blitz`,
      password: 'Password123!'
    };

    const regA = await page.evaluate(async (u) => {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(u)
      });
      return await res.json();
    }, userA);

    assert.ok(regA.token && regA.user, 'User A registered successfully');
    console.log(`  ✓ Registered User A: ${userA.username}`);

    // Set User A token and reload Welcome Screen
    await page.evaluate((tok) => {
      localStorage.setItem('block_blitz_token', tok);
    }, regA.token);
    await page.reload({ waitUntil: 'networkidle0' });
    await page.waitForSelector('.welcome-landing-screen', { timeout: 6000 });
    await sleep(400);

    const userACheck = await page.evaluate(() => {
      const welcomeMsg = document.querySelector('.welcome-auth-subtext.auth-logged-in');
      const switchBtn = document.querySelector('.welcome-switch-account-btn');
      const highlight = document.querySelector('.welcome-user-highlight');
      const guestSubtext = document.querySelector('.welcome-auth-subtext.auth-logged-out');

      return {
        hasWelcomeMsg: !!welcomeMsg,
        displayedName: highlight ? highlight.textContent.trim() : null,
        hasSwitchBtn: !!switchBtn,
        switchBtnText: switchBtn ? switchBtn.textContent.trim() : null,
        hasGuestSubtext: !!guestSubtext
      };
    });

    assert.strictEqual(userACheck.displayedName, userA.username, `User A greeting displays: "Welcome back, ${userA.username}!"`);
    console.log(`  ✓ Greeting displays: "Welcome back, ${userA.username}!"`);

    assert.ok(userACheck.hasSwitchBtn, 'Switch Account button is visible below the welcome message');
    console.log(`  ✓ Switch Account button is visible ("${userACheck.switchBtnText}")`);

    assert.strictEqual(userACheck.hasGuestSubtext, false, 'Guest "Already have an account?" is absent for authenticated User A');
    console.log('  ✓ Guest prompt is hidden for authenticated User A');

    // -------------------------------------------------------------------------
    // STEP 3: Click "Switch Account" -> Verify Logout & Auth Modal Display
    // -------------------------------------------------------------------------
    console.log('\n[Step 3] Clicking "Switch Account":');
    await page.click('.welcome-switch-account-btn');
    await page.waitForSelector('.auth-card', { timeout: 5000 });
    await sleep(300);

    const switchState = await page.evaluate(() => {
      const authModal = document.querySelector('.auth-card');
      const token = localStorage.getItem('block_blitz_token');
      const tabs = Array.from(document.querySelectorAll('.auth-tab')).map(t => t.textContent.trim());

      return {
        hasAuthModal: !!authModal,
        tokenCleared: !token,
        tabs
      };
    });

    assert.ok(switchState.hasAuthModal, 'Clicking Switch Account opened the Auth Modal');
    console.log('  ✓ Auth Modal opened on click');

    assert.ok(switchState.tokenCleared, 'Clicking Switch Account securely logged out User A (token cleared)');
    console.log('  ✓ User A session token was securely removed from localStorage');

    assert.ok(switchState.tabs.some(t => t.includes('Sign In')), 'Auth modal contains "Sign In" tab');
    assert.ok(switchState.tabs.some(t => t.includes('Create Account')), 'Auth modal contains "Create Account" tab');
    console.log(`  ✓ Both Sign In and Create Account tabs available: ${JSON.stringify(switchState.tabs)}`);

    // -------------------------------------------------------------------------
    // STEP 4: Register & Sign in as User B (Bob) through the open Auth Modal
    // -------------------------------------------------------------------------
    console.log('\n[Step 4] Signing in as User B (Bob) via Auth Modal:');
    const userB = {
      username: `PilotB_${Date.now()}`,
      email: `pilotb_${Date.now()}@test.blitz`,
      password: 'Password123!'
    };

    // Switch to "Create Account" tab
    const tabs = await page.$$('.auth-tab');
    for (const tab of tabs) {
      const text = await (await tab.getProperty('textContent')).jsonValue();
      if (text.includes('Create Account')) {
        await tab.click();
        break;
      }
    }
    await sleep(250);

    await page.type('#auth-username', userB.username);
    await page.type('#auth-email', userB.email);
    await page.type('#auth-password', userB.password);
    await page.click('.auth-submit-btn');

    // Wait for Auth Modal to complete and Welcome Page to reflect User B
    await page.waitForSelector('.welcome-user-highlight', { timeout: 8000 });
    await sleep(400);

    const userBCheck = await page.evaluate(() => {
      const welcomeMsg = document.querySelector('.welcome-auth-subtext.auth-logged-in');
      const highlight = document.querySelector('.welcome-user-highlight');
      const switchBtn = document.querySelector('.welcome-switch-account-btn');
      const storedToken = localStorage.getItem('block_blitz_token');

      return {
        hasWelcomeMsg: !!welcomeMsg,
        displayedName: highlight ? highlight.textContent.trim() : null,
        hasSwitchBtn: !!switchBtn,
        hasToken: !!storedToken
      };
    });

    assert.strictEqual(userBCheck.displayedName, userB.username, `Welcome message updated to User B's actual name: "${userBCheck.displayedName}" === "${userB.username}"`);
    console.log(`  ✓ Welcome greeting updated to: "Welcome back, ${userB.username}!"`);

    assert.ok(userBCheck.hasSwitchBtn, 'Switch Account button remains accessible for User B');
    console.log('  ✓ Switch Account button is available for User B');

    // -------------------------------------------------------------------------
    // STEP 5: Verify Data Isolation & Play Flow
    // -------------------------------------------------------------------------
    console.log('\n[Step 5] Account Data Isolation & Play Now:');
    // Verify User A and User B both exist in MongoDB and records are intact
    const verifyIsolation = await page.evaluate(async (tokA) => {
      const resA = await fetch('http://localhost:5000/api/auth/me', {
        headers: { 'Authorization': `Bearer ${tokA}` }
      });
      const dataA = await resA.json();

      const tokenB = localStorage.getItem('block_blitz_token');
      const resB = await fetch('http://localhost:5000/api/auth/me', {
        headers: { 'Authorization': `Bearer ${tokenB}` }
      });
      const dataB = await resB.json();

      return {
        userAIntact: resA.ok && dataA.user && dataA.user.username,
        userAName: dataA.user?.username,
        userBIntact: resB.ok && dataB.user && dataB.user.username,
        userBName: dataB.user?.username
      };
    }, regA.token);

    assert.ok(verifyIsolation.userAIntact, `User A database record was NOT deleted or corrupted (found: ${verifyIsolation.userAName})`);
    assert.ok(verifyIsolation.userBIntact, `User B database record created and active (found: ${verifyIsolation.userBName})`);
    console.log(`  ✓ Both User A (${verifyIsolation.userAName}) and User B (${verifyIsolation.userBName}) persist independently in MongoDB Atlas`);

    // Click PLAY NOW as User B
    await page.click('.welcome-play-now-btn');
    await page.waitForSelector('.adventure-map-screen, .campaign-map-screen', { timeout: 6000 });
    const mapOpened = await page.$('.adventure-map-screen, .campaign-map-screen');
    assert.ok(mapOpened, 'Clicking PLAY NOW as User B launches into Level Map');
    console.log('  ✓ Clicking PLAY NOW enters User B\'s Level Map');

    console.log('\n========================================================================');
    console.log('ALL SWITCH ACCOUNT FLOW CHECKS PASSED WITH ZERO FAILURES! ✓');
    console.log('========================================================================');
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error('\n❌ Verification Failed:', err);
  process.exit(1);
});
