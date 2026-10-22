import React, { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, Zap, Trophy, LockKeyholeOpen, Map } from 'lucide-react';
import confetti from 'canvas-confetti';

export const LevelCompleteModal = ({
  levelConfig,
  nextLevelConfig,
  bonusPoints,
  totalScore,
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

  useEffect(() => {
    try {
      confetti({
        particleCount: 60,
        spread: 55,
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
  }, [handleContinueClick]);

  const levelNum = levelConfig?.level || 1;
  const nextLevelNum = nextLevelConfig?.level || levelNum + 1;
  const nextLevelTitle = nextLevelConfig?.title || 'Next Level';
  const completedObjective = levelConfig?.description || 'Objective completed';

  return (
    <div
      className="modal-backdrop level-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="level-complete-title"
    >
      <div className="level-complete-card">
        {/* Victory Trophy & Medal Ribbon Badge */}
        <div className="victory-badge-wrap">
          <div className="victory-icon-circle">
            <Trophy size={30} className="victory-trophy-svg" />
            <div className="victory-ribbon-tails">
              <span className="ribbon-tail left" />
              <span className="ribbon-tail right" />
            </div>
          </div>
        </div>

        {/* Level Complete Heading */}
        <div className="level-complete-header">
          <div className="complete-tag-badge">STAGE COMPLETE</div>
          <h2 id="level-complete-title" className="level-complete-title">
            Level {levelNum} Cleared!
          </h2>
          <span className="level-complete-sub">{levelConfig?.title || 'Stage Mastered'}</span>
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
            <span className="stat-value bonus-val">+{bonusPoints.toLocaleString()}</span>
          </div>

          <div className="complete-stat-item">
            <div className="stat-label-wrap">
              <Trophy size={13} className="stat-trophy-svg" />
              <span>TOTAL SCORE</span>
            </div>
            <span className="stat-value total-val">{totalScore.toLocaleString()}</span>
          </div>
        </div>

        {/* Next Level Unlocked Teaser */}
        <div className="next-level-strip">
          <LockKeyholeOpen size={14} className="next-unlock-svg" />
          <span><strong>LEVEL {nextLevelNum} UNLOCKED!</strong> — {nextLevelTitle}</span>
        </div>

        {/* Actions: Primary "CONTINUE TO LEVEL MAP" button */}
        <div className="complete-actions-wrap">
          <button
            type="button"
            className="complete-continue-btn"
            onClick={handleContinueClick}
            disabled={hasContinued}
            autoFocus
            aria-label="Continue to Level Map"
          >
            <Map size={18} />
            <span>CONTINUE TO LEVEL MAP</span>
            <ArrowRight size={17} className="btn-arrow-svg" />
          </button>
        </div>
      </div>
    </div>
  );
};
