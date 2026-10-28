import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
  ArrowLeft,
  Check,
  Lock,
  Play,
  Star,
  Trophy,
  Target,
  Zap,
  Sparkles,
  Crown,
  Flame,
  Layers,
  Gem
} from 'lucide-react';
import {
  LEVEL_CONFIGS,
  TOTAL_LEVELS,
  CHAPTER_CONFIGS,
  getLevelConfig,
  getChapterForLevel
} from '../constants/levels';
import { sounds } from '../utils/soundEffects';

export const LevelMap = ({
  currentLevel = 1,
  unlockedLevel = 1,
  completedLevels = new Set(),
  totalScore = 0,
  onSelectLevel,
  onBackToGame,
  hasActiveGame = false,
  onReturnToWelcome = null
}) => {
  // Currently selected level for the action dock
  const [selectedLevelNum, setSelectedLevelNum] = useState(
    Math.min(currentLevel, unlockedLevel)
  );

  // Chapter filter: 0 = All Chapters, 1..10 = specific chapter
  const [activeChapterFilter, setActiveChapterFilter] = useState(() => {
    const activeChapter = getChapterForLevel(Math.min(currentLevel, unlockedLevel))?.chapter || 0;
    return activeChapter;
  });

  // Track previous currentLevel to sync selected level without cascading effects
  const [prevCurrentLevel, setPrevCurrentLevel] = useState(currentLevel);
  if (currentLevel !== prevCurrentLevel) {
    setPrevCurrentLevel(currentLevel);
    const target = Math.min(currentLevel, unlockedLevel);
    setSelectedLevelNum(target);
    const ch = getChapterForLevel(target);
    if (ch && activeChapterFilter !== 0) {
      setActiveChapterFilter(ch.chapter);
    }
  }

  const scrollContainerRef = useRef(null);
  const selectedCardRef = useRef(null);

  // Auto-scroll to selected level card
  useEffect(() => {
    const timer = setTimeout(() => {
      if (selectedCardRef.current) {
        selectedCardRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [selectedLevelNum, activeChapterFilter]);

  const handleLaunchLevel = useCallback((targetLevel) => {
    const levelToLaunch = targetLevel || selectedLevelNum || Math.min(currentLevel, unlockedLevel);
    if (levelToLaunch > unlockedLevel) {
      sounds.playInvalid();
      return;
    }
    sounds.playSelect();
    onSelectLevel(levelToLaunch);
  }, [selectedLevelNum, currentLevel, unlockedLevel, onSelectLevel]);

  // Keyboard navigation: Enter launches, Escape backs to game
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && hasActiveGame && onBackToGame) {
        e.preventDefault();
        onBackToGame();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleLaunchLevel(selectedLevelNum);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasActiveGame, onBackToGame, handleLaunchLevel, selectedLevelNum]);

  const handleCardClick = (level) => {
    const isUnlocked = level.level <= unlockedLevel;
    if (!isUnlocked) {
      sounds.playInvalid();
      return;
    }

    sounds.playSelect();
    setSelectedLevelNum(level.level);
  };

  const handleCardDoubleClick = (level) => {
    if (level.level <= unlockedLevel) {
      handleLaunchLevel(level.level);
    }
  };

  const completedCount = completedLevels.size;
  const progressPercent = Math.round((completedCount / TOTAL_LEVELS) * 100);
  const selectedConfig = useMemo(() => getLevelConfig(selectedLevelNum), [selectedLevelNum]);
  const selectedChapter = useMemo(() => getChapterForLevel(selectedLevelNum), [selectedLevelNum]);

  // Compute chapter progress for each chapter (0 to 10 completed)
  const chapterProgressMap = useMemo(() => {
    const map = {};
    CHAPTER_CONFIGS.forEach((ch) => {
      const chapterLevels = LEVEL_CONFIGS.filter((l) => l.chapter === ch.chapter);
      const completedInCh = chapterLevels.filter((l) => completedLevels.has(l.level)).length;
      map[ch.chapter] = {
        total: chapterLevels.length,
        completed: completedInCh,
        percent: Math.round((completedInCh / chapterLevels.length) * 100),
        isCompleted: completedInCh === chapterLevels.length,
        isUnlocked: unlockedLevel >= ch.start
      };
    });
    return map;
  }, [completedLevels, unlockedLevel]);

  // Filter levels based on selected chapter tab
  const displayedLevels = useMemo(() => {
    if (activeChapterFilter === 0) {
      return LEVEL_CONFIGS;
    }
    return LEVEL_CONFIGS.filter((lvl) => lvl.chapter === activeChapterFilter);
  }, [activeChapterFilter]);

  const renderObjectiveSummary = (lvl) => {
    switch (lvl.type) {
      case 'lines':
        return `Clear ${lvl.target} lines`;
      case 'score':
        return `Score ${lvl.target.toLocaleString()} pts`;
      case 'streak':
        return `${lvl.target}x Combo Streak`;
      case 'clear_pattern':
        return `Break ${lvl.target} gems`;
      case 'multilines':
        return `${lvl.target} Multi-Clears`;
      case 'placed':
        return `Place ${lvl.target} pieces`;
      default:
        return lvl.description || `Target: ${lvl.target}`;
    }
  };

  const renderObjectiveIcon = (type, color) => {
    switch (type) {
      case 'score':
        return <Trophy size={13} style={{ color }} />;
      case 'streak':
        return <Flame size={13} style={{ color }} />;
      case 'multilines':
        return <Layers size={13} style={{ color }} />;
      case 'clear_pattern':
        return <Gem size={13} style={{ color }} />;
      case 'placed':
        return <Sparkles size={13} style={{ color }} />;
      default:
        return <Target size={13} style={{ color }} />;
    }
  };

  return (
    <div className="campaign-map-screen" role="region" aria-label="Campaign Level Map">
      {/* Ambient Cyberpunk Glow */}
      <div className="map-ambient-glow" />

      {/* 1. Top Navigation & Stats Bar */}
      <header className="campaign-header">
        <div className="campaign-header-left">
          {hasActiveGame && onBackToGame ? (
            <button
              className="campaign-back-btn"
              onClick={onBackToGame}
              title="Return to active game"
              aria-label="Back to Game"
            >
              <ArrowLeft size={16} />
              <span>Back to Game</span>
            </button>
          ) : onReturnToWelcome ? (
            <button
              type="button"
              className="campaign-brand-tag clickable"
              onClick={onReturnToWelcome}
              title="Return to Welcome Landing"
              aria-label="Return to Welcome Screen"
            >
              <span className="brand-dot" />
              <span>BLOCK BLITZ</span>
            </button>
          ) : (
            <div className="campaign-brand-tag">
              <span className="brand-dot" />
              <span>BLOCK BLITZ</span>
            </div>
          )}

          <div className="campaign-title-block">
            <h1 className="campaign-title">CAMPAIGN MAP</h1>
            <span className="campaign-subtitle">
              100 Progressive Stages • 10 Thematic Chapters
            </span>
          </div>
        </div>

        <div className="campaign-header-stats">
          <div className="campaign-stat-pill" title={`${completedCount} of 100 stages cleared`}>
            {completedCount >= TOTAL_LEVELS ? (
              <Crown size={14} className="stat-star-gold" />
            ) : (
              <Star size={14} className="stat-star-gold" />
            )}
            <span className="stat-val">{completedCount} / {TOTAL_LEVELS}</span>
            <span className="stat-lbl">{completedCount >= TOTAL_LEVELS ? 'CONQUERED' : 'CLEARED'}</span>
          </div>

          <div className="campaign-stat-pill score-pill" title={`Total Campaign Score: ${totalScore.toLocaleString()}`}>
            <Trophy size={14} className="stat-trophy-cyan" />
            <span className="stat-val">{totalScore.toLocaleString()}</span>
            <span className="stat-lbl">PTS</span>
          </div>

          <div className="campaign-stat-pill stage-pill" title={`Highest Stage Unlocked: Level ${unlockedLevel}`}>
            <Sparkles size={14} className="stat-sparkle-cyan" />
            <span className="stat-val">LVL {unlockedLevel}</span>
            <span className="stat-lbl">ACTIVE</span>
          </div>
        </div>
      </header>

      {/* Overall Campaign Progress Bar */}
      <div className="campaign-progress-bar-wrap" title={`Campaign Completion: ${progressPercent}%`}>
        <div className="campaign-progress-bar-fill" style={{ width: `${progressPercent}%` }} />
      </div>

      {/* 2. Chapter Quick Selector Tabs with Chapter Progress */}
      <nav className="chapter-tabs-nav" aria-label="Filter stages by chapter">
        <div className="chapter-tabs-track">
          <button
            type="button"
            className={`chapter-tab-pill ${activeChapterFilter === 0 ? 'active' : ''}`}
            onClick={() => {
              sounds.playSelect();
              setActiveChapterFilter(0);
            }}
          >
            <span className="tab-title">All Chapters</span>
            <span className="tab-range">1-100</span>
            <span className="tab-ch-progress">{completedCount}/{TOTAL_LEVELS}</span>
          </button>

          {CHAPTER_CONFIGS.map((ch) => {
            const isActive = activeChapterFilter === ch.chapter;
            const chProgress = chapterProgressMap[ch.chapter] || { completed: 0, total: 10, isUnlocked: false };
            return (
              <button
                key={ch.chapter}
                type="button"
                className={`chapter-tab-pill ${isActive ? 'active' : ''} ${!chProgress.isUnlocked ? 'locked' : ''}`}
                onClick={() => {
                  sounds.playSelect();
                  setActiveChapterFilter(ch.chapter);
                }}
                style={{ '--chapter-color': ch.color }}
                title={`Chapter ${ch.chapter}: ${ch.name} (${chProgress.completed}/10 cleared)`}
              >
                <div className="tab-title-line">
                  {!chProgress.isUnlocked && <Lock size={10} className="tab-lock-icon" />}
                  <span className="tab-title">Ch {ch.chapter}</span>
                  {chProgress.isCompleted && <Check size={11} className="tab-check-icon" />}
                </div>
                <span className="tab-range">{ch.range}</span>
                <span className="tab-ch-progress">{chProgress.completed}/10</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* 3. Main Content: Responsive 100-Level Grid */}
      <main className="campaign-grid-container" ref={scrollContainerRef}>
        <div className="campaign-grid-wrapper">
          {/* Chapter Banner when viewing a single chapter */}
          {activeChapterFilter > 0 && (
            <div
              className="active-chapter-banner"
              style={{
                borderColor: CHAPTER_CONFIGS[activeChapterFilter - 1].color,
                background: `linear-gradient(135deg, ${CHAPTER_CONFIGS[activeChapterFilter - 1].color}15, rgba(15, 23, 42, 0.6))`
              }}
            >
              <div className="banner-left">
                <span className="banner-ch-number" style={{ color: CHAPTER_CONFIGS[activeChapterFilter - 1].color }}>
                  CHAPTER {activeChapterFilter} • {chapterProgressMap[activeChapterFilter]?.completed || 0}/10 COMPLETED
                </span>
                <h2 className="banner-ch-name">
                  {CHAPTER_CONFIGS[activeChapterFilter - 1].name}
                </h2>
                <span className="banner-ch-range">
                  Levels {CHAPTER_CONFIGS[activeChapterFilter - 1].range} • Chapter Boss Challenge at Level {CHAPTER_CONFIGS[activeChapterFilter - 1].end}
                </span>

                {/* Chapter Mini Progress Track */}
                <div className="chapter-progress-track">
                  <div
                    className="chapter-progress-fill"
                    style={{
                      width: `${chapterProgressMap[activeChapterFilter]?.percent || 0}%`,
                      backgroundColor: CHAPTER_CONFIGS[activeChapterFilter - 1].color
                    }}
                  />
                </div>
              </div>
              <button
                type="button"
                className="banner-view-all-btn"
                onClick={() => setActiveChapterFilter(0)}
              >
                View All 100 Levels
              </button>
            </div>
          )}

          {/* Grid of Level Cards */}
          <div className="levels-responsive-grid">
            {displayedLevels.map((lvl) => {
              const isCompleted = completedLevels.has(lvl.level);
              const isCurrent = lvl.level === unlockedLevel;
              const isLocked = lvl.level > unlockedLevel;
              const isSelected = lvl.level === selectedLevelNum;

              return (
                <div
                  key={lvl.level}
                  ref={isSelected ? selectedCardRef : null}
                  className={`level-card-item ${isCompleted ? 'completed' : ''} ${
                    isCurrent ? 'current' : ''
                  } ${isLocked ? 'locked' : 'unlocked'} ${isSelected ? 'selected' : ''} ${
                    lvl.isBoss ? 'boss-stage' : ''
                  }`}
                  onClick={() => handleCardClick(lvl)}
                  onDoubleClick={() => handleCardDoubleClick(lvl)}
                  role="button"
                  tabIndex={isLocked ? -1 : 0}
                  aria-label={`Level ${lvl.level}: ${lvl.title}. ${
                    isCompleted ? 'Completed' : isLocked ? 'Locked' : 'Unlocked'
                  }`}
                  style={{
                    '--lvl-accent': lvl.accentColor || '#38bdf8'
                  }}
                >
                  {/* Card Header */}
                  <div className="card-top-row">
                    <div className="card-top-left">
                      <span className="card-level-badge">
                        LVL {lvl.level}
                      </span>
                      <span className="card-chapter-tag">
                        CH {lvl.chapter}
                      </span>
                    </div>

                    <div className="card-status-badges">
                      {lvl.isBoss && (
                        <span className="card-boss-badge" title="Chapter Boss Challenge">
                          <Crown size={11} /> BOSS
                        </span>
                      )}

                      {isCompleted ? (
                        <span className="card-completed-badge" title="Completed">
                          <Check size={12} />
                        </span>
                      ) : isCurrent ? (
                        <span className="card-current-badge">
                          YOU
                        </span>
                      ) : isLocked ? (
                        <span className="card-lock-badge">
                          <Lock size={12} />
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Card Title */}
                  <div className="card-title-row">
                    <h3 className="card-title">{lvl.title}</h3>
                  </div>

                  {/* Card Objective Summary */}
                  <div className="card-objective-row">
                    <div className="obj-icon-wrap">
                      {renderObjectiveIcon(lvl.type, lvl.accentColor || '#38bdf8')}
                    </div>
                    <span className="card-obj-text">
                      {renderObjectiveSummary(lvl)}
                    </span>
                  </div>

                  {/* Pattern tag if present */}
                  {lvl.pattern && lvl.pattern !== 'clean' && (
                    <div className="card-pattern-pill" title={`Tactical Pattern: ${lvl.pattern}`}>
                      <span>◈ {lvl.pattern.replace('_', ' ')}</span>
                    </div>
                  )}

                  {/* Card Footer: Bonus & Action */}
                  <div className="card-footer-row">
                    <span className="card-bonus-tag">
                      +{lvl.bonusPoints.toLocaleString()} PTS
                    </span>

                    <span className="card-action-cue">
                      {isLocked ? 'LOCKED' : isCompleted ? 'REPLAY' : isCurrent ? 'PLAY NOW' : 'PLAY'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* 4. Selected Level Details Dock (Clean bottom fixed panel, zero clipping) */}
      <footer className="selected-level-dock">
        <div className="dock-container">
          {/* Level Info & Mission Overview */}
          <div className="dock-details-left">
            <div className="dock-meta-header">
              <span
                className="dock-level-badge"
                style={{ background: selectedConfig.accentColor || '#38bdf8' }}
              >
                LVL {selectedConfig.level}
              </span>
              <span className="dock-chapter-tag">
                CH {selectedConfig.chapter}: {selectedChapter?.name || 'Chapter'}
              </span>
              {selectedConfig.isBoss && (
                <span className="dock-boss-tag">
                  <Crown size={12} /> BOSS CHALLENGE
                </span>
              )}
              <h2 className="dock-title">{selectedConfig.title}</h2>
            </div>

            <div className="dock-meta-details">
              <div className="dock-objective-box">
                {renderObjectiveIcon(selectedConfig.type, selectedConfig.accentColor || '#38bdf8')}
                <span className="dock-objective-text">
                  <strong>Objective:</strong> {selectedConfig.description}
                </span>
              </div>

              {selectedConfig.pattern && selectedConfig.pattern !== 'clean' && (
                <span className="dock-pattern-pill">
                  ◈ Grid: {selectedConfig.pattern.replace('_', ' ')}
                </span>
              )}

              <span className="dock-reward-pill">
                <Zap size={12} className="dock-zap-icon" />
                +{selectedConfig.bonusPoints.toLocaleString()} Bonus PTS
              </span>
            </div>
          </div>

          {/* Action Launch Button */}
          <div className="dock-actions-right">
            <button
              type="button"
              className="dock-launch-btn"
              onClick={() => handleLaunchLevel(selectedConfig.level)}
              autoFocus
              aria-label={`Play Level ${selectedConfig.level}`}
            >
              <span>
                {selectedConfig.level === 100 && completedLevels.has(100)
                  ? 'REPLAY LEVEL 100 (CHAMPION)'
                  : selectedConfig.level === unlockedLevel
                  ? 'START LEVEL ' + selectedConfig.level
                  : completedLevels.has(selectedConfig.level)
                  ? 'REPLAY LEVEL ' + selectedConfig.level
                  : 'PLAY LEVEL ' + selectedConfig.level}
              </span>
              <Play size={18} fill="currentColor" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LevelMap;
