import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
  ChevronLeft,
  Lock,
  Trophy,
  Check,
  Crown,
  Zap,
  Target,
  Flame,
  Layers,
  Star
} from 'lucide-react';
import {
  LEVEL_CONFIGS,
  TOTAL_LEVELS,
  CHAPTER_CONFIGS,
  getLevelConfig,
  getChapterForLevel
} from '../constants/levels';
import { ADVENTURE_MOSAIC_MAPPING } from '../constants/adventureLayout';
import { sounds } from '../utils/soundEffects';

export const LevelMap = ({
  currentLevel = 1,
  unlockedLevel = 1,
  completedLevels = new Set(),
  totalScore = 0,
  onSelectLevel,
  _onBackToGame = null,
  _hasActiveGame = false,
  onReturnToWelcome = null
}) => {
  // Selected level for the launch dock
  const defaultSelected = Math.max(1, Math.min(currentLevel, unlockedLevel));
  const [selectedLevelNum, setSelectedLevelNum] = useState(defaultSelected);

  // Sync selected level when external currentLevel or unlockedLevel changes
  useEffect(() => {
    setSelectedLevelNum(Math.max(1, Math.min(currentLevel, unlockedLevel)));
  }, [currentLevel, unlockedLevel]);

  // Chapter filter: 0 = All Stages, 1..10 = specific chapter
  const [activeChapterFilter, setActiveChapterFilter] = useState(0);

  // Subtle locked feedback banner state
  const [lockedFeedback, setLockedFeedback] = useState(null);

  const scrollContainerRef = useRef(null);
  const selectedCardRef = useRef(null);
  const feedbackTimerRef = useRef(null);

  // Auto-scroll selected level tile into view on mount or selection
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

  const handleLaunchLevel = useCallback(
    (targetLevel) => {
      const levelToLaunch = targetLevel || selectedLevelNum || Math.min(currentLevel, unlockedLevel);
      if (levelToLaunch > unlockedLevel) {
        sounds.playInvalid();
        const requiredStage = Math.max(1, levelToLaunch - 1);
        setLockedFeedback(`Stage ${levelToLaunch} is locked. Clear Stage ${requiredStage} to unlock.`);
        if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
        feedbackTimerRef.current = setTimeout(() => setLockedFeedback(null), 3200);
        return;
      }
      sounds.playSelect();
      onSelectLevel(levelToLaunch);
    },
    [selectedLevelNum, currentLevel, unlockedLevel, onSelectLevel]
  );

  // Keyboard navigation (Escape = back to welcome, Enter = play selected)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (onReturnToWelcome) {
          e.preventDefault();
          onReturnToWelcome();
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleLaunchLevel(selectedLevelNum);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onReturnToWelcome, handleLaunchLevel, selectedLevelNum]);

  const handleTileClick = (levelNumber) => {
    setSelectedLevelNum(levelNumber);
    const isUnlocked = levelNumber <= unlockedLevel;

    if (!isUnlocked) {
      sounds.playInvalid();
      const requiredStage = Math.max(1, levelNumber - 1);
      setLockedFeedback(`Stage ${levelNumber} is locked. Clear Stage ${requiredStage} to unlock.`);
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = setTimeout(() => setLockedFeedback(null), 3200);
      return;
    }

    setLockedFeedback(null);
    sounds.playSelect();
  };

  const handleTileDoubleClick = (levelNumber) => {
    if (levelNumber <= unlockedLevel) {
      handleLaunchLevel(levelNumber);
    }
  };

  const handleChapterTabSelect = (chapterNum) => {
    sounds.playSelect();
    setActiveChapterFilter(chapterNum);
    if (chapterNum !== 0) {
      const ch = CHAPTER_CONFIGS.find((c) => c.chapter === chapterNum);
      if (ch) {
        if (selectedLevelNum < ch.start || selectedLevelNum > ch.end) {
          const nextTarget = Math.min(ch.end, Math.max(ch.start, unlockedLevel));
          setSelectedLevelNum(nextTarget);
        }
      }
    }
  };

  const completedCount = completedLevels.size;
  const progressPercent = Math.round((completedCount / TOTAL_LEVELS) * 100);
  const selectedConfig = useMemo(() => getLevelConfig(selectedLevelNum), [selectedLevelNum]);
  const selectedChapter = useMemo(() => getChapterForLevel(selectedLevelNum), [selectedLevelNum]);
  const isSelectedLocked = selectedLevelNum > unlockedLevel;
  const isSelectedCompleted = completedLevels.has(selectedLevelNum);

  // Active chapter configuration when a specific chapter filter is chosen
  const activeChapterData = useMemo(() => {
    if (activeChapterFilter === 0) return null;
    return CHAPTER_CONFIGS.find((c) => c.chapter === activeChapterFilter) || null;
  }, [activeChapterFilter]);

  // Chapter statistics map for pill badges and progress bars
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

  // Prepare mosaic tile data mapped to coordinates (All 100 stages)
  const mosaicTiles = useMemo(() => {
    return ADVENTURE_MOSAIC_MAPPING.map((entry) => {
      const config = getLevelConfig(entry.level);
      const isCompleted = completedLevels.has(entry.level);
      const isCurrent = entry.level === unlockedLevel;
      const isLocked = entry.level > unlockedLevel;
      const isSelected = entry.level === selectedLevelNum;
      const isBoss = config?.isBoss || entry.level % 10 === 0;

      return {
        ...entry,
        config,
        isCompleted,
        isCurrent,
        isLocked,
        isSelected,
        isBoss
      };
    });
  }, [completedLevels, unlockedLevel, selectedLevelNum]);

  // Levels for specific chapter view (10 stages)
  const chapterLevels = useMemo(() => {
    if (activeChapterFilter === 0) return [];
    return LEVEL_CONFIGS.filter((lvl) => lvl.chapter === activeChapterFilter).map((lvl) => {
      const isCompleted = completedLevels.has(lvl.level);
      const isCurrent = lvl.level === unlockedLevel;
      const isLocked = lvl.level > unlockedLevel;
      const isSelected = lvl.level === selectedLevelNum;
      const isBoss = lvl.isBoss || lvl.level % 10 === 0;

      return {
        ...lvl,
        isCompleted,
        isCurrent,
        isLocked,
        isSelected,
        isBoss
      };
    });
  }, [activeChapterFilter, completedLevels, unlockedLevel, selectedLevelNum]);

  const renderObjectiveIcon = (type, color) => {
    switch (type) {
      case 'lines':
        return <Layers size={14} style={{ color }} />;
      case 'score':
        return <Star size={14} style={{ color }} />;
      case 'streak':
        return <Flame size={14} style={{ color }} />;
      case 'clear_pattern':
        return <Target size={14} style={{ color }} />;
      case 'reach_level':
        return <Crown size={14} style={{ color }} />;
      default:
        return <Zap size={14} style={{ color }} />;
    }
  };

  return (
    <div
      className="campaign-map-screen adventure-map-screen"
      role="region"
      aria-label="Adventure Campaign Level Map"
    >
      {/* 1. Sleek Top Navigation Header */}
      <header className="adventure-top-header campaign-header">
        <button
          type="button"
          className="adventure-back-btn campaign-back-btn"
          onClick={() => {
            if (onReturnToWelcome) {
              onReturnToWelcome();
            }
          }}
          aria-label="Back to Welcome"
          title="Back to Welcome"
        >
          <ChevronLeft size={28} strokeWidth={2.8} />
        </button>

        <div className="adventure-header-center">
          <h1 className="adventure-screen-title campaign-title">Adventure</h1>
          <div className="campaign-stat-pill" title={`${completedCount} of ${TOTAL_LEVELS} stages cleared`}>
            {completedCount >= TOTAL_LEVELS ? (
              <Crown size={13} className="stat-star-gold" />
            ) : (
              <Trophy size={13} className="stat-star-gold" />
            )}
            <span className="stat-val">{completedCount} / {TOTAL_LEVELS}</span>
            <span className="stat-lbl">{completedCount >= TOTAL_LEVELS ? 'CHAMPION' : 'CLEARED'}</span>
          </div>
        </div>

        {/* Header Right Spacer for balanced centering */}
        <div className="adventure-header-spacer" aria-hidden="true">
          <span className="header-score-tag">{totalScore.toLocaleString()} PTS</span>
        </div>
      </header>

      {/* 2. Desktop & Mobile Chapter Switcher Navigation Bars */}
      <nav className="desktop-chapter-pills-bar" aria-label="Desktop Chapter Navigation">
        <button
          type="button"
          className={`ch-pill-item ${activeChapterFilter === 0 ? 'active' : ''}`}
          onClick={() => handleChapterTabSelect(0)}
          aria-label="All Stages"
        >
          <Trophy size={14} className="pill-icon" />
          <span>All Stages</span>
          <span className="pill-count-tag">100</span>
        </button>
        {CHAPTER_CONFIGS.map((ch) => {
          const prog = chapterProgressMap[ch.chapter];
          const isActive = activeChapterFilter === ch.chapter;
          return (
            <button
              key={ch.chapter}
              type="button"
              className={`ch-pill-item ${isActive ? 'active' : ''} ${prog?.isCompleted ? 'pill-completed' : ''}`}
              onClick={() => handleChapterTabSelect(ch.chapter)}
              aria-label={`Chapter ${ch.chapter}: ${ch.name}`}
            >
              <span className="pill-ch-num">CH {ch.chapter}</span>
              <span className="pill-ch-name">{ch.name}</span>
              {prog?.isCompleted ? (
                <Check size={12} className="pill-check-icon" />
              ) : (
                <span className="pill-mini-stat">{prog?.completed}/10</span>
              )}
            </button>
          );
        })}
      </nav>

      <nav className="mobile-chapter-switcher-bar" aria-label="Mobile Chapter Switcher">
        <button
          type="button"
          className={`ch-pill-item ${activeChapterFilter === 0 ? 'active' : ''}`}
          onClick={() => handleChapterTabSelect(0)}
          aria-label="All Stages"
        >
          <Trophy size={13} className="pill-icon" />
          <span>All</span>
        </button>
        {CHAPTER_CONFIGS.map((ch) => {
          const prog = chapterProgressMap[ch.chapter];
          const isActive = activeChapterFilter === ch.chapter;
          return (
            <button
              key={ch.chapter}
              type="button"
              className={`ch-pill-item ${isActive ? 'active' : ''} ${prog?.isCompleted ? 'pill-completed' : ''}`}
              onClick={() => handleChapterTabSelect(ch.chapter)}
              aria-label={`Chapter ${ch.chapter}: ${ch.name}`}
            >
              <span>CH {ch.chapter}</span>
              {prog?.isCompleted && <Check size={11} className="pill-check-icon" />}
            </button>
          );
        })}
      </nav>

      {/* 3. Main Scrollable Canvas */}
      <main className="campaign-grid-container adventure-scroll-container" ref={scrollContainerRef}>
        <div className={`adventure-content-wrapper ${activeChapterFilter !== 0 ? 'chapter-mode' : ''}`}>
          {/* Trophy Challenge Banner */}
          <div className="adventure-trophy-banner">
            <svg
              viewBox="0 0 120 120"
              className={`adventure-trophy-svg ${completedCount >= TOTAL_LEVELS ? 'trophy-champion' : ''}`}
              aria-hidden="true"
            >
              <path
                d="M 28 28 C 14 28 10 48 24 60 C 30 66 38 66 42 63"
                fill="none"
                stroke="currentColor"
                strokeWidth="7"
                strokeLinecap="round"
              />
              <path
                d="M 92 28 C 106 28 110 48 96 60 C 90 66 82 66 78 63"
                fill="none"
                stroke="currentColor"
                strokeWidth="7"
                strokeLinecap="round"
              />
              <path
                d="M 32 20 L 88 20 C 88 20 88 56 60 66 C 32 56 32 20 32 20 Z"
                fill="currentColor"
              />
              <rect x="30" y="18" width="60" height="5" rx="2.5" fill="rgba(255, 255, 255, 0.08)" />
              <path
                d="M 60 32 L 63 40 L 72 40 L 65 45 L 68 53 L 60 48 L 52 53 L 55 45 L 48 40 L 57 40 Z"
                fill="rgba(255, 255, 255, 0.18)"
              />
              <path d="M 54 66 L 66 66 L 64 80 L 56 80 Z" fill="currentColor" />
              <rect x="42" y="80" width="36" height="8" rx="2" fill="rgba(255, 255, 255, 0.06)" />
              <rect x="34" y="88" width="52" height="10" rx="3" fill="currentColor" />
            </svg>

            <p className="adventure-trophy-subtitle">
              Take part in the Adventure and win the trophy.
            </p>

            <div className="campaign-overall-progress-track" title={`${progressPercent}% Campaign Conquered`}>
              <div
                className="campaign-overall-progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Locked Stage Feedback Toast */}
          {lockedFeedback && (
            <div className="locked-feedback-toast adventure-toast" role="alert">
              <Lock size={14} className="toast-lock-icon" />
              <span>{lockedFeedback}</span>
            </div>
          )}

          {/* VIEW A: ALL STAGES (100-Block Adventure Trophy Sculpture Matrix) */}
          {activeChapterFilter === 0 ? (
            <div
              className="adventure-mosaic-grid campaign-tiles-grid"
              role="grid"
              aria-label="Adventure Trophy Stages 1 to 100"
            >
              {mosaicTiles.map((tile) => {
                return (
                  <div
                    key={tile.level}
                    ref={tile.isSelected ? selectedCardRef : null}
                    className={`adventure-block level-tile-stone level-card-item ${
                      tile.isCompleted ? 'completed' : ''
                    } ${tile.isCurrent ? 'current-unlocked' : ''} ${
                      tile.isLocked ? 'locked-stone' : 'unlocked-stone'
                    } ${tile.isSelected ? 'selected-stone' : ''} ${
                      tile.isBoss ? 'boss-stone' : ''
                    }`}
                    style={{
                      gridRow: tile.row,
                      gridColumn: tile.col
                    }}
                    onClick={() => handleTileClick(tile.level)}
                    onDoubleClick={() => handleTileDoubleClick(tile.level)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Level ${tile.level}: ${tile.config?.title || `Stage ${tile.level}`}. ${
                      tile.isCompleted ? 'Completed' : tile.isLocked ? 'Locked' : 'Unlocked'
                    }`}
                  >
                    {/* Active Level Origami Pointer Marker */}
                    {tile.isCurrent && (
                      <div className="adventure-pointer-marker" aria-hidden="true">
                        <svg viewBox="0 0 24 20" className="pointer-origami-svg">
                          <polygon points="12,18 4,6 7,2 12,5" fill="#ca8a04" />
                          <polygon points="12,18 12,5 17,2 20,6" fill="#fde047" />
                          <polygon points="12,18 7,5 17,5" fill="#eab308" />
                        </svg>
                      </div>
                    )}

                    {/* Boss Stage Badge */}
                    {tile.isBoss && (
                      <div className="adv-boss-crown-badge" title="Boss Challenge Stage">
                        <Crown size={9} strokeWidth={2.5} />
                      </div>
                    )}

                    {/* Tile Visual Presentation with Visible Numbers */}
                    {tile.isCompleted ? (
                      /* 3D Glossy Cyan Puzzle Block with Clearly Visible Number */
                      <div className="adv-completed-face" title={`Level ${tile.level} Completed`}>
                        <span className="adv-completed-number">{tile.level}</span>
                      </div>
                    ) : tile.isCurrent ? (
                      /* Bright Yellow Active Tile with Bold Number */
                      <span className="adv-current-number">{tile.level}</span>
                    ) : (
                      /* Clean Dark Blue Slate Tile with Readable Number */
                      <span className="adv-locked-number">{tile.level}</span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* VIEW B: SPECIFIC CHAPTER VIEW (10 Stages with Chapter Mission Header) */
            <div className="chapter-view-container" role="region" aria-label={`Chapter ${activeChapterFilter} Stages`}>
              {activeChapterData && (
                <div className="chapter-header-strip">
                  <div className="header-strip-meta">
                    <span className="header-strip-chapter-tag">
                      CHAPTER {activeChapterData.chapter}
                    </span>
                    <h2 className="header-strip-name">{activeChapterData.name}</h2>
                    <span className="header-strip-range">
                      Stages {activeChapterData.start} – {activeChapterData.end}
                    </span>
                  </div>

                  <div className="header-strip-progress">
                    <span className="strip-progress-label">
                      {chapterProgressMap[activeChapterData.chapter]?.completed} / {chapterProgressMap[activeChapterData.chapter]?.total} Cleared
                    </span>
                    <div className="strip-progress-track">
                      <div
                        className="strip-progress-fill"
                        style={{ width: `${chapterProgressMap[activeChapterData.chapter]?.percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="chapter-stages-grid" role="grid" aria-label={`Stages for Chapter ${activeChapterFilter}`}>
                {chapterLevels.map((lvl) => {
                  return (
                    <div
                      key={lvl.level}
                      ref={lvl.isSelected ? selectedCardRef : null}
                      className={`adventure-block level-tile-stone level-card-item chapter-stage-tile ${
                        lvl.isCompleted ? 'completed' : ''
                      } ${lvl.isCurrent ? 'current-unlocked' : ''} ${
                        lvl.isLocked ? 'locked-stone' : 'unlocked-stone'
                      } ${lvl.isSelected ? 'selected-stone' : ''} ${
                        lvl.isBoss ? 'boss-stone' : ''
                      }`}
                      onClick={() => handleTileClick(lvl.level)}
                      onDoubleClick={() => handleTileDoubleClick(lvl.level)}
                      role="button"
                      tabIndex={0}
                      aria-label={`Level ${lvl.level}: ${lvl.title}. ${
                        lvl.isCompleted ? 'Completed' : lvl.isLocked ? 'Locked' : 'Unlocked'
                      }`}
                    >
                      {/* Active Level Marker */}
                      {lvl.isCurrent && (
                        <div className="adventure-pointer-marker" aria-hidden="true">
                          <svg viewBox="0 0 24 20" className="pointer-origami-svg">
                            <polygon points="12,18 4,6 7,2 12,5" fill="#ca8a04" />
                            <polygon points="12,18 12,5 17,2 20,6" fill="#fde047" />
                            <polygon points="12,18 7,5 17,5" fill="#eab308" />
                          </svg>
                        </div>
                      )}

                      {/* Header in Stage Card */}
                      <div className="ch-tile-header">
                        <span className="ch-tile-num">Stage {lvl.level}</span>
                        {lvl.isBoss && (
                          <span className="ch-tile-boss-tag">
                            <Crown size={11} /> BOSS
                          </span>
                        )}
                        {lvl.isCompleted && <Check size={14} className="ch-tile-check" />}
                        {lvl.isLocked && <Lock size={12} className="ch-tile-lock" />}
                      </div>

                      {/* Title & Objective */}
                      <div className="ch-tile-body">
                        <div className="ch-tile-title">{lvl.title}</div>
                        <div className="ch-tile-objective">
                          {renderObjectiveIcon(lvl.type, lvl.accentColor || '#38bdf8')}
                          <span>{lvl.description}</span>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="ch-tile-footer">
                        <span className="ch-tile-bonus">+{lvl.bonusPoints.toLocaleString()} PTS</span>
                        <span className="ch-tile-state-cue">
                          {lvl.isLocked ? 'LOCKED' : lvl.isCompleted ? 'REPLAY' : lvl.isCurrent ? 'YOU' : 'READY'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 4. Streamlined Bottom Action Dock with Responsive Stage Info & Play Button */}
      <footer
        className="adventure-bottom-dock compact-action-dock selected-level-dock"
        role="region"
        aria-label="Play Level Action"
      >
        <div className="dock-content-wrapper">
          {/* Stage Mission Overview on Left */}
          <div className="dock-stage-info-column">
            <div className="dock-stage-title">
              <div className="dock-stage-header-row">
                <span className="dock-ch-badge">
                  CH {selectedConfig?.chapter || 1}: {selectedChapter?.name || 'Apprentice Heights'}
                </span>
                {selectedConfig?.isBoss && (
                  <span className="dock-boss-badge">
                    <Crown size={11} /> BOSS
                  </span>
                )}
              </div>
              <span className="dock-sep" aria-hidden="true">•</span>
              <span className="dock-stage-name">
                Stage {selectedConfig?.level || 1}: {selectedConfig?.title || 'Beginner\'s Path'}
              </span>
            </div>

            <div className="dock-stage-objective-snippet">
              <span className="dock-obj-text">{selectedConfig?.description || 'Complete objective'}</span>
              <span className="dock-pts-text">+{selectedConfig?.bonusPoints?.toLocaleString() || 100} PTS</span>
            </div>
          </div>

          {/* Action Launch Button on Right */}
          <button
            type="button"
            className={`adventure-play-btn dock-action-button dock-launch-btn ${
              isSelectedLocked ? 'btn-locked' : 'btn-active'
            } ${isSelectedCompleted ? 'btn-replay' : ''}`}
            onClick={() => handleLaunchLevel(selectedLevelNum)}
            disabled={isSelectedLocked}
            aria-label={`Play Level ${selectedConfig.level}`}
          >
            {isSelectedLocked ? (
              <span className="dock-btn-main">LOCKED</span>
            ) : activeChapterFilter === 0 ? (
              <span className="dock-btn-main">Level {selectedConfig.level}</span>
            ) : (
              <span className="dock-btn-main">START LEVEL {selectedConfig.level}</span>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default LevelMap;
