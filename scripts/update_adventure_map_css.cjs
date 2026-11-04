const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '..', 'src', 'App.css');
let css = fs.readFileSync(cssPath, 'utf8');

// Find boundaries of the Adventure Campaign section
const startMarker = '/* ==========================================================================\n   ADVENTURE CAMPAIGN LEVEL MAP (WINDING JOURNEY PROGRESSION THROUGH 10 REALMS)';
const endMarker = '/* 6. Redesigned Floating Bottom Dock */';

const startIndex = css.indexOf('ADVENTURE CAMPAIGN LEVEL MAP');
if (startIndex === -1) {
  console.error('Could not find start marker in App.css');
  process.exit(1);
}

// Find line starting with /* === before ADVENTURE CAMPAIGN
const actualStartIndex = css.lastIndexOf('/* ===', startIndex);
const actualEndIndex = css.indexOf('/* 6. Redesigned Floating Bottom Dock */', actualStartIndex);

if (actualStartIndex === -1 || actualEndIndex === -1) {
  console.error('Could not locate exact indices:', { actualStartIndex, actualEndIndex });
  process.exit(1);
}

const newAdventureSection = `/* ==========================================================================
   ADVENTURE CAMPAIGN LEVEL MAP (UPWARD ASCENT TO THE CITADEL: LEVEL 1 TO 100)
   ========================================================================== */

.campaign-map-screen,
.adventure-map-screen,
.level-map-screen {
  position: fixed;
  inset: 0;
  background-color: #050813;
  background-image:
    /* Summit: Golden Aurora of the Sovereign Zenith Citadel */
    radial-gradient(ellipse 100% 45% at 50% 0%, rgba(234, 179, 8, 0.18) 0%, transparent 70%),
    /* High Stratosphere: Plasma violet and cosmic cyan */
    radial-gradient(circle at 85% 22%, rgba(168, 85, 247, 0.12) 0%, transparent 45%),
    radial-gradient(circle at 15% 42%, rgba(56, 189, 248, 0.10) 0%, transparent 50%),
    /* Mid Realms: Emerald matrix nebula */
    radial-gradient(circle at 80% 68%, rgba(16, 185, 129, 0.08) 0%, transparent 45%),
    /* Ground Zero: Deep cyber runway launchpad */
    radial-gradient(ellipse 90% 28% at 50% 100%, rgba(6, 182, 212, 0.15) 0%, transparent 60%),
    /* Tech Grid coordinate lines */
    linear-gradient(rgba(56, 189, 248, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(56, 189, 248, 0.035) 1px, transparent 1px);
  background-size: 100% 100%, 100% 100%, 100% 100%, 100% 100%, 100% 100%, 36px 36px, 36px 36px;
  background-position: center top, center center, center center, center center, center bottom, center center, center center;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  user-select: none;
}

/* 1. Header Bar */
.adventure-top-header,
.campaign-header {
  height: 52px;
  background: rgba(10, 16, 28, 0.94);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(56, 189, 248, 0.16);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  flex-shrink: 0;
  z-index: 10;
}

.adventure-title-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.adventure-title-spark {
  color: #38bdf8;
}

.adventure-screen-title,
.campaign-title {
  font-size: 1.25rem;
  font-weight: 900;
  letter-spacing: 0.06em;
  color: #ffffff;
  margin: 0;
}

.adventure-header-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.campaign-stat-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(30, 41, 59, 0.7);
  border: 1px solid rgba(56, 189, 248, 0.25);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.72rem;
  font-weight: 700;
  color: #e2e8f0;
}

.stat-star-gold {
  color: #facc15;
}

.stat-val {
  color: #38bdf8;
  font-weight: 800;
}

.stat-lbl {
  color: #94a3b8;
  font-size: 0.65rem;
  letter-spacing: 0.5px;
}

.adventure-header-spacer {
  width: auto;
  height: auto;
  flex-shrink: 0;
}

.header-score-tag {
  font-size: 0.75rem;
  font-weight: 800;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.1);
  border: 1px solid rgba(56, 189, 248, 0.25);
  padding: 4px 8px;
  border-radius: 8px;
  white-space: nowrap;
}

/* 2. Chapter Switcher Bars */
.desktop-chapter-pills-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(15, 23, 42, 0.75);
  border-bottom: 1px solid rgba(56, 189, 248, 0.12);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  flex-shrink: 0;
  scrollbar-width: thin;
}

.mobile-chapter-switcher-bar {
  display: none;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: rgba(15, 23, 42, 0.85);
  border-bottom: 1px solid rgba(56, 189, 248, 0.12);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  flex-shrink: 0;
  scrollbar-width: none;
}

.mobile-chapter-switcher-bar::-webkit-scrollbar {
  display: none;
}

@media (max-width: 768px) {
  .desktop-chapter-pills-bar {
    display: none !important;
  }
  .mobile-chapter-switcher-bar {
    display: flex !important;
  }
}

.ch-pill-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  height: 36px;
  border-radius: 18px;
  background: rgba(30, 41, 59, 0.65);
  border: 1px solid rgba(148, 163, 184, 0.2);
  color: #94a3b8;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.ch-pill-item:hover {
  background: rgba(51, 65, 85, 0.8);
  color: #e2e8f0;
  border-color: rgba(56, 189, 248, 0.35);
}

.ch-pill-item.active {
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.25) 0%, rgba(14, 165, 233, 0.35) 100%);
  border-color: #38bdf8;
  color: #ffffff;
  box-shadow: 0 0 12px rgba(56, 189, 248, 0.3);
}

.pill-realm-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.pill-count-tag,
.pill-mini-stat {
  font-size: 0.7rem;
  background: rgba(0, 0, 0, 0.3);
  padding: 2px 6px;
  border-radius: 10px;
  color: #38bdf8;
}

.pill-completed {
  border-color: rgba(34, 197, 94, 0.4);
}

.pill-check-icon {
  color: #4ade80;
}

/* 3. Scrollable Canvas */
.campaign-grid-container,
.adventure-scroll-container {
  flex: 1 1 0%;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  display: block;
  width: 100%;
}

.adventure-content-wrapper {
  width: 100%;
  max-width: 520px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 14px 140px 14px;
  box-sizing: border-box;
}

.adventure-content-wrapper.chapter-mode {
  max-width: 520px;
}

/* Grand Finale Sovereign Zenith Citadel Banner (Summit Destination at Top of Map) */
.adventure-trophy-banner.zenith-citadel-banner {
  margin-top: 14px;
  margin-bottom: 26px;
  padding: 26px 22px;
  background: radial-gradient(circle at 50% 20%, rgba(250, 204, 21, 0.14) 0%, rgba(15, 23, 42, 0.95) 75%);
  border: 1.5px solid rgba(250, 204, 21, 0.45);
  border-radius: 24px;
  box-shadow:
    0 12px 36px rgba(0, 0, 0, 0.7),
    0 0 35px rgba(250, 204, 21, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  max-width: 440px;
  width: 100%;
  box-sizing: border-box;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.citadel-pedestal {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.citadel-aurora-glow {
  position: absolute;
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(250, 204, 21, 0.45) 0%, transparent 70%);
  filter: blur(18px);
  pointer-events: none;
  animation: citadel-aurora-pulse 3s infinite alternate ease-in-out;
}

@keyframes citadel-aurora-pulse {
  0% { transform: scale(0.9); opacity: 0.7; }
  100% { transform: scale(1.2); opacity: 1; }
}

.citadel-spire-svg {
  width: 78px;
  height: 78px;
  color: #facc15;
  filter: drop-shadow(0 0 18px rgba(250, 204, 21, 0.65));
  transition: all 0.3s ease;
  z-index: 1;
}

.citadel-spire-svg.trophy-champion {
  filter: drop-shadow(0 0 25px rgba(250, 204, 21, 0.95));
}

.zenith-apex-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  padding: 4px 12px;
  background: rgba(250, 204, 21, 0.18);
  border: 1px solid rgba(250, 204, 21, 0.55);
  border-radius: 9999px;
  font-size: 0.7rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  color: #fef08a;
  text-shadow: 0 0 8px rgba(250, 204, 21, 0.6);
}

.zenith-headline {
  font-size: 1.25rem;
  font-weight: 900;
  letter-spacing: 0.03em;
  color: #ffffff;
  margin: 10px 0 4px 0;
  text-shadow: 0 0 18px rgba(250, 204, 21, 0.5);
}

.zenith-subtitle {
  font-size: 0.82rem;
  font-weight: 600;
  color: #cbd5e1;
  margin: 0;
  max-width: 340px;
  line-height: 1.4;
}

/* Expedition Basecamp Banner (Ground Zero - Level 1 Launch Terminal at Bottom of Map) */
.adventure-departure-banner.expedition-basecamp-banner {
  margin-top: 24px;
  margin-bottom: 70px;
  padding: 18px 20px;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.94) 0%, rgba(8, 14, 26, 0.98) 100%);
  border: 1.5px solid rgba(56, 189, 248, 0.35);
  border-radius: 20px;
  box-shadow: 0 4px 28px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  max-width: 440px;
  width: 100%;
  box-sizing: border-box;
  text-align: center;
}

.basecamp-badge {
  background: rgba(6, 182, 212, 0.15) !important;
  border-color: rgba(6, 182, 212, 0.45) !important;
  color: #38bdf8 !important;
}

.basecamp-icon {
  color: #38bdf8;
}

.departure-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  background: rgba(56, 189, 248, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.35);
  border-radius: 9999px;
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  color: #38bdf8;
}

.departure-stages-pill {
  background: #38bdf8;
  color: #042f2e;
  padding: 1px 6px;
  border-radius: 6px;
  font-size: 0.62rem;
  font-weight: 900;
}

.departure-headline {
  font-size: 1.15rem;
  font-weight: 900;
  letter-spacing: 0.03em;
  color: #ffffff;
  margin: 8px 0 3px 0;
  text-shadow: 0 0 14px rgba(56, 189, 248, 0.4);
}

.departure-subtext {
  font-size: 0.8rem;
  font-weight: 600;
  color: #94a3b8;
  margin: 0;
  line-height: 1.35;
  max-width: 320px;
}

.departure-quick-actions {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 10px;
  gap: 8px;
}

.departure-stats-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 290px;
  font-size: 0.74rem;
  color: #cbd5e1;
}

.departure-stat-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.dep-icon-trophy {
  color: #facc15;
}

.departure-locate-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, rgba(234, 179, 8, 0.2) 0%, rgba(202, 138, 4, 0.3) 100%);
  border: 1px solid rgba(250, 204, 21, 0.5);
  border-radius: 9999px;
  padding: 4px 10px;
  color: #fef08a;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: all 0.2s ease;
}

.departure-locate-btn:hover {
  background: linear-gradient(135deg, rgba(234, 179, 8, 0.35) 0%, rgba(202, 138, 4, 0.5) 100%);
  border-color: #facc15;
  box-shadow: 0 0 10px rgba(250, 204, 21, 0.5);
  transform: translateY(-1px);
}

.dep-locate-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #facc15;
  box-shadow: 0 0 6px #facc15;
}

.campaign-overall-progress-track {
  width: 100%;
  max-width: 240px;
  height: 6px;
  background: rgba(30, 41, 59, 0.6);
  border-radius: 3px;
  overflow: hidden;
  margin-top: 10px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.campaign-overall-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #06b6d4 0%, #38bdf8 50%, #4ade80 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
}

/* Locked Feedback Toast */
.locked-feedback-toast,
.adventure-toast {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(239, 68, 68, 0.22);
  border: 1px solid rgba(239, 68, 68, 0.45);
  color: #fee2e2;
  padding: 8px 16px;
  border-radius: var(--radius-md);
  font-size: 0.8rem;
  font-weight: 700;
  margin-bottom: 14px;
  animation: toast-slide-down 0.2s ease-out;
}

.toast-lock-icon {
  color: #ef4444;
  flex-shrink: 0;
}

@keyframes toast-slide-down {
  0% { opacity: 0; transform: translateY(-6px); }
  100% { opacity: 1; transform: translateY(0); }
}

/* 4. Thematic Chapter Realm Zones */
.adventure-mosaic-grid,
.campaign-tiles-grid,
.adventure-trail-journey {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
  position: relative;
  z-index: 2;
}

.chapter-realm-zone {
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Realm Gateway Waypoint Arch (Entrance Threshold at base of realm) */
.realm-gateway-arch,
.realm-waypoint-gate {
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 16px;
  margin-top: 14px;
  margin-bottom: 16px;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.9) 0%, rgba(10, 16, 28, 0.7) 100%);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
  box-sizing: border-box;
}

.realm-gateway-top-line {
  position: absolute;
  top: 0;
  left: 10%;
  right: 10%;
  height: 2px;
  border-radius: 1px;
}

.realm-gateway-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.realm-gateway-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: 9999px;
  border: 1px solid;
}

.realm-badge-tag {
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.1em;
  color: #ffffff;
}

.realm-altitude-tag {
  font-size: 0.62rem;
  font-weight: 800;
  color: #facc15;
  background: rgba(250, 204, 21, 0.15);
  padding: 1px 6px;
  border-radius: 6px;
  letter-spacing: 0.04em;
}

.realm-gateway-title {
  font-size: 1.2rem;
  font-weight: 900;
  color: #ffffff;
  letter-spacing: -0.01em;
  margin: 0;
  text-shadow: 0 0 16px var(--realm-theme-color);
}

.realm-gateway-meta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.72rem;
  font-weight: 700;
  color: #94a3b8;
}

.realm-bullet {
  color: #475569;
}

.realm-cleared-tag {
  color: var(--realm-theme-color);
  font-weight: 800;
}

/* Winding Trail Canvas for 10 nodes (Upward Ascent: Height 820px) */
.realm-trail-canvas {
  position: relative;
  width: 100%;
  max-width: 400px;
  height: 820px;
  margin: 0 auto;
}

.realm-svg-track {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.realm-track-base {
  opacity: 0.25;
}

.realm-track-dash {
  opacity: 0.55;
}

.realm-track-active {
  animation: energy-path-glow 2.5s infinite alternate ease-in-out;
}

@keyframes energy-path-glow {
  0% { opacity: 0.82; filter: drop-shadow(0 0 4px #38bdf8); }
  100% { opacity: 1; filter: drop-shadow(0 0 10px #38bdf8) drop-shadow(0 0 18px rgba(245, 158, 11, 0.5)); }
}

/* 5. 3D Adventure Nodes (Standard, Milestone, Boss, Apex Sovereign) */
.adventure-block,
.level-tile-stone,
.level-card-item,
.adv-trail-node {
  position: absolute;
  transform: translate(-50%, -50%);
  width: 54px;
  height: 54px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 3;
  transition: transform 0.16s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.16s ease;
  box-sizing: border-box;
}

.adv-trail-node:hover:not(.locked-stone),
.adventure-block:hover:not(.locked-stone) {
  transform: translate(-50%, -50%) scale(1.18);
  z-index: 10;
}

.adv-orb-core {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
  box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.35), inset 0 -3px 6px rgba(0, 0, 0, 0.6);
}

.adv-node-gloss {
  position: absolute;
  top: 3px;
  left: 10px;
  right: 10px;
  height: 38%;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0) 100%);
  border-radius: 50% 50% 40% 40%;
  pointer-events: none;
  z-index: 4;
}

.adv-node-number {
  font-size: 1.05rem;
  font-weight: 900;
  line-height: 1;
  z-index: 3;
  letter-spacing: -0.02em;
}

/* Objective Micro Icon on Standard Nodes */
.adv-micro-obj-badge {
  position: absolute;
  top: 5px;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0.75;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 4;
}

/* Milestone Checkpoint Nodes (Levels 5, 15, 25... 95) */
.adv-trail-node.milestone-stone {
  width: 58px;
  height: 58px;
  border-radius: 36%;
  border: 2px solid #38bdf8;
  box-shadow: 0 0 16px rgba(56, 189, 248, 0.4), 0 4px 14px rgba(0, 0, 0, 0.55);
}

.adv-milestone-gem-badge {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #06b6d4 0%, #0284c7 100%);
  color: #ffffff;
  padding: 2px 5px;
  border-radius: 6px;
  border: 1px solid #7dd3fc;
  box-shadow: 0 0 8px rgba(6, 182, 212, 0.6);
  z-index: 7;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Boss Milestone Stage (Levels 10, 20, 30... 90) */
.adventure-block.boss-stone,
.level-tile-stone.boss-stone,
.adv-trail-node.boss-stone {
  width: 66px;
  height: 66px;
  border-radius: 20px;
  border: 2.5px solid #facc15 !important;
  box-shadow:
    0 0 24px rgba(250, 204, 21, 0.65),
    0 6px 20px rgba(0, 0, 0, 0.65) !important;
}

.adv-boss-crown-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #facc15 0%, #d97706 100%);
  color: #451a03;
  padding: 2px 6px;
  border-radius: 6px;
  border: 1px solid #fef08a;
  box-shadow: 0 0 10px rgba(250, 204, 21, 0.8);
  z-index: 7;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Level 100 Ultimate Sovereign Apex Node */
.adventure-block.apex-sovereign-node,
.level-tile-stone.apex-sovereign-node,
.adv-trail-node.apex-sovereign-node {
  width: 76px !important;
  height: 76px !important;
  border-radius: 50% !important;
  border: 3px solid #fef08a !important;
  background: radial-gradient(circle at 35% 35%, #fef08a 0%, #eab308 50%, #854d0e 100%) !important;
  box-shadow:
    0 0 35px rgba(250, 204, 21, 0.95),
    0 0 65px rgba(234, 179, 8, 0.6),
    0 8px 24px rgba(0, 0, 0, 0.8) !important;
  animation: apex-node-shimmer 2.2s infinite alternate ease-in-out;
  z-index: 9;
}

@keyframes apex-node-shimmer {
  0% { transform: translate(-50%, -50%) scale(1); filter: brightness(1); }
  100% { transform: translate(-50%, -50%) scale(1.06); filter: brightness(1.2) drop-shadow(0 0 25px rgba(250, 204, 21, 1)); }
}

.adv-apex-corona {
  position: absolute;
  inset: -14px;
  pointer-events: none;
  z-index: 1;
}

.apex-corona-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px dashed rgba(250, 204, 21, 0.8);
  animation: apex-ring-spin 12s infinite linear;
}

.apex-corona-ring.ring-2 {
  inset: -6px;
  border-style: dotted;
  border-width: 1.5px;
  animation-duration: 8s;
  animation-direction: reverse;
}

@keyframes apex-ring-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.adv-apex-badge {
  background: linear-gradient(135deg, #fef08a 0%, #eab308 100%) !important;
  color: #451a03 !important;
  border: 1px solid #ffffff !important;
  box-shadow: 0 0 12px rgba(250, 204, 21, 0.9) !important;
  padding: 2px 7px !important;
  gap: 3px;
}

.apex-badge-label {
  font-size: 0.6rem;
  font-weight: 900;
  letter-spacing: 0.08em;
}

/* Completed Jewel State */
.adventure-block.completed,
.level-tile-stone.completed,
.adv-trail-node.completed {
  background: linear-gradient(180deg, #38bdf8 0%, #0284c7 60%, #0369a1 100%);
  border: 2px solid #bae6fd;
  box-shadow:
    0 4px 14px rgba(14, 165, 233, 0.5),
    0 0 20px rgba(56, 189, 248, 0.35);
}

.completed-num {
  color: #ffffff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.65);
}

.adv-stars-arch {
  position: absolute;
  top: -14px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: flex-end;
  gap: 2px;
  z-index: 6;
  pointer-events: none;
}

.adv-star-mini {
  color: #facc15;
  filter: drop-shadow(0 0 3px rgba(250, 204, 21, 0.8));
}

.adv-star-mini.center {
  margin-bottom: 2px;
}

/* Inter-Realm Conduit Stream (Connects Chapter N-1 up to Chapter N) */
.realm-connector-conduit {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 36px;
  margin: -6px 0;
  position: relative;
  z-index: 2;
  pointer-events: none;
}

.conduit-vertical-stream {
  width: 6px;
  height: 100%;
  border-radius: 3px;
  transition: all 0.3s ease;
}

.conduit-vertical-stream.stream-active {
  background: linear-gradient(0deg, var(--stream-start), var(--stream-end));
  box-shadow: 0 0 10px #38bdf8, 0 0 18px rgba(56, 189, 248, 0.6);
  animation: conduit-stream-pulse 2s infinite alternate ease-in-out;
}

@keyframes conduit-stream-pulse {
  0% { filter: brightness(1) drop-shadow(0 0 4px #38bdf8); }
  100% { filter: brightness(1.25) drop-shadow(0 0 10px #38bdf8); }
}

.conduit-vertical-stream.stream-dormant {
  background: rgba(255, 255, 255, 0.12);
}

/* Floating Quick-Locate Pill */
.floating-locate-pill {
  position: fixed;
  right: 18px;
  bottom: 84px;
  z-index: 30;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%);
  border: 1.5px solid #facc15;
  border-radius: 9999px;
  padding: 6px 14px 6px 10px;
  color: #ffffff;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5), 0 0 14px rgba(250, 204, 21, 0.4);
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(12px);
}

.floating-locate-pill:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6), 0 0 20px rgba(250, 204, 21, 0.7);
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%);
}

.locate-nav-icon {
  color: #facc15;
}

.adv-completed-indicator {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #f59e0b;
  border: 1.5px solid #fef08a;
  box-shadow: 0 0 6px rgba(245, 158, 11, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  z-index: 6;
}

/* Active / Current Level Node */
.adventure-block.current-unlocked,
.level-tile-stone.current-unlocked,
.adv-trail-node.current-unlocked {
  background: linear-gradient(180deg, #fde047 0%, #eab308 60%, #ca8a04 100%);
  border: 2.5px solid #ffffff;
  box-shadow:
    0 0 24px rgba(234, 179, 8, 0.9),
    0 4px 16px rgba(0, 0, 0, 0.6);
  z-index: 8;
  animation: current-node-pulse 2s infinite ease-in-out;
}

.current-num {
  color: #713f12;
  font-weight: 900;
  font-size: 1.15rem;
}

@keyframes current-node-pulse {
  0%, 100% { box-shadow: 0 0 20px rgba(234, 179, 8, 0.8), 0 4px 16px rgba(0, 0, 0, 0.6); }
  50% { box-shadow: 0 0 32px rgba(250, 204, 21, 1), 0 0 45px rgba(234, 179, 8, 0.6); }
}

.adv-beacon-rings {
  position: absolute;
  inset: -10px;
  pointer-events: none;
  z-index: 1;
}

.adv-radar-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid #facc15;
  animation: radar-beacon 2s infinite cubic-bezier(0, 0.2, 0.8, 1);
}

.adv-radar-ring.r2 {
  animation-delay: 1s;
}

/* 3D Animated Hero Pin ("YOU") */
.adventure-pointer-marker {
  position: absolute;
  top: -24px;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
  z-index: 12;
  animation: pointer-float 1.8s infinite ease-in-out;
}

@keyframes pointer-float {
  0%, 100% { transform: translate(-50%, 0); }
  50% { transform: translate(-50%, -4px); }
}

.adv-hero-pin {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.adv-pin-label {
  background: linear-gradient(135deg, #facc15 0%, #eab308 100%);
  color: #451a03;
  font-size: 0.64rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  padding: 2px 7px;
  border-radius: 6px;
  border: 1px solid #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5), 0 0 10px rgba(250, 204, 21, 0.7);
}

.adv-pin-triangle {
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid #eab308;
}

/* Locked Node */
.adventure-block.locked-stone,
.level-tile-stone.locked-stone,
.adv-trail-node.locked-stone {
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  border: 1.5px solid rgba(148, 163, 184, 0.2);
  box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.06), 0 4px 10px rgba(0, 0, 0, 0.4);
}

.locked-num {
  color: #64748b;
  font-size: 0.95rem;
}

.adv-node-micro-lock {
  position: absolute;
  bottom: 2px;
  right: 2px;
  color: #64748b;
  z-index: 5;
}

/* Unlocked Stone */
.adventure-block.unlocked-stone:not(.completed):not(.current-unlocked),
.adv-trail-node.unlocked-stone:not(.completed):not(.current-unlocked) {
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  border: 2px solid rgba(56, 189, 248, 0.5);
  box-shadow: 0 0 10px rgba(56, 189, 248, 0.25);
}

.unlocked-num {
  color: #38bdf8;
}

/* Selected Node Aura */
.adventure-block.selected-stone,
.level-tile-stone.selected-stone,
.adv-trail-node.selected-stone {
  outline: 3px solid #38bdf8;
  outline-offset: 3px;
  box-shadow: 0 0 25px rgba(56, 189, 248, 0.8) !important;
  z-index: 12 !important;
}

`;

const updatedCss = css.slice(0, actualStartIndex) + newAdventureSection + css.slice(actualEndIndex);
fs.writeFileSync(cssPath, updatedCss, 'utf8');
console.log('Successfully updated src/App.css with upward adventure styling!');
