import React from 'react';
import { Sparkles, Trophy, Flame, AlertCircle, Star } from 'lucide-react';

export const ScoreNotification = ({ notification }) => {
  if (!notification) return null;

  const { id, title, points, sub, tier = 'subtle_points', position } = notification;

  const style = {};
  if (position?.top !== undefined) style.top = position.top;
  if (position?.left !== undefined) style.left = position.left;

  // Single line clear without combo: subtle floating points indicator
  if (tier === 'subtle_points' || (!title && points)) {
    return (
      <div className="score-popup-overlay subtle-overlay" style={style} aria-live="polite">
        <div key={id} className="subtle-points-badge">
          <span className="subtle-points-value">+{points.toLocaleString()}</span>
        </div>
      </div>
    );
  }

  const isHighScore = tier === 'highscore';
  const isLevelComplete = tier === 'level_complete';
  const isMegaClear = tier === 'mega_clear';
  const isTripleClear = tier === 'triple_clear';
  const isOnFire = tier === 'on_fire';
  const isCombo = tier === 'combo';
  const isHighTier = isHighScore || isLevelComplete || isMegaClear || isTripleClear || isOnFire;

  return (
    <div className="score-popup-overlay" style={style} aria-live="polite">
      <div key={id} className={`score-popup-badge tier-${tier}`}>
        {/* Ambient Sparkles for High Tiers */}
        {isHighTier && (
          <div className={`sparkle-cluster ${isHighScore || isLevelComplete ? 'gold-cyan' : ''}`}>
            <span className="sparkle s-1">✦</span>
            <span className="sparkle s-2">★</span>
            <span className="sparkle s-3">✦</span>
            <span className="sparkle s-4">★</span>
          </div>
        )}

        <div className="popup-header-row">
          {isHighScore && <Trophy size={24} className="popup-icon gold trophy-bounce" />}
          {isLevelComplete && <Star size={24} className="popup-icon gold star-bounce" />}
          {isMegaClear && <Sparkles size={22} className="popup-icon mega-sparkles" />}
          {(isOnFire || isCombo) && <Flame size={20} className="popup-icon flame-burst" />}
          {tier === 'invalid' && <AlertCircle size={18} className="popup-icon red-orange" />}
          <span className="popup-title">{title}</span>
        </div>

        {points !== undefined && points !== null && (
          <div className={`popup-points-pill ${isHighScore ? 'highscore-pill' : ''}`}>
            <span className="popup-points-text">
              {isHighScore ? `${points.toLocaleString()} PTS` : `+${points.toLocaleString()}`}
            </span>
          </div>
        )}

        {sub && (
          <div className="popup-sub-row">
            {sub.includes('🔥') && <Flame size={13} className="popup-flame" />}
            <span className="popup-sub">{sub}</span>
          </div>
        )}
      </div>
    </div>
  );
};
