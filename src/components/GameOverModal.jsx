import React, { useEffect } from 'react';
import {
  RotateCcw,
  Trophy,
  Zap,
  CloudCheck,
  LogIn,
  Map,
  Flame,
  Layers,
  Gem,
  Sparkles,
  XCircle,
  ShieldAlert,
  ArrowRight,
  Target
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CHAPTER_CONFIGS, calculateLevelProgressPercent } from '../constants/levels';
import { sounds } from '../utils/soundEffects';

/**
 * Premium Game Over / Level Failed Experience
 * Completely redesigned to replace ordinary stacked boxes with an immersive,
 * unified cyber-arcade failure presentation.
 */
export const GameOverModal = ({
  score = 0,
  highScore = 0,
  isNewHigh = false,
  linesCleared = 0,
  maxStreak = 0,
  level = 1,
  levelConfig,
  levelProgress = 0,
  onRestart,
  user,
  scoreSaved = false,
  onOpenAuth,
  onOpenLevelMap
}) => {
  // Trigger personal-record celebratory confetti if this attempt set a new personal best
  useEffect(() => {
    if (isNewHigh && score > 0) {
      try {
        confetti({
          particleCount: 85,
          spread: 65,
          origin: { y: 0.6 }
        });
      } catch {
        // Safe fallback
      }
    }
  }, [isNewHigh, score]);

  // Keyboard navigation: Enter / Space retries; Escape / M returns to Map
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        sounds.playSelect();
        onRestart(level);
      } else if ((e.key === 'Escape' || e.key === 'm' || e.key === 'M') && onOpenLevelMap) {
        e.preventDefault();
        sounds.playSelect();
        onOpenLevelMap();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [level, onRestart, onOpenLevelMap]);

  const chapterNum = levelConfig?.chapter || Math.ceil(level / 10);
  const chapterName = levelConfig?.chapter
    ? CHAPTER_CONFIGS.find((c) => c.chapter === levelConfig.chapter)?.name
    : `Chapter ${chapterNum}`;

  const progressPercent = levelConfig
    ? calculateLevelProgressPercent(levelProgress, levelConfig.target)
    : 0;

  const renderObjectiveIcon = () => {
    if (!levelConfig) return <Target size={18} className="mission-icon" />;
    switch (levelConfig.type) {
      case 'streak':
        return <Flame size={18} className="mission-icon streak-icon" />;
      case 'multilines':
      case 'lines':
        return <Layers size={18} className="mission-icon lines-icon" />;
      case 'clear_pattern':
        return <Gem size={18} className="mission-icon gem-icon" />;
      case 'placed':
        return <Sparkles size={18} className="mission-icon pieces-icon" />;
      case 'score':
        return <Trophy size={18} className="mission-icon score-icon" />;
      default:
        return <Target size={18} className="mission-icon target-icon" />;
    }
  };

  const renderObjectiveProgressDetails = () => {
    if (!levelConfig) return null;
    const remaining = Math.max(0, levelConfig.target - levelProgress);

    switch (levelConfig.type) {
      case 'lines':
        return {
          label: 'Lines Cleared',
          current: levelProgress,
          target: levelConfig.target,
          statusText: `${remaining} more ${remaining === 1 ? 'line' : 'lines'} needed`
        };
      case 'score':
        return {
          label: 'Target Score',
          current: levelProgress.toLocaleString(),
          target: levelConfig.target.toLocaleString(),
          statusText: `${remaining.toLocaleString()} points needed`
        };
      case 'streak':
        return {
          label: 'Streak Reached',
          current: `${levelProgress}x`,
          target: `${levelConfig.target}x`,
          statusText: `${remaining}x combo needed`
        };
      case 'multilines':
        return {
          label: 'Combos Achieved',
          current: levelProgress,
          target: levelConfig.target,
          statusText: `${remaining} more combo clear needed`
        };
      case 'clear_pattern':
        return {
          label: 'Pattern Gems Cleared',
          current: levelProgress,
          target: levelConfig.target,
          statusText: `${remaining} ${remaining === 1 ? 'gem' : 'gems'} remaining`
        };
      case 'placed':
        return {
          label: 'Pieces Placed',
          current: levelProgress,
          target: levelConfig.target,
          statusText: `${remaining} more pieces needed`
        };
      default:
        return {
          label: 'Progress',
          current: levelProgress,
          target: levelConfig.target,
          statusText: `${remaining} needed`
        };
    }
  };

  const objDetails = renderObjectiveProgressDetails();

  return (
    <div
      className="modal-backdrop game-over-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="game-over-title"
    >
      <div className="game-over-card level-failed-card failed-portal-chassis">
        {/* Cyber Framing Accents */}
        <div className="cyber-frame-corner corner-tl" aria-hidden="true" />
        <div className="cyber-frame-corner corner-tr" aria-hidden="true" />
        <div className="cyber-frame-corner corner-bl" aria-hidden="true" />
        <div className="cyber-frame-corner corner-br" aria-hidden="true" />

        {/* Ambient Flares */}
        <div className="failure-ambient-halo" />
        <div className="failure-beam-flare flare-crimson" />
        <div className="failure-beam-flare flare-amber" />

        {/* Top Distress & Sector Telemetry Banner */}
        <div className="distress-telemetry-banner">
          <div className="telemetry-distress-beacon">
            <span className="distress-ping" />
            <span className="distress-dot" />
            <span className="distress-label">GRID LOCKOUT</span>
          </div>
          {chapterName && (
            <div className="telemetry-ch-tag">
              CH {chapterNum}: {chapterName.toUpperCase()}
            </div>
          )}
        </div>

        {/* =========================================================
            CINEMATIC FAILURE SIGIL APPARATUS
            Replacing generic round failure icon with an angular,
            pulsing fractured matrix insignia.
           ========================================================= */}
        <div className="failure-sigil-apparatus">
          <div className="sigil-warning-pulse" />
          <div className="fractured-core-prism">
            <div className="sigil-core-inner">
              <ShieldAlert size={38} className="failure-sigil-icon" />
            </div>
            <div className="fracture-sheen-ring" />
          </div>
        </div>

        {/* =========================================================
            LEVEL FAILED HEADLINE & SECTOR IDENTIFIER
           ========================================================= */}
        <div className="failure-headline-block">
          <h2 id="game-over-title" className="game-over-title level-failed-title">
            LEVEL {level} FAILED
          </h2>
          <div className="stage-identity-strip failed-stage-strip">
            <span className="stage-code-pill failed-code-pill">STAGE {String(level).padStart(2, '0')}</span>
            <span className="stage-name-text">{levelConfig?.title || 'Grid Frontier'}</span>
            <span className="lockout-status-badge">OUT OF MOVES</span>
          </div>
        </div>

        {/* =========================================================
            TACTICAL OBJECTIVE DEBRIEF TERMINAL
            Highlights what was needed, actual progress, and exact deficit.
           ========================================================= */}
        {levelConfig && objDetails && (
          <div className="failed-objective-terminal">
            <div className="obj-terminal-top">
              <div className="obj-terminal-label">
                <Target size={13} className="obj-terminal-icon" />
                <span>OBJECTIVE DEFICIT</span>
              </div>
              <div className="obj-deficit-badge">
                <XCircle size={13} className="deficit-x-icon" />
                <span>{objDetails.statusText.toUpperCase()}</span>
              </div>
            </div>

            <div className="obj-terminal-body">
              <div className="obj-terminal-icon-pod">
                {renderObjectiveIcon()}
              </div>
              <div className="obj-terminal-text-block">
                <span className="obj-directive-quote">"{levelConfig.description}"</span>
              </div>
            </div>

            {/* Visual Progress Meter & Metric Counter */}
            <div className="failed-meter-container">
              <div className="failed-meter-track">
                <div
                  className="failed-meter-fill"
                  style={{
                    width: `${progressPercent}%`,
                    backgroundColor: levelConfig.accentColor || '#f43f5e'
                  }}
                />
              </div>
              <div className="failed-meter-stats">
                <span className="meter-label">PROGRESS: {progressPercent}% COMPLETED</span>
                <span className="meter-count">
                  {objDetails.current} <span className="meter-divider">/</span> {objDetails.target}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            HERO ATTEMPT SCORE DISPLAY
           ========================================================= */}
        <div className="hero-attempt-score-chassis">
          <div className="attempt-score-meta">
            <span className="attempt-score-label">ATTEMPT SCORE</span>
            <span className="final-score-number">{score.toLocaleString()}</span>
          </div>
        </div>

        {/* =========================================================
            SEPARATE CELEBRATORY PERSONAL RECORD MEDALLION
            Rendered as a prominent celebratory badge when player sets a new record.
           ========================================================= */}
        {isNewHigh && score > 0 && (
          <div className="personal-record-celebration-trophy">
            <div className="record-trophy-badge">
              <Trophy size={18} className="record-trophy-svg" />
            </div>
            <div className="record-text-group">
              <span className="record-hero-text">NEW ALL-TIME PERSONAL RECORD!</span>
              <span className="record-sub-text">Surpassed previous career high • Saved to record books</span>
            </div>
            <Sparkles size={16} className="record-sparkle-flair" />
          </div>
        )}

        {/* =========================================================
            UNIFIED TACTICAL TELEMETRY STATISTICS RIBBON
            Avoids excessive boxed containers by presenting stats in a
            single, elegant data ribbon.
           ========================================================= */}
        <div className="telemetry-stats-ribbon">
          <div className="telemetry-stat-col">
            <span className="stat-col-lbl">
              <Trophy size={12} className="col-icon gold-icon" /> BEST
            </span>
            <span className="stat-col-val">{highScore.toLocaleString()}</span>
          </div>
          <div className="telemetry-col-divider" />
          <div className="telemetry-stat-col">
            <span className="stat-col-lbl">
              <Zap size={12} className="col-icon cyan-icon" /> LINES
            </span>
            <span className="stat-col-val">{linesCleared}</span>
          </div>
          <div className="telemetry-col-divider" />
          <div className="telemetry-stat-col">
            <span className="stat-col-lbl">
              <Flame size={12} className="col-icon orange-icon" /> STREAK
            </span>
            <span className="stat-col-val">x{maxStreak}</span>
          </div>
        </div>

        {/* =========================================================
            CLOUD BACKUP STATUS / GUEST AUTH CALLOUT
           ========================================================= */}
        {user ? (
          scoreSaved && (
            <div className="cloud-saved-badge">
              <CloudCheck size={14} className="cloud-icon" />
              <span>Score verified and synced to cloud</span>
            </div>
          )
        ) : (
          <button
            type="button"
            className="guest-auth-callout"
            onClick={onOpenAuth}
            aria-label="Sign in to save scores"
          >
            <LogIn size={14} className="guest-login-icon" />
            <span>Sign in to save scores to Global Leaderboard</span>
          </button>
        )}

        {/* =========================================================
            REDESIGNED COMMAND ACTION BUTTONS
            Primary: RETRY LEVEL (High-impact 3D arcade button)
            Secondary: LEVEL MAP (Tactical glassmorphic button)
           ========================================================= */}
        <div className="failed-actions-container">
          <button
            type="button"
            className="play-again-btn retry-level-btn primary-retry-trigger"
            onClick={() => {
              sounds.playSelect();
              onRestart(level);
            }}
            autoFocus
            aria-label={`Retry Level ${level}`}
          >
            <div className="retry-icon-pod">
              <RotateCcw size={18} className="retry-spin-icon" />
            </div>
            <div className="retry-text-group">
              <span className="retry-primary-text">RETRY LEVEL {level}</span>
              <span className="retry-sub-text">Relaunch mission from checkpoint</span>
            </div>
            <div className="retry-arrow-pod">
              <ArrowRight size={18} className="retry-arrow-icon" />
            </div>
          </button>

          {onOpenLevelMap && (
            <button
              type="button"
              className="game-over-map-btn secondary-map-trigger"
              onClick={() => {
                sounds.playSelect();
                onOpenLevelMap();
              }}
              aria-label="Return to Adventure Map"
            >
              <Map size={16} />
              <span>LEVEL MAP</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameOverModal;
