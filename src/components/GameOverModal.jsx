import React, { useEffect } from 'react';
import { RotateCcw, Trophy, Zap, CloudCheck, LogIn, Star, Map, Award, Target, Flame, Layers, Gem, Sparkles, XCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CHAPTER_CONFIGS, calculateLevelProgressPercent } from '../constants/levels';

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
  useEffect(() => {
    if (isNewHigh && score > 0) {
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch {
        // Safe fallback
      }
    }
  }, [isNewHigh, score]);

  const chapterName = levelConfig?.chapter
    ? CHAPTER_CONFIGS.find((c) => c.chapter === levelConfig.chapter)?.name
    : null;

  const progressPercent = levelConfig
    ? calculateLevelProgressPercent(levelProgress, levelConfig.target)
    : 0;

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
    <div className="modal-backdrop game-over-backdrop" role="dialog" aria-modal="true" aria-labelledby="game-over-title">
      <div className="game-over-card level-failed-card">
        {/* Header */}
        <div className="modal-header">
          <div className="game-over-tag failed-tag">
            <XCircle size={13} className="tag-icon" />
            <span>OUT OF MOVES</span>
          </div>
          <h2 id="game-over-title" className="game-over-title">
            Level {level} Failed
          </h2>
          {chapterName && (
            <div className="failed-chapter-sub">
              Chapter {levelConfig?.chapter}: {chapterName}
            </div>
          )}
        </div>

        {/* Failed Objective Status Box */}
        {levelConfig && objDetails && (
          <div className="failed-mission-box">
            <div className="failed-mission-header">
              <div className="mission-title-wrap">
                {levelConfig.type === 'streak' ? (
                  <Flame size={14} className="mission-icon" style={{ color: levelConfig.accentColor || '#fb923c' }} />
                ) : levelConfig.type === 'multilines' ? (
                  <Layers size={14} className="mission-icon" style={{ color: levelConfig.accentColor || '#f472b6' }} />
                ) : levelConfig.type === 'clear_pattern' ? (
                  <Gem size={14} className="mission-icon" style={{ color: levelConfig.accentColor || '#34d399' }} />
                ) : levelConfig.type === 'placed' ? (
                  <Sparkles size={14} className="mission-icon" style={{ color: levelConfig.accentColor || '#38bdf8' }} />
                ) : levelConfig.type === 'score' ? (
                  <Trophy size={14} className="mission-icon" style={{ color: levelConfig.accentColor || '#38bdf8' }} />
                ) : (
                  <Target size={14} className="mission-icon" style={{ color: levelConfig.accentColor || '#38bdf8' }} />
                )}
                <span className="failed-mission-title">{levelConfig.title}</span>
              </div>
              <span className="failed-mission-status-pill">{objDetails.statusText}</span>
            </div>

            <p className="failed-mission-desc">{levelConfig.description}</p>

            <div className="failed-progress-bar-wrap">
              <div className="failed-progress-track">
                <div
                  className="failed-progress-fill"
                  style={{
                    width: `${progressPercent}%`,
                    backgroundColor: levelConfig.accentColor || '#38bdf8'
                  }}
                />
              </div>
              <div className="failed-progress-text-row">
                <span className="progress-detail-label">{objDetails.label}</span>
                <span className="progress-detail-val">
                  {objDetails.current} <span className="divider">/</span> {objDetails.target}
                </span>
              </div>
            </div>
          </div>
        )}

        {isNewHigh && score > 0 && (
          <div className="new-high-banner">
            <Award className="award-icon" size={17} />
            <span>NEW PERSONAL RECORD!</span>
          </div>
        )}

        {/* Attempt Score Display */}
        <div className="final-score-box">
          <span className="final-score-label">ATTEMPT SCORE</span>
          <span className="final-score-number">{score.toLocaleString()}</span>
        </div>

        {/* Cloud Sync Status / Guest CTA */}
        {user ? (
          scoreSaved && (
            <div className="cloud-saved-badge">
              <CloudCheck size={14} className="cloud-icon" />
              <span>Score recorded to cloud</span>
            </div>
          )
        ) : (
          <div className="guest-save-banner" onClick={onOpenAuth} role="button" tabIndex={0}>
            <LogIn size={13} />
            <span>Sign in to save scores to Global Leaderboard</span>
          </div>
        )}

        {/* Compact Stats Grid */}
        <div className="modal-stats-grid">
          <div className="modal-stat-item">
            <div className="stat-label-row">
              <Star size={12} className="level-stat-star" />
              <span>Level</span>
            </div>
            <span className="stat-val">LVL {level}</span>
          </div>

          <div className="modal-stat-item">
            <div className="stat-label-row">
              <Trophy size={12} />
              <span>Best</span>
            </div>
            <span className="stat-val">{highScore.toLocaleString()}</span>
          </div>

          <div className="modal-stat-item">
            <div className="stat-label-row">
              <Zap size={12} />
              <span>Lines</span>
            </div>
            <span className="stat-val">{linesCleared}</span>
          </div>

          <div className="modal-stat-item">
            <div className="stat-label-row">
              <Flame size={12} />
              <span>Streak</span>
            </div>
            <span className="stat-val">x{maxStreak}</span>
          </div>
        </div>

        {/* Action Buttons: 1 Primary + 1 Secondary */}
        <div className="game-over-actions-row">
          <button
            type="button"
            className="play-again-btn retry-level-btn"
            onClick={() => onRestart(level)}
            autoFocus
          >
            <RotateCcw size={16} />
            <span>RETRY LEVEL {level}</span>
          </button>

          {onOpenLevelMap && (
            <button
              type="button"
              className="game-over-map-btn"
              onClick={onOpenLevelMap}
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
