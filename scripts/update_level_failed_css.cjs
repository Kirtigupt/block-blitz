const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '..', 'src', 'App.css');
let css = fs.readFileSync(cssPath, 'utf8');

const targetStart = '/* ==========================================================================\r\n   Level Failed Modal — Premium Cyber-Arcade Game Over Experience\r\n   ========================================================================== */';
const targetStartLF = '/* ==========================================================================\n   Level Failed Modal — Premium Cyber-Arcade Game Over Experience\n   ========================================================================== */';

const targetEndMarker = '.game-over-map-btn.secondary-map-trigger:hover {';

const replacementCSS = `/* ==========================================================================
   Level Failed Modal — Premium Cyber-Arcade Game Over Experience
   ========================================================================== */

.level-failed-card {
  align-items: center;
  gap: 11px;
}

.level-failed-card.failed-portal-chassis {
  max-width: 480px;
  width: min(94vw, 480px);
  background: linear-gradient(180deg, rgba(22, 14, 25, 0.96) 0%, rgba(12, 8, 16, 0.98) 100%);
  border: 1.5px solid rgba(244, 63, 94, 0.35);
  border-radius: 24px;
  box-shadow:
    0 0 50px rgba(244, 63, 94, 0.2),
    0 25px 65px rgba(0, 0, 0, 0.85),
    inset 0 1px 1px rgba(255, 255, 255, 0.12);
  padding: 20px 20px 22px 20px;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  text-align: center;
}

/* Corner Cyber-Brackets in Rose Theme */
.failed-portal-chassis .cyber-frame-corner {
  border-color: #f43f5e;
}

/* Ambient Flares */
.failure-ambient-halo {
  position: absolute;
  top: -35px;
  left: 50%;
  transform: translateX(-50%);
  width: 260px;
  height: 110px;
  background: radial-gradient(circle, rgba(244, 63, 94, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  filter: blur(30px);
  pointer-events: none;
  z-index: 0;
}

.failure-beam-flare {
  position: absolute;
  pointer-events: none;
  z-index: 0;
  filter: blur(30px);
  opacity: 0.8;
}

.failure-beam-flare.flare-crimson {
  top: 10px;
  left: 15%;
  width: 140px;
  height: 80px;
  background: radial-gradient(circle, rgba(225, 29, 72, 0.28) 0%, transparent 70%);
}

.failure-beam-flare.flare-amber {
  top: 10px;
  right: 15%;
  width: 140px;
  height: 80px;
  background: radial-gradient(circle, rgba(245, 158, 11, 0.22) 0%, transparent 70%);
}

/* Top Distress Banner */
.distress-telemetry-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 4px;
  position: relative;
  z-index: 2;
  margin-bottom: 2px;
}

.telemetry-distress-beacon {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  position: relative;
}

.distress-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #f43f5e;
  box-shadow: 0 0 8px #f43f5e;
}

.distress-ping {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 7px;
  height: 7px;
  border-radius: 50%;
  border: 1.5px solid #f43f5e;
  animation: distress-ping 1.8s cubic-bezier(0, 0.2, 0.8, 1) infinite;
}

@keyframes distress-ping {
  0% { transform: translateY(-50%) scale(1); opacity: 0.9; }
  100% { transform: translateY(-50%) scale(2.8); opacity: 0; }
}

.distress-label {
  font-size: 0.65rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  color: #fb7185;
  text-transform: uppercase;
  margin-left: 6px;
}

/* =========================================================
   FAILURE SIGIL APPARATUS
   ========================================================= */

.failure-sigil-apparatus {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin: 4px 0 6px 0;
  z-index: 2;
}

.sigil-warning-pulse {
  position: absolute;
  width: 130px;
  height: 130px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(244, 63, 94, 0.25) 0%, transparent 70%);
  filter: blur(15px);
  pointer-events: none;
  animation: warning-breathe 2.5s infinite ease-in-out;
}

@keyframes warning-breathe {
  0%, 100% { transform: scale(0.9); opacity: 0.6; }
  50% { transform: scale(1.15); opacity: 0.9; }
}

.fractured-core-prism {
  width: 72px;
  height: 72px;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(38, 18, 28, 0.95) 0%, rgba(20, 10, 16, 0.98) 100%);
  border: 2px solid #f43f5e;
  box-shadow:
    0 0 25px rgba(244, 63, 94, 0.45),
    inset 0 0 15px rgba(244, 63, 94, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  animation: victory-medal-pop 0.38s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards;
}

.failure-sigil-icon {
  color: #fb7185;
  filter: drop-shadow(0 0 10px rgba(244, 63, 94, 0.8));
}

.fracture-sheen-ring {
  position: absolute;
  inset: -5px;
  border-radius: 22px;
  border: 1.5px dashed rgba(244, 63, 94, 0.35);
  animation: core-orbit-spin 16s linear infinite;
  pointer-events: none;
}

/* =========================================================
   HEADLINE & SECTOR IDENTIFIER
   ========================================================= */

.failure-headline-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  position: relative;
  z-index: 2;
  margin-top: 1px;
}

.game-over-title.level-failed-title {
  font-size: 1.55rem;
  font-weight: 900;
  color: #ffffff;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  margin: 0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.7);
}

.stage-identity-strip.failed-stage-strip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(244, 63, 94, 0.1);
  border: 1px solid rgba(244, 63, 94, 0.3);
  border-radius: 20px;
  padding: 3px 12px;
}

.failed-code-pill {
  color: #fb7185;
  margin-right: 2px;
}

.lockout-status-badge {
  font-size: 0.60rem;
  font-weight: 900;
  letter-spacing: 0.06em;
  color: #f43f5e;
  background: rgba(244, 63, 94, 0.18);
  border: 1px solid rgba(244, 63, 94, 0.4);
  padding: 1px 6px;
  border-radius: 4px;
}

/* =========================================================
   TACTICAL OBJECTIVE DEBRIEF TERMINAL
   ========================================================= */

.failed-objective-terminal {
  width: 100%;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(28, 16, 26, 0.85) 0%, rgba(15, 10, 18, 0.95) 100%);
  border: 1px solid rgba(244, 63, 94, 0.28);
  border-left: 3.5px solid #f43f5e;
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08);
  text-align: left;
  position: relative;
  z-index: 2;
}

.obj-terminal-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.obj-terminal-label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.64rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: #94a3b8;
  text-transform: uppercase;
}

.obj-terminal-icon {
  color: #fb7185;
}

.obj-deficit-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.64rem;
  font-weight: 900;
  letter-spacing: 0.04em;
  color: #fb7185;
  background: rgba(244, 63, 94, 0.16);
  border: 1px solid rgba(244, 63, 94, 0.4);
  padding: 1px 8px;
  border-radius: 20px;
  box-shadow: 0 0 10px rgba(244, 63, 94, 0.2);
}

.deficit-x-icon {
  color: #fb7185;
}

.obj-terminal-body {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.obj-terminal-icon-pod {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: rgba(244, 63, 94, 0.12);
  border: 1px solid rgba(244, 63, 94, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fb7185;
  flex-shrink: 0;
  box-shadow: 0 0 10px rgba(244, 63, 94, 0.2);
}

.obj-directive-quote {
  font-size: 0.85rem;
  font-weight: 800;
  color: #ffffff;
  line-height: 1.3;
}

.failed-meter-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  margin-top: 2px;
}

.failed-meter-track {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 9999px;
  overflow: hidden;
}

.failed-meter-fill {
  height: 100%;
  border-radius: 9999px;
  box-shadow: 0 0 10px rgba(244, 63, 94, 0.8);
  transition: width 0.4s ease;
}

.failed-meter-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.68rem;
  font-weight: 700;
}

.meter-label {
  color: #94a3b8;
}

.meter-count {
  color: #ffffff;
  font-weight: 800;
}

.meter-divider {
  color: #64748b;
  margin: 0 2px;
}

/* =========================================================
   HERO ATTEMPT SCORE DISPLAY
   ========================================================= */

.hero-attempt-score-chassis {
  width: 100%;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(25, 14, 25, 0.9) 0%, rgba(15, 8, 16, 0.95) 100%);
  border: 1px solid rgba(244, 63, 94, 0.3);
  padding: 8px 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 2;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
}

.attempt-score-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.attempt-score-label {
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  color: #94a3b8;
  text-transform: uppercase;
}

.final-score-number {
  font-size: 1.45rem;
  font-weight: 900;
  color: #ffffff;
  text-shadow: 0 0 14px rgba(244, 63, 94, 0.5);
  font-variant-numeric: tabular-nums;
}

/* =========================================================
   SEPARATE CELEBRATORY PERSONAL RECORD MEDALLION
   ========================================================= */

.personal-record-celebration-trophy {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.22) 0%, rgba(217, 119, 6, 0.12) 100%);
  border: 1.5px solid rgba(250, 204, 21, 0.55);
  border-radius: 12px;
  padding: 8px 12px;
  box-shadow: 0 0 16px rgba(250, 204, 21, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 2;
  animation: victory-medal-pop 0.35s cubic-bezier(0.18, 0.89, 0.32, 1.28);
  text-align: left;
}

.record-trophy-badge {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #facc15 0%, #d97706 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #451a03;
  flex-shrink: 0;
  box-shadow: 0 0 10px rgba(250, 204, 21, 0.7);
}

.record-text-group {
  display: flex;
  flex-direction: column;
  gap: 1px;
  overflow: hidden;
}

.record-hero-text {
  font-size: 0.78rem;
  font-weight: 900;
  color: #fde047;
  text-shadow: 0 0 8px rgba(250, 204, 21, 0.7);
}

.record-sub-text {
  font-size: 0.64rem;
  font-weight: 700;
  color: #fef08a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.record-sparkle-flair {
  color: #ffffff;
  animation: sparkle-flare 2s infinite ease-in-out;
  margin-left: auto;
  flex-shrink: 0;
}

/* =========================================================
   UNIFIED TACTICAL TELEMETRY STATISTICS RIBBON
   ========================================================= */

.telemetry-stats-ribbon {
  display: flex;
  align-items: center;
  justify-content: space-around;
  width: 100%;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 10px;
  padding: 6px 14px;
  position: relative;
  z-index: 2;
}

.telemetry-stat-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stat-col-lbl {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: #94a3b8;
}

.stat-col-val {
  font-size: 0.95rem;
  font-weight: 900;
  color: #ffffff;
  font-variant-numeric: tabular-nums;
}

.telemetry-col-divider {
  width: 1px;
  height: 20px;
  background: rgba(255, 255, 255, 0.1);
}

.col-icon.gold-icon { color: #facc15; }
.col-icon.cyan-icon { color: #38bdf8; }
.col-icon.orange-icon { color: #fb923c; }

/* =========================================================
   CLOUD BACKUP STATUS / GUEST AUTH CALLOUT
   ========================================================= */

.guest-auth-callout {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 36px;
  border-radius: 10px;
  background: rgba(56, 189, 248, 0.08);
  border: 1px solid rgba(56, 189, 248, 0.35);
  color: #38bdf8;
  font-size: 0.75rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.15s ease;
  position: relative;
  z-index: 2;
}

.guest-auth-callout:hover {
  background: rgba(56, 189, 248, 0.18);
  border-color: #38bdf8;
  color: #ffffff;
}

.cloud-saved-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 0.70rem;
  font-weight: 700;
  color: #94a3b8;
  width: 100%;
  position: relative;
  z-index: 2;
}

/* =========================================================
   REDESIGNED COMMAND ACTION BUTTONS
   ========================================================= */

.failed-actions-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  margin-top: 3px;
  position: relative;
  z-index: 2;
}

.play-again-btn.retry-level-btn.primary-retry-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 52px;
  border-radius: 16px;
  padding: 0 16px;
  background: linear-gradient(180deg, #f43f5e 0%, #e11d48 40%, #be123c 100%);
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  box-shadow:
    0 4px 0 #881337,
    0 10px 25px rgba(244, 63, 94, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  color: #ffffff;
  cursor: pointer;
  transition: all 0.12s cubic-bezier(0.16, 1, 0.3, 1);
  user-select: none;
  text-align: left;
  gap: 12px;
}

.play-again-btn.retry-level-btn.primary-retry-trigger:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
  box-shadow:
    0 5px 0 #881337,
    0 14px 30px rgba(244, 63, 94, 0.6);
}

.play-again-btn.retry-level-btn.primary-retry-trigger:active {
  transform: translateY(3px);
  box-shadow:
    0 1px 0 #881337,
    0 4px 10px rgba(244, 63, 94, 0.3);
}

.retry-icon-pod {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.retry-spin-icon {
  color: #ffffff;
  transition: transform 0.3s ease;
}

.play-again-btn.retry-level-btn.primary-retry-trigger:hover .retry-spin-icon {
  transform: rotate(-90deg);
}

.retry-text-group {
  display: flex;
  flex-direction: column;
  gap: 1px;
  flex: 1;
}

.retry-primary-text {
  font-size: 0.94rem;
  font-weight: 900;
  letter-spacing: 0.05em;
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
}

.retry-sub-text {
  font-size: 0.64rem;
  font-weight: 700;
  color: rgba(254, 205, 211, 0.9);
}

.retry-arrow-pod {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  transition: transform 0.15s ease;
}

.play-again-btn.retry-level-btn.primary-retry-trigger:hover .retry-arrow-icon {
  transform: translateX(3px);
}

/* Secondary Action: Level Map */
.game-over-map-btn.secondary-map-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 40px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #cbd5e1;
  font-size: 0.80rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.15s ease;
}

.game-over-map-btn.secondary-map-trigger:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(56, 189, 248, 0.4);
  color: #ffffff;
}
`;

let startIdx = css.indexOf(targetStart);
if (startIdx === -1) {
  startIdx = css.indexOf(targetStartLF);
}
if (startIdx === -1) {
  console.error('targetStart not found!');
  process.exit(1);
}

const normalizedCss = css.slice(startIdx);
let endIdxRel = normalizedCss.indexOf(targetEndMarker);
if (endIdxRel === -1) {
  console.error('targetEndMarker not found!');
  process.exit(1);
}

let closingBraceIdx = normalizedCss.indexOf('}', endIdxRel);
if (closingBraceIdx === -1) {
  console.error('closing brace not found!');
  process.exit(1);
}

const fullEndIdx = startIdx + closingBraceIdx + 1;
const isCRLF = css.includes('\r\n');
const finalReplacement = isCRLF ? replacementCSS.replace(/\n/g, '\r\n') : replacementCSS;

const updatedCss = css.slice(0, startIdx) + finalReplacement + css.slice(fullEndIdx);
fs.writeFileSync(cssPath, updatedCss, 'utf8');
console.log('Successfully updated Level Failed / Game Over styles in App.css!');
