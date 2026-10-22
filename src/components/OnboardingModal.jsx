import React, { useEffect } from 'react';
import { Sparkles, Target, Trophy, ArrowRight, ShieldCheck, Play } from 'lucide-react';

export const OnboardingModal = ({
  username,
  onProceedToMap
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        onProceedToMap();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onProceedToMap]);

  return (
    <div
      className="modal-backdrop onboarding-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onProceedToMap();
        }
      }}
    >
      <div className="onboarding-card">
        <div className="onboarding-badge">
          <Sparkles size={14} className="badge-sparkle-icon" />
          <span>NEW PILOT ONBOARDING</span>
        </div>

        <h2 id="onboarding-title" className="onboarding-title">
          Welcome to BLOCK BLITZ, <span className="highlight-name">{username}</span>!
        </h2>
        <p className="onboarding-subtitle">
          Your account has been created with a fresh Level 1 campaign.
        </p>

        <div className="onboarding-steps-grid">
          <div className="onboarding-step-item">
            <div className="step-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <Play size={18} />
            </div>
            <div className="step-content">
              <h3 className="step-title">1. Start at Level 1</h3>
              <p className="step-desc">
                Begin in Chapter 1: Apprentice Heights. Clear full rows & columns to meet tactical objectives.
              </p>
            </div>
          </div>

          <div className="onboarding-step-item">
            <div className="step-icon-wrap" style={{ background: 'rgba(192, 132, 252, 0.15)', color: '#c084fc' }}>
              <Target size={18} />
            </div>
            <div className="step-content">
              <h3 className="step-title">2. 100-Level Campaign</h3>
              <p className="step-desc">
                Conquer 10 thematic chapters featuring crystal obstacles, streaks, and boss levels.
              </p>
            </div>
          </div>

          <div className="onboarding-step-item">
            <div className="step-icon-wrap" style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24' }}>
              <Trophy size={18} />
            </div>
            <div className="step-content">
              <h3 className="step-title">3. Cloud Persistence</h3>
              <p className="step-desc">
                Your high scores and unlocked levels automatically save to your cloud profile.
              </p>
            </div>
          </div>
        </div>

        <div className="onboarding-footer">
          <div className="onboarding-tip">
            <ShieldCheck size={16} className="tip-icon" />
            <span>Review mission objectives on the Level Map before starting your run.</span>
          </div>

          <button
            type="button"
            className="onboarding-primary-btn"
            onClick={onProceedToMap}
            autoFocus
            aria-label="Play: Open Level Map"
          >
            <Play size={18} fill="currentColor" />
            <span>PLAY</span>
            <ArrowRight size={18} className="arrow-pulse" />
          </button>
        </div>
      </div>
    </div>
  );
};
