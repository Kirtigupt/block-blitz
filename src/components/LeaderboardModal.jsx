import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Trophy,
  Medal,
  Crown,
  RotateCcw,
  Loader2,
  AlertCircle,
  LogIn,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { apiGetGlobalLeaderboard } from '../utils/api';

export const LeaderboardModal = ({
  onClose,
  currentUsername,
  currentUser,
  onOpenAuth
}) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUserStats, setCurrentUserStats] = useState(null);
  const [rankingDescription, setRankingDescription] = useState(
    'Ranked primarily by Highest Single-Game Score. Tie-breakers: Completed Levels, Cumulative Career Score, Seniority.'
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Close with Escape key
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGetGlobalLeaderboard(25);
      setLeaderboard(data.leaderboard || []);
      if (data.currentUserStats) {
        setCurrentUserStats(data.currentUserStats);
      }
      if (data.rankingDescription) {
        setRankingDescription(data.rankingDescription);
      }
    } catch (err) {
      setError(err.message || 'Failed to load leaderboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    apiGetGlobalLeaderboard(25)
      .then((data) => {
        if (isMounted) {
          setLeaderboard(data.leaderboard || []);
          if (data.currentUserStats) {
            setCurrentUserStats(data.currentUserStats);
          }
          if (data.rankingDescription) {
            setRankingDescription(data.rankingDescription);
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load leaderboard data.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const getRankBadge = (rank) => {
    if (rank === 1) {
      return (
        <div className="rank-badge-item rank-gold">
          <Crown size={14} className="crown-icon" />
          <span>#1</span>
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="rank-badge-item rank-silver">
          <Medal size={14} />
          <span>#2</span>
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="rank-badge-item rank-bronze">
          <Medal size={14} />
          <span>#3</span>
        </div>
      );
    }
    return <span className="rank-badge-item rank-standard">#{rank}</span>;
  };

  // Top 3 players for podium
  const top1 = leaderboard[0] || null;
  const top2 = leaderboard[1] || null;
  const top3 = leaderboard[2] || null;

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="leaderboard-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="leaderboard-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="leaderboard-header">
          <div className="leaderboard-title-group">
            <div className="leaderboard-icon-bubble">
              <Crown size={22} className="leaderboard-crown-icon" />
            </div>
            <div>
              <h2 id="leaderboard-modal-title" className="leaderboard-title">
                GLOBAL LEADERBOARD
              </h2>
              <span className="leaderboard-subtitle">Top Block Blitz Masters</span>
            </div>
          </div>
          <div className="leaderboard-header-actions">
            <button
              type="button"
              className="leaderboard-refresh-btn"
              onClick={fetchLeaderboard}
              disabled={loading}
              title="Refresh Leaderboard"
              aria-label="Refresh Leaderboard"
            >
              <RotateCcw size={14} className={loading ? 'spinning-loader' : ''} />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              className="leaderboard-close-btn"
              onClick={onClose}
              aria-label="Close leaderboard"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="leaderboard-body">
          {/* Loading State */}
          {loading && (
            <div className="leaderboard-status-container">
              <Loader2 size={36} className="spinning-loader" />
              <p className="status-text">Fetching verified global rankings...</p>
            </div>
          )}

          {/* Error State with Retry Button */}
          {!loading && error && (
            <div className="leaderboard-status-container error-state">
              <AlertCircle size={32} className="status-error-icon" />
              <p className="status-title">Unable to Load Leaderboard</p>
              <p className="status-desc">{error}</p>
              <button
                type="button"
                className="leaderboard-retry-btn"
                onClick={fetchLeaderboard}
              >
                <RotateCcw size={15} />
                <span>Retry Connection</span>
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && leaderboard.length === 0 && (
            <div className="leaderboard-status-container empty-state">
              <Trophy size={42} className="empty-trophy-icon" />
              <p className="status-title">No High Scores Recorded Yet</p>
              <p className="status-desc">
                Be the first to clear a line, score points, and claim the #1 spot!
              </p>
            </div>
          )}

          {/* Success State */}
          {!loading && !error && leaderboard.length > 0 && (
            <>
              {/* Top Three Podium */}
              <div className="podium-wrapper">
                {/* 2nd Place Pillar (Left) */}
                {top2 ? (
                  <div className="podium-col podium-silver">
                    <div className="podium-avatar">
                      <Medal size={20} className="podium-icon silver-icon" />
                    </div>
                    <span className="podium-player-name" title={top2.username}>
                      {top2.username}
                    </span>
                    <span className="podium-score">
                      {(top2.totalScore || top2.highScore).toLocaleString()} PTS
                    </span>
                    <span className="podium-sub-tag">
                      Best: {top2.highScore.toLocaleString()} • {top2.completedLevelsCount} Stages
                    </span>
                    <div className="podium-pillar pillar-2">
                      <span className="pillar-rank-text">2</span>
                    </div>
                  </div>
                ) : (
                  <div className="podium-col podium-empty" />
                )}

                {/* 1st Place Pillar (Center, Most Prominent) */}
                {top1 && (
                  <div className="podium-col podium-gold">
                    <div className="podium-crown-badge">
                      <Crown size={22} className="gold-crown-icon" />
                    </div>
                    <div className="podium-avatar first-avatar">
                      <span className="avatar-letter">1</span>
                    </div>
                    <span className="podium-player-name prominent" title={top1.username}>
                      {top1.username}
                    </span>
                    <span className="podium-score prominent-score">
                      {(top1.totalScore || top1.highScore).toLocaleString()} PTS
                    </span>
                    <span className="podium-sub-tag prominent-tag">
                      Best: {top1.highScore.toLocaleString()} • {top1.completedLevelsCount} Stages
                    </span>
                    <div className="podium-pillar pillar-1">
                      <span className="pillar-rank-text">1</span>
                    </div>
                  </div>
                )}

                {/* 3rd Place Pillar (Right) */}
                {top3 ? (
                  <div className="podium-col podium-bronze">
                    <div className="podium-avatar">
                      <Medal size={18} className="podium-icon bronze-icon" />
                    </div>
                    <span className="podium-player-name" title={top3.username}>
                      {top3.username}
                    </span>
                    <span className="podium-score">
                      {(top3.totalScore || top3.highScore).toLocaleString()} PTS
                    </span>
                    <span className="podium-sub-tag">
                      Best: {top3.highScore.toLocaleString()} • {top3.completedLevelsCount} Stages
                    </span>
                    <div className="podium-pillar pillar-3">
                      <span className="pillar-rank-text">3</span>
                    </div>
                  </div>
                ) : (
                  <div className="podium-col podium-empty" />
                )}
              </div>

              {/* Current User Standing Dock */}
              {currentUser ? (
                <div className="current-user-standing-dock">
                  <div className="standing-rank-col">
                    <span className="standing-label">YOUR RANK</span>
                    <span className="standing-rank-val">
                      {currentUserStats?.rank ? `#${currentUserStats.rank}` : 'UNRANKED'}
                    </span>
                  </div>

                  <div className="standing-info-col">
                    <div className="standing-name-row">
                      <span className="standing-username">{currentUser.username}</span>
                      <span className="standing-you-badge">YOU</span>
                    </div>
                    <span className="standing-note">
                      {currentUserStats?.highScore > 0
                        ? `${currentUserStats.highScore.toLocaleString()} Best PTS • ${currentUserStats.completedLevelsCount || 0} Stages Cleared`
                        : 'Play a game to register your official rank!'}
                    </span>
                  </div>

                  <div className="standing-score-col">
                    <span className="standing-score-label">CAREER PTS</span>
                    <span className="standing-score-val">
                      {(currentUserStats?.totalScore || currentUser.highScore || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              ) : (
                onOpenAuth && (
                  <div className="guest-cta-dock" onClick={onOpenAuth} role="button" tabIndex={0}>
                    <LogIn size={15} className="guest-cta-icon" />
                    <span>Sign in to record your scores & claim your official rank</span>
                  </div>
                )
              )}

              {/* Full Leaderboard Table */}
              <div className="leaderboard-table-container">
                <div className="table-header-row">
                  <span className="col-rank">RANK</span>
                  <span className="col-player">PLAYER</span>
                  <span className="col-stages">STAGES</span>
                  <span className="col-total">CAREER TOTAL</span>
                  <span className="col-score">HIGH SCORE</span>
                </div>

                <div className="table-body">
                  {leaderboard.map((player) => {
                    const isMe =
                      currentUsername &&
                      player.username.toLowerCase() === currentUsername.toLowerCase();
                    return (
                      <div
                        key={player.username}
                        className={`table-row ${isMe ? 'row-me-highlight' : ''}`}
                      >
                        <div className="col-rank">{getRankBadge(player.rank)}</div>

                        <div className="col-player">
                          <div className="player-avatar-circle" title={player.username}>
                            {player.username.charAt(0).toUpperCase()}
                          </div>
                          <span className="player-display-name">{player.username}</span>
                          {isMe && <span className="player-you-pill">YOU</span>}
                        </div>

                        <div className="col-stages">
                          <div className="stages-pill">
                            <Layers size={11} className="stages-icon" />
                            <span>{player.completedLevelsCount || 0}</span>
                          </div>
                        </div>

                        <div className="col-total">
                          <span className="total-score-text">
                            {(player.totalScore || player.highScore).toLocaleString()}
                          </span>
                        </div>

                        <div className="col-score">
                          <span className="high-score-val">
                            {player.highScore.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Ranking Rules Legend Note */}
              <div className="leaderboard-legend-card">
                <Info size={13} className="legend-info-icon" />
                <span className="legend-text">{rankingDescription}</span>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="leaderboard-footer">
          <div className="footer-status-pill">
            <Sparkles size={12} className="footer-sparkle" />
            <span>Verified Cloud Scores</span>
          </div>

          <button
            type="button"
            className="leaderboard-back-btn"
            onClick={onClose}
            autoFocus
          >
            Back to Game
          </button>
        </div>
      </div>
    </div>
  );
};
