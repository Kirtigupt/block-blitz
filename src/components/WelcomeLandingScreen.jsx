import React, { useEffect } from 'react';
import {
  Play,
  ArrowRight,
  Flame,
  ArrowLeftRight
} from 'lucide-react';
import { BLOCK_PALETTE } from '../constants/blocks';

// 6x6 visual game preview showing an exciting mid-game state with combo & ghost piece
const PREVIEW_GRID = [
  [null, null, null, null, null, null],
  [null, 'cyan', 'cyan', null, null, null],
  [null, 'cyan', 'cyan', null, 'purple', null],
  [null, null, null, 'purple', 'purple', 'purple'],
  ['amber', 'amber', null, 'amber', 'amber', 'amber'],
  ['rose', 'rose', 'ghost', 'emerald', 'emerald', 'emerald']
];

// Mini tray pieces ready to place
const PREVIEW_TRAY_PIECES = [
  { id: 'p1', colorKey: 'cyan', matrix: [[1], [1]] },
  { id: 'p2', colorKey: 'emerald', matrix: [[1, 1], [1, 1]] },
  { id: 'p3', colorKey: 'purple', matrix: [[1, 0], [1, 1]] }
];

export const WelcomeLandingScreen = ({
  user = null,
  onPlayNow,
  onOpenAuth,
  onSwitchAccount
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        onPlayNow();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPlayNow]);

  return (
    <div
      className="welcome-landing-screen"
      role="region"
      aria-label="Welcome to BLOCK BLITZ"
    >
      {/* Background Floating Decorative Geometric Shapes */}
      <div className="welcome-bg-glow welcome-bg-glow-top" aria-hidden="true" />
      <div className="welcome-bg-glow welcome-bg-glow-bottom" aria-hidden="true" />
      <div className="welcome-bg-grid-overlay" aria-hidden="true" />

      {/* Floating Ambient Blocks */}
      <div className="welcome-floating-shapes" aria-hidden="true">
        <div className="floating-piece float-1">
          <div className="fp-cell cyan" />
          <div className="fp-cell cyan" />
          <div className="fp-cell cyan" />
          <div className="fp-cell cyan" />
        </div>
        <div className="floating-piece float-2">
          <div className="fp-cell purple" />
          <div className="fp-cell purple" />
          <div className="fp-cell purple" />
        </div>
        <div className="floating-piece float-3">
          <div className="fp-cell amber" />
          <div className="fp-cell amber" />
          <div className="fp-cell amber" />
          <div className="fp-cell amber" />
        </div>
        <div className="floating-piece float-4">
          <div className="fp-cell rose" />
          <div className="fp-cell rose" />
        </div>
      </div>

      {/* Main Arcade Stage Container */}
      <div className="welcome-arcade-container">
        {/* Hero Branding */}
        <header className="welcome-hero-header">
          <h1 className="welcome-landing-game-title">BLOCK BLITZ</h1>
          <p className="welcome-tagline">Think Fast. Place Smart. Beat Every Level.</p>
        </header>

        {/* Interactive / Visual Game Preview */}
        <div className="welcome-preview-showcase" aria-label="Game Preview Showcase">
          <div className="preview-board-frame">
            {/* Combo notification pill above board */}
            <div className="preview-combo-badge">
              <Flame size={13} className="combo-flame-icon" />
              <span>2x COMBO</span>
              <span className="combo-points">+480 PTS</span>
            </div>

            {/* 6x6 Mini Preview Grid */}
            <div className="preview-grid-matrix">
              {PREVIEW_GRID.map((row, rIdx) => (
                <div key={`row-${rIdx}`} className="preview-grid-row">
                  {row.map((cellKey, cIdx) => {
                    const isGhost = cellKey === 'ghost';
                    const isFilled = cellKey && !isGhost;
                    const palette = isFilled ? BLOCK_PALETTE[cellKey] : null;

                    return (
                      <div
                        key={`cell-${rIdx}-${cIdx}`}
                        className={`preview-cell ${isFilled ? 'filled' : ''} ${isGhost ? 'ghost-cell' : ''} ${rIdx === 5 ? 'line-clearing-ready' : ''}`}
                        style={
                          isFilled && palette
                            ? {
                                background: palette.gradient,
                                borderColor: palette.border,
                                boxShadow: `0 0 10px ${palette.glow}, inset 0 1px 2px rgba(255,255,255,0.4)`
                              }
                            : {}
                        }
                      >
                        {isGhost && <div className="ghost-crosshair" />}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Mini Block Tray Preview */}
            <div className="preview-tray-bar">
              <span className="tray-label">PIECES IN TRAY</span>
              <div className="preview-tray-pieces">
                {PREVIEW_TRAY_PIECES.map((piece) => {
                  const palette = BLOCK_PALETTE[piece.colorKey];
                  return (
                    <div key={piece.id} className="preview-tray-piece">
                      <div
                        className="tray-piece-matrix"
                        style={{
                          gridTemplateRows: `repeat(${piece.matrix.length}, 1fr)`,
                          gridTemplateColumns: `repeat(${piece.matrix[0].length}, 1fr)`
                        }}
                      >
                        {piece.matrix.map((row, r) =>
                          row.map((val, c) => (
                            <div
                              key={`${r}-${c}`}
                              className={`tray-mini-cell ${val === 1 ? 'filled' : ''}`}
                              style={
                                val === 1
                                  ? {
                                      background: palette.gradient,
                                      borderColor: palette.border
                                    }
                                  : {}
                              }
                            />
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Primary Action Button: Prominent PLAY NOW */}
        <div className="welcome-cta-zone">
          <button
            type="button"
            className="welcome-play-now-btn"
            onClick={onPlayNow}
            autoFocus
            aria-label="Play Now: Start Block Blitz Campaign"
          >
            <Play size={22} fill="currentColor" />
            <span>PLAY NOW</span>
            <ArrowRight size={20} className="arrow-pulse" />
          </button>

          {/* Authentication-Based Context Subtext */}
          <div className="welcome-auth-footer">
            {user ? (
              <div className="welcome-logged-in-container">
                <p className="welcome-auth-subtext auth-logged-in">
                  Welcome back, <span className="welcome-user-highlight">{user.username}</span>!
                </p>
                <button
                  type="button"
                  className="welcome-switch-account-btn"
                  onClick={onSwitchAccount}
                  aria-label="Switch to another account"
                >
                  <ArrowLeftRight size={12} className="switch-account-icon" />
                  <span>Switch Account</span>
                </button>
              </div>
            ) : (
              <p className="welcome-auth-subtext auth-logged-out">
                Already have an account?{' '}
                <button
                  type="button"
                  className="welcome-signin-link-btn welcome-signin-btn"
                  onClick={onOpenAuth}
                  aria-label="Sign in to your account"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
