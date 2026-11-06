import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
  Award,
  Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/soundEffects';
import { apiGetGlobalLeaderboard } from '../utils/api';
import { CHAPTER_CONFIGS, getLevelConfig } from '../constants/levels';

/**
 * Premium 3-Step Level Completion Experience
 * Step 1: Cyber-Arcade Achievement Victory Screen
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
  const isBossLevel = levelNum % 10 === 0;
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

  // Objective icon helper based on objective text or target
  const objectiveIcon = useMemo(() => {
    const desc = (completedObjective || '').toLowerCase();
    if (desc.includes('line') || desc.includes('row')) {
      return <Layers size={18} className="obj-icon-symbol" />;
    }
    if (desc.includes('streak') || desc.includes('flame') || desc.includes('combo')) {
      return <Flame size={18} className="obj-icon-symbol" />;
    }
    if (desc.includes('score') || desc.includes('point') || desc.includes('pts')) {
      return <Award size={18} className="obj-icon-symbol" />;
    }
    if (desc.includes('color') || desc.includes('block') || desc.includes('tile')) {
      return <Zap size={18} className="obj-icon-symbol" />;
    }
    return <Target size={18} className="obj-icon-symbol" />;
  }, [completedObjective]);

  // Trigger celebration confetti on mount
  useEffect(() => {
    try {
      confetti({
        particleCount: isCampaignComplete ? 110 : 70,
        spread: isCampaignComplete ? 85 : 65,
        origin: { y: 0.52 }
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
          STEP 1: LEVEL COMPLETED SCREEN (Completely Redesigned Achievement Experience)
         ========================================================================= */}
      {step === 'completed' && (
        <div className={`level-complete-card achievement-portal-card ${isCampaignComplete ? 'campaign-champion-card' : ''}`}>
          {/* Multi-layered Ambient Light Blooms & Beam Flares */}
          <div className="completion-ambient-halo" />
          <div className="completion-beam-flare flare-cyan" />
          <div className="completion-beam-flare flare-amber" />

          {/* Top Status & Sector Telemetry Banner */}
          <div className="achievement-telemetry-banner">
            <div className="telemetry-live-beacon">
              <span className="beacon-ping" />
              <span className="beacon-dot" />
              <span className="beacon-label">SECTOR CLEARED</span>
            </div>
            <div className="telemetry-ch-tag">
              CHAPTER {chapterNum} • {chapterData.name.toUpperCase()}
            </div>
          </div>

          {/* =========================================================
              CREATIVE ACHIEVEMENT PRESENTATION (Apex Crest + Arching Constellation)
              Replacing the generic trophy-in-a-circle + 3 isolated stars
             ========================================================= */}
          <div className="victory-crest-apparatus">
            {/* Energy Halo Field */}
            <div className="crest-energy-field" />

            {/* Hero Zenith Star (Star 2 - Apex Node) */}
            <div className="victory-star-slot star-slot-2 hero-star apex-zenith-node">
              <div className="hero-star-chassis">
                <Star size={36} className="star-fill-svg star-pop-2" fill="#fde047" stroke="#eab308" />
                <Sparkles size={16} className="apex-sparkle-flair" />
              </div>
            </div>

            {/* Constellation Triumph Arch (Left Wing, Central Core, Right Wing) */}
            <div className="triumph-constellation-arch" aria-label="3 Stars Rating Earned">
              {/* Star 1 - Wing Left */}
              <div className="victory-star-slot star-slot-1 constellation-node left-wing">
                <div className="star-pedestal-mount">
                  <Star size={24} className="star-fill-svg star-pop-1" fill="#fbbf24" stroke="#f59e0b" />
                  <span className="star-sparkle-dot" />
                </div>
              </div>

              {/* Central Power Core Crest */}
              <div className="victory-core-crest-chassis">
                <div className={`victory-core-prism ${isCampaignComplete ? 'campaign-zenith-core' : isBossLevel ? 'boss-slayer-core' : ''}`}>
                  <div className="core-prism-inner">
                    {isCampaignComplete ? (
                      <Crown size={36} className="victory-core-icon crown-glow" />
                    ) : isBossLevel ? (
                      <Flame size={34} className="victory-core-icon flame-glow" />
                    ) : (
                      <Award size={34} className="victory-core-icon award-glow" />
                    )}
                  </div>
                  {/* Revolving Energy Ring */}
                  <div className="core-orbit-ring" />
                  <div className="core-facet-sheen" />
                </div>
              </div>

              {/* Star 3 - Wing Right */}
              <div className="victory-star-slot star-slot-3 constellation-node right-wing">
                <div className="star-pedestal-mount">
                  <Star size={24} className="star-fill-svg star-pop-3" fill="#fbbf24" stroke="#f59e0b" />
                  <span className="star-sparkle-dot" />
                </div>
              </div>
            </div>

            {/* Tri-Star Grade Ribbon */}
            <div className="triumph-grade-ribbon">
              <span className="grade-badge">GRADE S</span>
              <span className="grade-divider">•</span>
              <span className="grade-sub">3-STAR OVERDRIVE</span>
            </div>
          </div>

          {/* =========================================================
              VICTORY HEADLINE & LEVEL INFORMATION
              Bold, stylized cyber-arcade typography with clear hierarchy
             ========================================================= */}
          <div className="level-complete-header achievement-headline-block">
            <div className="achievement-title-wrap">
              <h2 id="completion-flow-title" className="level-complete-title">
                {isCampaignComplete ? 'Level 100 Cleared! Zenith Master!' : 'LEVEL COMPLETED!'}
              </h2>
            </div>

            <div className="stage-identity-strip">
              <span className="stage-code-pill">STAGE {String(levelNum).padStart(2, '0')}</span>
              <span className="stage-name-text">{levelConfig?.title || 'Grid Frontier Mastered'}</span>
              {isReplay && <span className="stage-replay-pill">REPLAY</span>}
            </div>
          </div>

          {/* =========================================================
              HOLOGRAPHIC OBJECTIVE VERIFICATION CARD
              Tactical HUD terminal with status badge and directive icon
             ========================================================= */}
          <div className="holographic-objective-card">
            <div className="obj-card-top-row">
              <div className="obj-directive-tag">
                <Target size={13} className="obj-directive-icon" />
                <span>MISSION DIRECTIVE VERIFIED</span>
              </div>
              <div className="obj-status-badge">
                <CheckCircle2 size={13} className="obj-status-icon" />
                <span>100% COMPLETE</span>
              </div>
            </div>

            <div className="obj-card-body">
              <div className="obj-icon-pod">
                {objectiveIcon}
              </div>
              <div className="obj-detail-text">
                <span className="obj-quote-label">"{completedObjective}"</span>
                <span className="obj-param-note">Sector clearance parameters satisfied</span>
              </div>
            </div>
          </div>

          {/* =========================================================
              PERFORMANCE VAULT & REWARDS HUB
              Asymmetric high-tech data chambers with glowing neon telemetry
             ========================================================= */}
          <div className="rewards-performance-hub">
            {/* Left Chamber: Stage Bonus Yield */}
            <div className="reward-vault-chamber bonus-chamber">
              <div className="chamber-header">
                <div className="chamber-icon-wrapper bonus-glow">
                  <Zap size={14} className="chamber-icon" />
                </div>
                <span className="chamber-title">STAGE BONUS</span>
              </div>
              <div className="chamber-value-box">
                <span className={`stat-value bonus-val ${isReplay ? 'replay-val' : ''}`}>
                  {bonusPoints > 0 ? `+${bonusPoints.toLocaleString()} PTS` : '0 (Replay)'}
                </span>
              </div>
              <div className="chamber-subtext">
                {bonusPoints > 0 ? 'Clearance Yield Credited' : 'Archive Replay (No Extra Bonus)'}
              </div>
            </div>

            {/* Right Chamber: Total Accumulated Score */}
            <div className="reward-vault-chamber score-chamber">
              <div className="chamber-header">
                <div className="chamber-icon-wrapper score-glow">
                  <Trophy size={14} className="chamber-icon" />
                </div>
                <span className="chamber-title">FINAL SCORE</span>
              </div>
              <div className="chamber-value-box">
                <span className="stat-value total-val">{totalScore.toLocaleString()}</span>
              </div>
              <div className="chamber-subtext">
                <span className="score-live-tag">Total Career Blitz</span>
              </div>
            </div>
          </div>

          {/* Integrated Performance Telemetry Ribbon */}
          <div className="performance-telemetry-ribbon">
            <div className="perf-metric">
              <span className="metric-dot gold" />
              <span className="metric-lbl">EXECUTION:</span>
              <span className="metric-val">FLAWLESS</span>
            </div>
            <div className="perf-divider" />
            <div className="perf-metric">
              <span className="metric-dot cyan" />
              <span className="metric-lbl">GRID MULTIPLIER:</span>
              <span className="metric-val">x1.5 BOOST</span>
            </div>
          </div>

          {/* =========================================================
              DISTINCTIVE COMMAND-GRADE LEADERBOARD TRIGGER
              3D tactile physical arcade button with illuminated icon pod
             ========================================================= */}
          <div className="complete-actions-wrap">
            <button
              type="button"
              className="complete-continue-btn complete-leaderboard-btn command-leaderboard-trigger"
              onClick={() => {
                sounds.playSelect();
                setStep('leaderboard');
              }}
              autoFocus
              aria-label="View Leaderboard"
            >
              <div className="trigger-icon-pod">
                <Trophy size={20} className="trigger-trophy-icon" />
              </div>
              <div className="trigger-text-column">
                <span className="trigger-primary-label">VIEW LEADERBOARD</span>
                <span className="trigger-sub-label">Global Standings & Player Rankings</span>
              </div>
              <div className="trigger-arrow-pod">
                <ArrowRight size={18} className="trigger-arrow-icon" />
              </div>
            </button>

            {/* Quick Skip to Map Direct Alternative */}
            <div className="quick-advance-row">
              <button
                type="button"
                className="quick-map-direct-btn"
                onClick={handleFinishAndGoToMap}
                aria-label="Direct to Map"
              >
                <Map size={14} />
                <span>Skip Direct to Map</span>
              </button>
            </div>
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
