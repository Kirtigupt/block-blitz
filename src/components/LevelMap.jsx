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
  Star,
  Sparkles,
  Gem,
  Sun,
  Compass,
  Shield,
  Play,
  Navigation
} from 'lucide-react';
import {
  LEVEL_CONFIGS,
  TOTAL_LEVELS,
  CHAPTER_CONFIGS,
  getLevelConfig,
  getChapterForLevel
} from '../constants/levels';
import {
  getChapterWindingPattern,
  CHAPTER_ZONE_HEIGHT,
  CHAPTER_ZONE_WIDTH,
  buildChapterPathD
} from '../constants/adventureLayout';
import { sounds } from '../utils/soundEffects';

/**
 * Helper to render appropriate icon for chapter badge
 */
const getChapterIcon = (iconName, color, size = 14) => {
  const style = { color };
  switch (iconName) {
    case 'Sparkles': return <Sparkles size={size} style={style} />;
    case 'Zap': return <Zap size={size} style={style} />;
    case 'Target': return <Target size={size} style={style} />;
    case 'Flame': return <Flame size={size} style={style} />;
    case 'Star': return <Star size={size} style={style} />;
    case 'Gem': return <Gem size={size} style={style} />;
    case 'Sun': return <Sun size={size} style={style} />;
    case 'Compass': return <Compass size={size} style={style} />;
    case 'Shield': return <Shield size={size} style={style} />;
    case 'Crown': return <Crown size={size} style={style} />;
    default: return <Sparkles size={size} style={style} />;
  }
};

/**
 * Helper to render objective icon
 */
