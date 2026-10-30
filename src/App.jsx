import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Header } from './components/Header';
import { GameGrid } from './components/GameGrid';
import { BlockTray } from './components/BlockTray';
import { GameOverModal } from './components/GameOverModal';
import { LevelCompleteModal } from './components/LevelCompleteModal';
import { LevelMap } from './components/LevelMap';
import { LevelIntroModal } from './components/LevelIntroModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { ScoreNotification } from './components/ScoreNotification';
import { AuthModal } from './components/AuthModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { PlayerProfileModal } from './components/PlayerProfileModal';
import { ExitConfirmModal } from './components/ExitConfirmModal';
import { OnboardingModal } from './components/OnboardingModal';
import { WelcomeLandingScreen } from './components/WelcomeLandingScreen';
import { SettingsModal } from './components/SettingsModal';
import { loadStoredSettings, saveStoredSettings } from './utils/settings';
import { triggerHaptic, setHapticsEnabled } from './utils/haptics';
import {
  createEmptyGrid,
  getRandomShapes,
  canPlaceShape,
  canShapeFitAnywhere,
  getShapeCoordinates,
  placeShapeOnGrid,
  detectFullLines,
  clearLinesFromGrid,
  getBlockTileCount,
  calculateScore,
  isGameOver
} from './utils/gameLogic';
import { BLOCK_PALETTE } from './constants/blocks';
import { getLevelConfig } from './constants/levels';
import { createPatternGrid } from './constants/patterns';
import { sounds } from './utils/soundEffects';
import { voiceAnnouncer } from './utils/voiceAnnouncer';
import {
  getClearCelebration,
  getHighScoreCelebration,
  getNoValidMoveCelebration,
  getStartGameCelebration,
  getGameOverCelebration,
  getLevelCompleteCelebration
} from './utils/celebrations';
import { getToken, clearToken, apiGetMe, apiSaveGame, apiUpdateProgression } from './utils/api';
import confetti from 'canvas-confetti';
import './App.css';

const HIGH_SCORE_KEY = 'block_blitz_high_score';
const UNLOCKED_LEVEL_KEY = 'block_blitz_unlocked_level';
const CURRENT_LEVEL_KEY = 'block_blitz_current_level';
const COMPLETED_LEVELS_KEY = 'block_blitz_completed_levels';

/**
 * Account-scoped storage key helper.
 * When authenticated, keys are isolated per user ID so User A never bleeds into User B.
 */
const getStorageKey = (baseKey, userId = null) => {
  return userId ? `${baseKey}_user_${userId}` : `${baseKey}_guest`;
};

