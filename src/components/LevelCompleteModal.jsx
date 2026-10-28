import React, { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, Zap, Trophy, LockKeyholeOpen, Map, Crown } from 'lucide-react';
import confetti from 'canvas-confetti';

export const LevelCompleteModal = ({
  levelConfig,
  nextLevelConfig,
  bonusPoints = 0,
  totalScore = 0,
  onContinue,
  onOpenLevelMap
}) => {
  const [hasContinued, setHasContinued] = useState(false);

  const handleContinueClick = React.useCallback(() => {
    if (hasContinued) return;
    setHasContinued(true);
    if (onOpenLevelMap) {
      onOpenLevelMap();
    } else {
      onContinue();
    }
  }, [hasContinued, onOpenLevelMap, onContinue]);

  const levelNum = levelConfig?.level || 1;
  const isCampaignComplete = levelNum >= 100;
  const isReplay = bonusPoints === 0;

  useEffect(() => {
    try {
      confetti({
        particleCount: isCampaignComplete ? 100 : 60,
        spread: isCampaignComplete ? 80 : 55,
        origin: { y: 0.55 }
      });
    } catch {
      // Safe fallback
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleContinueClick();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleContinueClick, isCampaignComplete]);

  const nextLevelNum = nextLevelConfig?.level || Math.min(100, levelNum + 1);
  const nextLevelTitle = nextLevelConfig?.title || 'Next Level';
  const completedObjective = levelConfig?.description || 'Objective completed';

  return (
    <div
      className="modal-backdrop level-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="level-complete-title"
    >
      <div className={`level-complete-card ${isCampaignComplete ? 'campaign-champion-card' : ''}`}>
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

          <h2 id="level-complete-title" className="level-complete-title">
            {isCampaignComplete ? 'Level 100 Cleared! Zenith Master!' : `Level ${levelNum} Cleared!`}
          </h2>
          <span className="level-complete-sub">
            {isCampaignComplete
              ? 'All 100 Progressive Stages Conquered! You are a Block Blitz Legend!'
              : levelConfig?.title || 'Stage Mastered'}
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
              {bonusPoints > 0 ? `+${bonusPoints.toLocaleString()}` : '0 (Replay)'}
            </span>
          </div>

          <div className="complete-stat-item">
            <div className="stat-label-wrap">
              <Trophy size={13} className="stat-trophy-svg" />
              <span>TOTAL SCORE</span>
            </div>
            <span className="stat-value total-val">{totalScore.toLocaleString()}</span>
          </div>
        </div>

        {/* Next Level or Campaign Conquered Strip */}
        {isCampaignComplete ? (
          <div className="next-level-strip campaign-victory-strip">
            <Crown size={15} className="campaign-crown-icon" />
            <span><strong>ALL 100 CAMPAIGN LEVELS CONQUERED!</strong> • Master of Block Blitz</span>
          </div>
        ) : (
          <div className="next-level-strip">
            <LockKeyholeOpen size={14} className="next-unlock-svg" />
            <span><strong>LEVEL {nextLevelNum} UNLOCKED!</strong> — {nextLevelTitle}</span>
          </div>
        )}

        {/* Actions: Primary button */}
        <div className="complete-actions-wrap">
          <button
            type="button"
            className={`complete-continue-btn ${isCampaignComplete ? 'champion-btn' : ''}`}
            onClick={handleContinueClick}
            disabled={hasContinued}
            autoFocus
            aria-label={isCampaignComplete ? 'View Campaign Map' : 'Continue to Level Map'}
          >
            <Map size={18} />
            <span>{isCampaignComplete ? 'VIEW CAMPAIGN MAP' : 'CONTINUE TO LEVEL MAP'}</span>
            <ArrowRight size={17} className="btn-arrow-svg" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LevelCompleteModal;
