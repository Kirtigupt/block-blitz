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
      return <Layers size={22} style={{ color }} />;
    case 'score':
      return <Trophy size={22} style={{ color }} />;
    case 'streak':
      return <Zap size={22} style={{ color }} />;
    case 'placed':
      return <Target size={22} style={{ color }} />;
    case 'multilines':
      return <Sparkles size={22} style={{ color }} />;
    case 'clear_pattern':
      return <Gem size={22} style={{ color }} />;
    default:
      return <Target size={22} style={{ color }} />;
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
        className={`level-intro-card ${isBoss ? 'intro-card-boss' : ''}`}
        style={{
          boxShadow: `0 25px 65px -10px rgba(0, 0, 0, 0.95), 0 0 45px ${accentColor}30, inset 0 1px 0 rgba(255, 255, 255, 0.16)`,
          borderColor: isBoss ? 'rgba(251, 191, 36, 0.7)' : `${accentColor}55`
        }}
      >
        {/* Sci-Fi HUD Corner Brackets */}
        <span className="intro-corner intro-corner-tl" aria-hidden="true" style={{ borderColor: `${accentColor}90` }} />
        <span className="intro-corner intro-corner-tr" aria-hidden="true" style={{ borderColor: `${accentColor}90` }} />
        <span className="intro-corner intro-corner-bl" aria-hidden="true" style={{ borderColor: `${accentColor}90` }} />
        <span className="intro-corner intro-corner-br" aria-hidden="true" style={{ borderColor: `${accentColor}90` }} />

        {/* Ambient Top Glow Halo */}
        <div
          className="intro-glow-aura"
          style={{
            background: `radial-gradient(circle, ${isBoss ? '#f59e0b' : accentColor}45 0%, transparent 70%)`
          }}
        />

        {/* Laser Header Accent Bar */}
        <div
          className="intro-accent-laser"
          style={{
            background: isBoss
              ? 'linear-gradient(90deg, transparent, #fbbf24, #f59e0b, transparent)'
              : `linear-gradient(90deg, transparent, ${accentColor}, #3b82f6, transparent)`
          }}
        />

        {/* 1. TOP TELEMETRY STRIP: Chapter Badge & Stage Classifier */}
        <div className="intro-telemetry-bar">
          <div
            className="intro-chapter-badge"
            style={{
              borderColor: `${chapterData.color}55`,
              background: `linear-gradient(135deg, ${chapterData.color}22, rgba(10, 18, 36, 0.9))`
            }}
          >
            <span className="intro-chapter-icon" style={{ color: chapterData.color }}>
              {getChapterIcon(chapterData.icon)}
            </span>
            <span className="intro-chapter-text">
              CH {chapterData.chapter} • {chapterData.name.toUpperCase()}
            </span>
          </div>

          <div
            className={`intro-stage-pill ${isBoss ? 'intro-stage-boss' : ''}`}
            style={{
              borderColor: isBoss ? 'rgba(251, 191, 36, 0.8)' : `${accentColor}60`,
              background: isBoss
                ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.32), rgba(15, 23, 42, 0.95))'
                : `linear-gradient(135deg, ${accentColor}25, rgba(15, 23, 42, 0.95))`
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

        {/* 2. HERO MISSION BANNER: Stage Crest & Bold Title (Primary Visual Focus) */}
        <div className="intro-hero-showcase">
          <div
            className={`intro-stage-sigil ${isBoss ? 'sigil-boss' : ''}`}
            style={{ borderColor: isBoss ? '#fbbf24' : accentColor }}
          >
            {isBoss ? (
              <Crown size={28} className="sigil-icon-crown" />
            ) : (
              <span className="sigil-num-display">{String(levelNum).padStart(2, '0')}</span>
            )}
            <div className="sigil-glow-pulse" style={{ background: isBoss ? '#fbbf24' : accentColor }} />
          </div>

          <div className="intro-title-block">
            <div className="intro-title-eyebrow">
              <span className="intro-eyebrow-line" style={{ background: accentColor }} />
              <span className="intro-eyebrow-text">
                {isBoss ? 'APEX GUARDIAN ENCOUNTER' : 'MISSION BRIEFING'}
              </span>
              <span className="intro-eyebrow-line" style={{ background: accentColor }} />
            </div>

            <h2 id="level-intro-title" className="intro-title-text">
              {levelTitle}
            </h2>

            <div className="intro-protocol-tag">
              <span className="protocol-dot" style={{ background: accentColor }} />
              <span className="protocol-text">TACTICAL DIRECTIVE ACTIVE</span>
            </div>
          </div>
        </div>

        {/* 3. VISUALLY ENGAGING MISSION OBJECTIVE CARD */}
        <div
          className="intro-objective-panel"
          style={{
            borderColor: `${accentColor}45`,
            boxShadow: `0 8px 24px -6px rgba(0, 0, 0, 0.7), inset 0 0 25px ${accentColor}12`
          }}
        >
          {/* Card Top: Icon Pod, Type & Target Counter */}
          <div className="intro-obj-header">
            <div className="intro-obj-tag">
              <div
                className="intro-obj-icon-halo"
                style={{
                  background: `${accentColor}25`,
                  borderColor: `${accentColor}65`
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
                  borderColor: isBoss ? 'rgba(251, 191, 36, 0.65)' : `${accentColor}60`
                }}
              >
                <span className="intro-target-label">TARGET</span>
                <span className="intro-target-val">{targetDisplay}</span>
              </div>
            )}
          </div>

          {/* Card Middle: Instruction Description */}
          <div className="intro-obj-body">
            <div className="intro-directive-callout">
              <p className="intro-obj-description">
                "{description}"
              </p>
            </div>
          </div>

          {/* Card Bottom: Tactical Grid Hazard Warning if present */}
          {hasPattern && (
            <div className="intro-hazard-pill">
              <Grid3X3 size={13} className="intro-hazard-icon" />
              <span className="intro-hazard-label">GRID HAZARD:</span>
              <span className="intro-hazard-name">{patternDisplay}</span>
            </div>
          )}
        </div>

        {/* 4. DEDICATED PREMIUM COMPLETION REWARD VAULT */}
        <div className="intro-reward-badge">
          <div className="intro-reward-glow-layer" />
          <div className="intro-reward-left">
            <div className="intro-reward-icon-box">
              <Award size={20} className="intro-gold-award" />
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

        {/* 5. DISTINCTIVE 3D ARCADE LAUNCH BUTTON */}
        <div className="intro-cta-wrapper">
          <button
            type="button"
            className="intro-start-btn"
            onClick={handleStartClick}
            disabled={hasStarted}
            autoFocus
            style={{
              background: isBoss
                ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 45%, #b45309 100%)'
                : 'linear-gradient(135deg, #06b6d4 0%, #0284c7 45%, #2563eb 100%)'
            }}
          >
            <span className="intro-btn-bezel">
              <Play size={18} fill="currentColor" className="intro-btn-play-icon" />
            </span>
            <span className="intro-btn-label">START LEVEL</span>
            <span className="intro-btn-key-badge">ENTER ↵</span>
          </button>
          <p className="intro-desktop-hint">
            <span>Press <strong>Enter</strong> or <strong>Space</strong> to launch mission</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LevelIntroModal;
