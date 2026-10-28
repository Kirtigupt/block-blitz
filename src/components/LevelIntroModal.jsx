import React, { useEffect, useState } from 'react';
import { Target, Zap, Play, Sparkles } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export const LevelIntroModal = ({ levelConfig, onIntroComplete }) => {
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasStarted) {
        setHasStarted(true);
        onIntroComplete();
      }
    }, 1450);

    const handleKeyDown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!hasStarted) {
          setHasStarted(true);
          onIntroComplete();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [hasStarted, onIntroComplete]);

  const handleStartClick = () => {
    if (hasStarted) return;
    setHasStarted(true);
    sounds.playSelect();
    onIntroComplete();
  };

  const levelNum = levelConfig?.level || 1;
  const levelTitle = levelConfig?.title || `Level ${levelNum}`;
  const accentColor = levelConfig?.accentColor || '#38bdf8';
  const description = levelConfig?.description || 'Complete the objective to advance';
  const bonusPoints = levelConfig?.bonusPoints || 250;

  return (
    <div
      className="modal-backdrop level-intro-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="level-intro-title"
    >
      <div
        className="level-intro-card"
        style={{
          boxShadow: `0 24px 64px rgba(0, 0, 0, 0.85), 0 0 45px ${accentColor}40`,
          borderColor: `${accentColor}70`
        }}
      >
        {/* Ambient Top Glow */}
        <div
          className="intro-glow-aura"
          style={{
            background: `radial-gradient(circle, ${accentColor}40 0%, transparent 70%)`
          }}
        />

        {/* Level Tag Pill */}
        <div
          className="intro-level-pill"
          style={{
            borderColor: `${accentColor}80`,
            background: `linear-gradient(135deg, ${accentColor}25, rgba(0, 0, 0, 0.4))`
          }}
        >
          <Sparkles size={14} style={{ color: accentColor }} />
          <span>{levelConfig?.chapter ? `CH ${levelConfig.chapter} • ` : ''}LEVEL {levelNum}</span>
        </div>

        {/* Level Title */}
        <div className="intro-title-group">
          <h2 id="level-intro-title" className="intro-title-text">
            {levelTitle}
          </h2>
          {levelConfig?.pattern && levelConfig.pattern !== 'clean' && (
            <div className="intro-pattern-badge">
              <span className="intro-pattern-glyph">◈</span>
              <span>GRID PATTERN: {levelConfig.pattern.replace('_', ' ').toUpperCase()}</span>
            </div>
          )}
          <div className="intro-accent-bar" style={{ background: accentColor }} />
        </div>

        {/* Objective Box */}
        <div className="intro-objective-box">
          <div className="intro-obj-label">
            <Target size={15} style={{ color: accentColor }} />
            <span>MISSION OBJECTIVE</span>
          </div>
          <p className="intro-obj-description">"{description}"</p>
        </div>

        {/* Bonus Points Badge */}
        <div className="intro-bonus-tag">
          <Zap size={14} className="intro-zap" />
          <span>Reward: +{bonusPoints.toLocaleString()} Bonus PTS</span>
        </div>

        {/* Quick Launch / Countdown Indicator */}
        <div className="intro-action-container">
          <button
            className="intro-start-btn"
            onClick={handleStartClick}
            disabled={hasStarted}
            autoFocus
            style={{
              background: `linear-gradient(135deg, ${accentColor}, #2563eb)`
            }}
          >
            <span>START GAME</span>
            <Play size={16} fill="currentColor" />
          </button>
          <div className="intro-timer-track">
            <div
              className="intro-timer-fill"
              style={{ background: accentColor }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
