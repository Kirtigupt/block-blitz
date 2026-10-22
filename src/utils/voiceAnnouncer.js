/**
 * Voice Announcer using Web Speech API (speechSynthesis)
 * Provides concise, clear arcade voice announcements for BLOCK BLITZ.
 * Controlled by Master Sound, Voice Announcements, and Volume settings.
 */

const VOICE_PREF_KEY = 'block_blitz_voice_enabled';

class VoiceAnnouncer {
  constructor() {
    this.enabled = true;
    this.masterSound = true;
    this.volume = 0.8;
    this.voice = null;
    this.isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
    this.hasUserInteracted = false;
    this.lastSpokenText = '';
    this.lastSpokenTime = 0;
    this.pendingTimeout = null;

    // Load legacy or existing voice preference if available
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem(VOICE_PREF_KEY);
        if (saved !== null) {
          this.enabled = saved === 'true';
        }
      }
    } catch {
      this.enabled = true;
    }

    if (this.isSupported) {
      this.initVoices();
      if (typeof window.speechSynthesis.onvoiceschanged !== 'undefined') {
        window.speechSynthesis.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  initVoices() {
    if (!this.isSupported) return;
    try {
      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) return;

      // Prefer a natural, clear English voice
      const englishVoices = voices.filter((v) => v.lang && v.lang.startsWith('en'));
      const naturalVoice = englishVoices.find((v) =>
        v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Karen')
      );

      this.voice = naturalVoice || englishVoices[0] || voices[0];
    } catch (e) {
      console.warn('Voice initialization notice:', e);
    }
  }

  unlock() {
    this.hasUserInteracted = true;
    if (this.isSupported && window.speechSynthesis.paused) {
      try {
        window.speechSynthesis.resume();
      } catch {
        // Ignore
      }
    }
  }

  setMasterSound(enabled) {
    this.masterSound = Boolean(enabled);
    if (!this.masterSound) {
      this.cancel();
    }
  }

  setEnabled(val) {
    this.enabled = Boolean(val);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(VOICE_PREF_KEY, String(this.enabled));
      }
    } catch {
      // Ignore
    }
    if (!this.enabled) {
      this.cancel();
    }
  }

  setVolume(volumeValue) {
    const val = typeof volumeValue === 'number' && Number.isFinite(volumeValue) ? volumeValue : 80;
    const normalized = val > 1 ? val / 100 : val;
    this.volume = Math.max(0, Math.min(1, normalized));
  }

  isEnabled() {
    return this.enabled && this.isSupported;
  }

  canSpeak() {
    return this.isSupported && this.enabled && this.masterSound;
  }

  cancel() {
    if (this.pendingTimeout) {
      clearTimeout(this.pendingTimeout);
      this.pendingTimeout = null;
    }
    if (this.isSupported) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Safe fallback
      }
    }
  }

  /**
   * Speak a concise announcement
   * @param {string} text - text to speak
   * @param {number} pitch - optional custom pitch
   * @param {number} rate - optional speech rate
   */
  speak(text, pitch = 1.12, rate = 1.08) {
    if (!this.canSpeak() || !text) return;

    this.unlock();

    try {
      // Clean punctuation and emoji for speech synthesis
      const cleanText = text.replace(/[!\u2022]|[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '').trim();
      if (!cleanText) return;

      const now = Date.now();
      // Deduplication & cooldown: avoid repeating identical phrases within 750ms
      if (this.lastSpokenText.toLowerCase() === cleanText.toLowerCase() && (now - this.lastSpokenTime) < 750) {
        return;
      }
      this.lastSpokenText = cleanText;
      this.lastSpokenTime = now;

      // Cancel previous speech to flush queue and avoid audio lag
      this.cancel();

      // Ensure voices are initialized if not already
      if (!this.voice) {
        this.initVoices();
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      if (this.voice) {
        utterance.voice = this.voice;
      }
      utterance.lang = 'en-US';
      utterance.pitch = pitch;
      utterance.rate = rate;
      utterance.volume = this.volume;

      utterance.onerror = (e) => {
        if (e.error !== 'canceled' && e.error !== 'interrupted') {
          console.debug('Speech announcement skipped:', e.error);
        }
      };

      // In Chromium engines, cancel() followed by immediate speak() in the same tick
      // can cause the audio thread to drop the utterance. A 15ms micro-flush resolves this.
      this.pendingTimeout = setTimeout(() => {
        if (!this.canSpeak()) return;
        try {
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
          window.speechSynthesis.speak(utterance);
        } catch {
          // Safe fallback
        }
      }, 15);
    } catch (err) {
      console.warn('Voice announcement error:', err);
    }
  }

  // --- Specialized Announcement Helpers (Task 3) ---

  announceLevelStart() {
    this.speak('Level started.', 1.15, 1.05);
  }

  announceGoodMove() {
    this.speak('Nice move!', 1.2, 1.1);
  }

  announceLineClear(linesCount, streak = 0) {
    if (linesCount <= 0) return;

    if (linesCount >= 4) {
      this.speak('Multi clear!', 1.25, 1.12);
    } else if (linesCount === 3) {
      this.speak('Triple clear!', 1.2, 1.1);
    } else if (linesCount === 2) {
      this.speak('Double clear!', 1.15, 1.08);
    } else if (streak >= 4) {
      this.speak('Amazing combo!', 1.25, 1.12);
    } else if (streak === 3) {
      this.speak('Combo x3!', 1.18, 1.1);
    } else if (streak === 2) {
      this.speak('Combo x2!', 1.15, 1.08);
    } else {
      this.speak('Line cleared!', 1.12, 1.06);
    }
  }

  announceLevelComplete() {
    this.speak('Level completed!', 1.2, 1.05);
  }

  announceLevelFailed() {
    this.speak('Level failed. Try again!', 1.05, 1.02);
  }
}

export const voiceAnnouncer = new VoiceAnnouncer();
