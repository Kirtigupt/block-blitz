const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '..', 'src', 'App.css');
let css = fs.readFileSync(cssPath, 'utf8');

const idx1 = css.indexOf('1. Header Navigation & Controls');
const idx2 = css.indexOf('Game Board (8x8 Grid)');

if (idx1 === -1 || idx2 === -1) {
  console.error('Could not find markers in App.css', { idx1, idx2 });
  process.exit(1);
}

const actualStartIndex = css.lastIndexOf('/* ===', idx1);
const actualEndIndex = css.lastIndexOf('/* ===', idx2);

console.log('Replacing from', actualStartIndex, 'to', actualEndIndex);

const newHudSection = `/* ==========================================================================
   1. TOP NAVIGATION COMMAND BAR (Redesigned Gaming Navigation)
   ========================================================================== */

.game-header,
.hud-gameplay-header {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
  z-index: 20;
}

/* 1.1 Header Top Bar / Tactical Command Bar */
.header-top,
.hud-command-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 8px;
  background: linear-gradient(180deg, rgba(13, 20, 36, 0.94) 0%, rgba(8, 12, 22, 0.98) 100%);
  border: 1px solid rgba(56, 189, 248, 0.2);
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 14px;
  padding: 4px 10px;
  box-sizing: border-box;
  min-height: 44px;
  max-height: 48px;
}

/* Nav Left: Logo & Stage Waypoint */
.hud-nav-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.hud-brand-anchor {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 8px;
  transition: all 0.2s ease;
  user-select: none;
}

.hud-brand-anchor:hover {
  filter: brightness(1.15);
  transform: translateY(-1px);
}

.brand-gem-insignia {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
  border: 1px solid #7dd3fc;
  box-shadow: 0 0 8px rgba(14, 165, 233, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.brand-zap-icon {
  color: #ffffff;
  filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.8));
}

.brand-logotype-wrap {
  display: flex;
  align-items: baseline;
  gap: 2px;
  font-weight: 900;
  font-size: 1.05rem;
  line-height: 1;
  letter-spacing: -0.4px;
}

.brand-word-block {
  color: #ffffff;
  font-weight: 900;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}

.brand-word-blitz {
  color: #38bdf8;
  font-weight: 900;
  text-shadow: 0 0 12px rgba(56, 189, 248, 0.7);
}

/* Current Stage Waypoint Chip */
.hud-waypoint-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 9px;
  height: 28px;
  border-radius: 9999px;
  cursor: pointer;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  white-space: nowrap;
  user-select: none;
}

.hud-waypoint-chip.chip-standard {
  background: rgba(14, 165, 233, 0.15);
  border: 1px solid rgba(56, 189, 248, 0.35);
  color: #38bdf8;
  box-shadow: 0 0 10px rgba(14, 165, 233, 0.2);
}

.hud-waypoint-chip.chip-boss {
  background: rgba(245, 158, 11, 0.18);
  border: 1px solid rgba(250, 204, 21, 0.55);
  color: #facc15;
  box-shadow: 0 0 12px rgba(250, 204, 21, 0.35);
}

.hud-waypoint-chip:hover {
  transform: translateY(-1px);
  filter: brightness(1.15);
  box-shadow: 0 0 14px rgba(56, 189, 248, 0.4);
}

.waypoint-radar-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #38bdf8;
  box-shadow: 0 0 6px #38bdf8;
  animation: radar-dot-pulse 1.8s infinite alternate ease-in-out;
}

@keyframes radar-dot-pulse {
  0% { transform: scale(0.8); opacity: 0.6; }
  100% { transform: scale(1.3); opacity: 1; box-shadow: 0 0 10px #38bdf8; }
}

.waypoint-icon.boss-crown {
  color: #fbbf24;
}

.waypoint-stage-tag {
  font-variant-numeric: tabular-nums;
}

/* Nav Right: Account & Controls Hub */
.hud-nav-right {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

/* Identity zone */
.hud-identity-zone {
  display: flex;
  align-items: center;
}

.hud-profile-pill,
.hud-signin-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 28px;
  padding: 0 10px;
  border-radius: 7px;
  font-size: 0.72rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.hud-profile-pill {
  background: rgba(30, 41, 59, 0.65);
  border: 1px solid rgba(56, 189, 248, 0.25);
  color: #cbd5e1;
  max-width: 120px;
}

.hud-profile-pill:hover {
  background: rgba(51, 65, 85, 0.8);
  border-color: rgba(56, 189, 248, 0.5);
  color: #ffffff;
}

.profile-avatar-circle {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: rgba(56, 189, 248, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #38bdf8;
}

.profile-username {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hud-signin-pill {
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.2) 0%, rgba(6, 182, 212, 0.15) 100%);
  border: 1px solid rgba(56, 189, 248, 0.4);
  color: #38bdf8;
}

.hud-signin-pill:hover {
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.35) 0%, rgba(6, 182, 212, 0.25) 100%);
  border-color: #38bdf8;
  color: #ffffff;
  box-shadow: 0 0 10px rgba(56, 189, 248, 0.3);
  transform: translateY(-1px);
}

/* Distinct Action Control Pods */
.hud-control-pod {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Tactile Soft-Capsule Buttons */
.hud-tactile-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.09);
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.16s cubic-bezier(0.16, 1, 0.3, 1);
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.hud-tactile-btn:hover {
  background: rgba(255, 255, 255, 0.09);
  color: #ffffff;
  transform: translateY(-1px);
}

.hud-tactile-btn:active {
  transform: translateY(1px);
  box-shadow: none;
}

.hud-btn-leaderboard {
  color: #fbbf24;
}

.hud-btn-leaderboard:hover {
  border-color: rgba(250, 204, 21, 0.5);
  background: rgba(250, 204, 21, 0.14);
  box-shadow: 0 0 10px rgba(250, 204, 21, 0.35);
}

.hud-btn-audio.is-muted {
  color: #64748b;
  opacity: 0.6;
}

.hud-btn-audio:not(.is-muted) {
  color: #38bdf8;
}

.hud-btn-restart {
  color: #38bdf8;
}

.hud-btn-restart:hover {
  border-color: rgba(56, 189, 248, 0.5);
  background: rgba(56, 189, 248, 0.14);
  box-shadow: 0 0 10px rgba(56, 189, 248, 0.35);
}

.hud-btn-exit {
  color: #f43f5e;
}

.hud-btn-exit:hover {
  border-color: rgba(244, 63, 94, 0.5);
  background: rgba(244, 63, 94, 0.14);
  box-shadow: 0 0 10px rgba(244, 63, 94, 0.35);
}

/* Micro Vertical Light Divider */
.hud-v-divider {
  width: 1px;
  height: 18px;
  background: linear-gradient(180deg, transparent 0%, rgba(56, 189, 248, 0.3) 50%, transparent 100%);
  margin: 0 2px;
  flex-shrink: 0;
}


/* ==========================================================================
   2. REIMAGINED HERO SCOREBOARD TELEMETRY CONSOLE
   ========================================================================== */

.score-board,
.hero-scoreboard-console {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 14px;
  background: linear-gradient(135deg, rgba(13, 20, 36, 0.94) 0%, rgba(8, 12, 22, 0.98) 100%);
  border: 1px solid rgba(56, 189, 248, 0.2);
  border-radius: 14px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-sizing: border-box;
  min-height: 50px;
}

/* Left Wing: Hero Current Score Anchor */
.hero-score-anchor {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
}

.hero-score-subhead {
  display: flex;
  align-items: center;
  gap: 5px;
}

.score-live-beacon {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 6px #22c55e;
}

.score-label-text {
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: #38bdf8;
  text-transform: uppercase;
}

.hero-score-number {
  font-size: 2.1rem;
  font-weight: 900;
  line-height: 1;
  color: #ffffff;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
  text-shadow: 0 0 16px rgba(56, 189, 248, 0.35), 0 2px 4px rgba(0, 0, 0, 0.7);
  transition: transform 0.15s ease;
}

.hero-score-number.score-pulse {
  animation: hero-score-pulse-anim 0.24s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes hero-score-pulse-anim {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); color: #38bdf8; text-shadow: 0 0 20px rgba(56, 189, 248, 0.8); }
  100% { transform: scale(1); }
}

/* Right Wing: Secondary Telemetry Anchor */
.secondary-telemetry-anchor {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.telemetry-pill {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  padding: 3px 10px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.07);
  min-width: 68px;
  box-sizing: border-box;
}

.telemetry-pill-head {
  display: flex;
  align-items: center;
  gap: 4px;
}

.telemetry-pill-lbl {
  font-size: 0.58rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #94a3b8;
  text-transform: uppercase;
}

.telemetry-pill-val {
  font-size: 1.05rem;
  font-weight: 800;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}

.telemetry-pill-val.gold-num {
  color: #fbbf24;
  text-shadow: 0 0 8px rgba(251, 191, 36, 0.3);
}

.icon-best-gold {
  color: #fbbf24;
}

/* Streak Reactor States */
.streak-reactor-pill.reactor-idle {
  opacity: 0.65;
}

.streak-reactor-pill.reactor-idle .streak-num {
  color: #64748b;
}

.streak-reactor-pill.reactor-active {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.16) 0%, rgba(15, 23, 42, 0.85) 100%);
  border-color: rgba(245, 158, 11, 0.45);
  box-shadow: 0 0 10px rgba(245, 158, 11, 0.25);
}

.streak-reactor-pill.reactor-active .streak-num {
  color: #fbbf24;
  text-shadow: 0 0 8px rgba(251, 191, 36, 0.5);
}

.streak-reactor-pill.reactor-hyper {
  background: linear-gradient(135deg, rgba(244, 63, 94, 0.22) 0%, rgba(15, 23, 42, 0.85) 100%);
  border-color: rgba(244, 63, 94, 0.55);
  box-shadow: 0 0 14px rgba(244, 63, 94, 0.35);
  animation: streak-hyper-pulse 1.6s infinite alternate ease-in-out;
}

@keyframes streak-hyper-pulse {
  0% { box-shadow: 0 0 8px rgba(244, 63, 94, 0.25); }
  100% { box-shadow: 0 0 16px rgba(244, 63, 94, 0.55); }
}

.streak-reactor-pill.reactor-hyper .streak-num {
  color: #f43f5e;
  text-shadow: 0 0 10px rgba(244, 63, 94, 0.6);
}

.icon-streak.flame-active {
  color: #f59e0b;
}

.icon-streak.flame-hyper {
  color: #f43f5e;
}

.icon-streak.flame-idle {
  color: #64748b;
}


/* ==========================================================================
   3. REIMAGINED MISSION-CONTROL OBJECTIVE HUD
   ========================================================================== */

.level-objective-panel,
.mission-control-hud {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 14px 6px;
  background: linear-gradient(180deg, rgba(13, 20, 36, 0.94) 0%, rgba(8, 12, 22, 0.98) 100%);
  border: 1px solid rgba(56, 189, 248, 0.2);
  border-radius: 14px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
}

/* Row 1: Taxonomy Header Strip */
.mission-taxonomy-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.taxonomy-left {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  overflow: hidden;
}

.taxonomy-stage-badge {
  font-size: 0.6rem;
  font-weight: 900;
  color: #38bdf8;
  background: rgba(14, 165, 233, 0.15);
  border: 1px solid rgba(56, 189, 248, 0.35);
  border-radius: 4px;
  padding: 1px 5px;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.taxonomy-stage-badge.badge-boss {
  color: #facc15;
  background: rgba(245, 158, 11, 0.2);
  border-color: rgba(250, 204, 21, 0.5);
  box-shadow: 0 0 8px rgba(250, 204, 21, 0.3);
}

.taxonomy-level-title {
  font-size: 0.82rem;
  font-weight: 800;
  color: #ffffff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  letter-spacing: 0.02em;
}

.taxonomy-right {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.taxonomy-chapter-name {
  font-size: 0.64rem;
  font-weight: 700;
  color: #94a3b8;
  white-space: nowrap;
}

.taxonomy-pattern-tag {
  font-size: 0.62rem;
  font-weight: 800;
  color: #fbbf24;
  background: rgba(245, 158, 11, 0.14);
  border: 1px solid rgba(245, 158, 11, 0.35);
  border-radius: 4px;
  padding: 1px 5px;
  white-space: nowrap;
  text-transform: capitalize;
}

.pattern-glyph {
  color: #facc15;
}

/* Row 2: Mission Core Row (Icon + Directive + Live Counter) */
.mission-core-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
}

.directive-icon-pod {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  background: rgba(15, 23, 42, 0.85);
  border: 1.5px solid var(--pod-accent, #38bdf8);
  box-shadow: 0 0 8px rgba(56, 189, 248, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.directive-icon {
  flex-shrink: 0;
}

.directive-statement {
  flex: 1;
  min-width: 0;
}

.directive-text {
  font-size: 0.82rem;
  font-weight: 700;
  color: #f1f5f9;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}

.mission-counter-badge {
  display: flex;
  align-items: baseline;
  gap: 3px;
  padding: 2px 7px;
  border-radius: 6px;
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid rgba(56, 189, 248, 0.3);
  font-size: 0.82rem;
  font-weight: 900;
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
  white-space: nowrap;
}

.mission-counter-badge.mission-completed {
  background: rgba(16, 185, 129, 0.16);
  border-color: rgba(52, 211, 153, 0.5);
  color: #4ade80;
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.3);
}

.counter-label {
  font-size: 0.62rem;
  font-weight: 800;
  color: #94a3b8;
  margin-right: 3px;
}

.counter-val.current {
  color: #38bdf8;
}

.counter-slash {
  color: #64748b;
  margin: 0 1px;
}

.counter-val.target {
  color: #ffffff;
}

.counter-sub-note {
  font-size: 0.62rem;
  font-weight: 700;
  color: #facc15;
  margin-left: 4px;
}

/* Row 3: Smooth Precision Energy Conduit */
.mission-conduit-track {
  width: 100%;
  height: 4px;
  background: rgba(8, 14, 28, 0.8);
  border-radius: 9999px;
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.6);
  margin-top: 2px;
}

.mission-conduit-fill {
  height: 100%;
  border-radius: 9999px;
  transition: width 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  box-shadow: 0 0 8px rgba(56, 189, 248, 0.6);
}

.mission-conduit-fill.conduit-complete {
  box-shadow: 0 0 12px rgba(52, 211, 153, 0.8);
}

.conduit-spark-head {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 5px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 0 6px #ffffff, 0 0 10px #38bdf8;
}

`;

const updatedCss = css.slice(0, actualStartIndex) + newHudSection + css.slice(actualEndIndex);
fs.writeFileSync(cssPath, updatedCss, 'utf8');
console.log('Successfully replaced lines in App.css!');
