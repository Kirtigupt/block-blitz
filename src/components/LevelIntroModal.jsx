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
      return <Layers size={20} style={{ color }} />;
    case 'score':
      return <Trophy size={20} style={{ color }} />;
    case 'streak':
      return <Zap size={20} style={{ color }} />;
    case 'placed':
      return <Target size={20} style={{ color }} />;
    case 'multilines':
      return <Sparkles size={20} style={{ color }} />;
    case 'clear_pattern':
      return <Gem size={20} style={{ color }} />;
    default:
      return <Target size={20} style={{ color }} />;
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
      <div className={`level-intro-card ${isBoss ? 'intro-card-boss' : ''}`}>
        {/* Subtle Ambient Chapter Aura */}
        <div
          className="intro-glow-aura"
          style={{
            background: isBoss
              ? 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 70%)'
              : `radial-gradient(circle, ${accentColor}15 0%, transparent 70%)`
          }}
        />

        {/* 1. Small Chapter & Stage Header */}
        <div className="intro-meta-bar">
          <div className="intro-chapter-chip intro-chapter-badge">
            <span className="chapter-chip-icon" style={{ color: chapterData.color }}>
              {getChapterIcon(chapterData.icon)}
            </span>
            <span className="chapter-chip-name">
              CH {chapterData.chapter} • {chapterData.name}
            </span>
          </div>

          <div className={`intro-stage-pill ${isBoss ? 'stage-pill-boss intro-stage-boss' : ''}`}>
            {isBoss ? (
              <>
                <Crown size={13} className="boss-crown-icon intro-boss-crown" />
                <span>Boss Stage</span>
              </>
            ) : (
              <span>Stage {String(levelNum).padStart(2, '0')}</span>
            )}
          </div>
        </div>

        {/* 2. Clean Level Title Heading */}
        <div className="intro-hero-headline">
          <h2 id="level-intro-title" className="intro-level-title intro-title-text">
            {levelTitle}
          </h2>
        </div>

        {/* 3. Simple, Attractive Objective Section (Single unified surface) */}
        <div className="intro-directive-card intro-objective-panel">
          <div className="directive-top-row">
            <div
              className="directive-icon-pod"
              style={{
                background: `${accentColor}14`,
                color: accentColor
              }}
            >
              {getObjectiveIcon(objectiveType, accentColor)}
            </div>

            <div className="directive-meta-col">
              <span className="directive-type-title">
                {getObjectiveTypeLabel(objectiveType)}
              </span>
              {targetDisplay && (
                <span className="directive-target-pill">
                  Target: {targetDisplay}
                </span>
              )}
            </div>
          </div>

          <p className="directive-statement intro-obj-description">
            "{description}"
          </p>

          {hasPattern && (
            <div className="directive-hazard-badge intro-hazard-pill">
              <Grid3X3 size={13} className="hazard-icon" />
              <span>Grid Hazard: <strong>{patternDisplay}</strong></span>
            </div>
          )}
        </div>

        {/* 4. Compact Reward Info */}
        <div className="intro-reward-strip intro-reward-badge">
          <div className="reward-strip-left">
            <Star size={15} className="reward-award-icon" />
            <span className="reward-label">Clearance Reward</span>
          </div>
          <span className="reward-value">+<span className="intro-reward-amount">{bonusPoints.toLocaleString()}</span> PTS</span>
        </div>

        {/* 5. One Attractive, Tactile Start Button */}
        <div className="intro-action-container">
          <button
            type="button"
            className="intro-start-btn"
            onClick={handleStartClick}
            disabled={hasStarted}
            autoFocus
          >
            <Play size={16} fill="currentColor" className="btn-play-icon" />
            <span className="btn-text intro-btn-label">START LEVEL</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LevelIntroModal;