const getObjectiveIcon = (type, color) => {
  switch (type) {
    case 'lines': return <Layers size={13} style={{ color }} />;
    case 'score': return <Star size={13} style={{ color }} />;
    case 'streak': return <Flame size={13} style={{ color }} />;
    case 'clear_pattern': return <Target size={13} style={{ color }} />;
    case 'reach_level': return <Crown size={13} style={{ color }} />;
    default: return <Zap size={13} style={{ color }} />;
  }
};

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

  // Chapter filter: 0 = All Realms, 1..10 = specific chapter realm
  const [activeChapterFilter, setActiveChapterFilter] = useState(0);

  // Subtle locked feedback banner state
  const [lockedFeedback, setLockedFeedback] = useState(null);

  const scrollContainerRef = useRef(null);
  const selectedCardRef = useRef(null);
  const feedbackTimerRef = useRef(null);
  const chapterSectionRefs = useRef({});

  // Auto-scroll selected/current level tile into view on mount or change
  useEffect(() => {
    const targetStage = Math.max(1, Math.min(currentLevel, unlockedLevel));

    const timer = setTimeout(() => {
      if (activeChapterFilter !== 0) {
        if (selectedCardRef.current) {
          selectedCardRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
        return;
      }

      if (targetStage === 1) {
        // Level 1 starts right at the top of the adventure map
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else {
        const targetNode = scrollContainerRef.current?.querySelector(`.adv-trail-node[data-level="${targetStage}"]`);
        if (targetNode) {
          targetNode.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        } else if (selectedCardRef.current) {
          selectedCardRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [currentLevel, unlockedLevel, activeChapterFilter]);

  // Quick action to locate and smoothly center the player's current unlocked level
  const handleLocateCurrentLevel = useCallback(() => {
    sounds.playSelect();
    const targetStage = Math.max(1, Math.min(currentLevel, unlockedLevel));
    setSelectedLevelNum(targetStage);
    setActiveChapterFilter(0);

    setTimeout(() => {
      if (targetStage === 1) {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else {
        const targetNode = scrollContainerRef.current?.querySelector(`.adv-trail-node[data-level="${targetStage}"]`);
        if (targetNode) {
          targetNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }, 120);
  }, [currentLevel, unlockedLevel]);

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

    if (chapterNum === 0) {
      // Scroll to current player level
      const targetStage = Math.max(1, Math.min(currentLevel, unlockedLevel));
      setTimeout(() => {
        if (targetStage === 1) {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
          }
        } else {
          const targetNode = scrollContainerRef.current?.querySelector(`.adv-trail-node[data-level="${targetStage}"]`);
          if (targetNode) {
            targetNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }, 100);
    } else {
      // Scroll to that chapter section
      const sectionEl = chapterSectionRefs.current[chapterNum];
      if (sectionEl) {
        sectionEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      const ch = CHAPTER_CONFIGS.find((c) => c.chapter === chapterNum);
      if (ch && (selectedLevelNum < ch.start || selectedLevelNum > ch.end)) {
        const nextTarget = Math.min(ch.end, Math.max(ch.start, unlockedLevel));
        setSelectedLevelNum(nextTarget);
      }
    }
  };

  const completedCount = completedLevels.size;
  const progressPercent = Math.round((completedCount / TOTAL_LEVELS) * 100);
  const selectedConfig = useMemo(() => getLevelConfig(selectedLevelNum), [selectedLevelNum]);
  const selectedChapter = useMemo(() => getChapterForLevel(selectedLevelNum), [selectedLevelNum]);
  const isSelectedLocked = selectedLevelNum > unlockedLevel;
  const isSelectedCompleted = completedLevels.has(selectedLevelNum);

  // Chapter statistics map
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

  // Pre-calculate paths for each chapter
  const chapterPaths = useMemo(() => {
    const map = {};
    CHAPTER_CONFIGS.forEach((ch) => {
      const pattern = getChapterWindingPattern(ch.chapter);
      const pts = pattern.map((p, idx) => ({
        x: (p.x / 100) * CHAPTER_ZONE_WIDTH,
        y: p.y,
        level: ch.start + idx
      }));

      const hasLeadIn = ch.chapter > 1;
      const hasLeadOut = ch.chapter < 10;

      const fullPath = buildChapterPathD(pts, hasLeadIn, hasLeadOut);
      const unlockedPts = pts.filter((p) => p.level <= unlockedLevel);
      const unlockedPath = unlockedPts.length > 0
        ? buildChapterPathD(unlockedPts, hasLeadIn && unlockedLevel >= ch.start, false)
        : '';

      map[ch.chapter] = {
        pts,
        fullPath,
        unlockedPath
      };
    });
    return map;
  }, [unlockedLevel]);

  // Active chapter configuration when a specific chapter filter is chosen
  const activeChapterData = useMemo(() => {
    if (activeChapterFilter === 0) return null;
    return CHAPTER_CONFIGS.find((c) => c.chapter === activeChapterFilter) || null;
  }, [activeChapterFilter]);

  // Levels for specific chapter view (10 stages)
  const chapterViewLevels = useMemo(() => {
    if (activeChapterFilter === 0) return [];
    return LEVEL_CONFIGS.filter((lvl) => lvl.chapter === activeChapterFilter).map((lvl) => {
      const isCompleted = completedLevels.has(lvl.level);
      const isCurrent = lvl.level === unlockedLevel;
      const isLocked = lvl.level > unlockedLevel;
      const isSelected = lvl.level === selectedLevelNum;
      const isBoss = Boolean(lvl.isBoss || lvl.level % 10 === 0);

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

  return (
    <div
      className="campaign-map-screen adventure-map-screen"
      role="region"
      aria-label="Adventure Campaign Level Map"
    >
      {/* 1. Top Navigation Header */}
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
          <div className="adventure-title-badge">
            <Sparkles size={14} className="adventure-title-spark" />
            <h1 className="adventure-screen-title campaign-title">ADVENTURE MAP</h1>
          </div>
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

        <div className="adventure-header-spacer" aria-hidden="true">
          <span className="header-score-tag">{totalScore.toLocaleString()} PTS</span>
        </div>
      </header>

      {/* 2. Horizontal Realm Navigation Carousel */}
      <nav className="desktop-chapter-pills-bar" aria-label="Desktop Chapter Navigation">
        <button
          type="button"
          className={`ch-pill-item ${activeChapterFilter === 0 ? 'active' : ''}`}
          onClick={() => handleChapterTabSelect(0)}
          aria-label="All Stages"
        >
          <Trophy size={14} className="pill-icon" />
          <span>All Realms</span>
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
              style={{ '--realm-accent': ch.color }}
            >
              <span className="pill-realm-dot" style={{ background: ch.color }} />
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

      {/* Mobile Chapter Switcher Bar */}
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

      {/* 3. Main Scrollable Adventure Trail Canvas (Top-to-Bottom Sequential Road) */}
      <main className="campaign-grid-container adventure-scroll-container" ref={scrollContainerRef}>
        <div className={`adventure-content-wrapper ${activeChapterFilter !== 0 ? 'chapter-mode' : ''}`}>

          {/* TOP DEPARTURE TERMINAL BANNER (Level 1 Starts Here) */}
          <div className="adventure-departure-banner" role="region" aria-label="Campaign Departure Waypoint">
            <div className="departure-badge">
              <Sparkles size={12} />
              <span>ADVENTURE EXPEDITION</span>
              <span className="departure-stages-pill">100 STAGES</span>
            </div>
            <h2 className="departure-headline">ASCEND TO THE CITADEL</h2>
            <p className="departure-subtext">
              Level 1 starts at the summit. Clear stages sequentially downwards through all 10 Cyber Realms to conquer the Sovereign Trophy.
            </p>
            <div className="departure-quick-actions">
              <div className="campaign-overall-progress-track" title={`${progressPercent}% Campaign Conquered`}>
                <div
                  className="campaign-overall-progress-fill"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="departure-stats-strip">
                <span className="departure-stat-item">
                  <Trophy size={12} className="dep-icon-trophy" />
                  <strong>{completedCount}</strong> / {TOTAL_LEVELS} Cleared
                </span>
                {unlockedLevel > 1 && (
                  <button
                    type="button"
                    className="departure-locate-btn"
                    onClick={handleLocateCurrentLevel}
                    title="Jump view to your current unlocked stage"
                  >
                    <span className="dep-locate-dot" />
                    <span>LOCATE STAGE {unlockedLevel}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Locked Stage Feedback Toast */}
          {lockedFeedback && (
            <div className="locked-feedback-toast adventure-toast" role="alert">
              <Lock size={14} className="toast-lock-icon" />
              <span>{lockedFeedback}</span>
            </div>
          )}

          {/* VIEW A: ALL STAGES (WINDING JOURNEY PATH: LEVEL 1 TOP TO LEVEL 100 BOTTOM) */}
          {activeChapterFilter === 0 ? (
            <div className="adventure-mosaic-grid campaign-tiles-grid adventure-trail-journey">
              {CHAPTER_CONFIGS.map((chapter) => {
                const prog = chapterProgressMap[chapter.chapter];
                const pathData = chapterPaths[chapter.chapter];
                const chapterLevels = LEVEL_CONFIGS.filter((l) => l.chapter === chapter.chapter);

                return (
                  <section
                    key={chapter.chapter}
                    ref={(el) => { chapterSectionRefs.current[chapter.chapter] = el; }}
                    className={`chapter-realm-zone realm-ch-${chapter.chapter}`}
                    style={{ '--realm-theme-color': chapter.color }}
                    aria-label={`Chapter ${chapter.chapter}: ${chapter.name}`}
                  >
                    {/* CHAPTER GATEWAY ARCHWAY */}
                    <div className="realm-gateway-arch">
                      <div
                        className="realm-gateway-top-line"
                        style={{ background: `linear-gradient(90deg, transparent, ${chapter.color}, transparent)` }}
                      />
                      <div className="realm-gateway-content">
                        <div
                          className="realm-gateway-badge"
                          style={{ borderColor: `${chapter.color}70`, background: `${chapter.color}18` }}
                        >
                          {getChapterIcon(chapter.icon, chapter.color, 16)}
                          <span className="realm-badge-tag">CHAPTER {chapter.chapter}</span>
                        </div>
                        <h3 className="realm-gateway-title">{chapter.name}</h3>
                        <div className="realm-gateway-meta">
                          <span className="realm-stages-tag">Stages {chapter.start}–{chapter.end}</span>
                          <span className="realm-bullet">•</span>
                          <span className="realm-cleared-tag">
                            {prog?.isCompleted ? 'REALM CONQUERED' : `${prog?.completed || 0}/10 CLEARED`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* WINDING PATHWAY FOR THIS REALM (10 SEQUENTIAL STAGES TOP TO BOTTOM) */}
                    <div className="realm-trail-canvas">
                      {/* SVG Serpentine Road Track Overlay */}
                      <svg
                        className="realm-svg-track journey-path-svg-overlay"
                        viewBox={`0 0 ${CHAPTER_ZONE_WIDTH} ${CHAPTER_ZONE_HEIGHT}`}
                        preserveAspectRatio="none"
                        aria-hidden="true"
                      >
                        <defs>
                          <linearGradient id={`realmGrad-${chapter.chapter}`} x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor={chapter.color} stopOpacity="0.85" />
                            <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.95" />
                            <stop offset="100%" stopColor="#f59e0b" stopOpacity="1" />
                          </linearGradient>
                          <filter id={`glow-${chapter.chapter}`} x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="4" result="blur" />
                            <feMerge>
                              <feMergeNode in="blur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                        </defs>

                        {/* Dormant Road Track Conduit */}
                        <path
                          d={pathData.fullPath}
                          className="journey-path-dormant realm-track-base"
                          stroke="rgba(255, 255, 255, 0.12)"
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                        />
                        <path
                          d={pathData.fullPath}
                          className="journey-path-dormant realm-track-dash"
                          stroke={chapter.color}
                          strokeOpacity="0.3"
                          strokeWidth="3"
                          strokeDasharray="6 8"
                          strokeLinecap="round"
                          fill="none"
                        />

                        {/* Active Illuminated Energy Stream */}
                        {pathData.unlockedPath && (
                          <path
                            d={pathData.unlockedPath}
                            className="journey-path-active realm-track-active"
                            stroke={`url(#realmGrad-${chapter.chapter})`}
                            strokeWidth="7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                            filter={`url(#glow-${chapter.chapter})`}
                          />
                        )}
                      </svg>

                      {/* THE 10 STAGES IN THIS REALM */}
                      {chapterLevels.map((lvl, idx) => {
                        const pattern = getChapterWindingPattern(chapter.chapter);
                        const pos = pattern[idx];
                        const isCompleted = completedLevels.has(lvl.level);
                        const isCurrent = lvl.level === unlockedLevel;
                        const isLocked = lvl.level > unlockedLevel;
                        const isSelected = lvl.level === selectedLevelNum;
                        const isBoss = Boolean(lvl.isBoss || lvl.level % 10 === 0);

                        return (
                          <div
                            key={lvl.level}
                            ref={isSelected ? selectedCardRef : null}
                            data-level={lvl.level}
                            className={`adventure-block level-tile-stone level-card-item journey-node adv-trail-node ${
                              isCompleted ? 'completed' : ''
                            } ${isCurrent ? 'current-unlocked' : ''} ${
                              isLocked ? 'locked-stone' : 'unlocked-stone'
                            } ${isSelected ? 'selected-stone' : ''} ${
                              isBoss ? 'boss-stone' : ''
                            }`}
                            style={{
                              left: `${pos.x}%`,
                              top: `${pos.y}px`,
                              '--node-accent': lvl.accentColor || chapter.color
                            }}
                            onClick={() => handleTileClick(lvl.level)}
                            onDoubleClick={() => handleTileDoubleClick(lvl.level)}
                            role="button"
                            tabIndex={0}
                            aria-label={`Level ${lvl.level}: ${lvl.title}. ${
                              isCompleted ? 'Completed' : isLocked ? 'Locked' : 'Unlocked'
                            }`}
                          >
                            {/* Active Radar Beacon Waves */}
                            {isCurrent && (
                              <div className="adv-beacon-rings" aria-hidden="true">
                                <span className="adv-radar-ring r1" />
                                <span className="adv-radar-ring r2" />
                              </div>
                            )}

                            {/* 3D Animated Hero Player Pin ("YOU ARE HERE") */}
                            {isCurrent && (
                              <div className="adventure-pointer-marker" aria-hidden="true">
                                <div className="adv-hero-pin">
                                  <span className="adv-pin-label">YOU</span>
                                  <div className="adv-pin-triangle" />
                                </div>
                              </div>
                            )}

                            {/* Completed 3-Star Crown Arch */}
                            {isCompleted && (
                              <div className="adv-stars-arch" aria-hidden="true">
                                <Star size={9} className="adv-star-mini filled" />
                                <Star size={11} className="adv-star-mini center filled" />
                                <Star size={9} className="adv-star-mini filled" />
                              </div>
                            )}

                            {/* Boss Fortress Crown Crest */}
                            {isBoss && (
                              <div
                                className="adv-boss-crown-badge"
                                title={lvl.level === 100 ? 'Final Sovereign Boss Stage' : 'Boss Milestone Stage'}
                              >
                                <Crown size={lvl.level === 100 ? 14 : 12} strokeWidth={2.8} />
                              </div>
                            )}

                            {/* 3D Gloss Highlight */}
                            <div className="adv-node-gloss" />

                            {/* 3D Node Core Sphere */}
                            <div className="adv-orb-core">
                              <span
                                className={`adv-node-number ${
                                  isCompleted
                                    ? 'completed-num'
                                    : isCurrent
                                    ? 'current-num'
                                    : isLocked
                                    ? 'locked-num'
                                    : 'unlocked-num'
                                }`}
                              >
                                {lvl.level}
                              </span>
                            </div>

                            {/* Completed Radiant Checkmark Badge */}
                            {isCompleted && (
                              <div className="adv-completed-indicator" aria-hidden="true">
                                <Check size={9} strokeWidth={3.5} />
                              </div>
                            )}

                            {/* Locked Node Padlock */}
                            {isLocked && (
                              <div className="adv-node-micro-lock" aria-hidden="true">
                                <Lock size={9} strokeWidth={2.4} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Transitional Connector Conduit between Consecutive Realms */}
                    {chapter.chapter < 10 && (
                      <div className="realm-connector-conduit" aria-hidden="true">
                        <div
                          className={`conduit-vertical-stream ${
                            unlockedLevel > chapter.end ? 'stream-active' : 'stream-dormant'
                          }`}
                          style={{
                            '--stream-start': chapter.color,
                            '--stream-end': CHAPTER_CONFIGS[chapter.chapter]?.color || '#38bdf8'
                          }}
                        />
                      </div>
                    )}
                  </section>
                );
              })}

              {/* GRAND FINALE: SOVEREIGN CHAMPION TROPHY MONUMENT AT THE VERY BOTTOM */}
              <div
                className="adventure-trophy-banner grand-finale-banner"
                role="region"
                aria-label="Sovereign Champion Monument"
              >
                <div className="adventure-trophy-pedestal">
                  <div className="trophy-ambient-glow" />
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
                    <rect x="30" y="18" width="60" height="5" rx="2.5" fill="rgba(255, 255, 255, 0.15)" />
                    <path
                      d="M 60 32 L 63 40 L 72 40 L 65 45 L 68 53 L 60 48 L 52 53 L 55 45 L 48 40 L 57 40 Z"
                      fill="rgba(255, 255, 255, 0.28)"
                    />
                    <path d="M 54 66 L 66 66 L 64 80 L 56 80 Z" fill="currentColor" />
                    <rect x="42" y="80" width="36" height="8" rx="2" fill="rgba(255, 255, 255, 0.08)" />
                    <rect x="34" y="88" width="52" height="10" rx="3" fill="currentColor" />
                  </svg>
                </div>

                <div className="trophy-finale-badge">
                  <Crown size={13} className="finale-crown-icon" />
                  <span>LEVEL 100 APEX MILESTONE</span>
                </div>

                <h2 className="adventure-trophy-headline">
                  {completedCount >= TOTAL_LEVELS
                    ? 'SOVEREIGN CHAMPION OF BLOCK BLITZ'
                    : 'SOVEREIGN CHAMPION TROPHY'}
                </h2>
                <p className="adventure-trophy-subtitle">
                  {completedCount >= TOTAL_LEVELS
                    ? 'All 100 stages conquered! You reign supreme as the Sovereign Arcade Champion.'
                    : `Conquer Stage 100 to claim the Sovereign Champion Trophy. ${TOTAL_LEVELS - completedCount} stages remaining.`}
                </p>

                <div className="campaign-overall-progress-track" title={`${progressPercent}% Campaign Conquered`}>
                  <div
                    className="campaign-overall-progress-fill"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
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
                {chapterViewLevels.map((lvl) => {
                  return (
                    <div
                      key={lvl.level}
                      ref={lvl.isSelected ? selectedCardRef : null}
                      data-level={lvl.level}
                      className={`adventure-block level-tile-stone level-card-item journey-node chapter-stage-tile ${
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
                          <div className="adv-hero-pin">
                            <span className="adv-pin-label">YOU</span>
                            <div className="adv-pin-triangle" />
                          </div>
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
                          {getObjectiveIcon(lvl.type, lvl.accentColor || '#38bdf8')}
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

      {/* Floating Quick-Locate Pill (When user has progressed past Level 1) */}
      {unlockedLevel > 1 && activeChapterFilter === 0 && (
        <button
          type="button"
          className="floating-locate-pill"
          onClick={handleLocateCurrentLevel}
          aria-label={`Locate current Stage ${unlockedLevel}`}
          title={`Center view on Stage ${unlockedLevel}`}
        >
          <Navigation size={13} className="locate-nav-icon" />
          <span>STAGE {unlockedLevel}</span>
        </button>
      )}

      {/* 4. Floating Tactical Launch Dock */}
      <footer
        className="adventure-bottom-dock compact-action-dock selected-level-dock"
        role="region"
        aria-label="Play Level Action"
      >
        <div className="dock-content-wrapper">
          {/* Stage Info on Left */}
          <div className="dock-stage-info-column">
            <div className="dock-stage-header-row">
              <div className="dock-stage-crest" style={{ borderColor: selectedConfig?.accentColor || '#38bdf8' }}>
                <span className="dock-crest-num">{selectedConfig?.level || selectedLevelNum}</span>
              </div>

              <div className="dock-stage-text-block">
                <div className="dock-stage-top-meta">
                  <span className="dock-ch-badge">
                    CH {selectedConfig?.chapter || 1} • {selectedChapter?.name || 'Apprentice Heights'}
                  </span>
                  {selectedConfig?.isBoss && (
                    <span className="dock-boss-badge">
                      <Crown size={10} /> BOSS STAGE
                    </span>
                  )}
                </div>
                <h4 className="dock-stage-name">
                  {selectedConfig?.title || `Stage ${selectedLevelNum}`}
                </h4>
              </div>
            </div>

            <div className="dock-stage-objective-snippet">
              <span className="dock-obj-icon-tag">
                {getObjectiveIcon(selectedConfig?.type, selectedConfig?.accentColor || '#38bdf8')}
              </span>
              <span className="dock-obj-text">{selectedConfig?.description || 'Complete objective'}</span>
              <span className="dock-pts-badge">+{selectedConfig?.bonusPoints?.toLocaleString() || 250} PTS</span>
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
            aria-label={`Play Level ${selectedConfig?.level || selectedLevelNum}`}
          >
            {isSelectedLocked ? (
              <span className="dock-btn-main">
                <Lock size={15} /> LOCKED
              </span>
            ) : isSelectedCompleted ? (
              <span className="dock-btn-main">
                <Play size={15} fill="currentColor" /> REPLAY LEVEL {selectedConfig?.level || selectedLevelNum}
              </span>
            ) : (
              <span className="dock-btn-main">
                <Play size={15} fill="currentColor" /> PLAY LEVEL {selectedConfig?.level || selectedLevelNum}
              </span>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default LevelMap;
