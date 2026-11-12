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
  Shield,
  Map,
  X
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
      return <Layers size={18} style={{ color }} />;
    case 'score':
      return <Trophy size={18} style={{ color }} />;
    case 'streak':
      return <Zap size={18} style={{ color }} />;
    case 'placed':
      return <Target size={18} style={{ color }} />;
    case 'multilines':
      return <Sparkles size={18} style={{ color }} />;
    case 'clear_pattern':
      return <Gem size={18} style={{ color }} />;
    default:
      return <Target size={18} style={{ color }} />;
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

/**
 * Derives difficulty descriptor and accent color from level configuration
 */
const getDifficulty = (levelNum, isBoss) => {
  if (isBoss) {
    return { label: 'Boss Encounter', color: '#f59e0b' };
  }
  if (levelNum <= 10) {
    return { label: 'Apprentice', color: '#38bdf8' };
  }
  if (levelNum <= 30) {
    return { label: 'Normal', color: '#34d399' };
  }
  if (levelNum <= 60) {
    return { label: 'Advanced', color: '#818cf8' };
  }
  if (levelNum <= 80) {
    return { label: 'Expert', color: '#fb923c' };
  }
  return { label: 'Master', color: '#c084fc' };
};

export const LevelIntroModal = ({ levelConfig, onIntroComplete, onClose }) => {
  const [hasStarted, setHasStarted] = useState(false);

  const handleClose = () => {
    if (hasStarted) return;
    sounds.playSelect();
    if (onClose) {
      onClose();
    } else if (typeof window !== 'undefined' && window.__onCloseLevelIntro) {
      window.__onCloseLevelIntro();
    }
  };

  useEffect(() => {
    sounds.playLevelStart();

    const handleKeyDown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        if (!hasStarted) {
          setHasStarted(true);
          sounds.playSelect();
          onIntroComplete();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [hasStarted, onIntroComplete, onClose]);

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
  const hasPattern = Boolean(pattern && pattern !== 'clean');
  const patternDisplay = pattern ? pattern.replace(/_/g, ' ').toUpperCase() : '';
  const objectiveType = levelConfig?.type || 'lines';
  const targetDisplay = getTargetDisplay(objectiveType, levelConfig?.target);
  const difficulty = getDifficulty(levelNum, isBoss);

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
      <div className={`level-intro-card mission-briefing-card ${isBoss ? 'intro-card-boss' : ''}`}>
        {/* Subtle Ambient Halo */}
        <div
          className="intro-ambient-halo intro-glow-aura"
          aria-hidden="true"
          style={{
            background: isBoss
              ? 'radial-gradient(circle, rgba(245, 158, 11, 0.18) 0%, transparent 70%)'
              : `radial-gradient(circle, ${accentColor}18 0%, transparent 70%)`
          }}
        />

        {/* 1. Header Meta Bar: Chapter Tag + Stage Pill + Close Button */}
        <div className="intro-meta-bar">
          <div className="intro-chapter-chip intro-chapter-badge">
            <span className="chapter-chip-icon" style={{ color: chapterData.color || accentColor }}>
              {getChapterIcon(chapterData.icon)}
            </span>
            <span className="chapter-chip-name">
              CH {chapterData.chapter} · {chapterData.name}
            </span>
          </div>

          <div className="intro-meta-right">
            <div className={`intro-stage-pill ${isBoss ? 'stage-pill-boss intro-stage-boss' : ''}`}>
              {isBoss ? (
                <>
                  <Crown size={12} className="boss-crown-icon intro-boss-crown" />
                  <span>Boss Stage</span>
                </>
              ) : (
                <span>Stage {String(levelNum).padStart(2, '0')}</span>
              )}
            </div>

            <button
              type="button"
              className="intro-close-icon-btn"
              onClick={handleClose}
              aria-label="Close briefing"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* 2. Clean Level Title Heading & Kicker */}
        <div className="intro-hero-headline">
          <span className="intro-kicker-label">MISSION BRIEFING</span>
          <h2 id="level-intro-title" className="intro-level-title intro-title-text">
            {levelTitle}
          </h2>
        </div>

        {/* 3. Objective Section (Single unified surface, no nested boxes) */}
        <div className="intro-directive-card intro-objective-panel">
          <div className="directive-top-row">
            <div
              className="directive-icon-pod"
              style={{
                background: `${accentColor}16`,
                borderColor: `${accentColor}30`,
                color: accentColor
              }}
            >
              {getObjectiveIcon(objectiveType, accentColor)}
            </div>

            <div className="directive-meta-col">
              <span className="directive-kicker">MISSION OBJECTIVE</span>
              <span className="directive-type-title">
                {getObjectiveTypeLabel(objectiveType)}
              </span>
            </div>

            {targetDisplay && (
              <div className="directive-target-pill">
                <span className="target-pill-label">TARGET</span>
                <span className="target-pill-val">{targetDisplay}</span>
              </div>
            )}
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

        {/* 4. Telemetry Info Ribbon: Level Difficulty & Clearance Reward */}
        <div className="intro-info-ribbon">
          <div className="intro-info-col">
            <div className="info-col-label">
              <Shield size={12} className="info-icon" style={{ color: difficulty.color }} />
              <span>DIFFICULTY</span>
            </div>
            <span className="info-col-val" style={{ color: difficulty.color }}>
              {difficulty.label}
            </span>
          </div>

          <div className="intro-info-vsep" aria-hidden="true" />

          <div className="intro-info-col intro-reward-badge">
            <div className="info-col-label">
              <Award size={12} className="info-icon" style={{ color: '#fbbf24' }} />
              <span>REWARD</span>
            </div>
            <span className="info-col-val intro-reward-amount-box" style={{ color: '#facc15' }}>
              +<span className="intro-reward-amount">{bonusPoints.toLocaleString()}</span> PTS
            </span>
          </div>
        </div>

        {/* 5. Primary START MISSION Button + Secondary BACK TO MAP Button */}
        <div className="intro-action-container">
          <button
            type="button"
            className="intro-start-btn primary-start-trigger"
            onClick={handleStartClick}
            disabled={hasStarted}
            autoFocus
          >
            <Play size={16} fill="currentColor" className="btn-play-icon" />
            <span className="btn-text intro-btn-label">START MISSION</span>
          </button>

          <button
            type="button"
            className="intro-map-btn secondary-map-trigger"
            onClick={handleClose}
          >
            <Map size={15} className="btn-map-icon" />
            <span className="btn-text">BACK TO MAP</span>
          </button>

          <span className="intro-footer-hint">
            Press <strong>Enter</strong> to start or <strong>Esc</strong> to close
          </span>
        </div>
      </div>
    </div>
  );
};

export default LevelIntroModal;
