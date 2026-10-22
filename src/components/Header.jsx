import React, { useState, useEffect, useRef } from 'react';
import { Trophy, RotateCcw, Volume2, VolumeX, HelpCircle, Flame, User, LogIn, Crown, Mic, MicOff, Target, Map, Layers, Gem, Sparkles, LogOut, Settings } from 'lucide-react';
import { calculateLevelProgressPercent, CHAPTER_CONFIGS } from '../constants/levels';

export const Header = ({
  score,
  highScore,
  streak,
  currentLevel = 1,
  levelConfig,
  levelProgress = 0,
  isMuted,
  onToggleMute,
  isVoiceEnabled,
  onToggleVoice,
  onRestart,
  onOpenExitModal,
  onOpenHelp,
  user,
  onOpenAuth,
  onOpenLeaderboard,
  onOpenProfile,
  onOpenLevelMap,
  onOpenSettings
}) => {
  const [isScoreBumping, setIsScoreBumping] = useState(false);
  const prevScoreRef = useRef(score);

  // Subtle number animation when points increase without bouncing the whole card
  useEffect(() => {
    if (score > prevScoreRef.current) {
      setIsScoreBumping(true);
      const timer = setTimeout(() => setIsScoreBumping(false), 240);
      prevScoreRef.current = score;
      return () => clearTimeout(timer);
    }
    prevScoreRef.current = score;
  }, [score]);

  const progressPercent = levelConfig ? calculateLevelProgressPercent(levelProgress, levelConfig.target) : 0;
  const chapterName = levelConfig?.chapter
    ? CHAPTER_CONFIGS.find((c) => c.chapter === levelConfig.chapter)?.name
    : null;

  const renderObjectiveIcon = () => {
    if (!levelConfig) return null;
    const color = levelConfig.accentColor || '#38bdf8';
    switch (levelConfig.type) {
      case 'streak':
        return <Flame size={14} style={{ color }} className="objective-icon" />;
      case 'multilines':
        return <Layers size={14} style={{ color }} className="objective-icon" />;
      case 'clear_pattern':
        return <Gem size={14} style={{ color }} className="objective-icon" />;
      case 'placed':
        return <Sparkles size={14} style={{ color }} className="objective-icon" />;
      case 'score':
        return <Trophy size={14} style={{ color }} className="objective-icon" />;
      default:
        return <Target size={14} style={{ color }} className="objective-icon" />;
    }
  };

  const renderObjectiveCounter = () => {
    if (!levelConfig) return null;
    switch (levelConfig.type) {
      case 'lines':
        return (
          <>
            <span className="objective-type-prefix">Lines:</span>
            <span className="current-progress-val">{levelProgress}</span>
            <span className="progress-divider">/</span>
            <span className="target-progress-val">{levelConfig.target}</span>
          </>
        );
      case 'score':
        return (
          <>
            <span className="objective-type-prefix">Score:</span>
            <span className="current-progress-val">{levelProgress.toLocaleString()}</span>
            <span className="progress-divider">/</span>
            <span className="target-progress-val">{levelConfig.target.toLocaleString()}</span>
          </>
        );
      case 'streak':
        return (
          <>
            <span className="objective-type-prefix">Streak:</span>
            <span className="current-progress-val">{levelProgress}x</span>
            <span className="progress-divider">/</span>
            <span className="target-progress-val">{levelConfig.target}x</span>
          </>
        );
      case 'multilines':
        return (
          <>
            <span className="objective-type-prefix">Combos:</span>
            <span className="current-progress-val">{levelProgress}</span>
            <span className="progress-divider">/</span>
            <span className="target-progress-val">{levelConfig.target}</span>
          </>
        );
      case 'clear_pattern': {
        const remaining = Math.max(0, levelConfig.target - levelProgress);
        return (
          <>
            <span className="objective-type-prefix">Gems:</span>
            <span className="current-progress-val">{levelProgress}</span>
            <span className="progress-divider">/</span>
            <span className="target-progress-val">{levelConfig.target}</span>
            <span className="progress-remaining-tag">({remaining} left)</span>
          </>
        );
      }
      case 'placed':
        return (
          <>
            <span className="objective-type-prefix">Placed:</span>
            <span className="current-progress-val">{levelProgress}</span>
            <span className="progress-divider">/</span>
            <span className="target-progress-val">{levelConfig.target}</span>
          </>
        );
      default:
        return (
          <>
            <span className="current-progress-val">{levelProgress}</span>
            <span className="progress-divider">/</span>
            <span className="target-progress-val">{levelConfig.target}</span>
          </>
        );
    }
  };

  return (
    <header className="game-header">
      {/* 1. Header Navigation & Tools Bar */}
      <div className="header-top">
        {/* Left: Brand Identity & Stage Map */}
        <div className="header-brand-group">
          <div className="logo-badge" onClick={onOpenLevelMap} role="button" tabIndex={0} title="Open Level Map">
            <span className="logo-text-block">BLOCK</span>
            <span className="logo-text-blitz">BLITZ</span>
          </div>

          <button
            type="button"
            className="level-badge-pill"
            onClick={onOpenLevelMap}
            title={`Level ${currentLevel} • Open Level Map`}
            aria-label="Open Level Map"
          >
            <Map size={12} className="lvl-map-icon" />
            <span>LVL {currentLevel}</span>
          </button>
        </div>

        {/* Right: Account & Community */}
        <div className="header-group-account">
          {user ? (
            <button
              type="button"
              className="user-pill-btn"
              onClick={onOpenProfile}
              title={`Logged in as ${user.username} (Stats & History)`}
            >
              <User size={13} className="user-icon" />
              <span className="user-pill-name">{user.username}</span>
            </button>
          ) : (
            <button
              type="button"
              className="auth-cta-btn"
              onClick={onOpenAuth}
              title="Sign in to save scores & compete"
            >
              <LogIn size={13} />
              <span>Sign In</span>
            </button>
          )}

          <button
            type="button"
            className="action-btn leaderboard-btn"
            onClick={onOpenLeaderboard}
            title="Global Leaderboard"
            aria-label="Global Leaderboard"
          >
            <Crown size={15} />
          </button>
        </div>

        {/* Tools & Gameplay Controls Cluster */}
        <div className="header-tools-cluster">
          <div className="header-group-settings">
            <button
              type="button"
              className={`action-btn sound-btn ${isMuted ? 'btn-muted' : ''}`}
              onClick={onToggleMute}
              title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
              aria-label="Toggle Sound"
            >
              {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>

            <button
              type="button"
              className={`action-btn voice-btn ${!isVoiceEnabled ? 'btn-muted' : ''}`}
              onClick={onToggleVoice}
              title={isVoiceEnabled ? 'Mute Voice Announcements' : 'Enable Voice Announcements'}
              aria-label="Toggle Voice"
            >
              {isVoiceEnabled ? <Mic size={15} /> : <MicOff size={15} />}
            </button>

            <button
              type="button"
              className="action-btn settings-btn"
              onClick={onOpenSettings}
              title="Game Settings"
              aria-label="Game Settings"
            >
              <Settings size={15} />
            </button>

            <button
              type="button"
              className="action-btn help-btn"
              onClick={onOpenHelp}
              title="How to Play"
              aria-label="Help"
            >
              <HelpCircle size={15} />
            </button>
          </div>

          <div className="header-control-divider" />

          <div className="header-group-stage">
            <button
              type="button"
              className="action-btn restart-btn"
              onClick={onRestart}
              title="Restart Level"
              aria-label="Restart Level"
            >
              <RotateCcw size={15} />
            </button>

            {onOpenExitModal && (
              <button
                type="button"
                className="action-btn exit-btn"
                onClick={onOpenExitModal}
                title="Exit to Level Map (Esc)"
                aria-label="Exit Level"
              >
                <LogOut size={15} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Unified Cohesive Score Dashboard */}
      <div className="score-board">
        <div className="score-primary-section">
          <span className="score-label">SCORE</span>
          <span className={`score-value ${isScoreBumping ? 'score-bump' : ''}`}>
            {score.toLocaleString()}
          </span>
        </div>

        <div className="score-secondary-section">
          <div className="score-secondary-item best-score-box">
            <div className="score-secondary-header">
              <Trophy size={11} className="trophy-gold" />
              <span className="secondary-label">BEST</span>
            </div>
            <span className="secondary-value best-val">{highScore.toLocaleString()}</span>
          </div>

          <div className={`score-secondary-item streak-indicator ${streak > 1 ? (streak >= 4 ? 'streak-fire' : 'streak-active') : 'streak-idle'}`}>
            <div className="score-secondary-header">
              <Flame size={11} className={streak > 1 ? (streak >= 4 ? 'flame-fire' : 'flame-gold') : 'flame-idle'} />
              <span className="secondary-label">STREAK</span>
            </div>
            <span className="secondary-value streak-val">
              {streak > 1 ? `x${streak}` : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Structured Progressive Level Objective Panel */}
      {levelConfig && (
        <div className="level-objective-panel" title={levelConfig.description}>
          {/* Identity & Pattern Row */}
          <div className="objective-meta-row">
            <div className="objective-title-group">
              <span className="objective-level-name">LVL {currentLevel}: {levelConfig.title}</span>
              {chapterName && (
                <span className="objective-chapter-badge">CH {levelConfig.chapter}: {chapterName}</span>
              )}
            </div>

            {levelConfig.pattern && levelConfig.pattern !== 'clean' && (
              <span className="objective-pattern-tag" title={`Board Pattern: ${levelConfig.pattern}`}>
                ◈ {levelConfig.pattern.replace('_', ' ')}
              </span>
            )}
          </div>

          {/* Mission Task & Live Counter Row */}
          <div className="objective-task-row">
            <div className="objective-desc-wrap">
              {renderObjectiveIcon()}
              <span className="objective-task-desc">{levelConfig.description}</span>
            </div>

            <div className="objective-progress-numbers">
              {renderObjectiveCounter()}
            </div>
          </div>

          {/* Precision Smooth Progress Track */}
          <div className="objective-progress-track">
            <div
              className="objective-progress-fill"
              style={{
                width: `${progressPercent}%`,
                background: `linear-gradient(90deg, #0ea5e9, ${levelConfig.accentColor || '#38bdf8'})`
              }}
            />
          </div>
        </div>
      )}
    </header>
  );
};
