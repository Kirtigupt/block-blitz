const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '..', 'src', 'App.css');
let css = fs.readFileSync(cssPath, 'utf8');

const targetStart = '/* ==========================================================================\r\n   Level Complete Modal — Premium Cyber-Arcade Achievement Experience\r\n   ========================================================================== */';
const targetStartLF = '/* ==========================================================================\n   Level Complete Modal — Premium Cyber-Arcade Achievement Experience\n   ========================================================================== */';

const targetEndMarker = '.complete-map-btn:hover {';

const replacementCSS = `/* ==========================================================================
   Level Complete Modal — Premium Cyber-Arcade Achievement Experience
   ========================================================================== */

.level-complete-card {
  align-items: center;
  gap: 12px;
}

.level-complete-card.achievement-portal-card {
  max-width: 500px;
  width: min(94vw, 500px);
  background: linear-gradient(180deg, rgba(14, 22, 41, 0.96) 0%, rgba(8, 12, 22, 0.98) 100%);
  border: 1.5px solid rgba(56, 189, 248, 0.35);
  border-radius: 24px;
  box-shadow:
    0 0 50px rgba(6, 182, 212, 0.22),
    0 25px 65px rgba(0, 0, 0, 0.85),
    inset 0 1px 1px rgba(255, 255, 255, 0.15);
  padding: 20px 20px 22px 20px;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  text-align: center;
}

/* Cyber Framing Accents */
.cyber-frame-corner {
  position: absolute;
  width: 14px;
  height: 14px;
  pointer-events: none;
  z-index: 4;
}

.cyber-frame-corner.corner-tl {
  top: 8px;
  left: 8px;
  border-top: 2px solid #38bdf8;
  border-left: 2px solid #38bdf8;
}

.cyber-frame-corner.corner-tr {
  top: 8px;
  right: 8px;
  border-top: 2px solid #38bdf8;
  border-right: 2px solid #38bdf8;
}

.cyber-frame-corner.corner-bl {
  bottom: 8px;
  left: 8px;
  border-bottom: 2px solid #38bdf8;
  border-left: 2px solid #38bdf8;
}

.cyber-frame-corner.corner-br {
  bottom: 8px;
  right: 8px;
  border-bottom: 2px solid #38bdf8;
  border-right: 2px solid #38bdf8;
}

/* Ambient Flares & Light Blooms */
.completion-beam-flare {
  position: absolute;
  pointer-events: none;
  z-index: 0;
  filter: blur(35px);
  opacity: 0.8;
}

.completion-beam-flare.flare-cyan {
  top: -30px;
  left: 15%;
  width: 160px;
  height: 90px;
  background: radial-gradient(circle, rgba(56, 189, 248, 0.38) 0%, transparent 70%);
}

.completion-beam-flare.flare-amber {
  top: 15px;
  right: 15%;
  width: 160px;
  height: 90px;
  background: radial-gradient(circle, rgba(250, 204, 21, 0.3) 0%, transparent 70%);
}

/* Top Telemetry Banner */
.achievement-telemetry-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 4px;
  position: relative;
  z-index: 2;
  margin-bottom: 4px;
}

.telemetry-live-beacon {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  position: relative;
}

.beacon-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 8px #22c55e;
}

.beacon-ping {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 7px;
  height: 7px;
  border-radius: 50%;
  border: 1.5px solid #22c55e;
  animation: beacon-ping 1.8s cubic-bezier(0, 0.2, 0.8, 1) infinite;
}

@keyframes beacon-ping {
  0% { transform: translateY(-50%) scale(1); opacity: 0.9; }
  100% { transform: translateY(-50%) scale(2.8); opacity: 0; }
}

.beacon-label {
  font-size: 0.65rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  color: #4ade80;
  text-transform: uppercase;
  margin-left: 6px;
}

.telemetry-ch-tag {
  font-size: 0.66rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: #94a3b8;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2px 8px;
  border-radius: 6px;
}

/* =========================================================
   CREATIVE ACHIEVEMENT PRESENTATION (Apex Crest + Arching Constellation)
   ========================================================= */

.victory-crest-apparatus {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin: 2px 0 4px 0;
  z-index: 2;
}

.crest-energy-field {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 190px;
  height: 190px;
  background: radial-gradient(circle, rgba(250, 204, 21, 0.18) 0%, rgba(56, 189, 248, 0.1) 45%, transparent 72%);
  border-radius: 50%;
  pointer-events: none;
  filter: blur(20px);
}

/* Apex Zenith Star (Star 2 - Mounted Prominently Above Arch) */
.victory-star-slot.star-slot-2.hero-star.apex-zenith-node {
  margin-bottom: -10px;
  z-index: 3;
}

.hero-star-chassis {
  display: flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 0 16px rgba(253, 224, 71, 0.95));
  position: relative;
}

.apex-sparkle-flair {
  position: absolute;
  top: -6px;
  right: -8px;
  color: #ffffff;
  animation: sparkle-flare 2.2s infinite ease-in-out;
}

@keyframes sparkle-flare {
  0%, 100% { transform: scale(0.8) rotate(0deg); opacity: 0.6; }
  50% { transform: scale(1.2) rotate(45deg); opacity: 1; }
}

.triumph-constellation-arch {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  width: 100%;
  position: relative;
  z-index: 2;
}

.victory-star-slot {
  display: flex;
  align-items: center;
  justify-content: center;
}

.victory-star-slot.constellation-node .star-pedestal-mount {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%);
  border: 1.5px solid rgba(250, 204, 21, 0.45);
  box-shadow: 0 0 16px rgba(250, 204, 21, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2);
  position: relative;
  transition: transform 0.3s ease;
}

.victory-star-slot.constellation-node.left-wing {
  transform: translateY(6px) rotate(-6deg);
}

.victory-star-slot.constellation-node.right-wing {
  transform: translateY(6px) rotate(6deg);
}

.star-sparkle-dot {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 0 6px #ffffff;
}

/* Central Power Core Crest */
.victory-core-crest-chassis {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
}

.victory-core-prism {
  width: 74px;
  height: 74px;
  border-radius: 20px;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border: 2.5px solid #facc15;
  box-shadow:
    0 0 32px rgba(250, 204, 21, 0.55),
    inset 0 0 20px rgba(250, 204, 21, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  animation: victory-medal-pop 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards;
}

.victory-core-prism.campaign-zenith-core {
  border-color: #fde047;
  box-shadow: 0 0 40px rgba(253, 224, 71, 0.75), inset 0 0 24px rgba(253, 224, 71, 0.35);
}

.victory-core-prism.boss-slayer-core {
  border-color: #f97316;
  box-shadow: 0 0 36px rgba(249, 115, 22, 0.65), inset 0 0 22px rgba(249, 115, 22, 0.3);
}

.core-orbit-ring {
  position: absolute;
  inset: -6px;
  border-radius: 24px;
  border: 1.5px dashed rgba(250, 204, 21, 0.4);
  animation: core-orbit-spin 14s linear infinite;
  pointer-events: none;
}

@keyframes core-orbit-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.core-facet-sheen {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent 40%, rgba(255, 255, 255, 0.25) 50%, transparent 60%);
  pointer-events: none;
  animation: facet-sweep 4.5s infinite linear;
}

@keyframes facet-sweep {
  0% { transform: translateX(-60%) translateY(-60%); }
  100% { transform: translateX(60%) translateY(60%); }
}

.victory-core-icon {
  color: #facc15;
  filter: drop-shadow(0 0 12px rgba(250, 204, 21, 0.85));
}

.victory-core-icon.flame-glow {
  color: #fb923c;
  filter: drop-shadow(0 0 12px rgba(249, 115, 22, 0.9));
}

.victory-core-icon.crown-glow {
  color: #fde047;
  filter: drop-shadow(0 0 14px rgba(253, 224, 71, 0.95));
}

.triumph-grade-ribbon {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.28) 0%, rgba(217, 119, 6, 0.16) 100%);
  border: 1px solid rgba(250, 204, 21, 0.55);
  border-radius: 20px;
  padding: 2px 12px;
  box-shadow: 0 0 14px rgba(250, 204, 21, 0.35);
  white-space: nowrap;
}

.grade-badge {
  font-size: 0.74rem;
  font-weight: 900;
  color: #fde047;
  text-shadow: 0 0 8px rgba(250, 204, 21, 0.7);
}

.grade-divider {
  color: rgba(250, 204, 21, 0.6);
  font-size: 0.7rem;
}

.grade-sub {
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #fef08a;
}

/* Animations for Stars */
.star-pop-1 {
  animation: star-bounce-pop 0.45s 0.15s cubic-bezier(0.18, 0.89, 0.32, 1.28) both;
}

.star-pop-2 {
  animation: star-bounce-pop 0.45s 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28) both;
}

.star-pop-3 {
  animation: star-bounce-pop 0.45s 0.45s cubic-bezier(0.18, 0.89, 0.32, 1.28) both;
}

@keyframes star-bounce-pop {
  0% { transform: scale(0) rotate(-25deg); opacity: 0; }
  70% { transform: scale(1.22) rotate(6deg); }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

@keyframes victory-medal-pop {
  0% { transform: scale(0.6); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

/* =========================================================
   HEADLINE & LEVEL INFORMATION
   ========================================================= */

.achievement-headline-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  position: relative;
  z-index: 2;
  margin-top: 2px;
}

.level-complete-title {
  font-size: 1.55rem;
  font-weight: 900;
  color: #ffffff;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  margin: 0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.6);
}

.stage-identity-strip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(56, 189, 248, 0.1);
  border: 1px solid rgba(56, 189, 248, 0.32);
  border-radius: 20px;
  padding: 3px 12px;
}

.stage-code-pill {
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  color: #38bdf8;
  margin-right: 2px;
}

.stage-name-text {
  font-size: 0.82rem;
  font-weight: 800;
  color: #ffffff;
}

.stage-replay-pill {
  font-size: 0.58rem;
  font-weight: 900;
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.2);
  border: 1px solid rgba(245, 158, 11, 0.4);
  padding: 1px 5px;
  border-radius: 4px;
}

/* =========================================================
   HOLOGRAPHIC OBJECTIVE VERIFICATION CARD
   ========================================================= */

.holographic-objective-card {
  width: 100%;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(10, 16, 30, 0.95) 100%);
  border: 1px solid rgba(56, 189, 248, 0.28);
  border-left: 3.5px solid #22c55e;
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08);
  text-align: left;
  position: relative;
  z-index: 2;
}

.obj-card-top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.obj-directive-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.64rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: #94a3b8;
  text-transform: uppercase;
}

.obj-directive-icon {
  color: #38bdf8;
}

.obj-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.64rem;
  font-weight: 900;
  letter-spacing: 0.04em;
  color: #22c55e;
  background: rgba(34, 197, 94, 0.14);
  border: 1px solid rgba(34, 197, 94, 0.4);
  padding: 1px 7px;
  border-radius: 20px;
  box-shadow: 0 0 10px rgba(34, 197, 94, 0.2);
}

.obj-status-icon {
  color: #22c55e;
}

.obj-card-body {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.obj-icon-pod {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(56, 189, 248, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #38bdf8;
  flex-shrink: 0;
  box-shadow: 0 0 10px rgba(56, 189, 248, 0.2);
}

.obj-icon-symbol {
  color: #38bdf8;
}

.obj-detail-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
}

.obj-quote-label {
  font-size: 0.86rem;
  font-weight: 800;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.obj-param-note {
  font-size: 0.68rem;
  font-weight: 600;
  color: #64748b;
}

/* =========================================================
   PERFORMANCE VAULT & REWARDS HUB
   ========================================================= */

.rewards-performance-hub {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  width: 100%;
  position: relative;
  z-index: 2;
}

.reward-vault-chamber {
  border-radius: 14px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
}

.reward-vault-chamber.bonus-chamber {
  background: linear-gradient(135deg, rgba(30, 27, 18, 0.9) 0%, rgba(20, 17, 10, 0.95) 100%);
  border: 1px solid rgba(245, 158, 11, 0.35);
}

.reward-vault-chamber.score-chamber {
  background: linear-gradient(135deg, rgba(14, 25, 45, 0.9) 0%, rgba(8, 15, 30, 0.95) 100%);
  border: 1px solid rgba(56, 189, 248, 0.35);
}

.chamber-header {
  display: flex;
  align-items: center;
  gap: 6px;
}

.chamber-icon-wrapper {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chamber-icon-wrapper.bonus-glow {
  background: rgba(245, 158, 11, 0.2);
  color: #facc15;
}

.chamber-icon-wrapper.score-glow {
  background: rgba(56, 189, 248, 0.2);
  color: #38bdf8;
}

.chamber-title {
  font-size: 0.64rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #94a3b8;
  text-transform: uppercase;
}

.chamber-value-box .stat-value {
  font-size: 1.25rem;
  font-weight: 900;
  font-variant-numeric: tabular-nums;
  display: block;
}

.bonus-val {
  color: #fde047;
  text-shadow: 0 0 12px rgba(250, 204, 21, 0.6);
}

.bonus-val.replay-val {
  color: var(--text-muted);
  font-size: 0.95rem;
  text-shadow: none;
}

.total-val {
  color: #ffffff;
  text-shadow: 0 0 12px rgba(56, 189, 248, 0.5);
}

.chamber-subtext {
  font-size: 0.64rem;
  font-weight: 700;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.score-live-tag {
  color: #38bdf8;
}

/* Integrated Performance Telemetry Ribbon */
.performance-telemetry-ribbon {
  display: flex;
  align-items: center;
  justify-content: space-around;
  width: 100%;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  padding: 5px 12px;
  position: relative;
  z-index: 2;
  margin-top: -2px;
}

.perf-metric {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.64rem;
  font-weight: 800;
}

.metric-dot.gold {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #facc15;
  box-shadow: 0 0 6px #facc15;
}

.metric-dot.cyan {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #38bdf8;
  box-shadow: 0 0 6px #38bdf8;
}

.metric-lbl {
  color: #94a3b8;
}

.metric-val {
  color: #ffffff;
}

.perf-divider {
  width: 1px;
  height: 12px;
  background: rgba(255, 255, 255, 0.1);
}

/* =========================================================
   DISTINCTIVE COMMAND-GRADE LEADERBOARD ACTION TRIGGER
   ========================================================= */

.complete-actions-wrap {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  margin-top: 4px;
  position: relative;
  z-index: 2;
}

.complete-continue-btn.complete-leaderboard-btn.command-leaderboard-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 54px;
  border-radius: 16px;
  padding: 0 16px;
  background: linear-gradient(180deg, #0284c7 0%, #0369a1 40%, #075985 100%);
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  box-shadow:
    0 4px 0 #0c4a6e,
    0 10px 25px rgba(2, 132, 199, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  color: #ffffff;
  cursor: pointer;
  transition: all 0.12s cubic-bezier(0.16, 1, 0.3, 1);
  user-select: none;
  text-align: left;
  gap: 12px;
}

.complete-continue-btn.complete-leaderboard-btn.command-leaderboard-trigger:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
  box-shadow:
    0 5px 0 #0c4a6e,
    0 14px 30px rgba(2, 132, 199, 0.65);
}

.complete-continue-btn.complete-leaderboard-btn.command-leaderboard-trigger:active {
  transform: translateY(3px);
  box-shadow:
    0 1px 0 #0c4a6e,
    0 4px 10px rgba(2, 132, 199, 0.35);
}

.trigger-icon-pod {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.trigger-trophy-icon {
  color: #fde047;
  filter: drop-shadow(0 0 6px rgba(250, 204, 21, 0.8));
}

.trigger-text-column {
  display: flex;
  flex-direction: column;
  gap: 1px;
  flex: 1;
}

.trigger-primary-label {
  font-size: 0.92rem;
  font-weight: 900;
  letter-spacing: 0.05em;
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
}

.trigger-sub-label {
  font-size: 0.64rem;
  font-weight: 700;
  color: rgba(224, 242, 254, 0.85);
}

.trigger-arrow-pod {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  transition: transform 0.15s ease;
}

.complete-continue-btn.complete-leaderboard-btn.command-leaderboard-trigger:hover .trigger-arrow-icon {
  transform: translateX(3px);
}

/* Quick Advance Direct to Map */
.quick-advance-row {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-top: 2px;
}

.quick-map-direct-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #94a3b8;
  font-size: 0.74rem;
  font-weight: 700;
  padding: 6px 14px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.quick-map-direct-btn:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #ffffff;
  border-color: rgba(56, 189, 248, 0.4);
}

/* Fallback & Legacy classes preserved for Step 2 & Step 3 buttons */
.complete-continue-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 48px;
  font-size: 0.94rem;
  font-weight: 800;
  letter-spacing: 0.6px;
  border-radius: var(--radius-md);
  color: #fff;
  background: linear-gradient(135deg, #06b6d4 0%, #0284c7 45%, #2563eb 100%);
  border: none;
  box-shadow: 0 4px 14px rgba(6, 182, 212, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
}

.complete-continue-btn:hover {
  background: linear-gradient(135deg, #0369a1, var(--accent-cyan-hover));
  transform: translateY(-1px);
}

.complete-continue-btn.champion-btn {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  box-shadow: 0 4px 18px rgba(245, 158, 11, 0.4);
}

.complete-continue-btn.champion-btn:hover {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  box-shadow: 0 6px 24px rgba(245, 158, 11, 0.6);
  transform: translateY(-1px);
}

/* Secondary Button */
.complete-map-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  height: 38px;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-secondary);
  background: transparent;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.18s ease;
}

.complete-map-btn:hover {
  background: var(--bg-surface-hover);
  color: var(--text-primary);
  border-color: var(--border-medium);
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
console.log('Successfully re-tuned Level Complete Modal spacing and layout!');
