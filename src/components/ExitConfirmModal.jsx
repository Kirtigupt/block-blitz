import React, { useEffect } from 'react';
import { Play, Map, AlertCircle, ShieldCheck } from 'lucide-react';

export const ExitConfirmModal = ({
  currentLevel = 1,
  levelConfig,
  score = 0,
  linesCleared = 0,
  onCancel,
  onConfirmExit
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  return (
    <div
      className="modal-backdrop exit-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-modal-title"
    >
      <div className="exit-confirm-card">
        <div className="exit-modal-badge">
          <AlertCircle size={15} className="exit-badge-icon" />
          <span>PAUSE & EXIT</span>
        </div>

        <h2 id="exit-modal-title" className="exit-modal-title">
          Exit Level {currentLevel}?
        </h2>

        {levelConfig && (
          <div className="exit-level-subtitle">
            <span className="exit-level-name">{levelConfig.title}</span>
            {levelConfig.chapter && (
              <span className="exit-chapter-tag">• Chapter {levelConfig.chapter}</span>
            )}
          </div>
        )}

        <div className="exit-modal-message-box">
          <p className="exit-primary-prompt">
            Exit this level? Your level progress will be saved.
          </p>
          <div className="exit-save-guarantee">
            <ShieldCheck size={16} className="guarantee-icon" />
            <span>Unlocked levels and high scores remain saved. Current attempt ends without penalty.</span>
          </div>
        </div>

        {(score > 0 || linesCleared > 0) && (
          <div className="exit-attempt-stats">
            <div className="exit-stat-item">
              <span className="exit-stat-label">ATTEMPT SCORE</span>
              <span className="exit-stat-val">{score.toLocaleString()}</span>
            </div>
            <div className="exit-stat-item">
              <span className="exit-stat-label">LINES IN ATTEMPT</span>
              <span className="exit-stat-val">{linesCleared}</span>
            </div>
          </div>
        )}

        <div className="exit-actions-row">
          <button
            type="button"
            className="exit-btn-continue"
            onClick={onCancel}
            autoFocus
          >
            <Play size={17} fill="currentColor" />
            <span>CONTINUE PLAYING</span>
          </button>

          <button
            type="button"
            className="exit-btn-confirm"
            onClick={onConfirmExit}
          >
            <Map size={17} />
            <span>EXIT TO LEVEL MAP</span>
          </button>
        </div>
      </div>
    </div>
  );
};
