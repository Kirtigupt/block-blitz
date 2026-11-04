const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '..', 'src', 'App.css');
let css = fs.readFileSync(cssPath, 'utf8');

const startMarker = '/* ==========================================================================\r\n   1. Header Navigation & Controls (Arcade Tactical HUD)\r\n   ========================================================================== */';
const startMarkerLF = '/* ==========================================================================\n   1. Header Navigation & Controls (Arcade Tactical HUD)\n   ========================================================================== */';

const endMarker = '/* ==========================================================================\r\n   4. Game Board (8x8 Grid)\r\n   ========================================================================== */';
const endMarkerLF = '/* ==========================================================================\n   4. Game Board (8x8 Grid)\n   ========================================================================== */';

const isCRLF = css.includes('\r\n');
const sMarker = isCRLF ? startMarker : startMarkerLF;
const eMarker = isCRLF ? endMarker : endMarkerLF;

const startIndex = css.indexOf(sMarker);
const endIndex = css.indexOf(eMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error('Markers not found! startIndex:', startIndex, 'endIndex:', endIndex);
  process.exit(1);
}

const replacement = `/* ==========================================================================
   1. Header Navigation & Controls (Arcade Tactical HUD - Redesigned)
   ========================================================================== */

.game-header,
.hud-gameplay-header {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: relative;
  z-index: 20;
}

/* Header Top Bar / Tactical Command Bar */
.header-top,
.hud-command-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 10px;
  background: linear-gradient(180deg, rgba(14, 22, 38, 0.94) 0%, rgba(8, 14, 26, 0.98) 100%);
  border: 1px solid rgba(56, 189, 248, 0.26);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(16px);
  border-radius: var(--radius-lg);
  padding: 4px 12px;
  box-sizing: border-box;
  max-height: 48px;
}

/* Brand Logo & Stage Crest Deck */
.header-brand-group,
.hud-brand-deck {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

/* Arcade Brand Plaque */
.logo-badge,
.hud-brand-plaque {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 10px 4px 6px;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%);
  border: 1.5px solid rgba(56, 189, 248, 0.3);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  user-select: none;
}

.logo-badge:hover,
.hud-brand-plaque:hover {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(14, 165, 233, 0.25) 100%);
  border-color: rgba(56, 189, 248, 0.6);
  box-shadow: 0 0 16px rgba(56, 189, 248, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.25);
  transform: translateY(-1px);
}

.hud-logo-gem,
.logo-icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 7px;
  background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
  border: 1px solid #7dd3fc;
  box-shadow: 0 0 10px rgba(14, 165, 233, 0.5);
  flex-shrink: 0;
}

.logo-spark-icon {
  color: #ffffff;
  filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.8));
}

.hud-brand-titles {
  display: flex;
  flex-direction: column;
  line-height: 1;
  gap: 2px;
}

.hud-brand-logotype {
  display: flex;
  align-items: baseline;
  gap: 2px;
  font-weight: 900;
  font-size: 1.15rem;
  letter-spacing: -0.4px;
}

.logo-text-block {
  color: #ffffff;
  font-weight: 900;
  letter-spacing: -0.5px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9);
}

.logo-text-blitz {
  color: #38bdf8;
  letter-spacing: 0.5px;
  font-weight: 900;
  text-shadow: 0 0 14px rgba(56, 189, 248, 0.7);
}

.hud-brand-subtag {
  font-size: 0.52rem;
  font-weight: 900;
  letter-spacing: 1.5px;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.28);
  border-radius: 3px;
  padding: 1px 4px;
  width: fit-content;
  text-transform: uppercase;
}

/* Stage Crest (Current Level Indicator) */
.level-badge-pill,
.hud-stage-crest {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.22) 0%, rgba(15, 23, 42, 0.95) 100%);
  border: 1.5px solid rgba(56, 189, 248, 0.45);
  box-shadow: 0 0 12px rgba(14, 165, 233, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15);
  color: #38bdf8;
  padding: 0 12px;
  min-height: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  white-space: nowrap;
  user-select: none;
}

.level-badge-pill:hover,
.hud-stage-crest:hover {
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.35) 0%, rgba(15, 23, 42, 0.98) 100%);
  border-color: #38bdf8;
  box-shadow: 0 0 18px rgba(56, 189, 248, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.25);
  transform: translateY(-1px);
}

.lvl-beacon-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #38bdf8;
  box-shadow: 0 0 8px #38bdf8;
  animation: beacon-pulse 1.8s infinite alternate ease-in-out;
  flex-shrink: 0;
}

@keyframes beacon-pulse {
  0% { transform: scale(0.85); opacity: 0.65; }
  100% { transform: scale(1.35); opacity: 1; box-shadow: 0 0 14px #38bdf8; }
}

.lvl-map-icon {
  color: #38bdf8;
  flex-shrink: 0;
}

.lvl-boss-icon {
  color: #fbbf24 !important;
}

.hud-stage-text-wrap {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.hud-stage-tiny-lbl {
  font-size: 0.58rem;
  font-weight: 800;
  letter-spacing: 1px;
  color: rgba(148, 163, 184, 0.9);
  text-transform: uppercase;
}

.lvl-num-text {
  font-weight: 900;
  font-size: 0.92rem;
  letter-spacing: 0.5px;
  color: #ffffff;
  font-variant-numeric: tabular-nums;
}

/* Header Actions & Tactical Tools Hub */
.header-actions,
.hud-actions-deck {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: nowrap;
}

.header-group-account,
.hud-account-slot {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
}

.header-tools-cluster,
.hud-tools-cluster {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.header-group-settings,
.hud-settings-group,
.header-group-stage,
.hud-stage-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* User Account & Auth Identity Pills */
.user-pill-btn,
.auth-cta-btn,
.hud-identity-pill {
  display: inline-flex;
  align-items: center;
  height: 36px;
  min-height: 36px;
  padding: 0 12px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  white-space: nowrap;
  user-select: none;
}

.user-pill-btn {
  gap: 7px;
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.75) 0%, rgba(15, 23, 42, 0.9) 100%);
  border: 1px solid rgba(56, 189, 248, 0.3);
  color: var(--text-secondary);
  font-size: 0.76rem;
  font-weight: 700;
  max-width: 130px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-pill-btn:hover {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(14, 165, 233, 0.25) 100%);
  color: #ffffff;
  border-color: rgba(56, 189, 248, 0.55);
  box-shadow: 0 0 12px rgba(56, 189, 248, 0.3);
}

.hud-avatar-dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(56, 189, 248, 0.2);
  border: 1px solid rgba(56, 189, 248, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #38bdf8;
  flex-shrink: 0;
}

.user-pill-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.auth-cta-btn {
  gap: 6px;
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.22) 0%, rgba(6, 182, 212, 0.14) 100%);
  border: 1.5px solid rgba(56, 189, 248, 0.45);
  color: #38bdf8;
  font-size: 0.76rem;
  font-weight: 800;
  box-shadow: 0 0 10px rgba(14, 165, 233, 0.18);
}

.auth-cta-btn:hover {
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.38) 0%, rgba(6, 182, 212, 0.28) 100%);
  border-color: #38bdf8;
  color: #ffffff;
  box-shadow: 0 0 16px rgba(56, 189, 248, 0.4);
  transform: translateY(-1px);
}

.hud-login-icon {
  color: #38bdf8;
  flex-shrink: 0;
}

/* Tactical Icon Buttons */
.action-btn,
.hud-icon-btn {
  background: linear-gradient(180deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.88) 100%);
  border: 1px solid rgba(148, 163, 184, 0.22);
  color: var(--text-secondary);
  width: 36px;
  height: 36px;
  min-width: 36px;
  min-height: 36px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.action-btn:hover,
.hud-icon-btn:hover {
  background: linear-gradient(180deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%);
  color: #ffffff;
  border-color: rgba(56, 189, 248, 0.45);
  box-shadow: 0 0 12px rgba(56, 189, 248, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.18);
  transform: translateY(-1px);
}

.action-btn:active,
.hud-icon-btn:active {
  transform: translateY(0);
}

/* Leaderboard Crown Button */
.action-btn.leaderboard-btn,
.crown-glow {
  border-color: rgba(251, 191, 36, 0.35);
  color: #fbbf24;
}

.action-btn.leaderboard-btn:hover,
.crown-glow:hover {
  background: linear-gradient(180deg, rgba(251, 191, 36, 0.25) 0%, rgba(15, 23, 42, 0.95) 100%);
  color: #fde047;
  border-color: #fbbf24;
  box-shadow: 0 0 14px rgba(251, 191, 36, 0.45);
}

/* Restart Button */
.action-btn.restart-btn,
.restart-glow:hover {
  color: #38bdf8;
  border-color: rgba(56, 189, 248, 0.45);
  box-shadow: 0 0 12px rgba(56, 189, 248, 0.35);
}

/* Exit Button */
.action-btn.exit-btn,
.exit-glow:hover {
  color: #f43f5e;
  border-color: rgba(244, 63, 94, 0.5);
  background: rgba(244, 63, 94, 0.18);
  box-shadow: 0 0 14px rgba(244, 63, 94, 0.4);
}

/* Muted Audio States */
.action-btn.btn-muted {
  color: var(--text-muted);
  opacity: 0.65;
}

.action-btn.btn-muted:hover {
  color: var(--accent-rose);
  border-color: rgba(244, 63, 94, 0.4);
  opacity: 1;
}

/* Control Divider */
.header-control-divider,
.hud-control-divider {
  width: 1px;
  height: 20px;
  background: linear-gradient(180deg, transparent 0%, rgba(56, 189, 248, 0.35) 50%, transparent 100%);
  margin: 0 2px;
  flex-shrink: 0;
}

/* ==========================================================================
   2. Cockpit Statistics Dashboard (Engaging Gaming Scoreboard Console)
   ========================================================================== */

.score-board,
.hud-stats-chassis {
  width: 100%;
  background: linear-gradient(180deg, rgba(14, 22, 38, 0.92) 0%, rgba(8, 13, 25, 0.97) 100%);
  border: 1px solid rgba(56, 189, 248, 0.22);
  backdrop-filter: blur(16px);
  border-radius: var(--radius-lg);
  padding: 8px 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  box-shadow: 0 6px 22px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08);
  box-sizing: border-box;
}

/* Stat Bays */
.hud-stat-bay {
  display: flex;
  flex-direction: column;
}

/* Bay 1: Primary Current Score Hero */
.score-primary-section,
.bay-score {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.hud-bay-label-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
}

.score-label,
.hud-bay-label {
  font-size: 0.64rem;
  font-weight: 800;
  letter-spacing: 1.2px;
  color: rgba(148, 163, 184, 0.9);
  text-transform: uppercase;
}

.hud-live-tag {
  font-size: 0.52rem;
  font-weight: 900;
  letter-spacing: 0.8px;
  color: #4ade80;
  background: rgba(34, 197, 94, 0.16);
  border: 1px solid rgba(34, 197, 94, 0.4);
  border-radius: 4px;
  padding: 0 4px;
  line-height: 1.2;
}

.score-value,
.hud-score-digits {
  font-size: 2.2rem;
  font-weight: 900;
  color: #ffffff;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
  display: inline-block;
  transition: transform 0.15s ease;
  text-shadow: 0 0 18px rgba(56, 189, 248, 0.4), 0 2px 6px rgba(0, 0, 0, 0.8);
}

.score-value.score-bump {
  animation: score-micro-bump 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes score-micro-bump {
  0% { transform: scale(1); }
  50% { transform: scale(1.08); color: #38bdf8; text-shadow: 0 0 16px rgba(56, 189, 248, 0.9); }
  100% { transform: scale(1); }
}

/* Cockpit Divider */
.score-deck-divider,
.hud-deck-divider {
  width: 1px;
  height: 36px;
  background: linear-gradient(180deg, transparent 0%, rgba(56, 189, 248, 0.35) 50%, transparent 100%);
  flex-shrink: 0;
}

/* Bay 2: Best Record */
.score-secondary-item.best-score-box,
.bay-best {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.score-secondary-header {
  display: flex;
  align-items: center;
  gap: 5px;
}

.secondary-label {
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.8px;
  color: rgba(148, 163, 184, 0.85);
  text-transform: uppercase;
}

.secondary-value,
.hud-best-digits {
  font-size: 1.25rem;
  font-weight: 900;
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
  color: #fbbf24;
  text-shadow: 0 0 10px rgba(251, 191, 36, 0.35);
}

.trophy-gold {
  color: #fbbf24;
  filter: drop-shadow(0 0 4px rgba(251, 191, 36, 0.5));
}

/* Bay 3: Dynamic Streak Engine */
.score-secondary-item.streak-indicator,
.bay-streak {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 3px 12px;
  border-radius: var(--radius-sm);
  transition: all 0.22s ease;
  min-width: 64px;
}

.streak-indicator.streak-idle {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(148, 163, 184, 0.16);
}

.streak-indicator.streak-idle .secondary-label,
.streak-indicator.streak-idle .streak-val,
.streak-indicator.streak-idle .hud-streak-digits {
  color: var(--text-dim);
}

.streak-indicator.streak-active {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(15, 23, 42, 0.85) 100%);
  border: 1px solid rgba(245, 158, 11, 0.45);
  box-shadow: 0 0 12px rgba(245, 158, 11, 0.25);
}

.streak-indicator.streak-active .secondary-label,
.streak-indicator.streak-active .streak-val,
.streak-indicator.streak-active .hud-streak-digits {
  color: #fbbf24;
  text-shadow: 0 0 6px rgba(251, 191, 36, 0.5);
}

.streak-indicator.streak-fire {
  background: linear-gradient(135deg, rgba(244, 63, 94, 0.25) 0%, rgba(15, 23, 42, 0.85) 100%);
  border: 1px solid rgba(244, 63, 94, 0.55);
  box-shadow: 0 0 16px rgba(244, 63, 94, 0.4);
  animation: fire-pulse 1.6s infinite alternate ease-in-out;
}

@keyframes fire-pulse {
  0% { box-shadow: 0 0 8px rgba(244, 63, 94, 0.25); }
  100% { box-shadow: 0 0 18px rgba(244, 63, 94, 0.6); }
}

.streak-indicator.streak-fire .secondary-label,
.streak-indicator.streak-fire .streak-val,
.streak-indicator.streak-fire .hud-streak-digits {
  color: #f43f5e;
  text-shadow: 0 0 8px rgba(244, 63, 94, 0.6);
}

.streak-val,
.hud-streak-digits {
  font-size: 1.05rem;
  font-weight: 900;
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
}

.flame-gold {
  color: #f59e0b;
  filter: drop-shadow(0 0 4px #f59e0b);
}

.flame-idle {
  color: var(--text-dim);
}

.flame-fire {
  color: #f43f5e;
  filter: drop-shadow(0 0 6px #f43f5e);
}

/* ==========================================================================
   3. Active Mission Tracker Bar (Level Objectives Tactical HUD)
   ========================================================================== */

.level-objective-panel,
.hud-mission-chassis {
  width: 100%;
  background: linear-gradient(180deg, rgba(14, 22, 38, 0.92) 0%, rgba(8, 13, 25, 0.97) 100%);
  border: 1px solid rgba(56, 189, 248, 0.25);
  backdrop-filter: blur(16px);
  border-radius: var(--radius-lg);
  padding: 10px 16px 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 6px 22px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08);
  box-sizing: border-box;
}

/* Row 1: Identity & Chapter Meta */
.objective-meta-row,
.hud-mission-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.objective-title-group,
.hud-mission-title-group {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  overflow: hidden;
}

.hud-mission-badge {
  font-size: 0.64rem;
  font-weight: 900;
  color: #38bdf8;
  background: rgba(14, 165, 233, 0.2);
  border: 1px solid rgba(56, 189, 248, 0.45);
  border-radius: 4px;
  padding: 1.5px 6px;
  white-space: nowrap;
  letter-spacing: 0.5px;
}

.hud-mission-badge.badge-boss {
  background: rgba(245, 158, 11, 0.25) !important;
  border-color: #facc15 !important;
  color: #fde047 !important;
  box-shadow: 0 0 10px rgba(250, 204, 21, 0.4) !important;
}

.objective-level-name,
.hud-mission-name {
  font-size: 0.88rem;
  font-weight: 800;
  color: #ffffff;
  white-space: nowrap;
  letter-spacing: 0.2px;
}

.objective-chapter-badge,
.hud-chapter-badge {
  font-size: 0.68rem;
  font-weight: 700;
  color: rgba(226, 232, 240, 0.8);
  background: rgba(30, 41, 59, 0.7);
  border: 1px solid rgba(148, 163, 184, 0.25);
  border-radius: var(--radius-sm);
  padding: 1.5px 7px;
  white-space: nowrap;
}

.objective-pattern-tag,
.hud-pattern-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.68rem;
  font-weight: 800;
  color: #fbbf24;
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.45);
  border-radius: var(--radius-sm);
  padding: 1.5px 7px;
  white-space: nowrap;
  text-transform: capitalize;
}

.hud-pattern-gem {
  color: #fbbf24;
  font-size: 0.72rem;
}

/* Row 2: Mission Task & Target Counter */
.objective-task-row,
.hud-mission-directive-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.objective-desc-wrap,
.hud-mission-instruction {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
  flex: 1;
}

.hud-mission-icon-socket {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  background: rgba(15, 23, 42, 0.85);
  border: 1.5px solid var(--socket-accent, #38bdf8);
  box-shadow: 0 0 10px rgba(56, 189, 248, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.objective-icon {
  flex-shrink: 0;
}

.objective-task-desc,
.hud-instruction-text {
  font-size: 0.86rem;
  font-weight: 700;
  color: #f1f5f9;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  letter-spacing: 0.01em;
}

/* Target Counter */
.objective-progress-numbers,
.hud-progress-digital-badge {
  display: flex;
  align-items: baseline;
  gap: 3px;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
  font-size: 0.88rem;
  font-weight: 900;
  background: rgba(15, 23, 42, 0.7);
  border: 1.5px solid rgba(56, 189, 248, 0.3);
  border-radius: 6px;
  padding: 3px 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
}

.objective-type-prefix {
  font-size: 0.7rem;
  font-weight: 800;
  color: rgba(148, 163, 184, 0.9);
  text-transform: uppercase;
  margin-right: 4px;
}

.current-progress-val {
  color: #38bdf8;
  font-weight: 900;
  font-size: 0.92rem;
}

.progress-divider {
  color: rgba(148, 163, 184, 0.6);
  margin: 0 1px;
}

.target-progress-val {
  color: #ffffff;
  font-weight: 900;
  font-size: 0.92rem;
}

.progress-remaining-tag {
  font-size: 0.7rem;
  font-weight: 800;
  color: #fbbf24;
  background: rgba(245, 158, 11, 0.16);
  border: 1px solid rgba(245, 158, 11, 0.38);
  border-radius: 4px;
  padding: 1px 6px;
  margin-left: 6px;
  white-space: nowrap;
}

/* Row 3: Smooth Precision Energy Conduit */
.objective-progress-track,
.hud-energy-track {
  width: 100%;
  height: 6px;
  background: rgba(8, 14, 28, 0.9);
  border: 1px solid rgba(56, 189, 248, 0.25);
  border-radius: var(--radius-full);
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.6);
  position: relative;
}

.objective-progress-fill,
.hud-energy-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 0 12px rgba(56, 189, 248, 0.6);
  position: relative;
}

.progress-fill-glow-head,
.hud-conduit-spark {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 6px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 0 6px #ffffff, 0 0 10px #38bdf8;
}
`;

const newCss = css.slice(0, startIndex) + (isCRLF ? replacement.replace(/\n/g, '\r\n') : replacement) + '\r\n\r\n' + css.slice(endIndex);
fs.writeFileSync(cssPath, newCss, 'utf8');
console.log('Successfully updated App.css with redesigned Gameplay Header, Scoreboard, and Objective Panel!');
