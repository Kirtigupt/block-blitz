import React, { useEffect } from 'react';
import { Play, Map, Trophy, Star, CheckCircle, ShieldCheck, ArrowRight } from 'lucide-react';
import { getLevelConfig } from '../constants/levels';

export const WelcomeBackModal = ({
  user,
  unlockedLevel = 1,
  completedCount = 0,
  highScore = 0,
  onResumeLevel,
  onViewMap
}) => {
  const currentLevelConfig = getLevelConfig(unlockedLevel);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onViewMap();
      } else if (e.key === 'Enter') {
        onResumeLevel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onResumeLevel, onViewMap]);

  return (
    <div
      className="modal-backdrop welcome-back-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-back-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onViewMap();
        }
      }}
    >
      <div className="welcome-back-card">
        <div className="welcome-back-badge">
          <ShieldCheck size={14} className="badge-shield-icon" />
          <span>CLOUD PROGRESSION LOADED</span>
        </div>

        <h2 id="welcome-back-title" className="welcome-back-title">
          Welcome Back, <span className="highlight-name">{user?.username}</span>!
        </h2>
        <p className="welcome-back-subtitle">
          Your saved campaign progression has been synced from the cloud.
        </p>

        <div className="welcome-stats-row">
          <div className="welcome-stat-card">
            <div className="welcome-stat-label">
              <Star size={13} className="stat-star-icon" />
              <span>UNLOCKED</span>
            </div>
            <span className="welcome-stat-value">LVL {unlockedLevel}</span>
            <span className="welcome-stat-sub">{currentLevelConfig?.title || 'Active Stage'}</span>
          </div>

          <div className="welcome-stat-card">
            <div className="welcome-stat-label">
              <CheckCircle size={13} className="stat-check-icon" />
              <span>COMPLETED</span>
            </div>
            <span className="welcome-stat-value">{completedCount}</span>
            <span className="welcome-stat-sub">of 100 Levels</span>
          </div>

          <div className="welcome-stat-card">
            <div className="welcome-stat-label">
              <Trophy size={13} className="stat-trophy-icon" />
              <span>BEST SCORE</span>
            </div>
            <span className="welcome-stat-value">{highScore.toLocaleString()}</span>
            <span className="welcome-stat-sub">All-time record</span>
          </div>
        </div>

        <div className="welcome-actions-row">
          <button
            type="button"
            className="welcome-btn-resume"
            onClick={onResumeLevel}
            autoFocus
          >
            <Play size={17} fill="currentColor" />
            <span>RESUME LEVEL {unlockedLevel}</span>
            <ArrowRight size={16} />
          </button>

          <button
            type="button"
            className="welcome-btn-map"
            onClick={onViewMap}
          >
            <Map size={17} />
            <span>VIEW LEVEL MAP</span>
          </button>
        </div>
      </div>
    </div>
  );
};
