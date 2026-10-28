/**
 * Game Settings Configuration & Persistence for BLOCK BLITZ
 * Persists locally in localStorage independently of account progression and scores.
 * Scoped by user ID for logged-in accounts and guest mode.
 */

const SETTINGS_STORAGE_KEY = 'block_blitz_user_settings';

export const getSettingsStorageKey = (userId = null) => {
  return userId ? `${SETTINGS_STORAGE_KEY}_user_${userId}` : `${SETTINGS_STORAGE_KEY}_guest`;
};

export const DEFAULT_SETTINGS = Object.freeze({
  masterSound: true,
  soundEffects: true,
  voiceAnnouncements: true,
  volume: 80,
  reduceAnimations: false,
  haptics: true,
  gameplayHints: true
});

/**
 * Validates a settings object against expected types and ranges.
 * @param {object} raw
 * @returns {object} validated settings
 */
export const validateSettings = (raw) => {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_SETTINGS };
  }

  const masterSound = typeof raw.masterSound === 'boolean' ? raw.masterSound : DEFAULT_SETTINGS.masterSound;
  const soundEffects = typeof raw.soundEffects === 'boolean' ? raw.soundEffects : DEFAULT_SETTINGS.soundEffects;
  const voiceAnnouncements = typeof raw.voiceAnnouncements === 'boolean' ? raw.voiceAnnouncements : DEFAULT_SETTINGS.voiceAnnouncements;

  let volume = DEFAULT_SETTINGS.volume;
  if (typeof raw.volume === 'number' && Number.isFinite(raw.volume)) {
    volume = Math.max(0, Math.min(100, Math.round(raw.volume)));
  }

  const reduceAnimations = typeof raw.reduceAnimations === 'boolean' ? raw.reduceAnimations : DEFAULT_SETTINGS.reduceAnimations;
  const haptics = typeof raw.haptics === 'boolean' ? raw.haptics : DEFAULT_SETTINGS.haptics;
  const gameplayHints = typeof raw.gameplayHints === 'boolean' ? raw.gameplayHints : DEFAULT_SETTINGS.gameplayHints;

  return {
    masterSound,
    soundEffects,
    voiceAnnouncements,
    volume,
    reduceAnimations,
    haptics,
    gameplayHints
  };
};

/**
 * Loads stored settings from localStorage with fallback to defaults.
 * @param {string|null} userId - optional user ID for account-scoped settings
 * @returns {object} validated settings
 */
export const loadStoredSettings = (userId = null) => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { ...DEFAULT_SETTINGS };
  }

  try {
    const scopedKey = getSettingsStorageKey(userId);
    let serialized = localStorage.getItem(scopedKey);

    // Fallback to legacy un-scoped key or guest key if account-scoped key is not yet set
    if (!serialized && userId) {
      serialized = localStorage.getItem(getSettingsStorageKey(null)) || localStorage.getItem(SETTINGS_STORAGE_KEY);
    } else if (!serialized && !userId) {
      serialized = localStorage.getItem(SETTINGS_STORAGE_KEY);
    }

    if (!serialized) {
      return { ...DEFAULT_SETTINGS };
    }
    const parsed = JSON.parse(serialized);
    return validateSettings(parsed);
  } catch (err) {
    console.warn('Failed to load stored settings, using defaults:', err);
    return { ...DEFAULT_SETTINGS };
  }
};

/**
 * Saves validated settings to localStorage.
 * @param {object} settings
 * @param {string|null} userId - optional user ID for account-scoped settings
 */
export const saveStoredSettings = (settings, userId = null) => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    const validated = validateSettings(settings);
    const serialized = JSON.stringify(validated);
    const scopedKey = getSettingsStorageKey(userId);

    localStorage.setItem(scopedKey, serialized);
    // Also mirror to legacy key for guest / general fallback
    if (!userId) {
      localStorage.setItem(SETTINGS_STORAGE_KEY, serialized);
    }
  } catch (err) {
    console.warn('Failed to persist settings to localStorage:', err);
  }
};