export function App() {
  const [grid, setGrid] = useState(() => createEmptyGrid());
  const [shapes, setShapes] = useState(() => getRandomShapes(3));
  const [selectedShape, setSelectedShape] = useState(null);
  const [hoverPos, setHoverPos] = useState(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try {
      return Number(localStorage.getItem(getStorageKey(HIGH_SCORE_KEY, null))) || 0;
    } catch {
      return 0;
    }
  });
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [linesClearedTotal, setLinesClearedTotal] = useState(0);
  const [completedLevels, setCompletedLevels] = useState(() => {
    try {
      const saved = localStorage.getItem(getStorageKey(COMPLETED_LEVELS_KEY, null));
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return new Set(parsed);
      }
    } catch {
      // fallback
    }
    return new Set();
  });
  const [unlockedLevel, setUnlockedLevel] = useState(() => {
    try {
      return Number(localStorage.getItem(getStorageKey(UNLOCKED_LEVEL_KEY, null))) || 1;
    } catch {
      return 1;
    }
  });
  const [currentLevel, setCurrentLevel] = useState(() => {
    try {
      const saved = Number(localStorage.getItem(getStorageKey(CURRENT_LEVEL_KEY, null))) || 1;
      const maxUnlocked = Number(localStorage.getItem(getStorageKey(UNLOCKED_LEVEL_KEY, null))) || 1;
      return Math.max(1, Math.min(saved, Math.max(1, maxUnlocked)));
    } catch {
      return 1;
    }
  });
  const [levelProgress, setLevelProgress] = useState(0);
  const [showLevelCompleteModal, setShowLevelCompleteModal] = useState(false);
  const [completedLevelData, setCompletedLevelData] = useState(null);
  const levelConfig = useMemo(() => getLevelConfig(currentLevel), [currentLevel]);
  const [gameOver, setGameOver] = useState(false);
  const [isNewHigh, setIsNewHigh] = useState(false);
  const [clearingCells, setClearingCells] = useState(() => new Set());
  const [clearingLines, setClearingLines] = useState(null);
  const [justPlacedCells, setJustPlacedCells] = useState(() => new Set());
  const [unplaceableShakeId, setUnplaceableShakeId] = useState(null);
  const [screenShake, setScreenShake] = useState(null);
  const [settings, setSettings] = useState(() => loadStoredSettings());
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [notification, setNotification] = useState(null);

  // Screen Flow State: Welcome Screen -> Level Map -> Intro Animation -> Gameplay
  // Every time the application opens or reloads, show the Welcome Landing page first
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(true);
  const [showLevelMap, setShowLevelMap] = useState(false);
  const [hasStartedGame, setHasStartedGame] = useState(false);
  const [showLevelIntro, setShowLevelIntro] = useState(false);
  const [introLevelConfig, setIntroLevelConfig] = useState(null);
  const [isAuthChecking, setIsAuthChecking] = useState(() => Boolean(getToken()));

  // Dragging State (Unified for Mobile Touch and Desktop Mouse)
  const [touchDragShape, setTouchDragShape] = useState(null);
  const [touchCoord, setTouchCoord] = useState(null);
  const [desktopDragShape, setDesktopDragShape] = useState(null);
  const [desktopDragCoord, setDesktopDragCoord] = useState(null);

  // Authentication & Modals State
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showExitConfirmModal, setShowExitConfirmModal] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [scoreSaved, setScoreSaved] = useState(false);

  // Refs for state persistence and single-fire celebrations
  const userRef = useRef(null);
  const authPromiseRef = useRef(null);
  const previousPersonalBestRef = useRef(highScore);
  const hasSubmittedCurrentGameRef = useRef(false);
  const hasCelebratedHighScoreRef = useRef(false);
  const isHighScoreCelebrationActiveRef = useRef(false);
  const awardedLevelBonusesRef = useRef(new Set(completedLevels));
  const notificationTimeoutRef = useRef(null);
  const unplaceableTimeoutRef = useRef(null);
  const currentGameSessionIdRef = useRef('sess_default');
  const authOriginRef = useRef(null);

  // Track window mouse movements during desktop drag
  useEffect(() => {
    if (!desktopDragShape) return;

    const handleWindowDragOver = (e) => {
      e.preventDefault();
      setDesktopDragCoord({ x: e.clientX, y: e.clientY });
    };

    const handleWindowDragEnd = () => {
      setDesktopDragShape(null);
      setDesktopDragCoord(null);
    };

    window.addEventListener('dragover', handleWindowDragOver);
    window.addEventListener('dragend', handleWindowDragEnd);
    return () => {
      window.removeEventListener('dragover', handleWindowDragOver);
      window.removeEventListener('dragend', handleWindowDragEnd);
    };
  }, [desktopDragShape]);

  // Keep userRef synchronized with user state for synchronous access
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Restore authenticated session on mount if token exists
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    authPromiseRef.current = apiGetMe()
      .then((res) => {
        if (res.user) {
          const authUser = res.user;
          userRef.current = authUser;
          setUser(authUser);
          const userId = authUser._id || authUser.id;

          const serverUnlocked = Math.max(1, Math.min(100, Number(authUser.unlockedLevel) || 1));
          const serverCurrent = Math.max(1, Math.min(serverUnlocked, Number(authUser.currentLevel) || 1));
          const serverCompleted = new Set(Array.isArray(authUser.completedLevels) ? authUser.completedLevels : []);
          const serverHigh = Number(authUser.highScore) || 0;

          setUnlockedLevel(serverUnlocked);
          setCurrentLevel(serverCurrent);
          setCompletedLevels(serverCompleted);
          setHighScore(serverHigh);
          previousPersonalBestRef.current = serverHigh;
          awardedLevelBonusesRef.current = new Set(serverCompleted);

          // Save to user-scoped storage so fast reload can use cached progress
          try {
            localStorage.setItem(getStorageKey(UNLOCKED_LEVEL_KEY, userId), serverUnlocked.toString());
            localStorage.setItem(getStorageKey(CURRENT_LEVEL_KEY, userId), serverCurrent.toString());
            localStorage.setItem(getStorageKey(COMPLETED_LEVELS_KEY, userId), JSON.stringify(Array.from(serverCompleted)));
            localStorage.setItem(getStorageKey(HIGH_SCORE_KEY, userId), serverHigh.toString());
          } catch {
            // Ignore
          }

          // Restore user-scoped settings
          const userSettings = loadStoredSettings(userId);
          setSettings(userSettings);
        }
      })
      .catch((err) => {
        console.warn('Session expired or unreachable:', err.message);
        clearToken();
        userRef.current = null;
        setUser(null);
      })
      .finally(() => {
        setIsAuthChecking(false);
      });
  }, []);

  // Submit game score to backend when game over occurs (strictly once per game over)
  useEffect(() => {
    if (gameOver && user && !hasSubmittedCurrentGameRef.current) {
      hasSubmittedCurrentGameRef.current = true;

      apiSaveGame(score, linesClearedTotal, maxStreak, currentGameSessionIdRef.current)
        .then((res) => {
          setScoreSaved(true);
          if (res.stats?.highScore) {
            setHighScore(res.stats.highScore);
            try {
              localStorage.setItem(
                getStorageKey(HIGH_SCORE_KEY, user._id || user.id),
                res.stats.highScore.toString()
              );
            } catch {
              // Ignore
            }
          }
          if (res.stats?.isNewHighScore) {
            setIsNewHigh(true);
          }
        })
        .catch((err) => {
          console.error('Failed to submit game score to backend:', err.message);
        });
    }
  }, [gameOver, user, score, linesClearedTotal, maxStreak]);

  // Sync settings with audio managers and haptics on mount and changes
  useEffect(() => {
    sounds.setMasterSound(settings.masterSound);
    sounds.setSoundEffectsEnabled(settings.soundEffects);
    sounds.setVolume(settings.volume);

    voiceAnnouncer.setMasterSound(settings.masterSound);
    voiceAnnouncer.setEnabled(settings.voiceAnnouncements);
    voiceAnnouncer.setVolume(settings.volume);

    setHapticsEnabled(settings.haptics);
  }, [settings]);

  // Central settings update handler
  const handleUpdateSettings = useCallback((partial) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      saveStoredSettings(next, user?._id || user?.id);

      sounds.setMasterSound(next.masterSound);
      sounds.setSoundEffectsEnabled(next.soundEffects);
      sounds.setVolume(next.volume);

      voiceAnnouncer.setMasterSound(next.masterSound);
      voiceAnnouncer.setEnabled(next.voiceAnnouncements);
      voiceAnnouncer.setVolume(next.volume);

      setHapticsEnabled(next.haptics);

      return next;
    });
  }, [user]);

  // Quick sound mute toggle handler for header button / keyboard (toggles SFX independently)
  const handleToggleMute = useCallback(() => {
    handleUpdateSettings({ soundEffects: !settings.soundEffects });
  }, [settings.soundEffects, handleUpdateSettings]);

  // Quick voice toggle handler for header button / keyboard (toggles Voice independently)
  const handleToggleVoice = useCallback(() => {
    handleUpdateSettings({ voiceAnnouncements: !settings.voiceAnnouncements });
  }, [settings.voiceAnnouncements, handleUpdateSettings]);

  // Trigger celebration badge and spoken announcement
  const triggerCelebration = useCallback((celeb) => {
    if (!celeb) return;
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    setNotification({
      id: Date.now(),
      title: celeb.title,
      points: celeb.points,
      sub: celeb.sub,
      tier: celeb.tier || 'subtle_points',
      position: celeb.position || null
    });

    if (celeb.screenShake && !settings.reduceAnimations) {
      setScreenShake(celeb.screenShake);
      setTimeout(() => setScreenShake(null), 380);
    }

    if (celeb.spoken) {
      voiceAnnouncer.speak(celeb.spoken);
    }

    if (celeb.triggerConfetti && !settings.reduceAnimations) {
      try {
        confetti({
          particleCount: 65,
          spread: 65,
          origin: { y: 0.65 }
        });
      } catch {
        // Ignore
      }
    }

    const duration = celeb.tier === 'subtle_points' ? 1100 : 1600;
    notificationTimeoutRef.current = setTimeout(() => {
      setNotification(null);
    }, duration);
  }, [settings.reduceAnimations]);


  // Update high score in local storage when score increases
  const updateScoreAndHigh = useCallback((addedPoints) => {
    setScore((prevScore) => {
      const nextScore = prevScore + addedPoints;
      setHighScore((prevHigh) => {
        if (nextScore > prevHigh) {
          try {
            localStorage.setItem(getStorageKey(HIGH_SCORE_KEY, user?._id || user?.id), nextScore.toString());
          } catch {
            // LocalStorage might be disabled
          }
          setIsNewHigh(true);
          return nextScore;
        }
        return prevHigh;
      });
      return nextScore;
    });
  }, [user]);

  // Handle unplaceable piece selection attempt with subtle rejection feedback
  const handleUnplaceableAttempt = useCallback(
    (shape) => {
      sounds.playInvalid();
      triggerHaptic('invalid');
      setUnplaceableShakeId(shape.instanceId);
      if (unplaceableTimeoutRef.current) {
        clearTimeout(unplaceableTimeoutRef.current);
      }
      unplaceableTimeoutRef.current = setTimeout(() => {
        setUnplaceableShakeId(null);
      }, 450);

      triggerCelebration(getNoValidMoveCelebration('No space on board for this piece'));
    },
    [triggerCelebration]
  );

  // Central interaction blocker (pauses gameplay during welcome screen, map, intro, modals)
  const isInputBlocked =
    gameOver ||
    showLevelCompleteModal ||
    Boolean(completedLevelData) ||
    showWelcomeScreen ||
    showLevelMap ||
    showLevelIntro ||
    showExitConfirmModal ||
    showOnboardingModal ||
    showSettingsModal;

  // Handle selecting a shape from the bottom tray
  const handleSelectShape = useCallback(
    (shape) => {
      if (isInputBlocked || shape.placed) return;

      if (!canShapeFitAnywhere(grid, shape)) {
        handleUnplaceableAttempt(shape);
        return;
      }

      if (selectedShape?.instanceId === shape.instanceId) {
        setSelectedShape(null);
        sounds.playSelect();
      } else {
        setSelectedShape(shape);
        sounds.playPickup();
      }
    },
    [isInputBlocked, grid, selectedShape, handleUnplaceableAttempt]
  );

  // Handle cell hover for ghost preview
  const handleCellHover = useCallback(
    (row, col) => {
      if (!selectedShape) {
        setHoverPos(null);
        return;
      }
      setHoverPos({ row, col });
    },
    [selectedShape]
  );

  const handleGridLeave = useCallback(() => {
    // Keep hover pos if currently touch dragging
    if (!touchDragShape) {
      setHoverPos(null);
    }
  }, [touchDragShape]);

  // Central placement logic
  const executePlacement = useCallback(
    (shapeToPlace, targetRow, targetCol) => {
      if (isInputBlocked || !shapeToPlace || shapeToPlace.placed) return false;

      if (!canPlaceShape(grid, shapeToPlace, targetRow, targetCol)) {
        sounds.playInvalid();
        triggerHaptic('invalid');
        return false;
      }

      sounds.playPlace();
      triggerHaptic('place');

      const tilePoints = getBlockTileCount(shapeToPlace);
      const { newGrid } = placeShapeOnGrid(grid, shapeToPlace, targetRow, targetCol);

      // Track newly placed cells for natural settle-snap and ripple animation
      const placedCoords = getShapeCoordinates(shapeToPlace, targetRow, targetCol);
      const placedKeys = new Set(placedCoords.map((pt) => `${pt.row},${pt.col}`));
      setJustPlacedCells(placedKeys);
      setTimeout(() => setJustPlacedCells(new Set()), 320);

      let updatedShapes = shapes.map((s) =>
        s.instanceId === shapeToPlace.instanceId ? { ...s, placed: true } : s
      );

      const allUsed = updatedShapes.every((s) => s.placed);
      if (allUsed) {
        updatedShapes = getRandomShapes(3);
      }

      const { fullRows, fullCols, totalLines } = detectFullLines(newGrid);

      if (totalLines > 0) {
        const clearingKeys = new Set();
        fullRows.forEach((r) => {
          for (let c = 0; c < 8; c++) clearingKeys.add(`${r},${c}`);
        });
        fullCols.forEach((c) => {
          for (let r = 0; r < 8; r++) clearingKeys.add(`${r},${c}`);
        });

        setClearingCells(clearingKeys);
        setClearingLines({ rows: fullRows, cols: fullCols, totalLines });

        // Haptic feedback for single or multi-line clears
        triggerHaptic(totalLines >= 2 ? 'multi_clear' : 'clear');

        // Screen shake for impressive multi-line clears (suppressed when reduceAnimations is active)
        if (!settings.reduceAnimations) {
          if (totalLines >= 3) {
            setScreenShake('intense');
            setTimeout(() => setScreenShake(null), 380);
          } else if (totalLines === 2) {
            setScreenShake('subtle');
            setTimeout(() => setScreenShake(null), 380);
          }
        }

        const nextStreak = streak + 1;
        setStreak(nextStreak);
        setMaxStreak((prev) => Math.max(prev, nextStreak));
        setLinesClearedTotal((prev) => prev + totalLines);

        const lineScore = calculateScore(totalLines, nextStreak);
        const totalPointsGained = tilePoints + lineScore;

        const currentScore = score;
        const currentPersonalBest = previousPersonalBestRef.current;
        const projectedScore = currentScore + totalPointsGained;

        // Calculate pattern obstacle cells cleared in full rows & columns
        let clearedPatternCells = 0;
        for (const r of fullRows) {
          for (let c = 0; c < 8; c++) {
            if (newGrid[r][c]?.isPattern) clearedPatternCells++;
          }
        }
        for (const c of fullCols) {
          for (let r = 0; r < 8; r++) {
            if (newGrid[r][c]?.isPattern && !fullRows.includes(r)) {
              clearedPatternCells++;
            }
          }
        }

        // Multi-objective Level Progression Check
        let nextLevelProgress = levelProgress;
        if (levelConfig.type === 'lines') {
          nextLevelProgress = levelProgress + totalLines;
        } else if (levelConfig.type === 'score') {
          nextLevelProgress = levelProgress + totalPointsGained;
        } else if (levelConfig.type === 'streak') {
          nextLevelProgress = Math.max(levelProgress, nextStreak);
        } else if (levelConfig.type === 'multilines') {
          nextLevelProgress = levelProgress + (totalLines >= 2 ? 1 : 0);
        } else if (levelConfig.type === 'clear_pattern') {
          nextLevelProgress = levelProgress + clearedPatternCells;
        } else if (levelConfig.type === 'placed') {
          nextLevelProgress = levelProgress + 1;
        }
        const isLevelComplete = nextLevelProgress >= levelConfig.target;

        // Check if genuine new personal record achieved before updating stored value
        const isGenuineNewRecord =
          !hasCelebratedHighScoreRef.current &&
          ((currentPersonalBest > 0 && currentScore <= currentPersonalBest && projectedScore > currentPersonalBest) ||
           (currentPersonalBest === 0 && currentScore < 100 && projectedScore >= 100));

        let bonusToAward = 0;
        if (isLevelComplete) {
          const hasBonusBeenAwarded = awardedLevelBonusesRef.current.has(currentLevel);
          bonusToAward = hasBonusBeenAwarded ? 0 : levelConfig.bonusPoints;
          if (!hasBonusBeenAwarded) {
            awardedLevelBonusesRef.current.add(currentLevel);
          }

          const nextLevelNum = Math.min(100, currentLevel + 1);

          // Always update levelProgress to reflect completed objective
          setLevelProgress(nextLevelProgress);

          // Record completed level and persist to user-scoped storage
          setCompletedLevels((prev) => {
            const next = new Set(prev).add(currentLevel);
            try {
              localStorage.setItem(
                getStorageKey(COMPLETED_LEVELS_KEY, user?._id || user?.id),
                JSON.stringify(Array.from(next))
              );
            } catch {
              // Ignore
            }
            return next;
          });

          setUnlockedLevel((prev) => {
            const nextMax = Math.min(100, Math.max(prev, nextLevelNum));
            try {
              localStorage.setItem(
                getStorageKey(UNLOCKED_LEVEL_KEY, user?._id || user?.id),
                nextMax.toString()
              );
            } catch {
              // Ignore
            }
            return nextMax;
          });

          // Persist currentLevel update so reload immediately shows next level
          try {
            localStorage.setItem(
              getStorageKey(CURRENT_LEVEL_KEY, user?._id || user?.id),
              nextLevelNum.toString()
            );
          } catch {
            // Ignore
          }

          // Sync progression to server if authenticated
          if (user) {
            apiUpdateProgression({
              completedLevel: currentLevel,
              currentLevel: nextLevelNum
            })
              .then((res) => {
                if (res?.progression) {
                  setUser((prev) =>
                    prev
                      ? {
                          ...prev,
                          unlockedLevel: res.progression.unlockedLevel,
                          currentLevel: res.progression.currentLevel,
                          completedLevels: res.progression.completedLevels
                        }
                      : null
                  );
                }
              })
              .catch((err) => {
                console.warn('Failed to sync progression to server:', err.message);
              });

            if (!hasSubmittedCurrentGameRef.current) {
              hasSubmittedCurrentGameRef.current = true;
              apiSaveGame(
                projectedScore + bonusToAward,
                linesClearedTotal,
                maxStreak,
                currentGameSessionIdRef.current
              )
                .then((res) => {
                  setScoreSaved(true);
                  if (res?.stats?.highScore) {
                    setHighScore(res.stats.highScore);
                    try {
                      localStorage.setItem(
                        getStorageKey(HIGH_SCORE_KEY, user._id || user.id),
                        res.stats.highScore.toString()
                      );
                    } catch {
                      // Ignore
                    }
                  }
                })
                .catch((err) => {
                  console.warn('Failed to save completed level score to backend:', err.message);
                });
            }
          }

          updateScoreAndHigh(totalPointsGained + bonusToAward);
          sounds.playLevelComplete();
          if (currentLevel >= 100) {
            voiceAnnouncer.announceCampaignComplete();
          } else {
            voiceAnnouncer.announceLevelComplete();
          }
          triggerHaptic('level_complete');
          triggerCelebration(getLevelCompleteCelebration(levelConfig, bonusToAward));
        } else {
          setLevelProgress(nextLevelProgress);
          updateScoreAndHigh(totalPointsGained);

          if (isGenuineNewRecord) {
            hasCelebratedHighScoreRef.current = true;
            isHighScoreCelebrationActiveRef.current = true;
            sounds.playHighScore();
            setTimeout(() => {
              isHighScoreCelebrationActiveRef.current = false;
            }, 1800);
          } else {
            sounds.playClear(totalLines, nextStreak);
          }

          // Anchor floating score near the cleared row/col for single clears
          let position = null;
          if (fullRows.length === 1 && fullCols.length === 0) {
            const rowPercent = 28 + (fullRows[0] * 5.2);
            position = { top: `${rowPercent}%` };
          } else if (fullCols.length === 1 && fullRows.length === 0) {
            const colPercent = 30 + (fullCols[0] * 5.2);
            position = { left: `${colPercent}%` };
          }

          let celeb;
          if (isGenuineNewRecord) {
            celeb = getHighScoreCelebration(projectedScore);
            if (totalLines > 0) {
              celeb.sub = `${totalLines} ${totalLines === 1 ? 'LINE' : 'LINES'} • NEW RECORD! 🏆`;
            }
          } else {
            const isRecordScore = projectedScore > highScore && highScore > 0;
            celeb = getClearCelebration(totalLines, nextStreak, totalPointsGained, isRecordScore);
          }

          if (position && celeb) {
            celeb.position = position;
          }

          triggerCelebration(celeb);
        }

        // Animation timing: reduced (130ms) for snappy response or standard (380ms) for full particle sweep
        const clearAnimDuration = settings.reduceAnimations ? 130 : 380;
        setTimeout(() => {
          const clearedGrid = clearLinesFromGrid(newGrid, fullRows, fullCols);
          setGrid(clearedGrid);
          setClearingCells(new Set());
          setClearingLines(null);
          setShapes(updatedShapes);
          setSelectedShape(null);
          setHoverPos(null);

          if (isLevelComplete) {
            const isFinalLevel = currentLevel >= 100;
            const nextLevelNum = Math.min(100, currentLevel + 1);
            setCompletedLevelData({
              levelConfig,
              nextLevelConfig: isFinalLevel ? null : getLevelConfig(nextLevelNum),
              bonusPoints: bonusToAward,
              totalScore: projectedScore + bonusToAward,
              isCampaignComplete: isFinalLevel
            });
            setShowLevelCompleteModal(true);
          } else if (isGameOver(clearedGrid, updatedShapes)) {
            setGameOver(true);
            sounds.playGameOver();
            voiceAnnouncer.announceGameOver();
            triggerHaptic('game_over');
            // Never let Game Over overwrite an active High Score celebration
            if (!isHighScoreCelebrationActiveRef.current) {
              triggerCelebration(getGameOverCelebration(projectedScore));
            }
          }
        }, clearAnimDuration);
      } else {
        setStreak(0);
        const currentScore = score;
        const currentPersonalBest = previousPersonalBestRef.current;
        const projectedScore = currentScore + tilePoints;

        // Check if objective completed on placement without line clear (score or placed pieces)
        let progressGain = 0;
        if (levelConfig.type === 'score') {
          progressGain = tilePoints;
        } else if (levelConfig.type === 'placed') {
          progressGain = 1;
        }
        const nextLevelProgress = levelProgress + progressGain;
        const isLevelComplete =
          (levelConfig.type === 'score' || levelConfig.type === 'placed') &&
          nextLevelProgress >= levelConfig.target;

        // Check if genuine new personal record achieved
        const isGenuineNewRecord =
          !hasCelebratedHighScoreRef.current &&
          ((currentPersonalBest > 0 && currentScore <= currentPersonalBest && projectedScore > currentPersonalBest) ||
           (currentPersonalBest === 0 && currentScore < 100 && projectedScore >= 100));

        let bonusToAward = 0;
        if (isLevelComplete) {
          const hasBonusBeenAwarded = awardedLevelBonusesRef.current.has(currentLevel);
          bonusToAward = hasBonusBeenAwarded ? 0 : levelConfig.bonusPoints;
          if (!hasBonusBeenAwarded) {
            awardedLevelBonusesRef.current.add(currentLevel);
          }

          const nextLevelNum = Math.min(100, currentLevel + 1);

          // Always update levelProgress to reflect completed objective
          setLevelProgress(nextLevelProgress);

          // Record completed level and persist to user-scoped storage
          setCompletedLevels((prev) => {
            const next = new Set(prev).add(currentLevel);
            try {
              localStorage.setItem(
                getStorageKey(COMPLETED_LEVELS_KEY, user?._id || user?.id),
                JSON.stringify(Array.from(next))
              );
            } catch {
              // Ignore
            }
            return next;
          });

          setUnlockedLevel((prev) => {
            const nextMax = Math.min(100, Math.max(prev, nextLevelNum));
            try {
              localStorage.setItem(
                getStorageKey(UNLOCKED_LEVEL_KEY, user?._id || user?.id),
                nextMax.toString()
              );
            } catch {
              // Ignore
            }
            return nextMax;
          });

          // Persist currentLevel update so reload immediately shows next level
          try {
            localStorage.setItem(
              getStorageKey(CURRENT_LEVEL_KEY, user?._id || user?.id),
              nextLevelNum.toString()
            );
          } catch {
            // Ignore
          }

          // Sync progression to server if authenticated
          if (user) {
            apiUpdateProgression({
              completedLevel: currentLevel,
              currentLevel: nextLevelNum
            })
              .then((res) => {
                if (res?.progression) {
                  setUser((prev) =>
                    prev
                      ? {
                          ...prev,
                          unlockedLevel: res.progression.unlockedLevel,
                          currentLevel: res.progression.currentLevel,
                          completedLevels: res.progression.completedLevels
                        }
                      : null
                  );
                }
              })
              .catch((err) => {
                console.warn('Failed to sync progression to server:', err.message);
              });

            if (!hasSubmittedCurrentGameRef.current) {
              hasSubmittedCurrentGameRef.current = true;
              apiSaveGame(
                projectedScore + bonusToAward,
                linesClearedTotal,
                maxStreak,
                currentGameSessionIdRef.current
              )
                .then((res) => {
                  setScoreSaved(true);
                  if (res?.stats?.highScore) {
                    setHighScore(res.stats.highScore);
                    try {
                      localStorage.setItem(
                        getStorageKey(HIGH_SCORE_KEY, user._id || user.id),
                        res.stats.highScore.toString()
                      );
                    } catch {
                      // Ignore
                    }
                  }
                })
                .catch((err) => {
                  console.warn('Failed to save completed level score to backend:', err.message);
                });
            }
          }

          updateScoreAndHigh(tilePoints + bonusToAward);
          setGrid(newGrid);
          setShapes(updatedShapes);
          setSelectedShape(null);
          setHoverPos(null);
          sounds.playLevelComplete();
          if (currentLevel >= 100) {
            voiceAnnouncer.announceCampaignComplete();
          } else {
            voiceAnnouncer.announceLevelComplete();
          }
          triggerHaptic('level_complete');
          triggerCelebration(getLevelCompleteCelebration(levelConfig, bonusToAward));
          setTimeout(() => {
            const isFinalLevel = currentLevel >= 100;
            const nextLevelNum = Math.min(100, currentLevel + 1);
            setCompletedLevelData({
              levelConfig,
              nextLevelConfig: isFinalLevel ? null : getLevelConfig(nextLevelNum),
              bonusPoints: bonusToAward,
              totalScore: projectedScore + bonusToAward,
              isCampaignComplete: isFinalLevel
            });
            setShowLevelCompleteModal(true);
          }, 240);
        } else {
          setLevelProgress(nextLevelProgress);
          updateScoreAndHigh(tilePoints);
          setGrid(newGrid);
          setShapes(updatedShapes);
          setSelectedShape(null);
          setHoverPos(null);

          if (isGenuineNewRecord) {
            hasCelebratedHighScoreRef.current = true;
            isHighScoreCelebrationActiveRef.current = true;
            sounds.playHighScore();
            setTimeout(() => {
              isHighScoreCelebrationActiveRef.current = false;
            }, 1800);
            triggerCelebration(getHighScoreCelebration(projectedScore));
          } else if (!isGameOver(newGrid, updatedShapes)) {
            voiceAnnouncer.announceGoodMove();
          }

          if (isGameOver(newGrid, updatedShapes)) {
            setGameOver(true);
            sounds.playGameOver();
            voiceAnnouncer.announceGameOver();
            triggerHaptic('game_over');
            if (!isHighScoreCelebrationActiveRef.current) {
              triggerCelebration(getGameOverCelebration(projectedScore));
            }
          }
        }
      }
      return true;
    },
    [isInputBlocked, grid, shapes, streak, score, highScore, triggerCelebration, updateScoreAndHigh, currentLevel, levelConfig, levelProgress, settings.reduceAnimations, user]
  );

  const handleCellClick = useCallback(
    (row, col) => {
      if (isInputBlocked || !selectedShape) return;
      executePlacement(selectedShape, row, col);
    },
    [isInputBlocked, selectedShape, executePlacement]
  );

  const handleDropShape = useCallback(
    (droppedShape, row, col) => {
      if (isInputBlocked) return;
      const liveShape = shapes.find((s) => s.instanceId === droppedShape.instanceId);
      if (liveShape) {
        executePlacement(liveShape, row, col);
      }
      setDesktopDragShape(null);
      setDesktopDragCoord(null);
    },
    [isInputBlocked, shapes, executePlacement]
  );

  // Desktop Mouse Drag Handlers
  const handleDesktopDragStart = useCallback(
    (shape, clientX, clientY) => {
      if (isInputBlocked) return;
      if (!canShapeFitAnywhere(grid, shape)) {
        handleUnplaceableAttempt(shape);
        return;
      }
      setSelectedShape(shape);
      setDesktopDragShape(shape);
      setDesktopDragCoord({ x: clientX, y: clientY });
      sounds.playPickup();
    },
    [isInputBlocked, grid, handleUnplaceableAttempt]
  );

  const handleDesktopDragEnd = useCallback(() => {
    setDesktopDragShape(null);
    setDesktopDragCoord(null);
  }, []);

  // Mobile Touch Drag Handlers
  const handleTouchDragStart = useCallback(
    (shape, clientX, clientY) => {
      if (isInputBlocked) return;
      if (!canShapeFitAnywhere(grid, shape)) {
        handleUnplaceableAttempt(shape);
        return;
      }
      setSelectedShape(shape);
      setTouchDragShape(shape);
      setTouchCoord({ x: clientX, y: clientY });
      sounds.playPickup();

      // Look for initial target cell beneath touch point
      const el =
        document.elementFromPoint(clientX, clientY - 35) ||
        document.elementFromPoint(clientX, clientY);
      const cell = el?.closest('.grid-cell');
      if (cell) {
        const row = parseInt(cell.getAttribute('data-row'), 10);
        const col = parseInt(cell.getAttribute('data-col'), 10);
        if (!isNaN(row) && !isNaN(col)) {
          setHoverPos({ row, col });
        }
      }
    },
    [isInputBlocked, grid, handleUnplaceableAttempt]
  );

  const handleTouchDragMove = useCallback((shape, clientX, clientY) => {
    if (isInputBlocked) return;
    setTouchCoord({ x: clientX, y: clientY });

    // Offset touch test point slightly upwards so the user's thumb does not hide the targeted cell
    const el =
      document.elementFromPoint(clientX, clientY - 35) ||
      document.elementFromPoint(clientX, clientY);
    const cell = el?.closest('.grid-cell');
    if (cell) {
      const row = parseInt(cell.getAttribute('data-row'), 10);
      const col = parseInt(cell.getAttribute('data-col'), 10);
      if (!isNaN(row) && !isNaN(col)) {
        setHoverPos({ row, col });
        return;
      }
    }
    setHoverPos(null);
  }, [isInputBlocked]);

  const handleTouchDragEnd = useCallback(
    (shape, clientX, clientY, isCancelled = false) => {
      if (isInputBlocked) {
        setTouchDragShape(null);
        setTouchCoord(null);
        setHoverPos(null);
        return;
      }

      if (!isCancelled && hoverPos) {
        executePlacement(shape, hoverPos.row, hoverPos.col);
      }

      setTouchDragShape(null);
      setTouchCoord(null);
      setHoverPos(null);
    },
    [isInputBlocked, hoverPos, executePlacement]
  );

  // Level Map & Intro Animation Flow Callbacks
  const handleStartLevelWithIntro = useCallback((levelNum) => {
    const safeLevel = Math.max(1, Math.min(levelNum, unlockedLevel));
    const config = getLevelConfig(safeLevel);
    setCurrentLevel(safeLevel);
    setLevelProgress(0);
    const initialGrid = config.pattern && config.pattern !== 'clean'
      ? createPatternGrid(config.pattern, config.patternColor)
      : createEmptyGrid();
    setGrid(initialGrid);
    setShapes(getRandomShapes(3));
    setSelectedShape(null);
    setHoverPos(null);
    setTouchDragShape(null);
    setTouchCoord(null);
    setDesktopDragShape(null);
    setDesktopDragCoord(null);
    setClearingLines(null);
    setScreenShake(null);
    setJustPlacedCells(new Set());
    setUnplaceableShakeId(null);
    setShowLevelCompleteModal(false);
    setCompletedLevelData(null);
    setGameOver(false);
    setIntroLevelConfig(config);
    setShowLevelIntro(true);
    currentGameSessionIdRef.current = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    try {
      localStorage.setItem(getStorageKey(CURRENT_LEVEL_KEY, user?._id || user?.id), safeLevel.toString());
    } catch {
      // Safe fallback
    }

    if (user) {
      apiUpdateProgression({ currentLevel: safeLevel }).catch(() => {});
    }
  }, [unlockedLevel, user]);

  const handleIntroComplete = useCallback(() => {
    setShowLevelIntro(false);
    setShowLevelMap(false);
    setHasStartedGame(true);
    sounds.playLevelStart();
    voiceAnnouncer.announceGameStart();
    triggerCelebration(getStartGameCelebration());
  }, [triggerCelebration]);

  // Test helper for automated verification of 3-step completion experience
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__triggerLevelCompleteForTest = (lvl = 1) => {
        const cfg = getLevelConfig(lvl);
        const nextCfg = lvl >= 100 ? null : getLevelConfig(lvl + 1);
        const nextLevelNum = Math.min(100, lvl + 1);
        setUnlockedLevel((prev) => Math.max(prev, nextLevelNum));
        setCompletedLevels((prev) => new Set(prev).add(lvl));
        setCurrentLevel(nextLevelNum);
        try {
          localStorage.setItem(getStorageKey(UNLOCKED_LEVEL_KEY, user?._id || user?.id), nextLevelNum.toString());
          localStorage.setItem(getStorageKey(CURRENT_LEVEL_KEY, user?._id || user?.id), nextLevelNum.toString());
        } catch {
          // Ignore
        }
        setCompletedLevelData({
          levelConfig: cfg,
          nextLevelConfig: nextCfg,
          bonusPoints: cfg.bonusPoints,
          totalScore: (score || 1200) + cfg.bonusPoints,
          isCampaignComplete: lvl >= 100
        });
        setShowLevelCompleteModal(true);
      };
    }
  }, [score, user]);

  const handleOpenLevelMap = useCallback(() => {
    voiceAnnouncer.cancel();
    setClearingCells(new Set());
    setClearingLines(null);
    setScreenShake(null);
    setNotification(null);
    setShowLevelCompleteModal(false);
    setShowLevelIntro(false);
    setGameOver(false);
    setShowLevelMap(true);
    sounds.playSelect();
  }, []);

  const handleBackToGame = useCallback(() => {
    setShowLevelMap(false);
    sounds.playSelect();
  }, []);

  // Completion flow: Player clicks CONTINUE TO LEVEL MAP -> Level Map opens with new level highlighted
  const handleContinueToLevelMap = useCallback((targetLevel) => {
    voiceAnnouncer.cancel();
    setClearingCells(new Set());
    setClearingLines(null);
    setScreenShake(null);
    setNotification(null);
    const nextLevelNum = targetLevel || Math.min(100, currentLevel >= 100 ? 100 : currentLevel + 1);
    setShowLevelCompleteModal(false);
    setCompletedLevelData(null);
    setCurrentLevel(nextLevelNum);
    setShowLevelMap(true);
    setHasStartedGame(false);
    try {
      localStorage.setItem(
        getStorageKey(CURRENT_LEVEL_KEY, user?._id || user?.id),
        nextLevelNum.toString()
      );
    } catch {
      // Ignore
    }
    if (user) {
      apiUpdateProgression({ currentLevel: nextLevelNum }).catch(() => {});
    }
    sounds.playSelect();
  }, [currentLevel, user]);

  const handleRestart = useCallback((targetLevel = currentLevel) => {
    voiceAnnouncer.cancel();
    setClearingCells(new Set());
    setClearingLines(null);
    setScreenShake(null);
    setNotification(null);
    const safeLevel = Math.max(1, Math.min(targetLevel, unlockedLevel));
    const config = getLevelConfig(safeLevel);
    const initialGrid = config.pattern && config.pattern !== 'clean'
      ? createPatternGrid(config.pattern, config.patternColor)
      : createEmptyGrid();

    setGrid(initialGrid);
    setShapes(getRandomShapes(3));
    setSelectedShape(null);
    setHoverPos(null);
    setTouchDragShape(null);
    setTouchCoord(null);
    setDesktopDragShape(null);
    setDesktopDragCoord(null);
    setClearingLines(null);
    setScreenShake(null);
    setJustPlacedCells(new Set());
    setUnplaceableShakeId(null);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setLinesClearedTotal(0);
    setCurrentLevel(safeLevel);
    setLevelProgress(0);
    try {
      localStorage.setItem(getStorageKey(CURRENT_LEVEL_KEY, user?._id || user?.id), safeLevel.toString());
    } catch {
      // Ignore
    }
    setShowLevelCompleteModal(false);
    setCompletedLevelData(null);
    setGameOver(false);
    setIsNewHigh(false);
    setScoreSaved(false);
    setShowExitConfirmModal(false);
    hasSubmittedCurrentGameRef.current = false;
    hasCelebratedHighScoreRef.current = false;
    isHighScoreCelebrationActiveRef.current = false;
    previousPersonalBestRef.current = highScore;
    setClearingCells(new Set());
    sounds.playSelect();
    // Launch selected level with full-screen intro animation
    setIntroLevelConfig(config);
    setShowLevelIntro(true);
    currentGameSessionIdRef.current = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }, [currentLevel, unlockedLevel, highScore, user]);

  // Exit Level Confirmation Handlers
  const handleOpenExitModal = useCallback(() => {
    setShowExitConfirmModal(true);
    sounds.playSelect();
  }, []);

  const handleCancelExit = useCallback(() => {
    setShowExitConfirmModal(false);
    sounds.playSelect();
  }, []);

  const handleConfirmExit = useCallback(() => {
    voiceAnnouncer.cancel();
    setClearingCells(new Set());
    setClearingLines(null);
    setScreenShake(null);
    setNotification(null);
    setShowExitConfirmModal(false);
    setSelectedShape(null);
    setHoverPos(null);
    setTouchDragShape(null);
    setTouchCoord(null);
    setDesktopDragShape(null);
    setDesktopDragCoord(null);
    // Exiting returns safely to Level Map without marking level completed or saving duplicate score
    setShowLevelMap(true);
    sounds.playSelect();
  }, []);

  // Auth Handlers with Account Isolation & Systematic Onboarding Flow
  const handleAuthSuccess = useCallback((authenticatedUser, isNewRegistration = false) => {
    userRef.current = authenticatedUser;
    setUser(authenticatedUser);
    const userId = authenticatedUser._id || authenticatedUser.id;

    // Load user-specific progression directly from authenticated record
    const userUnlocked = Math.max(1, Math.min(100, Number(authenticatedUser.unlockedLevel) || 1));
    const userCurrent = Math.max(1, Math.min(userUnlocked, Number(authenticatedUser.currentLevel) || 1));
    const userCompleted = new Set(Array.isArray(authenticatedUser.completedLevels) ? authenticatedUser.completedLevels : []);
    const userHigh = Number(authenticatedUser.highScore) || 0;

    setUnlockedLevel(userUnlocked);
    setCurrentLevel(userCurrent);
    setCompletedLevels(userCompleted);
    setHighScore(userHigh);
    previousPersonalBestRef.current = userHigh;
    awardedLevelBonusesRef.current = new Set(userCompleted);

    // Save to isolated user-scoped localStorage
    try {
      localStorage.setItem(getStorageKey(UNLOCKED_LEVEL_KEY, userId), userUnlocked.toString());
      localStorage.setItem(getStorageKey(CURRENT_LEVEL_KEY, userId), userCurrent.toString());
      localStorage.setItem(getStorageKey(COMPLETED_LEVELS_KEY, userId), JSON.stringify(Array.from(userCompleted)));
      localStorage.setItem(getStorageKey(HIGH_SCORE_KEY, userId), userHigh.toString());
    } catch {
      // Ignore
    }

    // Restore user-scoped settings
    const userSettings = loadStoredSettings(userId);
    setSettings(userSettings);

    // Reset current attempt states so previous account / guest data is never retained
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setLinesClearedTotal(0);
    setLevelProgress(0);
    setGameOver(false);
    setShowLevelCompleteModal(false);
    setCompletedLevelData(null);
    setSelectedShape(null);
    setHoverPos(null);
    setTouchDragShape(null);
    setTouchCoord(null);
    setDesktopDragShape(null);
    setDesktopDragCoord(null);
    setClearingLines(null);
    setScreenShake(null);
    setJustPlacedCells(new Set());
    setClearingCells(new Set());
    hasSubmittedCurrentGameRef.current = false;
    hasCelebratedHighScoreRef.current = false;
    isHighScoreCelebrationActiveRef.current = false;

    // Navigate to Level Map, or remain on Welcome Screen if switching accounts
    if (authOriginRef.current === 'switch_account' || authOriginRef.current === 'welcome_signin') {
      setShowWelcomeScreen(true);
      setShowLevelMap(false);
      setShowAuthModal(false);
      setHasStartedGame(false);
    } else {
      setShowWelcomeScreen(false);
      setShowLevelMap(true);
      setShowAuthModal(false);
      setHasStartedGame(false);
    }

    // Systematic Onboarding Flow:
    if (isNewRegistration && authOriginRef.current !== 'switch_account' && authOriginRef.current !== 'welcome_signin') {
      setShowOnboardingModal(true);
    } else {
      setShowOnboardingModal(false);
    }
  }, []);

  // Handle Play Now from Welcome Landing Screen
  const handlePlayNow = useCallback(async () => {
    sounds.playSelect();
    authOriginRef.current = 'play_now';

    // If an auth check is currently in flight, wait for it
    if (authPromiseRef.current && isAuthChecking) {
      try {
        await authPromiseRef.current;
      } catch {
        // Ignore
      }
    }

    const currentUser = userRef.current || user;
    if (currentUser) {
      // Valid authenticated session exists -> navigate directly to Level Map
      setShowWelcomeScreen(false);
      setShowLevelMap(true);
    } else {
      // No authenticated session -> display Sign Up / Login modal
      setShowAuthModal(true);
    }
  }, [user, isAuthChecking]);

  // Handle Continue as Guest from Auth Modal
  const handleGuestContinueFromAuth = useCallback(() => {
    setShowAuthModal(false);
    setShowWelcomeScreen(false);
    setShowLevelMap(true);
    sounds.playSelect();
  }, []);

  const handleLogout = useCallback(() => {
    clearToken();
    userRef.current = null;
    setUser(null);
    setShowProfileModal(false);
    setShowOnboardingModal(false);

    // Completely clear user-specific state and restore Guest state
    const guestUnlocked = Number(localStorage.getItem(getStorageKey(UNLOCKED_LEVEL_KEY, null))) || 1;
    let guestCompleted = new Set();
    try {
      const saved = localStorage.getItem(getStorageKey(COMPLETED_LEVELS_KEY, null));
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) guestCompleted = new Set(parsed);
      }
    } catch {
      // Ignore
    }
    const guestCurrent = Math.max(1, Math.min(Number(localStorage.getItem(getStorageKey(CURRENT_LEVEL_KEY, null))) || 1, guestUnlocked));
    const guestHigh = Number(localStorage.getItem(getStorageKey(HIGH_SCORE_KEY, null))) || 0;

    setUnlockedLevel(guestUnlocked);
    setCompletedLevels(guestCompleted);
    setCurrentLevel(guestCurrent);
    setHighScore(guestHigh);
    previousPersonalBestRef.current = guestHigh;
    awardedLevelBonusesRef.current = new Set(guestCompleted);

    // Restore guest settings
    const guestSettings = loadStoredSettings(null);
    setSettings(guestSettings);

    // Wipe gameplay attempt
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setLinesClearedTotal(0);
    setLevelProgress(0);
    setGameOver(false);
    setShowLevelCompleteModal(false);
    setCompletedLevelData(null);
    setSelectedShape(null);
    setHoverPos(null);
    setTouchDragShape(null);
    setTouchCoord(null);
    setDesktopDragShape(null);
    setDesktopDragCoord(null);
    setClearingLines(null);
    setScreenShake(null);
    setJustPlacedCells(new Set());
    setClearingCells(new Set());

    // Return to Welcome Landing Screen
    setShowWelcomeScreen(true);
    setShowLevelMap(false);
    setHasStartedGame(false);
    sounds.playSelect();
  }, []);

  // Handle Switch Account from Welcome Screen
  const handleSwitchAccount = useCallback(() => {
    authOriginRef.current = 'switch_account';
    handleLogout();
    setShowAuthModal(true);
    sounds.playSelect();
  }, [handleLogout]);

  // Systematic Onboarding Flow Callbacks
  const handleProceedFromOnboarding = useCallback(() => {
    setShowOnboardingModal(false);
    setShowLevelMap(true);
    sounds.playSelect();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // If Welcome Landing Screen is visible, Enter triggers Play Now
      if (showWelcomeScreen) {
        if (e.key === 'Enter') {
          handlePlayNow();
        }
        return;
      }

      // If Onboarding modal is open, Enter or Escape proceeds to map
      if (showOnboardingModal) {
        if (e.key === 'Escape' || e.key === 'Enter') {
          handleProceedFromOnboarding();
        }
        return;
      }

      // If Exit modal is open, Escape closes it (resumes play)
      if (showExitConfirmModal) {
        if (e.key === 'Escape') {
          handleCancelExit();
        }
        return;
      }

      if (isInputBlocked) return;
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === '1' && shapes[0] && !shapes[0].placed) {
        handleSelectShape(shapes[0]);
      } else if (e.key === '2' && shapes[1] && !shapes[1].placed) {
        handleSelectShape(shapes[1]);
      } else if (e.key === '3' && shapes[2] && !shapes[2].placed) {
        handleSelectShape(shapes[2]);
      } else if (e.key === 'Escape') {
        if (selectedShape) {
          setSelectedShape(null);
        } else {
          handleOpenExitModal();
        }
      } else if (e.key === 'r' || e.key === 'R') {
        handleRestart();
      } else if (e.key === 'm' || e.key === 'M') {
        handleToggleMute();
      } else if (e.key === 'v' || e.key === 'V') {
        handleToggleVoice();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    showWelcomeScreen,
    handlePlayNow,
    showOnboardingModal,
    showExitConfirmModal,
    handleProceedFromOnboarding,
    handleCancelExit,
    handleOpenExitModal,
    isInputBlocked,
    shapes,
    selectedShape,
    handleSelectShape,
    handleRestart,
    handleToggleMute,
    handleToggleVoice
  ]);

  const activeDragShape = touchDragShape || desktopDragShape;
  const activeDragCoord = touchCoord
    ? { x: touchCoord.x, y: touchCoord.y - 45 }
    : desktopDragCoord;

  return (
    <div className={`game-wrapper ${settings.reduceAnimations ? 'reduce-animations' : ''}`}>
      <div className="game-container">
        <Header
          score={score}
          highScore={highScore}
          streak={streak}
          currentLevel={currentLevel}
          levelConfig={levelConfig}
          levelProgress={levelProgress}
          isMuted={!settings.masterSound || !settings.soundEffects}
          onToggleMute={handleToggleMute}
          isVoiceEnabled={settings.masterSound && settings.voiceAnnouncements}
          onToggleVoice={handleToggleVoice}
          onRestart={handleRestart}
          onOpenExitModal={handleOpenExitModal}
          onOpenHelp={() => setShowHelp(true)}
          user={user}
          onOpenAuth={() => setShowAuthModal(true)}
          onOpenLeaderboard={() => setShowLeaderboardModal(true)}
          onOpenProfile={() => setShowProfileModal(true)}
          onOpenLevelMap={handleOpenLevelMap}
          onOpenSettings={() => setShowSettingsModal(true)}
        />

        <main className="game-playfield">
          <ScoreNotification notification={notification} />

          <GameGrid
            grid={grid}
            selectedShape={selectedShape}
            hoverPos={hoverPos}
            clearingCells={clearingCells}
            clearingLines={clearingLines}
            screenShake={screenShake}
            justPlacedCells={justPlacedCells}
            onCellClick={handleCellClick}
            onCellHover={handleCellHover}
            onGridLeave={handleGridLeave}
            onDropShape={handleDropShape}
          />

          <BlockTray
            shapes={shapes}
            grid={grid}
            selectedShape={selectedShape}
            unplaceableShakeId={unplaceableShakeId}
            showHints={settings.gameplayHints}
            onSelectShape={handleSelectShape}
            onUnplaceableAttempt={handleUnplaceableAttempt}
            onDragStart={handleDesktopDragStart}
            onDragEnd={handleDesktopDragEnd}
            onTouchDragStart={handleTouchDragStart}
            onTouchDragMove={handleTouchDragMove}
            onTouchDragEnd={handleTouchDragEnd}
          />
        </main>
      </div>

      {/* Floating Active Drag Avatar with soft neon glow, particle sparks, and animated trail */}
      {activeDragShape && activeDragCoord && (
        <div
          className="active-drag-avatar"
          style={{
            left: `${activeDragCoord.x}px`,
            top: `${activeDragCoord.y}px`
          }}
        >
          {/* Soft neon glow aura */}
          <div
            className="drag-neon-aura"
            style={{
              boxShadow: `0 0 24px ${BLOCK_PALETTE[activeDragShape.colorKey]?.glow || '#06b6d4'}, 0 0 45px ${BLOCK_PALETTE[activeDragShape.colorKey]?.glow || '#06b6d4'}`
            }}
          />

          {/* Animated trail echo */}
          <div className="drag-trail-echo" />

          {/* Small colorful glowing particle sparks attached to moving block */}
          <div className="drag-spark-cluster">
            <span className="drag-spark ds-1">✦</span>
            <span className="drag-spark ds-2">•</span>
            <span className="drag-spark ds-3">★</span>
            <span className="drag-spark ds-4">•</span>
          </div>

          <div
            className="block-matrix"
            style={{
              gridTemplateRows: `repeat(${activeDragShape.matrix.length}, 1fr)`,
              gridTemplateColumns: `repeat(${activeDragShape.matrix[0].length}, 1fr)`
            }}
          >
            {activeDragShape.matrix.map((row, r) =>
              row.map((val, c) => (
                <div
                  key={`${r}-${c}`}
                  className={`mini-cell ${val === 1 ? 'filled' : 'empty'}`}
                  style={
                    val === 1
                      ? {
                          background: BLOCK_PALETTE[activeDragShape.colorKey]?.gradient || '#06b6d4',
                          borderColor: BLOCK_PALETTE[activeDragShape.colorKey]?.border || '#fff',
                          boxShadow: `0 0 10px ${BLOCK_PALETTE[activeDragShape.colorKey]?.glow || '#06b6d4'}`
                        }
                      : {}
                  }
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {gameOver && (
        <GameOverModal
          score={score}
          highScore={highScore}
          isNewHigh={isNewHigh}
          linesCleared={linesClearedTotal}
          maxStreak={maxStreak}
          level={currentLevel}
          levelConfig={levelConfig}
          levelProgress={levelProgress}
          onRestart={handleRestart}
          user={user}
          scoreSaved={scoreSaved}
          onOpenAuth={() => setShowAuthModal(true)}
          onOpenLevelMap={handleOpenLevelMap}
        />
      )}

      {/* New User Onboarding Modal */}
      {showOnboardingModal && user && (
        <OnboardingModal
          username={user.username}
          onProceedToMap={handleProceedFromOnboarding}
        />
      )}


      {/* Exit Level Confirmation Modal */}
      {showExitConfirmModal && (
        <ExitConfirmModal
          currentLevel={currentLevel}
          levelConfig={levelConfig}
          score={score}
          linesCleared={linesClearedTotal}
          onCancel={handleCancelExit}
          onConfirmExit={handleConfirmExit}
        />
      )}

      {/* Level Complete Modal */}
      {showLevelCompleteModal && completedLevelData && (
        <LevelCompleteModal
          levelConfig={completedLevelData.levelConfig}
          nextLevelConfig={completedLevelData.nextLevelConfig}
          bonusPoints={completedLevelData.bonusPoints}
          totalScore={completedLevelData.totalScore}
          currentUser={user}
          onContinue={() => handleContinueToLevelMap(completedLevelData.nextLevelConfig?.level)}
          onOpenLevelMap={() => handleContinueToLevelMap(completedLevelData.nextLevelConfig?.level)}
        />
      )}

      {/* Dedicated Full-Screen Level Map */}
      {showLevelMap && (
        <LevelMap
          currentLevel={currentLevel}
          unlockedLevel={unlockedLevel}
          completedLevels={completedLevels}
          totalScore={score}
          onSelectLevel={handleStartLevelWithIntro}
          onBackToGame={hasStartedGame ? handleBackToGame : null}
          hasActiveGame={hasStartedGame}
          onReturnToWelcome={() => {
            setShowWelcomeScreen(true);
            setShowLevelMap(false);
            sounds.playSelect();
          }}
        />
      )}

      {/* Full-Screen Animated Level Intro Modal */}
      {showLevelIntro && introLevelConfig && (
        <LevelIntroModal
          levelConfig={introLevelConfig}
          onIntroComplete={handleIntroComplete}
        />
      )}

      {/* How to Play Rules Modal */}
      {showHelp && (
        <HowToPlayModal onClose={() => setShowHelp(false)} />
      )}

      {/* Authentication Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
          onContinueAsGuest={handleGuestContinueFromAuth}
        />
      )}

      {/* Initial Welcome / Landing Screen (Always shown on startup/reload) */}
      {showWelcomeScreen && (
        <WelcomeLandingScreen
          user={user}
          unlockedLevel={unlockedLevel}
          completedCount={completedLevels.size}
          highScore={highScore}
          onPlayNow={handlePlayNow}
          onOpenAuth={() => {
            authOriginRef.current = 'welcome_signin';
            setShowAuthModal(true);
          }}
          onSwitchAccount={handleSwitchAccount}
          onLogout={handleLogout}
        />
      )}

      {/* Global Leaderboard Modal */}
      {showLeaderboardModal && (
        <LeaderboardModal
          onClose={() => setShowLeaderboardModal(false)}
          currentUsername={user?.username}
          currentUser={user}
          onOpenAuth={() => {
            setShowLeaderboardModal(false);
            setShowAuthModal(true);
          }}
        />
      )}

      {/* Player Profile & History Modal */}
      {showProfileModal && user && (
        <PlayerProfileModal
          user={user}
          onClose={() => setShowProfileModal(false)}
          onLogout={handleLogout}
        />
      )}

      {/* Game Settings Modal */}
      {showSettingsModal && (
        <SettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
        />
      )}
    </div>
  );
}

export default App;
