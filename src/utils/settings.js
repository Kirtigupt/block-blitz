/**
 * Game Settings Configuration & Persistence for BLOCK BLITZ
 * Persists locally in localStorage independently of account progression and scores.
 */

const SETTINGS_STORAGE_KEY = 'block_blitz_user_settings';

export const DEFAULT_SETTINGS = Object.freeze({
  masterSound: true,
  soundEffects: true,
  voiceAnnouncements: true,
  volume: 80,
  reduceAnimations: false,
  haptics: true
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

  return {
    masterSound,
    soundEffects,
    voiceAnnouncements,
    volume,
    reduceAnimations,
    haptics
  };
};

/**
 * Loads stored settings from localStorage with fallback to defaults.
 * @returns {object} validated settings
 */
export const loadStoredSettings = () => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { ...DEFAULT_SETTINGS };
  }

  try {
    const serialized = localStorage.getItem(SETTINGS_STORAGE_KEY);
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
 */
export const saveStoredSettings = (settings) => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    const validated = validateSettings(settings);
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(validated));
  } catch (err) {
    console.warn('Failed to persist settings to localStorage:', err);
  }
};
