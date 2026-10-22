import React, { useState, useEffect } from 'react';
import { X, User, Trophy, Zap, Gamepad2, LogOut, Clock, Flame, Award, Loader2 } from 'lucide-react';
import { apiGetMyStats, apiGetMyHistory } from '../utils/api';

export const PlayerProfileModal = ({ user, onClose, onLogout }) => {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadProfileData = async () => {
      try {
        const [statsRes, historyRes] = await Promise.all([
          apiGetMyStats().catch(() => null),
          apiGetMyHistory().catch(() => null)
        ]);

        if (isMounted) {
          if (statsRes?.stats) setStats(statsRes.stats);
          if (historyRes?.games) setHistory(historyRes.games);
        }
      } catch (err) {
        console.error('Failed to load profile data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProfileData();

    return () => {
      isMounted = false;
    };
  }, []);

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="profile-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-row">
          <div className="profile-header-user">
            <div className="profile-avatar-circle">
              <User size={24} />
            </div>
            <div>
              <h3>{user?.username || 'Player'}</h3>
              <span className="profile-email-tag">{user?.email || 'Logged In'}</span>
            </div>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="profile-loading-box">
            <Loader2 size={32} className="spinning-icon" />
            <p>Loading stats & history...</p>
          </div>
        ) : (
          <div className="profile-body">
            {/* Career Stats Grid */}
            <div className="profile-stats-grid">
              <div className="profile-stat-box">
                <div className="stat-label-row">
                  <Trophy size={14} className="trophy-icon" />
                  <span>High Score</span>
                </div>
                <span className="profile-stat-value gold">
                  {(stats?.highScore ?? user?.highScore ?? 0).toLocaleString()}
                </span>
              </div>

              <div className="profile-stat-box">
                <div className="stat-label-row">
                  <Gamepad2 size={14} />
                  <span>Games</span>
                </div>
                <span className="profile-stat-value">
                  {stats?.totalGamesPlayed ?? user?.totalGamesPlayed ?? 0}
                </span>
              </div>

              <div className="profile-stat-box">
                <div className="stat-label-row">
                  <Zap size={14} className="zap-icon" />
                  <span>Lines Cleared</span>
                </div>
                <span className="profile-stat-value">
                  {stats?.totalLinesCleared ?? user?.totalLinesCleared ?? 0}
                </span>
              </div>
            </div>

            {/* Game History List */}
            <div className="history-section">
              <div className="history-section-header">
                <Clock size={16} />
                <h4>Recent Games</h4>
              </div>

              {history.length === 0 ? (
                <div className="empty-history-box">
                  <p>No games played yet on this account.</p>
                  <span>Play a match to see your history here!</span>
                </div>
              ) : (
                <div className="history-list-scroll">
                  {history.map((game) => (
                    <div key={game._id} className="history-item-row">
                      <div className="history-left">
                        <span className="history-score">{game.score.toLocaleString()} pts</span>
                        {game.isNewHighScore && (
                          <span className="new-best-pill">
                            <Award size={12} /> BEST
                          </span>
                        )}
                        <span className="history-date">{formatDate(game.playedAt)}</span>
                      </div>

                      <div className="history-right">
                        <div className="history-stat-tag">
                          <Zap size={12} />
                          <span>{game.linesCleared} lines</span>
                        </div>
                        {game.maxStreak > 1 && (
                          <div className="history-stat-tag streak">
                            <Flame size={12} />
                            <span>x{game.maxStreak}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="profile-footer">
          <button className="logout-btn" onClick={onLogout}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
