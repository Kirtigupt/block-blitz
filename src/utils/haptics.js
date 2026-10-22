/**
 * Safe Haptic Feedback Helper for BLOCK BLITZ
 * Supports subtle, satisfying vibration patterns on supported devices.
 * Gracefully handles unsupported devices and restricted contexts.
 */

let isHapticsGlobalEnabled = true;

/**
 * Checks whether the browser and device support the Vibration API
 * @returns {boolean}
 */
export const isHapticsSupported = () => {
  return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
};

/**
 * Enables or disables haptics globally
 * @param {boolean} enabled
 */
export const setHapticsEnabled = (enabled) => {
  isHapticsGlobalEnabled = Boolean(enabled);
};

/**
 * Gets current haptic enabled status
 * @returns {boolean}
 */
export const getHapticsEnabled = () => {
  return isHapticsGlobalEnabled;
};

/**
 * Trigger a tactile haptic pattern
 * @param {'place'|'clear'|'multi_clear'|'level_complete'|'game_over'|'invalid'} type
 */
export const triggerHaptic = (type = 'place') => {
  if (!isHapticsGlobalEnabled || !isHapticsSupported()) {
    return;
  }

  try {
    switch (type) {
      case 'place':
        // Crisp, subtle 14ms tap for block placement
        navigator.vibrate(14);
        break;
      case 'clear':
        // 2-pulse ripple for single line clear
        navigator.vibrate([20, 25, 20]);
        break;
      case 'multi_clear':
        // Ascending 3-pulse burst for multi-line clears
        navigator.vibrate([25, 30, 30, 30, 45]);
        break;
      case 'level_complete':
        // Triumphant 4-pulse celebration cadence
        navigator.vibrate([35, 40, 35, 40, 45, 50, 70]);
        break;
      case 'game_over':
        // Heavy double buzz for game over
        navigator.vibrate([55, 40, 60]);
        break;
      case 'invalid':
        // Quick double reject buzz
        navigator.vibrate([20, 25, 20]);
        break;
      default:
        navigator.vibrate(14);
        break;
    }
  } catch {
    // Graceful fallback: some browsers (or desktop modes) throw if user hasn't interacted
  }
};
