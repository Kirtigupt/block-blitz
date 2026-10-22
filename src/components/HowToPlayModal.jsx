import React from 'react';
import { X, CheckCircle2, Zap, Flame, RotateCcw } from 'lucide-react';

export const HowToPlayModal = ({ onClose }) => {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="how-to-play-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-row">
          <h3>How to Play BLOCK BLITZ</h3>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="rules-list">
          <div className="rule-item">
            <div className="rule-icon-box">
              <CheckCircle2 size={18} className="rule-icon cyan" />
            </div>
            <div className="rule-content">
              <strong>Select & Place</strong>
              <p>Click on one of the three blocks below, then click any grid cell to place it. You can also drag and drop blocks directly!</p>
            </div>
          </div>

          <div className="rule-item">
            <div className="rule-icon-box">
              <Zap size={18} className="rule-icon purple" />
            </div>
            <div className="rule-content">
              <strong>Clear Lines</strong>
              <p>Fill complete horizontal rows or vertical columns to clear them and score big points.</p>
            </div>
          </div>

          <div className="rule-item">
            <div className="rule-icon-box">
              <Flame size={18} className="rule-icon amber" />
            </div>
            <div className="rule-content">
              <strong>Combos & Streaks</strong>
              <p>Clear multiple rows/columns simultaneously or clear lines on consecutive turns to multiply your score.</p>
            </div>
          </div>

          <div className="rule-item">
            <div className="rule-icon-box">
              <RotateCcw size={18} className="rule-icon pink" />
            </div>
            <div className="rule-content">
              <strong>End of Game</strong>
              <p>The game ends when none of the remaining blocks can fit anywhere on the 8x8 grid. Think ahead and manage your space!</p>
            </div>
          </div>
        </div>

        <button className="got-it-btn" onClick={onClose}>
          LET'S PLAY
        </button>
      </div>
    </div>
  );
};
