/**
 * Celebration logic for BLOCK BLITZ
 * Evaluates gameplay events to determine celebratory visual badges and spoken announcements.
 */

/**
 * Determine celebration details for a line clear move
 * @param {number} clearedLines - Number of full rows + columns cleared in this move
 * @param {number} currentStreak - Current consecutive clear streak count (e.g. 1, 2, 3...)
 * @param {number} turnPoints - Total points awarded for this turn
 * @param {boolean} isNewRecord - Whether this move just broke the all-time high score
 * @returns {object} { title, spoken, points, sub, tier, triggerConfetti, screenShake }
 */
export const getClearCelebration = (clearedLines, currentStreak, turnPoints, isNewRecord = false) => {
  if (clearedLines <= 0) return null;

  const recordBadge = isNewRecord ? ' • NEW RECORD! 🏆' : '';

  // 1. Four or more lines cleared in one move: "MULTI CLEAR!"
  if (clearedLines >= 4) {
    let sub = `${clearedLines} LINES CLEARED!`;
    if (currentStreak >= 2) {
      sub = `${clearedLines} LINES • COMBO x${currentStreak}! 🔥`;
    }
    return {
      title: 'MULTI CLEAR!',
      spoken: 'Multi clear!',
      points: turnPoints,
      sub: `${sub}${recordBadge}`,
      tier: 'mega_clear',
      triggerConfetti: true,
      screenShake: 'intense'
    };
  }

  // 2. Three lines cleared in one move: "TRIPLE CLEAR!"
  if (clearedLines === 3) {
    const baseSub = currentStreak > 1 ? `3 LINES • COMBO x${currentStreak}! 🔥` : 'TRIPLE LINE CLEAR!';
    return {
      title: 'TRIPLE CLEAR!',
      spoken: 'Triple clear!',
      points: turnPoints,
      sub: `${baseSub}${recordBadge}`,
      tier: 'triple_clear',
      triggerConfetti: true,
      screenShake: 'subtle'
    };
  }

  // 3. Two lines cleared in one move: "DOUBLE CLEAR!"
  if (clearedLines === 2) {
    const baseSub = currentStreak > 1 ? `2 LINES • COMBO x${currentStreak}! 🔥` : 'DOUBLE LINE CLEAR!';
    return {
      title: 'DOUBLE CLEAR!',
      spoken: 'Double clear!',
      points: turnPoints,
      sub: `${baseSub}${recordBadge}`,
      tier: 'double_clear',
      triggerConfetti: false,
      screenShake: 'subtle'
    };
  }

  // 4. Single line cleared:
  if (currentStreak >= 4) {
    return {
      title: 'ON FIRE!',
      spoken: 'Amazing combo!',
      points: turnPoints,
      sub: `STREAK x${currentStreak}! 🔥🔥🔥${recordBadge}`,
      tier: 'on_fire',
      triggerConfetti: true,
      screenShake: 'subtle'
    };
  }

  if (currentStreak === 3) {
    return {
      title: 'COMBO x3!',
      spoken: 'Combo x3!',
      points: turnPoints,
      sub: `3 Clears in a row! 🔥🔥${recordBadge}`,
      tier: 'combo',
      triggerConfetti: false,
      screenShake: null
    };
  }

  if (currentStreak === 2) {
    return {
      title: 'COMBO x2!',
      spoken: 'Combo x2!',
      points: turnPoints,
      sub: `2 Clears in a row! 🔥${recordBadge}`,
      tier: 'combo',
      triggerConfetti: false,
      screenShake: null
    };
  }

  // First line clear without an active streak:
  // Show a subtle "+POINTS" indicator with a clear, concise voice announcement
  return {
    title: 'LINE CLEARED!',
    spoken: 'Line cleared!',
    points: turnPoints,
    sub: isNewRecord ? 'NEW RECORD! 🏆' : null,
    tier: 'subtle_points',
    triggerConfetti: false,
    screenShake: null
  };
};

/**
 * Celebration for setting a new personal record
 */
export const getHighScoreCelebration = (newHighScore, sub = 'NEW PERSONAL BEST! 🏆') => {
  return {
    title: 'NEW HIGH SCORE!',
    spoken: 'Nice move! New high score!',
    points: newHighScore,
    sub,
    tier: 'highscore',
    triggerConfetti: true
  };
};

/**
 * Visual feedback when attempting to select or place an unplaceable piece
 */
export const getNoValidMoveCelebration = (customSub = 'No space on board for this piece') => {
  return {
    title: 'NO VALID MOVE!',
    spoken: null, // subtle visual only, no spoken audio clutter
    points: null,
    sub: customSub,
    tier: 'invalid',
    triggerConfetti: false
  };
};

/**
 * Celebration for starting a fresh match
 */
export const getStartGameCelebration = () => {
  return {
    title: "LET'S PLAY!",
    spoken: 'Level started.',
    points: null,
    sub: 'Clear lines & build combos!',
    tier: 'start',
    triggerConfetti: false
  };
};

/**
 * Announcement for Game Over / Level Failed
 */
export const getGameOverCelebration = (finalScore) => {
  return {
    title: 'LEVEL FAILED',
    spoken: 'Level failed. Try again!',
    points: finalScore,
    sub: 'Out of valid moves on board',
    tier: 'gameover',
    triggerConfetti: false
  };
};

/**
 * Celebration for completing a level objective
 */
export const getLevelCompleteCelebration = (levelConfig, bonusPoints) => {
  const levelNum = levelConfig?.level || 1;
  const levelTitle = levelConfig?.title || 'Objective Achieved';
  return {
    title: `LEVEL ${levelNum} COMPLETE!`,
    spoken: 'Level completed!',
    points: bonusPoints,
    sub: `${levelTitle} • +${bonusPoints.toLocaleString()} BONUS! ⭐`,
    tier: 'level_complete',
    triggerConfetti: true,
    screenShake: 'subtle'
  };
};
