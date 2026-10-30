import React, { useEffect, useState, useCallback } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Zap,
  Trophy,
  LockKeyholeOpen,
  Map,
  Crown,
  Star,
  Medal,
  Loader2,
  AlertCircle,
  Sparkles,
  RotateCcw,
  Target,
  Layers,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/soundEffects';
import { apiGetGlobalLeaderboard } from '../utils/api';
import { CHAPTER_CONFIGS, getLevelConfig } from '../constants/levels';

/**
 * Premium 3-Step Level Completion Experience
 * Step 1: Level Completed Screen
 * Step 2: Global Leaderboard Screen
 * Step 3: Next Level Unlocked Screen
 */
export const LevelCompleteModal = ({
  levelConfig,
  nextLevelConfig,
  bonusPoints = 0,
  totalScore = 0,
  currentUser = null,
  onContinue,
  onOpenLevelMap
}) => {
  // Step State Machine: 'completed' -> 'leaderboard' -> 'unlocked'
  const [step, setStep] = useState('completed');
  const [hasContinued, setHasContinued] = useState(false);

  // Leaderboard Data State
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUserStats, setCurrentUserStats] = useState(null);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState(null);

  const levelNum = levelConfig?.level || 1;
  const isCampaignComplete = levelNum >= 100;
  const isReplay = bonusPoints === 0;

  const nextLevelNum = nextLevelConfig?.level || Math.min(100, levelNum + 1);
  const resolvedNextConfig = nextLevelConfig || (nextLevelNum !== levelNum ? getLevelConfig(nextLevelNum) : null);
  const nextLevelTitle = resolvedNextConfig?.title || `Stage ${nextLevelNum}`;
  const completedObjective = levelConfig?.description || 'Objective completed';

  // Chapter details
  const chapterNum = levelConfig?.chapter || Math.ceil(levelNum / 10);
  const chapterData = CHAPTER_CONFIGS.find((c) => c.chapter === chapterNum) || {
    chapter: chapterNum,
    name: `Chapter ${chapterNum}`
  };

  const nextChapterNum = resolvedNextConfig?.chapter || Math.ceil(nextLevelNum / 10);
  const nextChapterData = CHAPTER_CONFIGS.find((c) => c.chapter === nextChapterNum) || {
    chapter: nextChapterNum,
    name: `Chapter ${nextChapterNum}`
  };

  // Trigger celebration confetti on mount
  useEffect(() => {
    try {
      confetti({
        particleCount: isCampaignComplete ? 100 : 65,
        spread: isCampaignComplete ? 80 : 60,
        origin: { y: 0.55 }
      });
    } catch {
      // Safe fallback
    }
  }, [isCampaignComplete]);

  // Fetch real backend leaderboard data
  const fetchLeaderboardData = useCallback(async () => {
    setLeaderboardLoading(true);
    setLeaderboardError(null);
    try {
      const data = await apiGetGlobalLeaderboard(20);
      setLeaderboard(Array.isArray(data.leaderboard) ? data.leaderboard : []);
      if (data.currentUserStats) {
        setCurrentUserStats(data.currentUserStats);
      }
    } catch (err) {
      setLeaderboardError(err.message || 'Failed to load live leaderboard.');
    } finally {
      setLeaderboardLoading(false);
    }
  }, []);

  // When step changes to leaderboard, fetch data
  useEffect(() => {
    if (step === 'leaderboard') {
      fetchLeaderboardData();
    } else if (step === 'unlocked') {
      try {
        confetti({
          particleCount: 50,
          spread: 50,
          origin: { y: 0.5 }
        });
      } catch {
        // Safe fallback
      }
    }
  }, [step, fetchLeaderboardData]);

  // Final Action: Go to Adventure Map
  const handleFinishAndGoToMap = useCallback(() => {
    if (hasContinued) return;
    setHasContinued(true);
    sounds.playSelect();
    if (onOpenLevelMap) {
      onOpenLevelMap(nextLevelNum);
    } else if (onContinue) {
      onContinue(nextLevelNum);
    }
  }, [hasContinued, onOpenLevelMap, onContinue, nextLevelNum]);

  // Keyboard navigation across all three steps
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (step === 'completed') {
          sounds.playSelect();
          setStep('leaderboard');
        } else if (step === 'leaderboard') {
          sounds.playSelect();
          setStep('unlocked');
        } else if (step === 'unlocked') {
          handleFinishAndGoToMap();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, handleFinishAndGoToMap]);

  // Helper for Top 3 Podium
  const top1 = leaderboard[0] || null;
  const top2 = leaderboard[1] || null;
  const top3 = leaderboard[2] || null;

  const currentUsername = currentUser?.username || 'Guest Pilot';
  const isCurrentUser = (uname) =>
    currentUser?.username && uname && uname.toLowerCase() === currentUser.username.toLowerCase();

  return (
    <div
      className="modal-backdrop level-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="completion-flow-title"
    >
      {/* =========================================================================
          STEP 1: LEVEL COMPLETED SCREEN
         ========================================================================= */}
      {step === 'completed' && (
        <div className={`level-complete-card ${isCampaignComplete ? 'campaign-champion-card' : ''}`}>
          {/* Ambient Glow */}
          <div className="completion-ambient-halo" />

          {/* Victory Trophy or Campaign Crown Badge */}
          <div className="victory-badge-wrap">
            <div className={`victory-icon-circle ${isCampaignComplete ? 'champion-icon-circle' : ''}`}>
              {isCampaignComplete ? (
                <Crown size={32} className="victory-crown-svg" />
              ) : (
                <Trophy size={30} className="victory-trophy-svg" />
              )}
              <div className="victory-ribbon-tails">
                <span className="ribbon-tail left" />
                <span className="ribbon-tail right" />
              </div>
            </div>
          </div>

          {/* Celebratory 3-Star Rating Row */}
          <div className="victory-stars-cluster" aria-label="3 Stars Rating Earned">
            <div className="victory-star-slot star-slot-1">
              <Star size={22} className="star-fill-svg star-pop-1" fill="#fbbf24" stroke="#f59e0b" />
            </div>
            <div className="victory-star-slot star-slot-2 hero-star">
              <Star size={32} className="star-fill-svg star-pop-2" fill="#fbbf24" stroke="#f59e0b" />
            </div>
            <div className="victory-star-slot star-slot-3">
              <Star size={22} className="star-fill-svg star-pop-3" fill="#fbbf24" stroke="#f59e0b" />
            </div>
          </div>

          {/* Level Complete Heading */}
          <div className="level-complete-header">
            {isCampaignComplete ? (
              <div className="complete-tag-badge champion-badge">
                <Crown size={12} />
                <span>CAMPAIGN CHAMPION</span>
              </div>
            ) : isReplay ? (
              <div className="complete-tag-badge replay-badge">STAGE REPLAYED</div>
            ) : (
              <div className="complete-tag-badge">STAGE COMPLETE</div>
            )}

            <h2 id="completion-flow-title" className="level-complete-title">
              {isCampaignComplete ? 'Level 100 Cleared! Zenith Master!' : 'LEVEL COMPLETED!'}
            </h2>
            <span className="level-complete-sub">
              {isCampaignComplete
                ? 'All 100 Progressive Stages Conquered! You are a Block Blitz Legend!'
                : `Level ${levelNum} — ${levelConfig?.title || 'Stage Mastered'}`}
            </span>
          </div>

          {/* Objective Achieved Callout */}
          <div className="complete-objective-box">
            <CheckCircle2 size={16} className="obj-check-svg" />
            <span className="obj-text">Objective Completed: {completedObjective}</span>
          </div>

          {/* Stats Row */}
          <div className="complete-stats-grid">
            <div className="complete-stat-item">
              <div className="stat-label-wrap">
                <Zap size={13} className="stat-zap-svg" />
                <span>STAGE BONUS</span>
              </div>
              <span className={`stat-value bonus-val ${isReplay ? 'replay-val' : ''}`}>
                {bonusPoints > 0 ? `+${bonusPoints.toLocaleString()} PTS` : '0 (Replay)'}
              </span>
            </div>

            <div className="complete-stat-item">
              <div className="stat-label-wrap">
                <Trophy size={13} className="stat-trophy-svg" />
                <span>FINAL SCORE</span>
              </div>
              <span className="stat-value total-val">{totalScore.toLocaleString()}</span>
            </div>
          </div>

          {/* Action: VIEW LEADERBOARD Button */}
          <div className="complete-actions-wrap">
            <button
              type="button"
              className="complete-continue-btn complete-leaderboard-btn"
              onClick={() => {
                sounds.playSelect();
                setStep('leaderboard');
              }}
              autoFocus
              aria-label="View Leaderboard"
            >
              <Trophy size={18} />
              <span>VIEW LEADERBOARD</span>
              <ArrowRight size={17} className="btn-arrow-svg" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 2: LEADERBOARD SCREEN
         ========================================================================= */}
      {step === 'leaderboard' && (
        <div className="level-complete-card completion-leaderboard-card">
          {/* Ambient Glow */}
          <div className="completion-ambient-halo" />

          {/* Header */}
          <div className="completion-flow-header">
            <div className="complete-tag-badge">
              <Trophy size={12} />
              <span>WORLDWIDE STANDINGS</span>
            </div>
            <h2 id="completion-flow-title" className="level-complete-title">
              GLOBAL LEADERBOARD
            </h2>
            <span className="level-complete-sub">Top Blitz Masters & Your Personal Ranking</span>
          </div>

          {/* Loading State */}
          {leaderboardLoading && (
            <div className="leaderboard-flow-status">
              <Loader2 size={28} className="loading-spinner-svg" />
              <span>Fetching live global standings...</span>
            </div>
          )}

          {/* Error State */}
          {!leaderboardLoading && leaderboardError && (
            <div className="leaderboard-flow-status error-state">
              <AlertCircle size={24} className="error-icon" />
              <span>{leaderboardError}</span>
              <button
                type="button"
                className="leaderboard-retry-btn"
                onClick={fetchLeaderboardData}
              >
                <RotateCcw size={14} />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* Loaded Content */}
          {!leaderboardLoading && !leaderboardError && (
            <>
              {/* Top 3 Podium Layout */}
              <div className="leaderboard-podium-wrap">
                {/* 2nd Place (Silver) */}
                <div className="podium-col podium-silver">
                  <div className="podium-player-meta">
                    <Medal size={20} className="podium-medal-svg silver" />
                    <span className="podium-username" title={top2 ? top2.username : 'Empty'}>
                      {top2 ? top2.username : '---'}
                    </span>
                    <span className="podium-score">
                      {top2 ? `${top2.totalScore?.toLocaleString()} PTS` : '0'}
                    </span>
                  </div>
                  <div className="podium-pedestal pedestal-2">
                    <span className="podium-rank-num">#2</span>
                  </div>
                </div>

                {/* 1st Place (Gold - Hero Elevated) */}
                <div className="podium-col podium-gold hero-gold">
                  <div className="podium-crown-halo">
                    <Crown size={24} className="podium-crown-svg" />
                  </div>
                  <div className="podium-player-meta">
                    <span className="podium-username hero-username" title={top1 ? top1.username : 'Empty'}>
                      {top1 ? top1.username : '---'}
                    </span>
                    <span className="podium-score hero-score">
                      {top1 ? `${top1.totalScore?.toLocaleString()} PTS` : '0'}
                    </span>
                  </div>
                  <div className="podium-pedestal pedestal-1">
                    <span className="podium-rank-num">#1</span>
                  </div>
                </div>

                {/* 3rd Place (Bronze) */}
                <div className="podium-col podium-bronze">
                  <div className="podium-player-meta">
                    <Medal size={20} className="podium-medal-svg bronze" />
                    <span className="podium-username" title={top3 ? top3.username : 'Empty'}>
                      {top3 ? top3.username : '---'}
                    </span>
                    <span className="podium-score">
                      {top3 ? `${top3.totalScore?.toLocaleString()} PTS` : '0'}
                    </span>
                  </div>
                  <div className="podium-pedestal pedestal-3">
                    <span className="podium-rank-num">#3</span>
                  </div>
                </div>
              </div>

              {/* Current Player Performance Highlight */}
              <div className="current-player-highlight-strip">
                <div className="player-highlight-left">
                  <span className="highlight-tag">YOU</span>
                  <span className="highlight-username">{currentUsername}</span>
                </div>
                <div className="player-highlight-right">
                  <span className="highlight-score">{totalScore.toLocaleString()} PTS</span>
                  <span className="highlight-rank">
                    {currentUserStats?.rank ? `#${currentUserStats.rank}` : (currentUser ? 'RANKED' : 'GUEST')}
                  </span>
                </div>
              </div>

              {/* Standings Table (Scrollable) */}
              <div className="completion-standings-scroll">
                {leaderboard.length === 0 ? (
                  <div className="leaderboard-empty-hint">
                    <Sparkles size={16} />
                    <span>No player records yet. Complete stages to claim the #1 rank!</span>
                  </div>
                ) : (
                  <table className="completion-table">
                    <thead>
                      <tr>
                        <th>RANK</th>
                        <th>PLAYER</th>
                        <th className="align-right">SCORE</th>
                        <th className="align-right">CLEARED</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.map((item) => {
                        const isMe = isCurrentUser(item.username);
                        return (
                          <tr
                            key={`lb-${item.rank}-${item.username}`}
                            className={`standings-row ${isMe ? 'standings-row-me' : ''}`}
                          >
                            <td className="rank-cell">
                              {item.rank === 1 && <Crown size={13} className="table-crown-icon" />}
                              <span>#{item.rank}</span>
                            </td>
                            <td className="user-cell">
                              <span className="table-username">{item.username}</span>
                              {isMe && <span className="table-me-badge">YOU</span>}
                            </td>
                            <td className="align-right score-cell">
                              {item.totalScore?.toLocaleString() || item.highScore?.toLocaleString() || 0}
                            </td>
                            <td className="align-right cleared-cell">
                              {item.completedLevelsCount || 0}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}

          {/* Action: CONTINUE Button */}
          <div className="complete-actions-wrap">
            <button
              type="button"
              className="complete-continue-btn leaderboard-continue-btn"
              onClick={() => {
                sounds.playSelect();
                setStep('unlocked');
              }}
              autoFocus
              aria-label="Continue to Next Level Unlocked Screen"
            >
              <span>CONTINUE</span>
              <ArrowRight size={17} className="btn-arrow-svg" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 3: NEXT LEVEL UNLOCKED SCREEN
         ========================================================================= */}
      {step === 'unlocked' && (
        <div className="level-complete-card completion-unlock-card">
          {/* Ambient Halo & Pulse Rings */}
          <div className="completion-ambient-halo" />
          <div className="unlock-ripple-ring" />

          {/* Padlock Unlock Animation Container */}
          <div className="unlock-badge-wrap">
            <div className="unlock-icon-circle">
              <LockKeyholeOpen size={36} className="unlock-hero-svg" />
            </div>
          </div>

          {/* Next Level Heading */}
          <div className="level-complete-header">
            <div className="complete-tag-badge unlock-tag-badge">
              <Sparkles size={12} />
              <span>NEW STAGE READY</span>
            </div>

            <h2 id="completion-flow-title" className="level-complete-title">
              {isCampaignComplete ? 'ALL 100 LEVELS COMPLETED!' : 'NEXT LEVEL UNLOCKED!'}
            </h2>

            <span className="level-complete-sub">
              {isCampaignComplete
                ? 'Congratulations! You conquered the entire progressive campaign.'
                : `Level ${nextLevelNum} — ${nextLevelTitle}`}
            </span>
          </div>

          {/* Newly Unlocked Mission Detail Card */}
          <div className="unlocked-preview-card">
            <div className="unlocked-preview-header">
              <span className="unlocked-chapter-tag">
                CH {nextChapterData.chapter}: {nextChapterData.name.toUpperCase()}
              </span>
              <span className="unlocked-level-tag">STAGE {String(nextLevelNum).padStart(2, '0')}</span>
            </div>

            <div className="unlocked-preview-title">{nextLevelTitle}</div>

            {resolvedNextConfig?.description && (
              <div className="unlocked-obj-preview">
                <Target size={14} className="preview-obj-icon" />
                <span>Objective: "{resolvedNextConfig.description}"</span>
              </div>
            )}

            <div className="unlocked-tactical-row">
              <div className="tactical-item">
                <Layers size={13} className="tactical-icon" />
                <span>
                  GRID: {resolvedNextConfig?.pattern ? resolvedNextConfig.pattern.replace(/_/g, ' ').toUpperCase() : 'CLEAN'}
                </span>
              </div>
              <div className="tactical-item reward-item">
                <Award size={13} className="tactical-icon-gold" />
                <span>+{resolvedNextConfig?.bonusPoints || 250} PTS</span>
              </div>
            </div>
          </div>

          {/* Action: GO TO ADVENTURE MAP Button */}
          <div className="complete-actions-wrap">
            <button
              type="button"
              className="complete-continue-btn unlock-go-map-btn"
              onClick={handleFinishAndGoToMap}
              disabled={hasContinued}
              autoFocus
              aria-label="Go to Adventure Map"
            >
              <Map size={18} />
              <span>GO TO ADVENTURE MAP</span>
              <ArrowRight size={17} className="btn-arrow-svg" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LevelCompleteModal;
