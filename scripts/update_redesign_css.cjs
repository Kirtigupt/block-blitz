const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '..', 'src', 'App.css');
let css = fs.readFileSync(cssPath, 'utf8');

// Find boundaries
const startMarker = '/* ==========================================================================\r\n   Level Intro Modal (Arcade Mission Briefing Screen)\r\n   ========================================================================== */';
const startMarkerLF = '/* ==========================================================================\n   Level Intro Modal (Arcade Mission Briefing Screen)\n   ========================================================================== */';

const endMarker = '/* ==========================================================================\r\n   Auth, Profile & Leaderboard Modals\r\n   ========================================================================== */';
const endMarkerLF = '/* ==========================================================================\n   Auth, Profile & Leaderboard Modals\n   ========================================================================== */';

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
   Level Intro Modal (Arcade Mission Briefing Screen - Redesigned)
   ========================================================================== */

.level-intro-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: radial-gradient(circle at 50% 30%, rgba(6, 182, 212, 0.18) 0%, rgba(6, 11, 24, 0.92) 50%, rgba(3, 7, 16, 0.98) 100%);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  user-select: none;
}

.level-intro-card {
  position: relative;
  max-width: 480px;
  width: min(94vw, 480px);
  background: linear-gradient(180deg, #0d1527 0%, #080d1a 100%);
  border: 1.5px solid rgba(56, 189, 248, 0.45);
  border-radius: 22px;
  box-shadow:
    0 25px 65px -10px rgba(0, 0, 0, 0.95),
    0 0 40px rgba(6, 182, 212, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.16);
  padding: 24px 22px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  overflow: hidden;
  animation: intro-card-appear 0.26s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.intro-card-boss {
  border-color: rgba(251, 191, 36, 0.7) !important;
  box-shadow:
    0 25px 70px -10px rgba(0, 0, 0, 0.95),
    0 0 50px rgba(245, 158, 11, 0.32),
    inset 0 1px 0 rgba(254, 240, 138, 0.25) !important;
}

/* Corner HUD brackets */
.intro-corner {
  position: absolute;
  width: 12px;
  height: 12px;
  border-color: rgba(56, 189, 248, 0.85);
  pointer-events: none;
  z-index: 2;
}
.intro-corner-tl { top: 10px; left: 10px; border-top: 2.5px solid; border-left: 2.5px solid; border-top-left-radius: 4px; }
.intro-corner-tr { top: 10px; right: 10px; border-top: 2.5px solid; border-right: 2.5px solid; border-top-right-radius: 4px; }
.intro-corner-bl { bottom: 10px; left: 10px; border-bottom: 2.5px solid; border-left: 2.5px solid; border-bottom-left-radius: 4px; }
.intro-corner-br { bottom: 10px; right: 10px; border-bottom: 2.5px solid; border-right: 2.5px solid; border-bottom-right-radius: 4px; }

/* Halo Glow */
.intro-glow-aura {
  position: absolute;
  top: -60px;
  left: 50%;
  transform: translateX(-50%);
  width: 320px;
  height: 160px;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(40px);
  opacity: 0.6;
  animation: intro-halo-pulse 4s ease-in-out infinite;
  z-index: 1;
}

/* Laser strip */
.intro-accent-laser {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  z-index: 3;
}

/* 1. Top Telemetry Bar */
.intro-telemetry-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 8px;
  position: relative;
  z-index: 2;
}

.intro-chapter-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 9999px;
  border: 1px solid rgba(56, 189, 248, 0.4);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #e2e8f0;
  max-width: calc(100% - 95px);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.intro-chapter-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.intro-chapter-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.intro-stage-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 12px;
  border-radius: 9999px;
  border: 1px solid rgba(56, 189, 248, 0.5);
  font-size: 0.75rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  color: #ffffff;
  flex-shrink: 0;
}

.intro-stage-prefix {
  color: rgba(226, 232, 240, 0.75);
  font-size: 0.68rem;
  font-weight: 800;
}

.intro-stage-num {
  color: #38bdf8;
  font-size: 0.82rem;
}

.intro-stage-boss {
  color: #fbbf24;
  border-color: rgba(251, 191, 36, 0.8) !important;
  box-shadow: 0 0 15px rgba(245, 158, 11, 0.4);
}

.intro-boss-crown {
  color: #fbbf24;
}

