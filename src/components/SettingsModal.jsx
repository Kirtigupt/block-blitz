import React, { useEffect, useCallback } from 'react';
import {
  Settings,
  X,
  Volume2,
  VolumeX,
  Volume1,
  Sparkles,
  Smartphone,
  RotateCcw,
  Check,
  Info,
  Lightbulb
} from 'lucide-react';
import { DEFAULT_SETTINGS } from '../utils/settings';
import { isHapticsSupported } from '../utils/haptics';
import { sounds } from '../utils/soundEffects';

export const SettingsModal = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings
}) => {
  const hapticsAvailable = isHapticsSupported();

  // Close with Escape key
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const handleToggle = (key) => {
    onUpdateSettings({ [key]: !settings[key] });
  };

  const handleVolumeChange = (e) => {
    const newVol = parseInt(e.target.value, 10);
    onUpdateSettings({ volume: newVol });
  };

  const handleResetDefaults = () => {
    onUpdateSettings({ ...DEFAULT_SETTINGS });
  };

  const handleTestSound = () => {
    if (settings.masterSound && settings.soundEffects) {
      sounds.playTestTone();
    }
  };

  const isAudioDisabled = !settings.masterSound;

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="settings-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="settings-header">
          <div className="settings-title-group">
            <div className="settings-icon-bubble">
              <Settings size={20} className="settings-title-icon" />
            </div>
            <div>
              <h2 id="settings-title" className="settings-title">
                GAME SETTINGS
              </h2>
              <p className="settings-subtitle">Customize audio, visuals, and feedback</p>
            </div>
          </div>
          <button
            type="button"
            className="settings-close-btn"
            onClick={onClose}
            aria-label="Close settings"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="settings-body">
          {/* Section: Audio Controls */}
          <div className="settings-section">
            <div className="settings-section-header">
              <Volume2 size={16} className="section-icon" />
              <h3>AUDIO CONTROLS</h3>
            </div>

            {/* 1. Master Sound */}
            <div className="setting-row">
              <div className="setting-info">
                <span className="setting-label">Master Sound</span>
                <span className="setting-desc">Enables or disables all game audio and commentary</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.masterSound}
                className={`switch-toggle ${settings.masterSound ? 'switch-on' : 'switch-off'}`}
                onClick={() => handleToggle('masterSound')}
                aria-label="Toggle Master Sound"
              >
                <span className="switch-thumb" />
              </button>
            </div>

            {/* 2. Sound Effects */}
            <div className={`setting-row ${isAudioDisabled ? 'setting-disabled' : ''}`}>
              <div className="setting-info">
                <div className="setting-label-row">
                  <span className="setting-label">Sound Effects</span>
                  {isAudioDisabled && <span className="disabled-badge">Master Audio OFF</span>}
                </div>
                <span className="setting-desc">Tactile clicks, piece placement snaps, and line chimes</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.soundEffects && !isAudioDisabled}
                disabled={isAudioDisabled}
                className={`switch-toggle ${
                  settings.soundEffects && !isAudioDisabled ? 'switch-on' : 'switch-off'
                }`}
                onClick={() => handleToggle('soundEffects')}
                aria-label="Toggle Sound Effects"
              >
                <span className="switch-thumb" />
              </button>
            </div>

            {/* 3. Voice Announcements */}
            <div className={`setting-row ${isAudioDisabled ? 'setting-disabled' : ''}`}>
              <div className="setting-info">
                <div className="setting-label-row">
                  <span className="setting-label">Voice Announcements</span>
                  {isAudioDisabled && <span className="disabled-badge">Master Audio OFF</span>}
                </div>
                <span className="setting-desc">Spoken commentary for combos, multi-clears, and stage results</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.voiceAnnouncements && !isAudioDisabled}
                disabled={isAudioDisabled}
                className={`switch-toggle ${
                  settings.voiceAnnouncements && !isAudioDisabled ? 'switch-on' : 'switch-off'
                }`}
                onClick={() => handleToggle('voiceAnnouncements')}
                aria-label="Toggle Voice Announcements"
              >
                <span className="switch-thumb" />
              </button>
            </div>

            {/* 4. Volume Slider */}
            <div className={`setting-row volume-row ${isAudioDisabled ? 'setting-disabled' : ''}`}>
              <div className="setting-info">
                <div className="setting-label-row">
                  <span className="setting-label">Master Volume</span>
                  <span className="volume-percent-badge">{settings.volume}%</span>
                </div>
                <span className="setting-desc">Applies consistently to sound effects and speech synthesizer</span>
              </div>
              <div className="volume-slider-group">
                <div className="slider-track-container">
                  {settings.volume === 0 || isAudioDisabled ? (
                    <VolumeX size={15} className="volume-min-icon" />
                  ) : settings.volume < 50 ? (
                    <Volume1 size={15} className="volume-min-icon" />
                  ) : (
                    <Volume2 size={15} className="volume-min-icon" />
                  )}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={settings.volume}
                    disabled={isAudioDisabled}
                    onChange={handleVolumeChange}
                    className="volume-slider"
                    aria-label="Master Volume Slider"
                  />
                </div>
                <button
                  type="button"
                  className="test-sound-btn"
                  onClick={handleTestSound}
                  disabled={isAudioDisabled || !settings.soundEffects}
                  title="Test Sound Volume"
                >
                  <Sparkles size={12} />
                  <span>Test Tone</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section: Visuals & Gameplay */}
          <div className="settings-section">
            <div className="settings-section-header">
              <Sparkles size={16} className="section-icon" />
              <h3>VISUALS & GAMEPLAY</h3>
            </div>

            {/* 5. Reduce Animations */}
            <div className="setting-row">
              <div className="setting-info">
                <span className="setting-label">Reduce Animations</span>
                <span className="setting-desc">
                  Accelerates line clears, suppresses screen shakes, and simplifies blast effects
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.reduceAnimations}
                className={`switch-toggle ${settings.reduceAnimations ? 'switch-on' : 'switch-off'}`}
                onClick={() => handleToggle('reduceAnimations')}
                aria-label="Toggle Reduce Animations"
              >
                <span className="switch-thumb" />
              </button>
            </div>

            {/* 6. Gameplay Hints */}
            <div className="setting-row">
              <div className="setting-info">
                <div className="setting-label-row">
                  <span className="setting-label">
                    <Lightbulb size={13} style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle', color: '#fbbf24' }} />
                    Gameplay Hints
                  </span>
                </div>
                <span className="setting-desc">
                  Show helpful placement guidance and drag-drop hints beneath the block tray
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.gameplayHints}
                className={`switch-toggle ${settings.gameplayHints ? 'switch-on' : 'switch-off'}`}
                onClick={() => handleToggle('gameplayHints')}
                aria-label="Toggle Gameplay Hints"
              >
                <span className="switch-thumb" />
              </button>
            </div>
          </div>

          {/* Section: Device & Feedback */}
          <div className="settings-section">
            <div className="settings-section-header">
              <Smartphone size={16} className="section-icon" />
              <h3>DEVICE FEEDBACK</h3>
            </div>

            {/* 6. Haptic Feedback */}
            <div className={`setting-row ${!hapticsAvailable ? 'setting-disabled' : ''}`}>
              <div className="setting-info">
                <div className="setting-label-row">
                  <span className="setting-label">Haptic Vibration</span>
                  {!hapticsAvailable && (
                    <span className="unsupported-badge">Not supported on this device</span>
                  )}
                </div>
                <span className="setting-desc">
                  Tactile pulses for block snaps, line clears, and stage achievements
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.haptics && hapticsAvailable}
                disabled={!hapticsAvailable}
                className={`switch-toggle ${
                  settings.haptics && hapticsAvailable ? 'switch-on' : 'switch-off'
                }`}
                onClick={() => handleToggle('haptics')}
                aria-label="Toggle Haptic Feedback"
              >
                <span className="switch-thumb" />
              </button>
            </div>
          </div>

          {/* Transparent System Notice */}
          <div className="settings-notice-card">
            <Info size={14} className="notice-icon" />
            <div className="notice-content">
              <span>
                <strong>Audio System Note:</strong> Master Sound independently controls overall audio. Sound effects and voice announcements can be muted independently. Settings persist across sessions. Background music is omitted as none exists in the sound engine.
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="settings-footer">
          <button
            type="button"
            className="settings-reset-btn"
            onClick={handleResetDefaults}
            title="Reset all settings to default values"
          >
            <RotateCcw size={14} />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            className="settings-done-btn"
            onClick={onClose}
            autoFocus
          >
            <Check size={16} />
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
};
