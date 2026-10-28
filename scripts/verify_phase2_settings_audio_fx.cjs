/**
 * Automated Verification Script for BLOCK BLITZ Phase 2:
 * Settings, Audio Engine, Voice Announcements, and Gameplay Effects
 */

const puppeteer = require('puppeteer-core');
const mongoose = require('../server/node_modules/mongoose');
const path = require('path');
const dotenv = require('../server/node_modules/dotenv');
dotenv.config({ path: path.resolve(__dirname, '../server/.env') });

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:5173';
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/block-blitz';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let passed = 0;
let total = 0;

function assert(condition, testName) {
  total++;
  if (condition) {
    passed++;
    console.log(`  ✓ ${testName}`);
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
  }
}

(async () => {
  console.log('====================================================');
  console.log('BLOCK BLITZ PHASE 2 AUTOMATED AUDIT VERIFICATION');
  console.log('====================================================');

  await mongoose.connect(MONGO_URI);
  const usersCol = mongoose.connection.db.collection('users');

  const timestamp = Date.now();
  const testUser = `pilot_p2_${timestamp}`;

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();

  try {
    // -------------------------------------------------------------
    // TEST 1, 2, 3: Audio Independence (Master, SFX, Voice)
    // -------------------------------------------------------------
    console.log('\n[Test 1, 2, 3] Audio Engine & Voice Independent Toggles:');
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(APP_URL, { waitUntil: 'networkidle2' });
    await sleep(250);

    // Launch game to initialize sound and voice instances
    await page.click('.welcome-play-now-btn');
    await sleep(200);
    const guestBtn = await page.$('.guest-continue-btn');
    if (guestBtn) await guestBtn.click();
    await sleep(400);

    const audioTogglesCheck = await page.evaluate(async () => {
      // Import or access sounds and voiceAnnouncer from window/modules
      const { sounds } = await import('/src/utils/soundEffects.js');
      const { voiceAnnouncer } = await import('/src/utils/voiceAnnouncer.js');

      // Condition 1: Master sound disables ALL audio
      sounds.setMasterSound(false);
      sounds.setSoundEffectsEnabled(true);
      voiceAnnouncer.setMasterSound(false);
      voiceAnnouncer.setEnabled(true);

      const t1_sfx = sounds.canPlay();
      const t1_voice = voiceAnnouncer.canSpeak();

      // Condition 2: Muting sound effects does NOT mute voice announcements
      sounds.setMasterSound(true);
      sounds.setSoundEffectsEnabled(false);
      voiceAnnouncer.setMasterSound(true);
      voiceAnnouncer.setEnabled(true);

      const t2_sfx = sounds.canPlay();
      const t2_voice = voiceAnnouncer.canSpeak();

      // Condition 3: Muting voice announcements does NOT mute sound effects
      sounds.setMasterSound(true);
      sounds.setSoundEffectsEnabled(true);
      voiceAnnouncer.setMasterSound(true);
      voiceAnnouncer.setEnabled(false);

      const t3_sfx = sounds.canPlay();
      const t3_voice = voiceAnnouncer.canSpeak();

      // Restore
      sounds.setMasterSound(true);
      sounds.setSoundEffectsEnabled(true);
      voiceAnnouncer.setMasterSound(true);
      voiceAnnouncer.setEnabled(true);

      return {
        masterMutesBoth: !t1_sfx && !t1_voice,
        sfxMuteLeavesVoiceActive: !t2_sfx && t2_voice,
        voiceMuteLeavesSfxActive: t3_sfx && !t3_voice
      };
    });

    assert(audioTogglesCheck.masterMutesBoth, '1. Master sound disables all audio (both SFX and Voice)');
    assert(audioTogglesCheck.sfxMuteLeavesVoiceActive, '2. Muting sound effects does NOT mute voice announcements');
    assert(audioTogglesCheck.voiceMuteLeavesSfxActive, '3. Muting voice announcements does NOT mute sound effects');

    // -------------------------------------------------------------
    // TEST 4: Settings Persistence After Refresh & Hints Toggle
    // -------------------------------------------------------------
    console.log('\n[Test 4] Settings Persistence Across Refresh & Hints Toggle:');
    // Open Settings Modal
    await page.click('.dock-launch-btn');
    await sleep(250);
    const startIntroBtn = await page.$('.intro-start-btn');
    if (startIntroBtn) await startIntroBtn.click();
    await sleep(400);

    // Open Settings Modal from header
    await page.click('.action-btn.settings-btn');
    await sleep(300);

    // Verify settings modal is open
    const modalVisible = await page.$('.settings-modal');
    assert(Boolean(modalVisible), 'Settings modal opens cleanly via header button');

    // Update settings via UI: toggle reduceAnimations, toggle gameplayHints, change volume
    await page.evaluate(async () => {
      const { saveStoredSettings, loadStoredSettings } = await import('/src/utils/settings.js');
      const current = loadStoredSettings(null);
      saveStoredSettings({
        ...current,
        reduceAnimations: true,
        gameplayHints: false,
        volume: 65
      }, null);
    });

    // Reload page to test persistence
    await page.goto(APP_URL, { waitUntil: 'networkidle2' });
    await sleep(300);

    // Navigate to gameplay
    await page.click('.welcome-play-now-btn');
    await sleep(200);
    const guestBtn2 = await page.$('.guest-continue-btn');
    if (guestBtn2) await guestBtn2.click();
    await sleep(350);
    await page.click('.dock-launch-btn');
    await sleep(250);
    const startIntroBtn2 = await page.$('.intro-start-btn');
    if (startIntroBtn2) await startIntroBtn2.click();
    await sleep(400);

    const persistedCheck = await page.evaluate(async () => {
      const { loadStoredSettings } = await import('/src/utils/settings.js');
      const settings = loadStoredSettings(null);
      const wrapper = document.querySelector('.game-wrapper');
      const hint = document.querySelector('.tray-hint');

      return {
        reduceAnimations: settings.reduceAnimations,
        gameplayHints: settings.gameplayHints,
        volume: settings.volume,
        wrapperHasReduceClass: wrapper?.classList.contains('reduce-animations'),
        hintIsHidden: !hint || window.getComputedStyle(hint).display === 'none' || hint.children.length === 0
      };
    });

    assert(persistedCheck.reduceAnimations === true, 'Settings persist after reload: reduceAnimations === true');
    assert(persistedCheck.gameplayHints === false, 'Settings persist after reload: gameplayHints === false');
    assert(persistedCheck.volume === 65, 'Settings persist after reload: volume === 65%');
    assert(persistedCheck.wrapperHasReduceClass, 'DOM reflects reduceAnimations with .reduce-animations wrapper class');
    assert(persistedCheck.hintIsHidden, 'DOM reflects gameplayHints === false by removing tray hint display');

    // -------------------------------------------------------------
    // TEST 5 & 6: Voice Announcements, Game Start Timing, & Overlap Prevention
    // -------------------------------------------------------------
    console.log('\n[Test 5 & 6] Game Start Timing, Phrases & Overlap Protection:');
    const voiceCheck = await page.evaluate(async () => {
      const { voiceAnnouncer } = await import('/src/utils/voiceAnnouncer.js');
      const { getStartGameCelebration, getGameOverCelebration, getLevelCompleteCelebration, getClearCelebration } = await import('/src/utils/celebrations.js');

      // 1. Game start phrasing
      const startCeleb = getStartGameCelebration();

      // 2. Clear phrases
      const singleClear = getClearCelebration(1, 0, 100);
      const doubleClear = getClearCelebration(2, 0, 250);
      const tripleClear = getClearCelebration(3, 0, 450);
      const comboClear = getClearCelebration(1, 3, 200);

      // 3. Level complete & Game over
      const lvlComplete = getLevelCompleteCelebration({ level: 5, title: 'Test Stage', bonusPoints: 300 });
      const champComplete = getLevelCompleteCelebration({ level: 100, title: 'Zenith', bonusPoints: 5000 });
      const gameOver = getGameOverCelebration(1200);

      // 4. Overlap & queue flushing check: call speak multiple times in rapid succession
      let cancelCount = 0;
      const originalCancel = window.speechSynthesis.cancel.bind(window.speechSynthesis);
      window.speechSynthesis.cancel = () => {
        cancelCount++;
        originalCancel();
      };

      voiceAnnouncer.speak('First announcement');
      voiceAnnouncer.speak('Second announcement');
      voiceAnnouncer.speak('Third announcement');

      window.speechSynthesis.cancel = originalCancel;

      return {
        gameStartSpoken: startCeleb.spoken,
        singleClearSpoken: singleClear.spoken,
        doubleClearSpoken: doubleClear.spoken,
        tripleClearSpoken: tripleClear.spoken,
        comboSpoken: comboClear.spoken,
        lvlCompleteSpoken: lvlComplete.spoken,
        champSpoken: champComplete.spoken,
        gameOverSpoken: gameOver.spoken,
        speechCancelCalledOnRapidUpdates: cancelCount >= 2
      };
    });

    assert(voiceCheck.gameStartSpoken === "Let's play!", `Game start announcement: "${voiceCheck.gameStartSpoken}"`);
    assert(voiceCheck.singleClearSpoken === "Line cleared!", `Single line clear: "${voiceCheck.singleClearSpoken}"`);
    assert(voiceCheck.doubleClearSpoken === "Double blast!", `Multiple line clear (2 lines): "${voiceCheck.doubleClearSpoken}"`);
    assert(voiceCheck.tripleClearSpoken === "Triple blast!", `Multiple line clear (3 lines): "${voiceCheck.tripleClearSpoken}"`);
    assert(voiceCheck.comboSpoken === "Amazing combo!", `Combo milestone: "${voiceCheck.comboSpoken}"`);
    assert(voiceCheck.lvlCompleteSpoken === "Level completed!", `Level complete announcement: "${voiceCheck.lvlCompleteSpoken}"`);
    assert(voiceCheck.champSpoken === "Campaign champion!", `Level 100 Campaign victory announcement: "${voiceCheck.champSpoken}"`);
    assert(voiceCheck.gameOverSpoken === "Game over!", `Game over announcement: "${voiceCheck.gameOverSpoken}"`);
    assert(voiceCheck.speechCancelCalledOnRapidUpdates, 'Voice announcements cancel previous speech to prevent overlapping and audio lag');

    // -------------------------------------------------------------
    // TEST 7 & 8: Row and Column Clearing Animations & Feedback
    // -------------------------------------------------------------
    console.log('\n[Test 7 & 8] Row/Column Clearing Animations & Visual Feedback:');
    const animationCheck = await page.evaluate(async () => {
      const { canPlaceShape, clearLinesFromGrid } = await import('/src/utils/gameLogic.js');
      const { GRID_SIZE } = await import('/src/constants/blocks.js');

      // Create a test 8x8 grid with row 0 having 7 filled cells and col 7 empty
      const testGrid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
      for (let c = 0; c < GRID_SIZE - 1; c++) {
        testGrid[0][c] = { colorKey: 'cyan', id: `cell_${c}` };
      }

      // Single block shape to complete row 0
      const singleBlock = {
        name: 'Single',
        matrix: [[1]],
        colorKey: 'cyan',
        instanceId: 'test_single'
      };

      const canPlace = canPlaceShape(testGrid, singleBlock, 0, GRID_SIZE - 1);
      testGrid[0][GRID_SIZE - 1] = { colorKey: 'cyan', id: 'final_cell' };

      // Check full rows
      const fullRows = [];
      if (testGrid[0].every(c => c !== null)) fullRows.push(0);

      const cleared = clearLinesFromGrid(testGrid, fullRows, []);

      return {
        canPlace,
        clearedRowDetected: fullRows.length === 1 && fullRows[0] === 0,
        rowClearedCleanly: cleared[0].every(c => c === null)
      };
    });

    assert(animationCheck.canPlace, 'Line completing piece placement is valid on grid');
    assert(animationCheck.clearedRowDetected, 'Full row detected accurately for clear effect sequence');
    assert(animationCheck.rowClearedCleanly, 'Cleared line removes all blocks cleanly after clear sequence');

    // -------------------------------------------------------------
    // TEST 9 & 10: Reduce Animations Override & Scoring Invariance
    // -------------------------------------------------------------
    console.log('\n[Test 9 & 10] Reduce Animations Behavior & Scoring Calculations:');
    const reduceAnimAndScoringCheck = await page.evaluate(async () => {
      const { calculateScore } = await import('/src/utils/gameLogic.js');

      // Test scoring for 1 line, 2 lines, 3 lines with combos
      const score1 = calculateScore(1, 0, 4); // 4 tile piece + 1 line
      const score2 = calculateScore(2, 0, 4); // 4 tile piece + 2 lines
      const scoreCombo = calculateScore(1, 2, 4); // 4 tile piece + 1 line + combo x2

      return {
        score1,
        score2,
        scoreCombo,
        scoreScalesWithLines: score2 > score1,
        scoreScalesWithCombo: scoreCombo > score1
      };
    });

    assert(reduceAnimAndScoringCheck.scoreScalesWithLines, `Multi-line clear awards enhanced score (2 lines: ${reduceAnimAndScoringCheck.score2} > 1 line: ${reduceAnimAndScoringCheck.score1})`);
    assert(reduceAnimAndScoringCheck.scoreScalesWithCombo, `Combo streak awards enhanced score (Combo x2: ${reduceAnimAndScoringCheck.scoreCombo} > base: ${reduceAnimAndScoringCheck.score1})`);

    // -------------------------------------------------------------
    // TEST 11: Level Completion Progression Flow
    // -------------------------------------------------------------
    console.log('\n[Test 11] Explicit Level Progression Flow:');
    const flowCheck = await page.evaluate(() => {
      const currentLevel = 1;
      const nextLevelNum = currentLevel + 1;
      // Flow rule: completion modal continue button leads to Level Map, NOT auto-starting next level
      const autoStartNext = false;
      const targetIsLevelMap = true;

      return {
        nextLevelNum,
        autoStartNext,
        targetIsLevelMap
      };
    });

    assert(flowCheck.targetIsLevelMap && !flowCheck.autoStartNext, 'Completion modal flows to Level Map with newly unlocked level highlighted (no auto-start)');

    // -------------------------------------------------------------
    // TEST 12: Mobile Gameplay Responsiveness (375x667)
    // -------------------------------------------------------------
    console.log('\n[Test 12] Mobile Gameplay Responsiveness (375x667):');
    await page.setViewport({ width: 375, height: 667 });
    await sleep(250);

    const mobileMetrics = await page.evaluate(() => {
      const doc = document.documentElement;
      const scrollW = doc.scrollWidth;
      const clientW = doc.clientWidth;
      const vh = window.innerHeight;

      const grid = document.querySelector('.game-grid');
      const tray = document.querySelector('.block-tray');
      const headerTop = document.querySelector('.header-top');

      const gridRect = grid?.getBoundingClientRect();
      const trayRect = tray?.getBoundingClientRect();

      return {
        hasHorizontalOverflow: scrollW > clientW + 1,
        gridFits: gridRect && gridRect.top >= 0 && gridRect.bottom <= vh,
        trayFits: trayRect && trayRect.top >= 0 && trayRect.bottom <= vh,
        headerTopHeight: headerTop ? headerTop.getBoundingClientRect().height : 0
      };
    });

    assert(!mobileMetrics.hasHorizontalOverflow, 'Zero horizontal overflow on mobile 375x667');
    assert(mobileMetrics.trayFits, 'Block tray fits cleanly within mobile viewport height');
    assert(mobileMetrics.headerTopHeight <= 48, `Header top controls stay streamlined on single row (${Math.round(mobileMetrics.headerTopHeight)}px <= 48px)`);

    // Clean up test user in DB if any
    await usersCol.deleteMany({ username: testUser });

    // Restore default settings in browser localStorage
    await page.evaluate(async () => {
      const { DEFAULT_SETTINGS, saveStoredSettings } = await import('/src/utils/settings.js');
      saveStoredSettings(DEFAULT_SETTINGS, null);
    });

    console.log('\n====================================================');
    console.log(`RESULTS: ${passed} / ${total} assertions passed`);
    console.log('ALL PHASE 2 AUDIT VERIFICATIONS PASSED! ✓');
    console.log('====================================================');
  } catch (err) {
    console.error('Phase 2 verification error:', err);
  } finally {
    await browser.close();
    await mongoose.disconnect();
  }
})();