/* 2. Hero Mission Showcase (Title & Sigil Dominance) */
.intro-hero-showcase {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  padding: 10px 14px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(15, 23, 42, 0.5) 100%);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  position: relative;
  z-index: 2;
  box-sizing: border-box;
}

.intro-stage-sigil {
  width: 54px;
  height: 54px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%);
  border: 2px solid #38bdf8;
  box-shadow: 0 0 18px rgba(56, 189, 248, 0.35), inset 0 1px 2px rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
}

.sigil-boss {
  border-color: #fbbf24 !important;
  box-shadow: 0 0 22px rgba(250, 204, 21, 0.5), inset 0 1px 2px rgba(254, 240, 138, 0.3) !important;
}

.sigil-icon-crown {
  color: #fbbf24;
  filter: drop-shadow(0 0 6px rgba(250, 204, 21, 0.7));
}

.sigil-num-display {
  font-size: 1.35rem;
  font-weight: 900;
  color: #ffffff;
  letter-spacing: -0.02em;
  text-shadow: 0 0 10px rgba(56, 189, 248, 0.6);
}

.sigil-glow-pulse {
  position: absolute;
  inset: -4px;
  border-radius: 18px;
  opacity: 0.15;
  filter: blur(6px);
  pointer-events: none;
}

.intro-title-block {
  display: flex;
  flex-direction: column;
  gap: 3px;
  text-align: left;
  min-width: 0;
  flex: 1;
}

.intro-title-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  color: rgba(148, 163, 184, 0.9);
  text-transform: uppercase;
}

.intro-eyebrow-line {
  width: 14px;
  height: 1.5px;
  border-radius: 1px;
}

.intro-title-text {
  font-size: 1.7rem;
  font-weight: 900;
  color: #ffffff;
  letter-spacing: -0.02em;
  line-height: 1.15;
  margin: 0;
  background: linear-gradient(135deg, #ffffff 40%, #7dd3fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}

.intro-protocol-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 1px;
}

.protocol-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  animation: radar-beacon 1.8s infinite ease-in-out;
}

.protocol-text {
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: #94a3b8;
}

/* 3. Engaging Mission Objective Panel */
.intro-objective-panel {
  width: 100%;
  border-radius: 16px;
  padding: 14px 16px;
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.08) 0%, rgba(30, 58, 138, 0.16) 100%);
  border: 1px solid rgba(56, 189, 248, 0.4);
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: relative;
  z-index: 2;
  box-sizing: border-box;
}

.intro-obj-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
}

.intro-obj-tag {
  display: flex;
  align-items: center;
  gap: 10px;
}

.intro-obj-icon-halo {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid;
  flex-shrink: 0;
  box-shadow: 0 0 14px rgba(56, 189, 248, 0.25);
}

.intro-obj-title-col {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.intro-obj-kicker {
  font-size: 0.58rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  color: rgba(148, 163, 184, 0.85);
  text-transform: uppercase;
}

.intro-obj-type-label {
  font-size: 0.82rem;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.intro-target-badge {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 4px 10px;
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.9);
  border: 1.5px solid;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
}

.intro-target-label {
  font-size: 0.52rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: rgba(148, 163, 184, 0.85);
  text-transform: uppercase;
}

.intro-target-val {
  font-size: 0.85rem;
  font-weight: 900;
  color: #ffffff;
  letter-spacing: 0.04em;
}

.intro-obj-body {
  width: 100%;
}

.intro-directive-callout {
  width: 100%;
  text-align: left;
  padding: 10px 14px;
  background: rgba(8, 14, 28, 0.75);
  border-left: 3.5px solid #38bdf8;
  border-radius: 0 10px 10px 0;
  box-sizing: border-box;
}

.intro-obj-description {
  font-size: 0.96rem;
  font-weight: 700;
  color: #f8fafc;
  line-height: 1.42;
  margin: 0;
}

.intro-hazard-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 5px 12px;
  border-radius: 8px;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  background: rgba(245, 158, 11, 0.14);
  border: 1px solid rgba(245, 158, 11, 0.5);
  color: #fbbf24;
  width: fit-content;
}

.intro-hazard-icon {
  color: #f59e0b;
}

.intro-hazard-label {
  color: rgba(251, 191, 36, 0.85);
  font-size: 0.64rem;
}

.intro-hazard-name {
  color: #ffffff;
}

