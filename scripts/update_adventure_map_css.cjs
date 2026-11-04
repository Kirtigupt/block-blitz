const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '..', 'src', 'App.css');
let css = fs.readFileSync(cssPath, 'utf8');

const targetStr = `/* Trophy Challenge Banner */
.adventure-trophy-banner {`;
const targetStrCRLF = `/* Trophy Challenge Banner */\r\n.adventure-trophy-banner {`;

const isCRLF = css.includes('\r\n');
const target = isCRLF ? targetStrCRLF : targetStr;

const newStyles = `/* Adventure Departure Terminal Banner (Top of Map - Level 1 Starts Here) */
.adventure-departure-banner {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 440px;
  padding: 16px 18px;
  margin-bottom: 22px;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.92) 0%, rgba(8, 14, 26, 0.98) 100%);
  border: 1.5px solid rgba(56, 189, 248, 0.3);
  border-radius: 20px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.12);
  text-align: center;
  box-sizing: border-box;
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

/* Trophy Challenge Banner / Grand Finale Monument (Bottom of Map) */
.adventure-trophy-banner {`;

if (!css.includes(target)) {
  console.error('Target marker not found!');
  process.exit(1);
}

css = css.replace(target, newStyles);

// Add grand finale banner styles & conduit styles
const endTargetStr = `.adv-completed-indicator {`;
const endTargetStrCRLF = `.adv-completed-indicator {\r\n`;
const endTarget = isCRLF ? endTargetStrCRLF : endTargetStr;

const extraStyles = `/* Grand Finale Trophy Monument (Level 100 Apex at Bottom of Map) */
.adventure-trophy-banner.grand-finale-banner {
  margin-top: 36px;
  margin-bottom: 70px;
  padding: 24px 20px;
  background: radial-gradient(circle at 50% 30%, rgba(250, 204, 21, 0.08) 0%, rgba(15, 23, 42, 0.95) 70%);
  border: 1.5px solid rgba(250, 204, 21, 0.35);
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6), 0 0 24px rgba(250, 204, 21, 0.25);
  max-width: 420px;
  box-sizing: border-box;
}

.trophy-finale-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  padding: 3px 10px;
  background: rgba(250, 204, 21, 0.15);
  border: 1px solid rgba(250, 204, 21, 0.4);
  border-radius: 9999px;
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  color: #fde047;
}

.finale-crown-icon {
  color: #facc15;
}

/* Inter-Realm Conduit Stream (Connects Chapter N to Chapter N+1) */
.realm-connector-conduit {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 28px;
  margin: -14px 0;
  position: relative;
  z-index: 2;
  pointer-events: none;
}

.conduit-vertical-stream {
  width: 5px;
  height: 100%;
  border-radius: 3px;
}

.conduit-vertical-stream.stream-active {
  background: linear-gradient(180deg, var(--stream-start), var(--stream-end));
  box-shadow: 0 0 8px #38bdf8, 0 0 14px rgba(56, 189, 248, 0.5);
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

.adv-completed-indicator {`;

css = css.replace(endTarget, extraStyles + (isCRLF ? '\r\n' : '\n'));

fs.writeFileSync(cssPath, css, 'utf8');
console.log('Successfully updated App.css with Adventure Map top-to-bottom layout styles!');
