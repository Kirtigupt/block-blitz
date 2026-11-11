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
  ShieldAlert,
  Target
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CHAPTER_CONFIGS, calculateLevelProgressPercent } from '../constants/levels';
import { sounds } from '../utils/soundEffects';

/**
 * Clean Casual-Arcade Game Over / Level Failed Modal
 * Matches the Stage Completed visual design system while preserving distinct failure hierarchy.
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
  const chapterName =
    (levelConfig?.chapter && CHAPTER_CONFIGS.find((c) => c.chapter === levelConfig.chapter)?.name) ||
    `Chapter ${chapterNum}`;

  const progressPercent = levelConfig
    ? calculateLevelProgressPercent(levelProgress, levelConfig.target)
    : 0;

  const renderObjectiveIcon = () => {
    if (!levelConfig) return <Target size={14} className="obj-terminal-icon" />;
    switch (levelConfig.type) {
      case 'streak':
        return <Flame size={14} className="obj-terminal-icon" />;
      case 'multilines':
      case 'lines':
        return <Layers size={14} className="obj-terminal-icon" />;
      case 'clear_pattern':
        return <Gem size={14} className="obj-terminal-icon" />;
      case 'placed':
        return <Sparkles size={14} className="obj-terminal-icon" />;
      case 'score':
        return <Trophy size={14} className="obj-terminal-icon" />;
      default:
        return <Target size={14} className="obj-terminal-icon" />;
    }
  };

  const renderObjectiveProgressDetails = () => {
    if (!levelConfig) return null;
    const remaining = Math.max(0, levelConfig.target - levelProgress);

    switch (levelConfig.type) {
      case 'lines':
        return {
          progressText: `${levelProgress} / ${levelConfig.target} ${levelConfig.target === 1 ? 'line' : 'lines'} cleared`,
          statusText: `${remaining} more ${remaining === 1 ? 'line' : 'lines'} needed`
        };
      case 'score':
        return {
          progressText: `${levelProgress.toLocaleString()} / ${levelConfig.target.toLocaleString()} pts`,
          statusText: `${remaining.toLocaleString()} more pts needed`
        };
      case 'streak':
        return {
          progressText: `${levelProgress}x / ${levelConfig.target}x streak`,
          statusText: `${remaining}x higher streak needed`
        };
      case 'multilines':
        return {
          progressText: `${levelProgress} / ${levelConfig.target} multi-line clears`,
          statusText: `${remaining} more ${remaining === 1 ? 'clear' : 'clears'} needed`
        };
      case 'clear_pattern':
        return {
          progressText: `${levelProgress} / ${levelConfig.target} ${levelConfig.target === 1 ? 'gem' : 'gems'} cleared`,
          statusText: `${remaining} more ${remaining === 1 ? 'gem' : 'gems'} needed`
        };
      case 'placed':
        return {
          progressText: `${levelProgress} / ${levelConfig.target} ${levelConfig.target === 1 ? 'piece' : 'pieces'} placed`,
          statusText: `${remaining} more ${remaining === 1 ? 'piece' : 'pieces'} needed`
        };
      default:
        return {
          progressText: `${levelProgress} / ${levelConfig.target} completed`,
          statusText: `${remaining} remaining`
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
        {/* Subtle Ambient Coral Halo */}
        <div className="failure-ambient-halo" aria-hidden="true" />

        {/* 1. Compact Status Pill + Chapter Context */}
        <div className="distress-telemetry-banner">
          <div className="telemetry-distress-beacon" role="status">
            <span className="distress-dot" aria-hidden="true" />
            <span className="distress-label">OUT OF MOVES</span>
          </div>
          {chapterName && (
            <div className="telemetry-ch-tag">
              Ch. {chapterNum} · {chapterName}
            </div>
          )}
        </div>

        {/* Failure Emblem, Headline & Stage Identity */}
        <div className="failure-headline-block">
          <div className="failure-sigil-apparatus" aria-hidden="true">
            <div className="fractured-core-prism">
              <ShieldAlert size={20} className="failure-sigil-icon" />
            </div>
          </div>

          <h2 id="game-over-title" className="game-over-title level-failed-title">
            LEVEL {level} FAILED
          </h2>

          <div className="stage-identity-strip failed-stage-strip">
            <span className="stage-code-pill failed-code-pill">
              STAGE {String(level).padStart(2, '0')}
            </span>
            <span className="stage-id-sep" aria-hidden="true">·</span>
            <span className="stage-name-text">{levelConfig?.title || 'Grid Frontier'}</span>
          </div>
        </div>

        {/* 2. Objective Progress (Clean Single-Surface Block) */}
        {levelConfig && objDetails && (
          <div className="failed-objective-terminal" aria-label="Objective Progress">
            <div className="obj-terminal-top">
              <div className="obj-terminal-label">
                {renderObjectiveIcon()}
                <span className="obj-progress-main">{objDetails.progressText}</span>
              </div>
              <span className="obj-deficit-badge">{objDetails.statusText}</span>
            </div>

            <div className="failed-meter-track" aria-hidden="true">
              <div
                className="failed-meter-fill"
                style={{
                  width: `${progressPercent}%`,
                  backgroundColor: levelConfig.accentColor || '#f43f5e'
                }}
              />
            </div>

            <div className="failed-meter-stats">
              <span className="obj-directive-quote">"{levelConfig.description}"</span>
              <span className="meter-count">{progressPercent}%</span>
            </div>
          </div>
        )}

        {/* 3. Performance Summary (Unified Single Panel: Final Score + Best Score + Run Stats) */}
        <div className="failed-performance-surface" aria-label="Performance Summary">
          {isNewHigh && score > 0 && (
            <div className="personal-record-celebration-trophy">
              <Trophy size={14} className="record-trophy-svg" />
              <div className="record-text-group">
                <span className="record-hero-text">NEW ALL-TIME PERSONAL RECORD!</span>
                <span className="record-sub-text">Personal best updated</span>
              </div>
            </div>
          )}

          <div className="hero-attempt-score-chassis">
            <div className="reward-vault-chamber score-chamber">
              <span className="chamber-title">FINAL SCORE</span>
              <span className="stat-value total-val final-score-number">
                {score.toLocaleString()}
              </span>
            </div>

            <div className="rewards-v-divider" aria-hidden="true" />

            <div className="reward-vault-chamber best-chamber">
              <span className="chamber-title">BEST SCORE</span>
              <span className={`stat-value best-val ${isNewHigh && score > 0 ? 'is-new-best' : ''}`}>
                {highScore.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="telemetry-stats-ribbon">
            <div className="telemetry-stat-item">
              <Zap size={12} className="col-icon cyan-icon" aria-hidden="true" />
              <span className="stat-item-lbl">Lines</span>
              <span className="stat-item-val">{linesCleared}</span>
            </div>
            <div className="telemetry-col-divider" aria-hidden="true" />
            <div className="telemetry-stat-item">
              <Flame size={12} className="col-icon orange-icon" aria-hidden="true" />
              <span className="stat-item-lbl">Best Streak</span>
              <span className="stat-item-val">x{maxStreak}</span>
            </div>
          </div>
        </div>

        {/* Cloud Backup Status / Guest Sign-In Utility */}
        {user ? (
          scoreSaved && (
            <div className="cloud-saved-badge">
              <CloudCheck size={13} className="cloud-icon" />
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
            <LogIn size={13} className="guest-login-icon" />
            <span>Sign in to save score &amp; rank</span>
          </button>
        )}

        {/* 4. Primary & Secondary Actions */}
        <div className="failed-actions-container">
          <button
            type="button"
            className="play-again-btn retry-level-btn primary-retry-trigger"
            onClick={() => {
              sounds.playSelect();
              onRestart(level);
            }}
            aria-label={`Retry Level ${level}`}
          >
            <RotateCcw size={16} className="retry-spin-icon" />
            <span className="retry-primary-text">RETRY LEVEL</span>
          </button>

          {onOpenLevelMap && (
            <button
              type="button"
              className="game-over-map-btn secondary-map-trigger"
              onClick={() => {
                sounds.playSelect();
                onOpenLevelMap();
              }}
              aria-label="Back to Adventure Map"
            >
              <Map size={15} />
              <span>BACK TO MAP</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameOverModal;
