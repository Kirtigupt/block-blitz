const fs = require('fs');

let css = fs.readFileSync('src/App.css', 'utf-8');
const isCrlf = css.includes('\r\n');
if (isCrlf) {
  css = css.replace(/\r\n/g, '\n');
}

// 1. In @media (max-width: 600px), ensure .hud-nav-left and .hud-nav-right are styled
const target600 = `  /* Two Compact Rows on Mobile */
  .header-top,
  .hud-command-bar {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    gap: 4px;
    width: 100%;
    padding: 3px 8px;
    border-radius: var(--radius-md);
    max-height: 78px;
    box-sizing: border-box;
  }`;

const replacement600 = `  /* Two Compact Rows on Mobile */
  .header-top,
  .hud-command-bar {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    gap: 4px;
    width: 100%;
    padding: 3px 8px;
    border-radius: var(--radius-md);
    max-height: 78px;
    box-sizing: border-box;
  }

  .hud-nav-left {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    gap: 8px;
  }

  .hud-nav-right {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    gap: 4px;
  }

  .hud-tactile-btn {
    width: 30px;
    height: 30px;
    border-radius: 7px;
  }

  .hud-control-pod {
    gap: 3px;
  }

  .hero-scoreboard-console {
    padding: 6px 12px;
  }

  .hero-score-number {
    font-size: 1.7rem;
  }

  .best-score-number,
  .streak-tally-number {
    font-size: 1.05rem;
  }

  .mission-control-hud {
    padding: 7px 10px 8px;
    gap: 5px;
  }`;

if (css.includes(target600)) {
  css = css.replace(target600, replacement600);
  console.log('Patched @media (max-width: 600px)');
} else {
  console.warn('target600 not found!');
}

// 2. In @media (max-width: 360px), add responsive rules for new HUD
const target360 = `@media (max-width: 360px) {
  .logo-badge,`;

const replacement360 = `@media (max-width: 360px) {
  .hud-command-bar {
    padding: 3px 6px;
    gap: 3px;
  }

  .brand-word-block,
  .brand-word-blitz {
    font-size: 0.95rem;
  }

  .brand-gem-insignia {
    width: 20px;
    height: 20px;
  }

  .hud-waypoint-chip {
    padding: 0 7px;
    font-size: 0.68rem;
    min-height: 26px;
    height: 26px;
  }

  .hud-signin-pill,
  .hud-profile-pill {
    padding: 0 6px;
    font-size: 0.68rem;
    height: 28px;
    min-height: 28px;
    gap: 3px;
    max-width: 75px;
  }

  .hud-tactile-btn {
    width: 27px;
    height: 27px;
    min-width: 27px;
    min-height: 27px;
    border-radius: 6px;
  }

  .hud-control-pod {
    gap: 2px;
  }

  .hud-v-divider {
    height: 16px;
    margin: 0 1px;
  }

  .hero-scoreboard-console {
    padding: 5px 8px;
    gap: 8px;
  }

  .hero-score-number {
    font-size: 1.45rem;
  }

  .best-score-number,
  .streak-tally-number {
    font-size: 0.92rem;
  }

  .mission-control-hud {
    padding: 5px 8px 6px;
    gap: 4px;
  }

  .taxonomy-chapter-name {
    display: none;
  }

  .directive-statement {
    font-size: 0.72rem;
  }

  .mission-counter-badge {
    font-size: 0.72rem;
    padding: 2px 6px;
  }

  .logo-badge,`;

if (css.includes(target360)) {
  css = css.replace(target360, replacement360);
  console.log('Patched @media (max-width: 360px)');
} else {
  console.warn('target360 not found!');
}

// 3. In @media (min-width: 601px), ensure desktop layout for .hud-command-bar, .hud-nav-left, .hud-nav-right
const targetDesktop = `  /* 2. Desktop Tactical Command Bar */
  .header-top,
  .hud-command-bar {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    padding: 5px 14px;
    min-height: 46px;
    max-height: 48px;
    box-sizing: border-box;
    gap: 8px;
  }`;

const replacementDesktop = `  /* 2. Desktop Tactical Command Bar */
  .header-top,
  .hud-command-bar {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 6px 16px;
    min-height: 48px;
    max-height: 50px;
    box-sizing: border-box;
    gap: 12px;
  }

  .hud-nav-left {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }

  .hud-nav-right {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .hud-tactile-btn {
    width: 34px;
    height: 34px;
  }`;

if (css.includes(targetDesktop)) {
  css = css.replace(targetDesktop, replacementDesktop);
  console.log('Patched @media (min-width: 601px)');
} else {
  console.warn('targetDesktop not found!');
}

if (isCrlf) {
  css = css.replace(/\n/g, '\r\n');
}

fs.writeFileSync('src/App.css', css, 'utf-8');
console.log('Successfully updated App.css with responsive HUD rules!');
