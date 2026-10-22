// Web Audio API Synthesizer for Block Blitz Sound Effects
class SoundManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.masterSound = true;
    this.soundEffectsEnabled = true;
    this.volume = 0.8;
    this.muted = false;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  getMasterDestination() {
    if (!this.ctx) return null;
    return this.masterGain || this.ctx.destination;
  }

  canPlay() {
    return this.masterSound && this.soundEffectsEnabled && !this.muted;
  }

  setMasterSound(enabled) {
    this.masterSound = Boolean(enabled);
  }

  setSoundEffectsEnabled(enabled) {
    this.soundEffectsEnabled = Boolean(enabled);
  }

  setVolume(volumeValue) {
    // Accepts 0-100 percentage or 0.0-1.0 float
    const val = typeof volumeValue === 'number' && Number.isFinite(volumeValue) ? volumeValue : 80;
    const normalized = val > 1 ? val / 100 : val;
    this.volume = Math.max(0, Math.min(1, normalized));

    if (this.ctx && this.masterGain) {
      try {
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      } catch {
        // Safe fallback
      }
    }
  }

  getVolume() {
    return Math.round(this.volume * 100);
  }

  setMuted(isMuted) {
    this.muted = Boolean(isMuted);
  }

  isMuted() {
    return !this.masterSound || !this.soundEffectsEnabled || this.muted;
  }

  // Preview tone for Settings volume testing
  playTestTone() {
    if (!this.canPlay()) return;
    this.init();
    const dest = this.getMasterDestination();
    if (!this.ctx || !dest) return;

    try {
      const now = this.ctx.currentTime;
      [523.25, 659.25].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        const start = now + i * 0.08;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.12, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.18);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(start);
        osc.stop(start + 0.18);
      });
    } catch {
      // AudioContext protection
    }
  }

  // Click / Select shape
  playSelect() {
    if (!this.canPlay()) return;
    this.init();
    const dest = this.getMasterDestination();
    if (!this.ctx || !dest) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(660, now + 0.08);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // AudioContext protection
    }
  }

  // Soft, pleasant pickup sound (gentle glass pop / digital chime)
  playPickup() {
    if (!this.canPlay()) return;
    this.init();
    const dest = this.getMasterDestination();
    if (!this.ctx || !dest) return;

    try {
      const now = this.ctx.currentTime;

      // Primary tone: gentle upward glass sweep
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(540, now);
      osc1.frequency.exponentialRampToValueAtTime(750, now + 0.05);

      gain1.gain.setValueAtTime(0.001, now);
      gain1.gain.linearRampToValueAtTime(0.09, now + 0.012);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.075);

      osc1.connect(gain1);
      gain1.connect(dest);
      osc1.start(now);
      osc1.stop(now + 0.08);

      // Delicate overtone for crystalline glass texture
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1080, now);
      osc2.frequency.exponentialRampToValueAtTime(1260, now + 0.04);

      gain2.gain.setValueAtTime(0.001, now);
      gain2.gain.linearRampToValueAtTime(0.035, now + 0.01);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc2.connect(gain2);
      gain2.connect(dest);
      osc2.start(now);
      osc2.stop(now + 0.06);
    } catch {
      // AudioContext protection
    }
  }

  // Block placement: satisfying tactile snap & gentle settling thud
  playPlace() {
    if (!this.canPlay()) return;
    this.init();
    const dest = this.getMasterDestination();
    if (!this.ctx || !dest) return;

    try {
      const now = this.ctx.currentTime;

      // 1. Crisp initial snap
      const snapOsc = this.ctx.createOscillator();
      const snapGain = this.ctx.createGain();
      snapOsc.type = 'sine';
      snapOsc.frequency.setValueAtTime(650, now);
      snapOsc.frequency.exponentialRampToValueAtTime(260, now + 0.035);

      snapGain.gain.setValueAtTime(0.09, now);
      snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      snapOsc.connect(snapGain);
      snapGain.connect(dest);
      snapOsc.start(now);
      snapOsc.stop(now + 0.04);

      // 2. Warm settling thud
      const thudOsc = this.ctx.createOscillator();
      const thudGain = this.ctx.createGain();
      thudOsc.type = 'triangle';
      thudOsc.frequency.setValueAtTime(260, now);
      thudOsc.frequency.exponentialRampToValueAtTime(110, now + 0.12);

      thudGain.gain.setValueAtTime(0.18, now);
      thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      thudOsc.connect(thudGain);
      thudGain.connect(dest);
      thudOsc.start(now);
      thudOsc.stop(now + 0.12);
    } catch {
      // AudioContext protection
    }
  }

  // Celebratory fanfare sound for setting a new personal record
  playHighScore() {
    if (!this.canPlay()) return;
    this.init();
    const dest = this.getMasterDestination();
    if (!this.ctx || !dest) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 major chime
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        const start = now + idx * 0.08;
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.16, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);

        osc.connect(gain);
        gain.connect(dest);
        osc.start(start);
        osc.stop(start + 0.35);
      });
    } catch {
      // AudioContext protection
    }
  }

  // Triumphant, uplifting fanfare sound for completing a level objective
  playLevelComplete() {
    if (!this.canPlay()) return;
    this.init();
    const dest = this.getMasterDestination();
    if (!this.ctx || !dest) return;

    try {
      // 5-note ascending fanfare: C5, E5, G5, B5, C6 + C6/G5 final chord
      const notes = [523.25, 659.25, 783.99, 987.77, 1046.50];
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        const start = now + idx * 0.09;
        osc.frequency.setValueAtTime(freq, start);

        // Climax note has longer sustain
        const duration = idx === notes.length - 1 ? 0.6 : 0.32;
        gain.gain.setValueAtTime(0.18, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

        osc.connect(gain);
        gain.connect(dest);
        osc.start(start);
        osc.stop(start + duration);
      });

      // Harmonic warmth overtone for final note
      const harmOsc = this.ctx.createOscillator();
      const harmGain = this.ctx.createGain();
      harmOsc.type = 'triangle';
      const finalStart = now + (notes.length - 1) * 0.09;
      harmOsc.frequency.setValueAtTime(1318.51, finalStart); // E6
      harmGain.gain.setValueAtTime(0.1, finalStart);
      harmGain.gain.exponentialRampToValueAtTime(0.001, finalStart + 0.65);
      harmOsc.connect(harmGain);
      harmGain.connect(dest);
      harmOsc.start(finalStart);
      harmOsc.stop(finalStart + 0.65);
    } catch {
      // AudioContext protection
    }
  }

  // Bright 3-note ascending chime for starting a level
  playLevelStart() {
    if (!this.canPlay()) return;
    this.init();
    const dest = this.getMasterDestination();
    if (!this.ctx || !dest) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [440, 554.37, 659.25]; // A4, C#5, E5
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        const start = now + idx * 0.08;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.12, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.28);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(start);
        osc.stop(start + 0.28);
      });
    } catch {
      // AudioContext protection
    }
  }

  // Invalid drop / rejected placement (low buzz)
  playInvalid() {
    if (!this.canPlay()) return;
    this.init();
    const dest = this.getMasterDestination();
    if (!this.ctx || !dest) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(100, now + 0.15);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // AudioContext protection
    }
  }

  // Line Clear (arpeggiated harmonious chime based on line count and combo)
  playClear(lineCount = 1, combo = 1) {
    if (!this.canPlay()) return;
    this.init();
    const dest = this.getMasterDestination();
    if (!this.ctx || !dest) return;

    try {
      const baseFreqs = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
      const baseIndex = Math.min(Math.max(0, lineCount - 1), baseFreqs.length - 1);
      const startFreq = baseFreqs[baseIndex] * (1 + (combo - 1) * 0.1);

      const notes = [startFreq, startFreq * 1.25, startFreq * 1.5];
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        const noteStart = now + idx * 0.06;
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.15, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.3);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(noteStart);
        osc.stop(noteStart + 0.3);
      });
    } catch {
      // AudioContext protection
    }
  }

  // Game over sound
  playGameOver() {
    if (!this.canPlay()) return;
    this.init();
    const dest = this.getMasterDestination();
    if (!this.ctx || !dest) return;

    try {
      const notes = [440, 392, 349.23, 293.66]; // A4, G4, F4, D4
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        const noteStart = now + idx * 0.15;
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.15, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.25);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(noteStart);
        osc.stop(noteStart + 0.25);
      });
    } catch {
      // AudioContext protection
    }
  }
}

export const sounds = new SoundManager();
