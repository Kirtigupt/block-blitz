import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
  ChevronLeft,
  Lock
} from 'lucide-react';
import {
  TOTAL_LEVELS,
  getLevelConfig
} from '../constants/levels';
import { ADVENTURE_MOSAIC_MAPPING } from '../constants/adventureLayout';
import { sounds } from '../utils/soundEffects';

export const LevelMap = ({
  currentLevel = 1,
  unlockedLevel = 1,
  completedLevels = new Set(),
  _totalScore = 0,
  onSelectLevel,
  _onBackToGame = null,
  _hasActiveGame = false,
  onReturnToWelcome = null
}) => {
  // Selected level for the launch dock
  const [selectedLevelNum, setSelectedLevelNum] = useState(
    Math.min(currentLevel, unlockedLevel)
  );

  // Subtle locked feedback banner state
  const [lockedFeedback, setLockedFeedback] = useState(null);

  // Sync selected level if external currentLevel changes
  const [prevCurrentLevel, setPrevCurrentLevel] = useState(currentLevel);
  if (currentLevel !== prevCurrentLevel) {
    setPrevCurrentLevel(currentLevel);
    const target = Math.min(currentLevel, unlockedLevel);
    setSelectedLevelNum(target);
  }

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
  }, [selectedLevelNum]);

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

  const completedCount = completedLevels.size;
  const selectedConfig = useMemo(() => getLevelConfig(selectedLevelNum), [selectedLevelNum]);
  const isSelectedLocked = selectedLevelNum > unlockedLevel;
  const isSelectedCompleted = completedLevels.has(selectedLevelNum);

  // Prepare mosaic tile data mapped to coordinates
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

        <h1 className="adventure-screen-title">Adventure</h1>

        {/* Header Right Spacer for balanced centering */}
        <div className="adventure-header-spacer" aria-hidden="true" />
      </header>

      {/* 2. Main Scrollable Canvas */}
      <main className="campaign-grid-container adventure-scroll-container" ref={scrollContainerRef}>
        <div className="adventure-content-wrapper">
          {/* Trophy Challenge Banner */}
          <div className="adventure-trophy-banner">
            <svg
              viewBox="0 0 120 120"
              className={`adventure-trophy-svg ${completedCount >= TOTAL_LEVELS ? 'trophy-champion' : ''}`}
              aria-hidden="true"
            >
              {/* Left Handle */}
              <path
                d="M 28 28 C 14 28 10 48 24 60 C 30 66 38 66 42 63"
                fill="none"
                stroke="currentColor"
                strokeWidth="7"
                strokeLinecap="round"
              />
              {/* Right Handle */}
              <path
                d="M 92 28 C 106 28 110 48 96 60 C 90 66 82 66 78 63"
                fill="none"
                stroke="currentColor"
                strokeWidth="7"
                strokeLinecap="round"
              />
              {/* Trophy Cup Body */}
              <path
                d="M 32 20 L 88 20 C 88 20 88 56 60 66 C 32 56 32 20 32 20 Z"
                fill="currentColor"
              />
              {/* Cup Rim Highlight */}
              <rect x="30" y="18" width="60" height="5" rx="2.5" fill="rgba(255, 255, 255, 0.08)" />
              {/* Star in Center of Cup */}
              <path
                d="M 60 32 L 63 40 L 72 40 L 65 45 L 68 53 L 60 48 L 52 53 L 55 45 L 48 40 L 57 40 Z"
                fill="rgba(255, 255, 255, 0.18)"
              />
              {/* Stem */}
              <path d="M 54 66 L 66 66 L 64 80 L 56 80 Z" fill="currentColor" />
              {/* Pedestal Base */}
              <rect x="42" y="80" width="36" height="8" rx="2" fill="rgba(255, 255, 255, 0.06)" />
              <rect x="34" y="88" width="52" height="10" rx="3" fill="currentColor" />
            </svg>

            <p className="adventure-trophy-subtitle">
              Take part in the Adventure and win the trophy.
            </p>
          </div>

          {/* Locked Stage Feedback Toast */}
          {lockedFeedback && (
            <div className="locked-feedback-toast adventure-toast" role="alert">
              <Lock size={14} className="toast-lock-icon" />
              <span>{lockedFeedback}</span>
            </div>
          )}

          {/* 3. The 100-Block Adventure Trophy Sculpture Matrix */}
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

                  {/* Tile Visual Presentation */}
                  {tile.isCompleted ? (
                    /* 3D Glossy Cyan Puzzle Block (Matches Screenshot) */
                    <div className="adv-completed-face" title={`Level ${tile.level} Completed`} />
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
        </div>
      </main>

      {/* 4. Streamlined Bottom Action Dock with Big Green Play Button */}
      <footer
        className="adventure-bottom-dock compact-action-dock selected-level-dock"
        role="region"
        aria-label="Play Level Action"
      >
        <button
          type="button"
          className={`adventure-play-btn dock-action-button dock-launch-btn ${
            isSelectedLocked ? 'btn-locked' : 'btn-active'
          } ${isSelectedCompleted ? 'btn-replay' : ''}`}
          onClick={() => handleLaunchLevel(selectedLevelNum)}
          disabled={isSelectedLocked}
          aria-label={`Play Level ${selectedConfig.level}`}
        >
          <span>Level {selectedConfig.level}</span>
        </button>
      </footer>
    </div>
  );
};

export default LevelMap;
