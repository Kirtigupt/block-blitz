const fs = require('fs');
const path = require('path');

const headerPath = path.join(__dirname, '..', 'src', 'components', 'Header.jsx');

const newHeaderCode = `import React, { useState, useEffect, useRef } from 'react';
import {
  Trophy,
  RotateCcw,
  Volume2,
  VolumeX,
  HelpCircle,
  Flame,
  User,
  LogIn,
  Crown,
  Target,
  Layers,
  Gem,
  Sparkles,
  LogOut,
  Settings,
  Zap,
  MapPin
} from 'lucide-react';
import { calculateLevelProgressPercent, CHAPTER_CONFIGS } from '../constants/levels';

export const Header = ({
  score = 0,
  highScore = 0,
  streak = 0,
  currentLevel = 1,
  levelConfig,
  levelProgress = 0,
  isMuted = false,
  onToggleMute,
  onRestart,
  onOpenExitModal,
  onOpenHelp,
  user = null,
  onOpenAuth,
  onOpenLeaderboard,
  onOpenProfile,
  onOpenLevelMap,
  onOpenSettings
}) => {
  const [isScoreBumping, setIsScoreBumping] = useState(false);
  const prevScoreRef = useRef(score);

  // Subtle score pulse when points increase
  useEffect(() => {
    if (score > prevScoreRef.current) {
      setIsScoreBumping(true);
      const timer = setTimeout(() => setIsScoreBumping(false), 240);
      prevScoreRef.current = score;
      return () => clearTimeout(timer);
    }
    prevScoreRef.current = score;
  }, [score]);

  const safeProgress = Number.isFinite(levelProgress) ? levelProgress : 0;
  const safeTarget = Number.isFinite(levelConfig?.target) ? levelConfig.target : 1;
  const progressPercent = levelConfig ? calculateLevelProgressPercent(safeProgress, safeTarget) : 0;
  const isMissionCompleted = safeProgress >= safeTarget;
  const chapterName = levelConfig?.chapter
    ? CHAPTER_CONFIGS.find((c) => c.chapter === levelConfig.chapter)?.name
    : null;

  const renderObjectiveIcon = () => {
    if (!levelConfig) return null;
    const color = levelConfig.accentColor || '#38bdf8';
    switch (levelConfig.type) {
      case 'streak':
        return <Flame size={14} style={{ color }} className="directive-icon" />;
      case 'multilines':
        return <Layers size={14} style={{ color }} className="directive-icon" />;
      case 'clear_pattern':
        return <Gem size={14} style={{ color }} className="directive-icon" />;
      case 'placed':
        return <Sparkles size={14} style={{ color }} className="directive-icon" />;
      case 'score':
        return <Trophy size={14} style={{ color }} className="directive-icon" />;
      default:
        return <Target size={14} style={{ color }} className="directive-icon" />;
    }
  };

  const renderObjectiveCounter = () => {
    if (!levelConfig) return null;
    switch (levelConfig.type) {
      case 'lines':
        return (
          <>
            <span className="counter-label">LINES:</span>
            <span className="counter-val current">{safeProgress}</span>
            <span className="counter-slash">/</span>
            <span className="counter-val target">{safeTarget}</span>
          </>
        );
      case 'score':
        return (
          <>
            <span className="counter-label">SCORE:</span>
            <span className="counter-val current">{safeProgress.toLocaleString()}</span>
            <span className="counter-slash">/</span>
            <span className="counter-val target">{safeTarget.toLocaleString()}</span>
          </>
        );
      case 'streak':
        return (
          <>
            <span className="counter-label">STREAK:</span>
            <span className="counter-val current">{safeProgress}x</span>
            <span className="counter-slash">/</span>
            <span className="counter-val target">{safeTarget}x</span>
          </>
        );
      case 'multilines':
        return (
          <>
            <span className="counter-label">COMBOS:</span>
            <span className="counter-val current">{safeProgress}</span>
            <span className="counter-slash">/</span>
            <span className="counter-val target">{safeTarget}</span>
          </>
        );
      case 'clear_pattern': {
        const remaining = Math.max(0, safeTarget - safeProgress);
        return (
          <>
            <span className="counter-label">GEMS:</span>
            <span className="counter-val current">{safeProgress}</span>
            <span className="counter-slash">/</span>
            <span className="counter-val target">{safeTarget}</span>
            {remaining > 0 && <span className="counter-sub-note">({remaining} left)</span>}
          </>
        );
      }
      case 'placed':
        return (
          <>
            <span className="counter-label">PLACED:</span>
            <span className="counter-val current">{safeProgress}</span>
            <span className="counter-slash">/</span>
            <span className="counter-val target">{safeTarget}</span>
          </>
        );
      default:
        return (
          <>
            <span className="counter-val current">{safeProgress}</span>
            <span className="counter-slash">/</span>
            <span className="counter-val target">{safeTarget}</span>
          </>
        );
    }
  };

  const isBossLevel = Boolean(levelConfig?.isBoss || currentLevel % 10 === 0);

  return (
    <header className="game-header hud-gameplay-header" role="banner" aria-label="Block Blitz Gameplay HUD">
      {/* 1. TOP NAVIGATION COMMAND BAR */}
      <div className="header-top hud-command-bar">
        {/* Left: Branding & Current Stage Waypoint */}
        <div className="hud-nav-left">
          {/* Logo */}
          <button
            type="button"
            className="hud-brand-anchor"
            onClick={onOpenLevelMap}
            title="Open Adventure Level Map"
            aria-label="BLOCK BLITZ Logo - Open Level Map"
          >
            <div className="brand-gem-insignia" aria-hidden="true">
              <Zap size={14} className="brand-zap-icon" fill="currentColor" />
            </div>
            <div className="brand-logotype-wrap">
              <span className="brand-word-block">BLOCK</span>
              <span className="brand-word-blitz">BLITZ</span>
            </div>
          </button>

          {/* Current Stage Waypoint Chip */}
          <button
            type="button"
            className={`hud-waypoint-chip ${isBossLevel ? 'chip-boss' : 'chip-standard'}`}
            onClick={onOpenLevelMap}
            title={`Stage ${currentLevel} • Open Adventure Map`}
            aria-label={`Current Stage ${currentLevel}${isBossLevel ? ' Boss Level' : ''}. Open Map`}
          >
            {isBossLevel ? (
              <Crown size={12} className="waypoint-icon boss-crown" />
            ) : (
              <span className="waypoint-radar-dot" aria-hidden="true" />
            )}
            <span className="waypoint-stage-tag">
              {isBossLevel ? `BOSS ${currentLevel}` : `STAGE ${currentLevel}`}
            </span>
          </button>
        </div>

        {/* Center/Right: Account & Controls Hub */}
        <div className="hud-nav-right">
          {/* User Profile / Guest Sign In */}
          <div className="hud-identity-zone">
            {user ? (
              <button
                type="button"
                className="hud-profile-pill user-logged-in"
                onClick={onOpenProfile}
                title={`Profile: ${user.username} (View Stats)`}
                aria-label={`User profile: ${user.username}`}
              >
                <div className="profile-avatar-circle">
                  <User size={12} />
                </div>
                <span className="profile-username">{user.username}</span>
              </button>
            ) : (
              <button
                type="button"
                className="hud-signin-pill guest-auth-cta"
                onClick={onOpenAuth}
                title="Sign in to save scores to leaderboard"
                aria-label="Sign in to save scores"
              >
                <LogIn size={12} className="signin-icon" />
                <span>Sign In</span>
              </button>
            )}
          </div>

          {/* Group 1: Meta Controls (Leaderboard, Sound, Settings, Help) */}
          <div className="hud-control-pod meta-pod">
            <button
              type="button"
              className="hud-tactile-btn hud-btn-leaderboard"
              onClick={onOpenLeaderboard}
              title="Global Leaderboard"
              aria-label="Global Leaderboard"
            >
              <Crown size={14} />
            </button>

            <button
              type="button"
              className={`hud-tactile-btn hud-btn-audio ${isMuted ? 'is-muted' : ''}`}
              onClick={onToggleMute}
              title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
              aria-label="Toggle Sound Effects"
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>

            <button
              type="button"
              className="hud-tactile-btn hud-btn-settings"
              onClick={onOpenSettings}
              title="Game Settings"
              aria-label="Game Settings"
            >
              <Settings size={14} />
            </button>

            <button
              type="button"
              className="hud-tactile-btn hud-btn-help"
              onClick={onOpenHelp}
              title="How to Play"
              aria-label="How to Play"
            >
              <HelpCircle size={14} />
            </button>
          </div>

          {/* Micro Vertical Light Divider */}
          <div className="hud-v-divider" aria-hidden="true" />

          {/* Group 2: Match Operations (Restart, Exit) */}
          <div className="hud-control-pod match-pod">
            <button
              type="button"
              className="hud-tactile-btn hud-btn-restart"
              onClick={onRestart}
              title="Restart Level (R)"
              aria-label="Restart Level"
            >
              <RotateCcw size={14} />
            </button>

            {onOpenExitModal && (
              <button
                type="button"
                className="hud-tactile-btn hud-btn-exit"
                onClick={onOpenExitModal}
                title="Exit to Adventure Map (Esc)"
                aria-label="Exit to Adventure Map"
              >
                <LogOut size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. REIMAGINED HERO SCOREBOARD TELEMETRY CONSOLE */}
      <div className="score-board hero-scoreboard-console" role="region" aria-label="Game Scoreboard">
        {/* Dominant Hero Score (Left Wing) */}
        <div className="hero-score-anchor">
          <div className="hero-score-subhead">
            <span className="score-live-beacon" aria-hidden="true" />
            <span className="score-label-text">CURRENT SCORE</span>
          </div>
          <div className={`hero-score-number ${isScoreBumping ? 'score-pulse' : ''}`}>
            {Number.isFinite(score) ? score.toLocaleString() : '0'}
          </div>
        </div>

        {/* Secondary Telemetry Cluster (Right Wing: Best Record & Dynamic Streak Reactor) */}
        <div className="secondary-telemetry-anchor">
          {/* Personal Best Telemetry */}
          <div className="telemetry-pill best-score-pill" title="Personal Best Score for this account">
            <div className="telemetry-pill-head">
              <Trophy size={11} className="icon-best-gold" />
              <span className="telemetry-pill-lbl">BEST</span>
            </div>
            <div className="telemetry-pill-val gold-num">
              {Number.isFinite(highScore) ? highScore.toLocaleString() : '0'}
            </div>
          </div>

          {/* Dynamic Streak / Combo Reactor */}
          <div
            className={`telemetry-pill streak-reactor-pill ${
              streak > 1 ? (streak >= 4 ? 'reactor-hyper' : 'reactor-active') : 'reactor-idle'
            }`}
            title={streak > 1 ? `Current Combo Streak: ${streak}x multiplier` : 'Achieve consecutive line clears to trigger streak multipliers'}
          >
            <div className="telemetry-pill-head">
              <Flame
                size={11}
                className={`icon-streak ${
                  streak > 1 ? (streak >= 4 ? 'flame-hyper' : 'flame-active') : 'flame-idle'
                }`}
              />
              <span className="telemetry-pill-lbl">STREAK</span>
            </div>
            <div className="telemetry-pill-val streak-num">
              {streak > 1 ? `${streak}x` : '—'}
            </div>
          </div>
        </div>
      </div>

      {/* 3. REIMAGINED MISSION-CONTROL OBJECTIVE HUD */}
      {levelConfig && (
        <div className="level-objective-panel mission-control-hud" role="region" aria-label="Mission Objective">
          {/* Top Mission Taxonomy Header Strip */}
          <div className="mission-taxonomy-row">
            <div className="taxonomy-left">
              <span className={`taxonomy-stage-badge ${isBossLevel ? 'badge-boss' : ''}`}>
                {isBossLevel ? 'BOSS STAGE' : `STAGE ${currentLevel}`}
              </span>
              <span className="taxonomy-level-title">{levelConfig.title}</span>
            </div>

            <div className="taxonomy-right">
              {chapterName && (
                <span className="taxonomy-chapter-name">
                  CH {levelConfig.chapter}: {chapterName}
                </span>
              )}
              {levelConfig.pattern && levelConfig.pattern !== 'clean' && (
                <span className="taxonomy-pattern-tag" title={`Board Pattern: ${levelConfig.pattern}`}>
                  <span className="pattern-glyph">◈</span> {levelConfig.pattern.replace('_', ' ')}
                </span>
              )}
            </div>
          </div>

          {/* Core Directive & Live Progress Readout Row */}
          <div className="mission-core-row">
            {/* Thematic Objective Icon Pod */}
            <div
              className="directive-icon-pod"
              style={{ '--pod-accent': levelConfig.accentColor || '#38bdf8' }}
              aria-hidden="true"
            >
              {renderObjectiveIcon()}
            </div>

            {/* Clear Objective Directive Sentence */}
            <div className="directive-statement">
              <span className="directive-text">{levelConfig.description}</span>
            </div>

            {/* Live Progress Digital Badge */}
            <div className={`mission-counter-badge ${isMissionCompleted ? 'mission-completed' : ''}`}>
              {renderObjectiveCounter()}
            </div>
          </div>

          {/* High-Precision Energy Conduit (Smooth Progress Track) */}
          <div className="mission-conduit-track" aria-hidden="true">
            <div
              className={`mission-conduit-fill ${isMissionCompleted ? 'conduit-complete' : ''}`}
              style={{
                width: `${progressPercent}%`,
                background: isMissionCompleted
                  ? 'linear-gradient(90deg, #10b981 0%, #34d399 50%, #facc15 100%)'
                  : `linear-gradient(90deg, #0ea5e9, #38bdf8, ${levelConfig.accentColor || '#38bdf8'})`
              }}
            >
              <span className="conduit-spark-head" />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
`;

fs.writeFileSync(headerPath, newHeaderCode, 'utf8');
console.log('Successfully updated Header.jsx with fresh HUD architecture!');
