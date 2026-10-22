/**
 * Verification Test Suite for Part 2:
 * Settings, Audio Controls, Voice Announcer, Clear Animations & Regression Checks.
 */

const mongoose = require('../server/node_modules/mongoose');

let passed = 0;
let total = 0;

function assert(condition, name) {
  total++;
  if (condition) {
    passed++;
    console.log('  ✓ ' + name);
  } else {
    console.error('  ✗ FAIL: ' + name);
  }
}

(async () => {
  console.log('====================================================');
  console.log('BLOCK BLITZ PART 2 VERIFICATION SUITE');
  console.log('====================================================');

  // --- SECTION 1: SETTINGS MANAGER & VALIDATION ---
  console.log('\n[Section 1: Settings Model & Local Storage Validation]');
  const settingsModule = await import('../src/utils/settings.js');
  const { DEFAULT_SETTINGS, validateSettings } = settingsModule;

  assert(DEFAULT_SETTINGS.masterSound === true, 'Default masterSound is true');
  assert(DEFAULT_SETTINGS.soundEffects === true, 'Default soundEffects is true');
  assert(DEFAULT_SETTINGS.voiceAnnouncements === true, 'Default voiceAnnouncements is true');
  assert(DEFAULT_SETTINGS.volume === 80, 'Default volume is 80');
  assert(DEFAULT_SETTINGS.reduceAnimations === false, 'Default reduceAnimations is false');
  assert(DEFAULT_SETTINGS.haptics === true, 'Default haptics is true');

  // Validation clamping & type check
  const clamped = validateSettings({ volume: 150, masterSound: 'bad', reduceAnimations: true });
  assert(clamped.volume === 100, 'Volume clamped to max 100');
  assert(clamped.masterSound === true, 'Invalid masterSound falls back to default');
  assert(clamped.reduceAnimations === true, 'Valid reduceAnimations preserved');

  const negativeVol = validateSettings({ volume: -20 });
  assert(negativeVol.volume === 0, 'Negative volume clamped to 0');

  // --- SECTION 2: AUDIO MANAGER GATING & VOLUME CONTROL ---
  console.log('\n[Section 2: SoundManager Gating & Volume]');
  const soundModule = await import('../src/utils/soundEffects.js');
  const { sounds } = soundModule;

  // Initial state
  sounds.setMasterSound(true);
  sounds.setSoundEffectsEnabled(true);
  sounds.setMuted(false);
  assert(sounds.canPlay() === true, 'Sound can play when all enabled');

  // Master Sound OFF stops all sound effects
  sounds.setMasterSound(false);
  assert(sounds.canPlay() === false, 'Master sound OFF disables sound playback');
  assert(sounds.isMuted() === true, 'isMuted returns true when master sound is OFF');

  // Re-enable master sound, disable sound effects
  sounds.setMasterSound(true);
  sounds.setSoundEffectsEnabled(false);
  assert(sounds.canPlay() === false, 'Disabling soundEffects disables playback even if master sound is ON');

  // Re-enable sound effects
  sounds.setSoundEffectsEnabled(true);
  assert(sounds.canPlay() === true, 'Re-enabling soundEffects restores playback');

  // Volume setter
  sounds.setVolume(50);
  assert(sounds.getVolume() === 50, 'Volume set to 50% properly stored');
  sounds.setVolume(80);
  assert(sounds.getVolume() === 80, 'Volume set to 80% restored');

  // --- SECTION 3: VOICE ANNOUNCER SAFEGUARDS & DEDUPLICATION ---
  console.log('\n[Section 3: VoiceAnnouncer Gating, Deduplication & Event Helpers]');
  const voiceModule = await import('../src/utils/voiceAnnouncer.js');
  const { voiceAnnouncer } = voiceModule;

  // Set master sound and voice
  voiceAnnouncer.setMasterSound(true);
  voiceAnnouncer.setEnabled(true);
  assert(voiceAnnouncer.masterSound === true, 'Voice masterSound set');
  assert(voiceAnnouncer.enabled === true, 'Voice enabled set');

  // Master Sound OFF disables voice
  voiceAnnouncer.setMasterSound(false);
  assert(voiceAnnouncer.masterSound === false, 'Master sound OFF disables voice');

  // Re-enable master sound, disable voice directly
  voiceAnnouncer.setMasterSound(true);
  voiceAnnouncer.setEnabled(false);
  assert(voiceAnnouncer.enabled === false, 'Disabling voiceAnnouncements independently stops voice');
  // Sound effects still can play
  assert(sounds.canPlay() === true, 'Disabling voice does NOT disable sound effects');

  // Re-enable voice
  voiceAnnouncer.setEnabled(true);
  assert(voiceAnnouncer.enabled === true, 'Voice announcements re-enabled');

  // Test volume
  voiceAnnouncer.setVolume(60);
  assert(voiceAnnouncer.volume === 0.6, 'Voice volume scaled correctly to 0.6');
  voiceAnnouncer.setVolume(80);

  // Announcement helper signatures exist
  assert(typeof voiceAnnouncer.announceLevelStart === 'function', 'announceLevelStart exists');
  assert(typeof voiceAnnouncer.announceGoodMove === 'function', 'announceGoodMove exists');
  assert(typeof voiceAnnouncer.announceLineClear === 'function', 'announceLineClear exists');
  assert(typeof voiceAnnouncer.announceLevelComplete === 'function', 'announceLevelComplete exists');
  assert(typeof voiceAnnouncer.announceLevelFailed === 'function', 'announceLevelFailed exists');
  assert(typeof voiceAnnouncer.cancel === 'function', 'cancel exists');

  // --- SECTION 4: LINE CLEAR DETECTION & CELEBRATION MAPPING ---
  console.log('\n[Section 4: Clear Logic, Scoring & Spoken Phrase Integrity]');
  const gameLogic = await import('../src/utils/gameLogic.js');
  const { createEmptyGrid, detectFullLines, calculateScore } = gameLogic;
  const celebModule = await import('../src/utils/celebrations.js');
  const { getClearCelebration, getGameOverCelebration, getLevelCompleteCelebration } = celebModule;

  // Single row full
  const gridRow = createEmptyGrid();
  for (let c = 0; c < 8; c++) gridRow[3][c] = { colorKey: 'cyan' };
  const resRow = detectFullLines(gridRow);
  assert(resRow.fullRows.length === 1 && resRow.fullCols.length === 0, '1 full row detected');
  assert(resRow.totalLines === 1, 'Total lines is exactly 1');

  // Single column full
  const gridCol = createEmptyGrid();
  for (let r = 0; r < 8; r++) gridCol[r][5] = { colorKey: 'purple' };
  const resCol = detectFullLines(gridCol);
  assert(resCol.fullCols.length === 1 && resCol.fullRows.length === 0, '1 full column detected');
  assert(resCol.totalLines === 1, 'Total lines is exactly 1');

  // Multi-line clear (2 lines)
  const celeb2 = getClearCelebration(2, 1, 300);
  assert(celeb2.title === 'DOUBLE CLEAR!', '2 lines mapped to DOUBLE CLEAR!');
  assert(celeb2.spoken === 'Double clear!', 'Spoken announcement is "Double clear!"');

  // Multi-line clear (3 lines)
  const celeb3 = getClearCelebration(3, 1, 500);
  assert(celeb3.title === 'TRIPLE CLEAR!', '3 lines mapped to TRIPLE CLEAR!');
  assert(celeb3.spoken === 'Triple clear!', 'Spoken announcement is "Triple clear!"');

  // Multi-line clear (4 lines)
  const celeb4 = getClearCelebration(4, 1, 800);
  assert(celeb4.title === 'MULTI CLEAR!', '4 lines mapped to MULTI CLEAR!');
  assert(celeb4.spoken === 'Multi clear!', 'Spoken announcement is "Multi clear!"');

  // Single line with combo
  const celebCombo2 = getClearCelebration(1, 2, 200);
  assert(celebCombo2.title === 'COMBO x2!', 'Streak 2 mapped to COMBO x2!');
  assert(celebCombo2.spoken === 'Combo x2!', 'Spoken announcement is "Combo x2!"');

  const celebCombo4 = getClearCelebration(1, 4, 400);
  assert(celebCombo4.title === 'ON FIRE!', 'Streak 4 mapped to ON FIRE!');
  assert(celebCombo4.spoken === 'Amazing combo!', 'Spoken announcement is "Amazing combo!"');

  // Single line without combo
  const celebSingle = getClearCelebration(1, 1, 100);
  assert(celebSingle.spoken === 'Line cleared!', 'Single line clear announces "Line cleared!"');

  // Level complete announcement
  const celebComplete = getLevelCompleteCelebration({ level: 5, title: 'Gem Hunter' }, 500);
  assert(celebComplete.spoken === 'Level completed!', 'Level complete announces "Level completed!"');

  // Level failed / Game Over announcement
  const celebFailed = getGameOverCelebration(1200);
  assert(celebFailed.spoken === 'Level failed. Try again!', 'Level failed announces "Level failed. Try again!"');

  // Line score invariant
  const score1 = calculateScore(1, 1);
  const score2 = calculateScore(2, 1);
  const score3 = calculateScore(3, 1);
  assert(score1 === 100, 'Score for 1 line is 100');
  assert(score2 === 300, 'Score for 2 lines is 300 (100*2 + 100 bonus)');
  assert(score3 === 600, 'Score for 3 lines is 600 (100*3 + 300 bonus)');

  // --- SECTION 5: HAPTICS & REDUCED ANIMATIONS INTEGRATION ---
  console.log('\n[Section 5: Haptics & Reduced Animations Safety]');
  const hapticsModule = await import('../src/utils/haptics.js');
  const { isHapticsSupported, triggerHaptic, setHapticsEnabled } = hapticsModule;

  // In Node.js, navigator.vibrate is undefined, which proves safe fallback
  assert(isHapticsSupported() === false, 'isHapticsSupported safely returns false in non-vibration environment');
  // Must not throw when called in unsupported environment
  let threw = false;
  try {
    triggerHaptic('place');
    triggerHaptic('clear');
    triggerHaptic('multi_clear');
    triggerHaptic('level_complete');
    triggerHaptic('invalid');
  } catch {
    threw = true;
  }
  assert(threw === false, 'triggerHaptic executed without errors in unsupported environment');

  setHapticsEnabled(false);
  assert(hapticsModule.getHapticsEnabled() === false, 'Haptics toggle successfully disabled');
  setHapticsEnabled(true);

  // --- SECTION 6: REGRESSION CHECKS (ACCOUNTS & PROGRESSION) ---
  console.log('\n[Section 6: Account Progression Preservation]');
  await mongoose.connect('mongodb://127.0.0.1:27017/block-blitz');
  const usersCol = mongoose.connection.db.collection('users');

  const kirti = await usersCol.findOne({ username: 'Kirti Gupta' });
  assert(kirti !== null, 'Kirti Gupta account preserved in database');
  assert(kirti.unlockedLevel === 10, 'Kirti Gupta remains at Level 10 (actual: ' + kirti?.unlockedLevel + ')');
  assert(kirti.completedLevels.length === 9, 'Kirti Gupta completed 9 levels');
  assert(kirti.highScore === 4312, 'Kirti Gupta high score preserved (4,312)');

  const krishnaa = await usersCol.findOne({ username: 'krishnaa' });
  assert(krishnaa !== null, 'krishnaa account preserved in database');
  assert(krishnaa.unlockedLevel === 1, 'krishnaa remains at Level 1');
  assert(krishnaa.completedLevels.length === 0, 'krishnaa completed levels empty');

  await mongoose.disconnect();

  console.log('\n====================================================');
  console.log(`RESULTS: ${passed} / ${total} checks passed.`);
  if (passed === total) {
    console.log('ALL PART 2 VERIFICATION CHECKS PASSED! ✓');
  } else {
    console.error('SOME CHECKS FAILED!');
    process.exit(1);
  }
})();
