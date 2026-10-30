import React, { useState, useEffect, useRef } from 'react';
import { Trophy, RotateCcw, Volume2, VolumeX, HelpCircle, Flame, User, LogIn, Crown, Mic, MicOff, Target, Map, Layers, Gem, Sparkles, LogOut, Settings, Zap } from 'lucide-react';
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
    <header className="game-header hud-gameplay-header">
      {/* 1. Header Navigation & Tactical Command Bar */}
      <div className="header-top hud-command-bar">
        {/* Brand Plaque & Stage Crest (Left on Desktop, Row 1 on Mobile) */}
        <div className="header-brand-group hud-brand-deck">
          <div
            className="logo-badge hud-brand-plaque"
            onClick={onOpenLevelMap}
            role="button"
            tabIndex={0}
            title="Open Level Map"
            aria-label="BLOCK BLITZ Logo - Open Level Map"
          >
            <div className="hud-logo-gem" aria-hidden="true">
              <Zap size={14} className="logo-spark-icon" fill="currentColor" />
            </div>
            <div className="hud-brand-titles">
              <div className="hud-brand-logotype">
                <span className="logo-text-block">BLOCK</span>
                <span className="logo-text-blitz">BLITZ</span>
              </div>
              <span className="hud-brand-subtag">ARCADE</span>
            </div>
          </div>

          <button
            type="button"
            className="level-badge-pill hud-stage-crest"
            onClick={onOpenLevelMap}
            title={`Stage ${currentLevel} • Open Level Map`}
            aria-label={`Current Level: ${currentLevel}. Open Level Map`}
          >
            <span className="lvl-beacon-dot" />
            <Map size={13} className="lvl-map-icon" />
            <div className="hud-stage-text-wrap">
              <span className="hud-stage-tiny-lbl">STAGE</span>
              <span className="lvl-num-text">{currentLevel}</span>
            </div>
          </button>
        </div>

        {/* Action Controls & Identity Hub (Right on Desktop, Row 2 on Mobile) */}
        <div className="header-actions hud-actions-deck">
          {/* Player Identity Capsule */}
          <div className="header-group-account hud-account-slot">
            {user ? (
              <button
                type="button"
                className="user-pill-btn hud-identity-pill user-active"
                onClick={onOpenProfile}
                title={`Logged in as ${user.username} (Stats & History)`}
                aria-label={`User profile: ${user.username}`}
              >
                <div className="hud-avatar-dot">
                  <User size={12} className="user-icon" />
                </div>
                <span className="user-pill-name">{user.username}</span>
              </button>
            ) : (
              <button
                type="button"
                className="auth-cta-btn hud-identity-pill auth-guest"
                onClick={onOpenAuth}
                title="Sign in to save scores & compete"
                aria-label="Sign in to save scores & compete"
              >
                <LogIn size={12} className="hud-login-icon" />
                <span>Sign In</span>
              </button>
            )}
          </div>

          {/* Tactical Utility Hub */}
          <div className="header-tools-cluster hud-tools-cluster">
            {/* Global Leaderboard Button */}
            <button
              type="button"
              className="action-btn leaderboard-btn hud-icon-btn crown-glow"
              onClick={onOpenLeaderboard}
              title="Global Leaderboard"
              aria-label="Global Leaderboard"
            >
              <Crown size={15} />
            </button>

            <div className="header-group-settings hud-settings-group">
              <button
                type="button"
                className={`action-btn sound-btn desktop-audio-toggle hud-icon-btn ${isMuted ? 'btn-muted' : ''}`}
                onClick={onToggleMute}
                title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
                aria-label="Toggle Sound Effects"
              >
                {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>

              <button
                type="button"
                className={`action-btn voice-btn desktop-audio-toggle hud-icon-btn ${!isVoiceEnabled ? 'btn-muted' : ''}`}
                onClick={onToggleVoice}
                title={isVoiceEnabled ? 'Mute Voice Announcements' : 'Enable Voice Announcements'}
                aria-label="Toggle Voice Announcements"
              >
                {isVoiceEnabled ? <Mic size={15} /> : <MicOff size={15} />}
              </button>

              <button
                type="button"
                className="action-btn settings-btn hud-icon-btn"
                onClick={onOpenSettings}
                title="Game Settings"
                aria-label="Game Settings"
              >
                <Settings size={15} />
              </button>

              <button
                type="button"
                className="action-btn help-btn desktop-only-tool hud-icon-btn"
                onClick={onOpenHelp}
                title="How to Play"
                aria-label="How to Play"
              >
                <HelpCircle size={15} />
              </button>
            </div>

            <div className="header-control-divider hud-control-divider" />

            <div className="header-group-stage hud-stage-group">
              <button
                type="button"
                className="action-btn restart-btn hud-icon-btn restart-glow"
                onClick={onRestart}
                title="Restart Level"
                aria-label="Restart Level"
              >
                <RotateCcw size={15} />
              </button>

              {onOpenExitModal && (
                <button
                  type="button"
                  className="action-btn exit-btn hud-icon-btn exit-glow"
                  onClick={onOpenExitModal}
                  title="Exit to Level Map (Esc)"
                  aria-label="Exit to Level Map"
                >
                  <LogOut size={15} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Cockpit Statistics Dashboard (3-Pod Integrated HUD) */}
      <div className="score-board hud-stats-chassis">
        {/* Bay 1: Primary Current Score Hero */}
        <div className="score-primary-section hud-stat-bay bay-score">
          <div className="hud-bay-label-wrap">
            <span className="score-label hud-bay-label">SCORE</span>
            <span className="hud-live-tag">LIVE</span>
          </div>
          <span className={`score-value hud-score-digits ${isScoreBumping ? 'score-bump' : ''}`}>
            {score.toLocaleString()}
          </span>
        </div>

        <div className="score-deck-divider hud-deck-divider" />

        {/* Bay 2: Personal Best Record */}
        <div className="score-secondary-item best-score-box hud-stat-bay bay-best">
          <div className="score-secondary-header hud-bay-label-wrap">
            <Trophy size={11} className="trophy-gold" />
            <span className="secondary-label hud-bay-label">BEST</span>
          </div>
          <span className="secondary-value best-val hud-best-digits">{highScore.toLocaleString()}</span>
        </div>

        <div className="score-deck-divider hud-deck-divider" />

        {/* Bay 3: Active Combo & Streak Engine */}
        <div className={`score-secondary-item streak-indicator hud-stat-bay bay-streak ${streak > 1 ? (streak >= 4 ? 'streak-fire' : 'streak-active') : 'streak-idle'}`}>
          <div className="score-secondary-header hud-bay-label-wrap">
            <Flame size={11} className={streak > 1 ? (streak >= 4 ? 'flame-fire' : 'flame-gold') : 'flame-idle'} />
            <span className="secondary-label hud-bay-label">STREAK</span>
          </div>
          <span className="secondary-value streak-val hud-streak-digits">
            {streak > 1 ? `x${streak}` : '—'}
          </span>
        </div>
      </div>

      {/* 3. Active Mission Tracker Bar (Level Objectives HUD) */}
      {levelConfig && (
        <div className="level-objective-panel hud-mission-chassis" title={levelConfig.description}>
          {/* Identity & Chapter Strip */}
          <div className="objective-meta-row hud-mission-meta">
            <div className="objective-title-group hud-mission-title-group">
              <span className="hud-mission-badge">STAGE {currentLevel}</span>
              <span className="objective-level-name hud-mission-name">{levelConfig.title}</span>
              {chapterName && (
                <span className="objective-chapter-badge hud-chapter-badge">CH.{levelConfig.chapter}: {chapterName}</span>
              )}
            </div>

            {levelConfig.pattern && levelConfig.pattern !== 'clean' && (
              <span className="objective-pattern-tag hud-pattern-badge" title={`Board Pattern: ${levelConfig.pattern}`}>
                <span className="hud-pattern-gem">◈</span> {levelConfig.pattern.replace('_', ' ')}
              </span>
            )}
          </div>

          {/* Mission Directive & Target Readout */}
          <div className="objective-task-row hud-mission-directive-row">
            <div className="objective-desc-wrap hud-mission-instruction">
              <div className="hud-mission-icon-socket" style={{ '--socket-accent': levelConfig.accentColor || '#38bdf8' }}>
                {renderObjectiveIcon()}
              </div>
              <span className="objective-task-desc hud-instruction-text">{levelConfig.description}</span>
            </div>

            <div className="objective-progress-numbers hud-progress-digital-badge">
              {renderObjectiveCounter()}
            </div>
          </div>

          {/* Precision Energy Conduit (Smooth Progress Track) */}
          <div className="objective-progress-track hud-energy-track">
            <div
              className="objective-progress-fill hud-energy-fill"
              style={{
                width: `${progressPercent}%`,
                background: `linear-gradient(90deg, #0ea5e9, #22d3ee, ${levelConfig.accentColor || '#38bdf8'})`
              }}
            >
              <div className="progress-fill-glow-head hud-conduit-spark" />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
