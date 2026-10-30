import React, { useEffect, useState } from 'react';
import {
  Target,
  Zap,
  Play,
  Sparkles,
  Trophy,
  Flame,
  Layers,
  Gem,
  Crown,
  Award,
  Grid3X3,
  Star,
  Sun,
  Compass,
  Shield
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';
import { CHAPTER_CONFIGS } from '../constants/levels';

/**
 * Helper to render appropriate icon for thematic chapter badge
 */
const getChapterIcon = (iconName) => {
  switch (iconName) {
    case 'Sparkles': return <Sparkles size={13} />;
    case 'Zap': return <Zap size={13} />;
    case 'Target': return <Target size={13} />;
    case 'Flame': return <Flame size={13} />;
    case 'Star': return <Star size={13} />;
    case 'Gem': return <Gem size={13} />;
    case 'Sun': return <Sun size={13} />;
    case 'Compass': return <Compass size={13} />;
    case 'Shield': return <Shield size={13} />;
    case 'Crown': return <Crown size={13} />;
    default: return <Sparkles size={13} />;
  }
};

/**
 * Helper to render appropriate objective icon based on level type
 */
const getObjectiveIcon = (type, color) => {
  switch (type) {
    case 'lines':
      return <Target size={17} style={{ color }} />;
    case 'score':
      return <Trophy size={17} style={{ color }} />;
    case 'streak':
      return <Zap size={17} style={{ color }} />;
    case 'placed':
      return <Layers size={17} style={{ color }} />;
    case 'multilines':
      return <Sparkles size={17} style={{ color }} />;
    case 'clear_pattern':
      return <Gem size={17} style={{ color }} />;
    default:
      return <Target size={17} style={{ color }} />;
  }
};

/**
 * Category kicker label for objective type
 */
const getObjectiveTypeLabel = (type) => {
  switch (type) {
    case 'lines':
      return 'LINE CLEARING';
    case 'score':
      return 'SCORE ATTACK';
    case 'streak':
      return 'COMBO STREAK';
    case 'placed':
      return 'BLOCK PLACEMENT';
    case 'multilines':
      return 'MULTI-LINE CLEAR';
    case 'clear_pattern':
      return 'OBSTACLE BREAKER';
    default:
      return 'MISSION OBJECTIVE';
  }
};

/**
 * Formats the target requirement badge
 */
const getTargetDisplay = (type, target) => {
  if (!target && target !== 0) return null;
  switch (type) {
    case 'lines':
      return `${target} LINES`;
    case 'score':
      return `${target.toLocaleString()} PTS`;
    case 'streak':
      return `${target}x COMBO`;
    case 'placed':
      return `${target} BLOCKS`;
    case 'multilines':
      return `${target} COMBO${target > 1 ? 'S' : ''}`;
    case 'clear_pattern':
      return `${target} GEMS`;
    default:
      return `${target}`;
  }
};

export const LevelIntroModal = ({ levelConfig, onIntroComplete }) => {
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    // Play subtle cyber fanfare on mounting
    sounds.playLevelStart();

    const handleKeyDown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!hasStarted) {
          setHasStarted(true);
          sounds.playSelect();
          onIntroComplete();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
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
  const isBoss = Boolean(levelConfig?.isBoss || levelNum % 10 === 0);
  const pattern = levelConfig?.pattern;
  const hasPattern = pattern && pattern !== 'clean';
  const patternDisplay = pattern ? pattern.replace(/_/g, ' ').toUpperCase() : '';
  const objectiveType = levelConfig?.type || 'lines';
  const targetDisplay = getTargetDisplay(objectiveType, levelConfig?.target);

  // Look up chapter details
  const chapterNum = levelConfig?.chapter || Math.ceil(levelNum / 10);
  const chapterData = CHAPTER_CONFIGS.find((c) => c.chapter === chapterNum) || {
    chapter: chapterNum,
    name: `Chapter ${chapterNum}`,
    color: accentColor,
    icon: 'Sparkles'
  };

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
          boxShadow: `0 25px 60px -10px rgba(0, 0, 0, 0.9), 0 0 35px ${accentColor}33, inset 0 1px 0 rgba(255, 255, 255, 0.15)`,
          borderColor: `${accentColor}55`
        }}
      >
        {/* Subtle Decorative Sci-Fi HUD Corner Brackets */}
        <span className="intro-corner intro-corner-tl" aria-hidden="true" style={{ borderColor: `${accentColor}80` }} />
        <span className="intro-corner intro-corner-tr" aria-hidden="true" style={{ borderColor: `${accentColor}80` }} />
        <span className="intro-corner intro-corner-bl" aria-hidden="true" style={{ borderColor: `${accentColor}80` }} />
        <span className="intro-corner intro-corner-br" aria-hidden="true" style={{ borderColor: `${accentColor}80` }} />

        {/* Ambient Top Glow Halo */}
        <div
          className="intro-glow-aura"
          style={{
            background: `radial-gradient(circle, ${accentColor}40 0%, transparent 70%)`
          }}
        />

        {/* Laser Header Accent Bar */}
        <div
          className="intro-accent-laser"
          style={{
            background: `linear-gradient(90deg, transparent, ${accentColor}, #3b82f6, transparent)`
          }}
        />

        {/* Top Badges Row: Chapter Badge & Level Number */}
        <div className="intro-header-badges">
          {/* Chapter Badge */}
          <div
            className="intro-chapter-badge"
            style={{
              borderColor: `${chapterData.color}50`,
              background: `linear-gradient(135deg, ${chapterData.color}20, rgba(10, 18, 36, 0.85))`
            }}
          >
            <span className="intro-chapter-icon" style={{ color: chapterData.color }}>
              {getChapterIcon(chapterData.icon)}
            </span>
            <span className="intro-chapter-text">
              CH {chapterData.chapter} • {chapterData.name.toUpperCase()}
            </span>
          </div>

          {/* Level / Stage Number */}
          <div
            className={`intro-stage-pill ${isBoss ? 'intro-stage-boss' : ''}`}
            style={{
              borderColor: isBoss ? 'rgba(251, 191, 36, 0.7)' : `${accentColor}60`,
              background: isBoss
                ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.28), rgba(15, 23, 42, 0.9))'
                : `linear-gradient(135deg, ${accentColor}25, rgba(15, 23, 42, 0.9))`
            }}
          >
            {isBoss ? (
              <>
                <Crown size={13} className="intro-boss-crown" />
                <span>BOSS STAGE</span>
              </>
            ) : (
              <>
                <span className="intro-stage-prefix">STAGE</span>
                <span className="intro-stage-num">{String(levelNum).padStart(2, '0')}</span>
              </>
            )}
          </div>
        </div>

        {/* Level Title Section */}
        <div className="intro-title-section">
          <div className="intro-title-eyebrow">
            <span className="intro-eyebrow-line" style={{ background: accentColor }} />
            <span className="intro-eyebrow-text">MISSION BRIEFING</span>
            <span className="intro-eyebrow-line" style={{ background: accentColor }} />
          </div>

          <h2 id="level-intro-title" className="intro-title-text">
            {levelTitle}
          </h2>

          {hasPattern && (
            <div className="intro-hazard-pill">
              <Grid3X3 size={13} className="intro-hazard-icon" />
              <span className="intro-hazard-label">GRID HAZARD:</span>
              <span className="intro-hazard-name">{patternDisplay}</span>
            </div>
          )}
        </div>

        {/* Mission Objective Panel */}
        <div
          className="intro-objective-panel"
          style={{
            borderColor: `${accentColor}40`,
            boxShadow: `0 8px 24px -6px rgba(0, 0, 0, 0.6), inset 0 0 25px ${accentColor}12`
          }}
        >
          <div className="intro-obj-header">
            <div className="intro-obj-tag">
              <div
                className="intro-obj-icon-halo"
                style={{
                  background: `${accentColor}25`,
                  borderColor: `${accentColor}60`
                }}
              >
                {getObjectiveIcon(objectiveType, accentColor)}
              </div>
              <div className="intro-obj-title-col">
                <span className="intro-obj-kicker">MISSION OBJECTIVE</span>
                <span className="intro-obj-type-label" style={{ color: accentColor }}>
                  {getObjectiveTypeLabel(objectiveType)}
                </span>
              </div>
            </div>

            {targetDisplay && (
              <div
                className="intro-target-badge"
                style={{
                  borderColor: `${accentColor}50`
                }}
              >
                <span className="intro-target-label">TARGET</span>
                <span className="intro-target-val">{targetDisplay}</span>
              </div>
            )}
          </div>

          <div className="intro-obj-body">
            <p className="intro-obj-description">
              "{description}"
            </p>
          </div>
        </div>

        {/* Premium Golden Reward Badge */}
        <div className="intro-reward-badge">
          <div className="intro-reward-glow-layer" />
          <div className="intro-reward-left">
            <div className="intro-reward-icon-box">
              <Award size={18} className="intro-gold-award" />
            </div>
            <div className="intro-reward-text-col">
              <span className="intro-reward-kicker">COMPLETION REWARD</span>
              <span className="intro-reward-sub">Bonus Score Points</span>
            </div>
          </div>
          <div className="intro-reward-right">
            <span className="intro-reward-plus">+</span>
            <span className="intro-reward-amount">{bonusPoints.toLocaleString()}</span>
            <span className="intro-reward-unit">PTS</span>
          </div>
        </div>

        {/* Start Level CTA Button */}
        <div className="intro-cta-wrapper">
          <button
            type="button"
            className="intro-start-btn"
            onClick={handleStartClick}
            disabled={hasStarted}
            autoFocus
            style={{
              background: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 45%, #2563eb 100%)'
            }}
          >
            <span className="intro-btn-label">START LEVEL</span>
            <span className="intro-btn-icon-wrapper">
              <Play size={18} fill="currentColor" />
            </span>
          </button>
          <p className="intro-desktop-hint">
            <span>Press <strong>Enter</strong> or <strong>Space</strong> to launch</span>
          </p>
        </div>
      </div>
    </div>
  );
};