/* 4. Dedicated Golden Reward Vault */
.intro-reward-badge {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 11px 16px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.18) 0%, rgba(180, 83, 9, 0.12) 100%);
  border: 1.5px solid rgba(251, 191, 36, 0.55);
  box-shadow:
    0 4px 18px rgba(245, 158, 11, 0.16),
    inset 0 1px 0 rgba(254, 240, 138, 0.3);
  position: relative;
  overflow: hidden;
  z-index: 2;
  box-sizing: border-box;
  animation: intro-reward-shimmer 3s ease-in-out infinite;
}

.intro-reward-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.intro-reward-icon-box {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(245, 158, 11, 0.25);
  border: 1.5px solid rgba(251, 191, 36, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fbbf24;
  flex-shrink: 0;
  box-shadow: 0 0 12px rgba(250, 204, 21, 0.35);
}

.intro-gold-award {
  color: #fbbf24;
}

.intro-reward-text-col {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.intro-reward-kicker {
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.1em;
  color: #fde047;
  text-transform: uppercase;
}

.intro-reward-sub {
  font-size: 0.64rem;
  font-weight: 600;
  color: rgba(253, 224, 71, 0.85);
}

.intro-reward-right {
  display: flex;
  align-items: baseline;
  gap: 3px;
  color: #facc15;
  font-weight: 900;
  flex-shrink: 0;
}

.intro-reward-plus {
  font-size: 1rem;
  font-weight: 900;
  color: #fde047;
}

.intro-reward-amount {
  font-size: 1.25rem;
  font-weight: 900;
  color: #ffffff;
  letter-spacing: -0.01em;
  text-shadow: 0 0 16px rgba(250, 204, 21, 0.6);
}

.intro-reward-unit {
  font-size: 0.75rem;
  font-weight: 800;
  color: #fde047;
  margin-left: 2px;
}

/* 5. Start Level Button & CTA Section */
.intro-cta-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  position: relative;
  z-index: 2;
}

.intro-start-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  height: 52px;
  font-size: 1.02rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #ffffff;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow:
    0 8px 24px -4px rgba(6, 182, 212, 0.55),
    0 0 18px rgba(37, 99, 235, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: all 0.16s cubic-bezier(0.16, 1, 0.3, 1);
}

.intro-start-btn:hover {
  transform: translateY(-2px);
  box-shadow:
    0 12px 32px -4px rgba(6, 182, 212, 0.7),
    0 0 24px rgba(37, 99, 235, 0.55);
  filter: brightness(1.08);
}

.intro-start-btn:active {
  transform: translateY(2px);
  filter: brightness(0.95);
}

.intro-btn-bezel {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.25);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.intro-btn-play-icon {
  margin-left: 2px;
}

.intro-btn-label {
  display: inline-block;
}

.intro-btn-key-badge {
  font-size: 0.68rem;
  font-weight: 800;
  background: rgba(0, 0, 0, 0.3);
  padding: 3px 7px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: 0.04em;
}

.intro-desktop-hint {
  font-size: 0.68rem;
  font-weight: 600;
  color: rgba(148, 163, 184, 0.75);
  margin: 0;
}

.intro-desktop-hint strong {
  color: #e2e8f0;
  font-weight: 800;
}

/* Animations */
@keyframes intro-card-appear {
  0% {
    opacity: 0;
    transform: scale(0.94) translateY(12px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes intro-reward-shimmer {
  0%, 100% {
    border-color: rgba(251, 191, 36, 0.45);
    box-shadow: 0 4px 16px rgba(245, 158, 11, 0.14);
  }
  50% {
    border-color: rgba(251, 191, 36, 0.75);
    box-shadow: 0 4px 22px rgba(245, 158, 11, 0.32);
  }
}

@keyframes intro-halo-pulse {
  0%, 100% {
    opacity: 0.45;
    transform: translateX(-50%) scale(1);
  }
  50% {
    opacity: 0.7;
    transform: translateX(-50%) scale(1.08);
  }
}

/* Reduced Motion Preference */
@media (prefers-reduced-motion: reduce) {
  .level-intro-card,
  .intro-reward-badge,
  .intro-glow-aura,
  .intro-start-btn {
    animation: none !important;
    transition: none !important;
  }
}

/* Responsive Breakpoints */
@media (max-width: 480px) {
  .level-intro-card {
    padding: 20px 16px;
    gap: 12px;
    border-radius: 18px;
  }
  .intro-title-text {
    font-size: 1.55rem;
  }
  .intro-start-btn {
    height: 48px;
    font-size: 0.94rem;
  }
  .intro-desktop-hint {
    display: none;
  }
}

@media (max-width: 360px) {
  .level-intro-card {
    padding: 16px 12px;
    gap: 10px;
    border-radius: 16px;
  }
  .intro-chapter-text {
    font-size: 0.65rem;
  }
  .intro-title-text {
    font-size: 1.35rem;
  }
  .intro-stage-sigil {
    width: 44px;
    height: 44px;
  }
  .sigil-num-display {
    font-size: 1.1rem;
  }
  .intro-obj-description {
    font-size: 0.86rem;
  }
  .intro-reward-badge {
    padding: 8px 10px;
  }
  .intro-reward-amount {
    font-size: 1.05rem;
  }
  .intro-start-btn {
    height: 46px;
    font-size: 0.9rem;
  }
}

/* ==========================================================================
   ADVENTURE CAMPAIGN LEVEL MAP (WINDING JOURNEY PROGRESSION THROUGH 10 REALMS)
   ========================================================================== */

.campaign-map-screen,
.adventure-map-screen,
.level-map-screen {
  position: fixed;
  inset: 0;
  background-color: #070c18;
  background-image:
    radial-gradient(ellipse 90% 55% at 50% -10%, rgba(6, 182, 212, 0.16) 0%, transparent 70%),
    radial-gradient(circle at 10% 40%, rgba(147, 51, 234, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 90% 60%, rgba(245, 158, 11, 0.07) 0%, transparent 50%),
    linear-gradient(rgba(56, 189, 248, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(56, 189, 248, 0.03) 1px, transparent 1px);
  background-size: 100% 100%, 100% 100%, 100% 100%, 32px 32px, 32px 32px;
  background-position: center top, center center, center center, center center;
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

/* Trophy Challenge Banner */
.adventure-trophy-banner {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
  text-align: center;
  width: 100%;
}

.adventure-trophy-pedestal {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.trophy-ambient-glow {
  position: absolute;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(250, 204, 21, 0.4) 0%, transparent 70%);
  filter: blur(14px);
  pointer-events: none;
}

.adventure-trophy-svg {
  width: 68px;
  height: 68px;
  color: #475569;
  filter: drop-shadow(0 4px 16px rgba(0, 0, 0, 0.5));
  transition: all 0.3s ease;
  z-index: 1;
}

.adventure-trophy-svg.trophy-champion {
  color: #facc15;
  filter: drop-shadow(0 0 20px rgba(250, 204, 21, 0.8));
}

.adventure-trophy-headline {
  font-size: 1.15rem;
  font-weight: 900;
  letter-spacing: 0.04em;
  color: #ffffff;
  margin: 8px 0 2px 0;
  text-shadow: 0 0 14px rgba(56, 189, 248, 0.35);
}

.adventure-trophy-subtitle {
  font-size: 0.82rem;
  font-weight: 600;
  color: #94a3b8;
  margin: 0;
  max-width: 320px;
  line-height: 1.4;
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
  gap: 32px;
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

/* Realm Gateway Archway */
.realm-gateway-arch {
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 16px;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.85) 0%, rgba(10, 16, 28, 0.6) 100%);
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

/* Winding Trail Canvas for 10 nodes */
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

/* 5. 3D Adventure Nodes (Orbs / Jewels) */
.adventure-block,
.level-tile-stone,
.level-card-item,
.adv-trail-node {
  position: absolute;
  transform: translate(-50%, -50%);
  width: 52px;
  height: 52px;
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

/* Boss Milestone Stage (Levels 10, 20, 30... 100) */
.adventure-block.boss-stone,
.level-tile-stone.boss-stone,
.adv-trail-node.boss-stone {
  width: 66px;
  height: 66px;
  border-radius: 18px;
  border: 2.5px solid #facc15 !important;
  box-shadow:
    0 0 22px rgba(250, 204, 21, 0.6),
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

/* 6. Redesigned Floating Bottom Dock */
.adventure-bottom-dock,
.compact-action-dock,
.selected-level-dock {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 76px;
  max-height: 84px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px 18px max(10px, env(safe-area-inset-bottom)) 18px;
  background: rgba(10, 16, 28, 0.96);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  z-index: 100;
  border-top: 1px solid rgba(56, 189, 248, 0.2);
  box-shadow: 0 -8px 28px rgba(0, 0, 0, 0.65);
  box-sizing: border-box;
}

.dock-content-wrapper {
  width: 100%;
  max-width: 680px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
}

.dock-stage-info-column {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
  text-align: left;
}

.dock-stage-header-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dock-stage-crest {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.9);
  border: 1.5px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 0 10px rgba(56, 189, 248, 0.25);
}

.dock-crest-num {
  font-size: 0.85rem;
  font-weight: 900;
  color: #ffffff;
}

.dock-stage-text-block {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.dock-stage-top-meta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.dock-ch-badge {
  font-size: 0.68rem;
  font-weight: 800;
  color: #38bdf8;
  text-transform: uppercase;
}

.dock-boss-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  background: rgba(250, 204, 21, 0.18);
  border: 1px solid rgba(250, 204, 21, 0.5);
  color: #facc15;
  font-size: 0.62rem;
  font-weight: 900;
  padding: 1px 6px;
  border-radius: 6px;
  flex-shrink: 0;
}

.dock-stage-name {
  font-size: 0.95rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dock-stage-objective-snippet {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.74rem;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dock-obj-icon-tag {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}

.dock-obj-text {
  overflow: hidden;
  text-overflow: ellipsis;
}

.dock-pts-badge {
  font-size: 0.7rem;
  font-weight: 800;
  color: #fde047;
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.35);
  padding: 1px 6px;
  border-radius: 6px;
  flex-shrink: 0;
}

.adventure-play-btn,
.dock-action-button,
.dock-launch-btn {
  height: 48px;
  min-width: 140px;
  max-width: 240px;
  padding: 0 20px;
  border-radius: 14px;
  background: linear-gradient(180deg, #4ade80 0%, #22c55e 40%, #16a34a 100%);
  border: 1px solid rgba(255, 255, 255, 0.28);
  box-shadow: 0 4px 0 #15803d, 0 8px 22px rgba(34, 197, 94, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.4);
  color: #ffffff;
  font-size: 1.05rem;
  font-weight: 900;
  cursor: pointer;
  letter-spacing: 0.4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: transform 0.08s ease, box-shadow 0.08s ease, filter 0.15s ease;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
  user-select: none;
  white-space: nowrap;
  flex-shrink: 0;
}

.adventure-play-btn:hover:not(:disabled),
.dock-action-button:hover:not(:disabled),
.dock-launch-btn:hover:not(:disabled) {
  filter: brightness(1.08);
  transform: translateY(-1px);
  box-shadow: 0 5px 0 #15803d, 0 10px 24px rgba(34, 197, 94, 0.6);
}

.adventure-play-btn:active:not(:disabled),
.dock-action-button:active:not(:disabled),
.dock-launch-btn:active:not(:disabled) {
  transform: translateY(3px);
  box-shadow: 0 1px 0 #15803d, 0 3px 8px rgba(34, 197, 94, 0.3);
}

.adventure-play-btn.btn-locked,
.adventure-play-btn:disabled,
.dock-action-button.btn-locked,
.dock-action-button:disabled {
  background: linear-gradient(180deg, #334155 0%, #1e293b 100%) !important;
  border-color: rgba(148, 163, 184, 0.25) !important;
  box-shadow: 0 4px 0 #0f172a !important;
  color: #94a3b8 !important;
  cursor: not-allowed !important;
  opacity: 0.85;
}

.adventure-play-btn.btn-replay {
  background: linear-gradient(180deg, #38bdf8 0%, #0284c7 40%, #0369a1 100%);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 0 #075985, 0 8px 22px rgba(14, 165, 233, 0.45);
}

.dock-btn-main {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

@media (max-width: 580px) {
  .dock-stage-objective-snippet {
    display: none;
  }
}
`;

const newCss = css.slice(0, startIndex) + (isCRLF ? replacement.replace(/\n/g, '\r\n') : replacement) + '\r\n\r\n' + css.slice(endIndex);
fs.writeFileSync(cssPath, newCss, 'utf8');
console.log('Successfully updated App.css with redesigned Mission Briefing and Adventure Progression Map!');
