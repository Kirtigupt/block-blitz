const fs = require('fs');

let css = fs.readFileSync('src/App.css', 'utf-8');
const isCrlf = css.includes('\r\n');
if (isCrlf) {
  css = css.replace(/\r\n/g, '\n');
}

const target = `/* Expedition Basecamp Banner (Ground Zero - Level 1 Launch Terminal at Bottom of Map) */`;

const chapterFocusCSS = `/* Chapter Focus Banner (Dedicated Realm Header when a Specific Chapter is Selected) */
.chapter-focus-header {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 10px;
  margin-bottom: 22px;
  padding: 0 4px;
  box-sizing: border-box;
}

.chapter-focus-banner {
  max-width: 440px;
  width: 100%;
  padding: 16px 20px;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.94) 0%, rgba(8, 14, 26, 0.98) 100%);
  border: 1.5px solid var(--chapter-accent, rgba(56, 189, 248, 0.35));
  border-radius: 20px;
  box-shadow: 0 4px 28px rgba(0, 0, 0, 0.55), 0 0 20px rgba(56, 189, 248, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  box-sizing: border-box;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.chapter-focus-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 12px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--chapter-accent, rgba(56, 189, 248, 0.45));
  border-radius: 9999px;
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  color: var(--chapter-accent, #38bdf8);
}

.chapter-focus-alt {
  background: var(--chapter-accent, #38bdf8);
  color: #042f2e;
  padding: 1px 6px;
  border-radius: 6px;
  font-size: 0.6rem;
  font-weight: 900;
}

.chapter-focus-title {
  font-size: 1.25rem;
  font-weight: 900;
  letter-spacing: 0.02em;
  color: #ffffff;
  margin: 2px 0 0 0;
  text-shadow: 0 0 16px var(--chapter-accent, rgba(56, 189, 248, 0.5));
}

.chapter-focus-stages {
  font-size: 0.78rem;
  font-weight: 600;
  color: #94a3b8;
  margin: 0;
  letter-spacing: 0.03em;
}

.chapter-focus-progress-wrap {
  width: 100%;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 4px;
}

.chapter-focus-stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.72rem;
  font-weight: 700;
  color: #cbd5e1;
}

.chapter-focus-stat-percent {
  color: var(--chapter-accent, #38bdf8);
  font-weight: 800;
}

`;

if (!css.includes('.chapter-focus-banner')) {
  if (css.includes(target)) {
    css = css.replace(target, chapterFocusCSS + target);
    console.log('Added chapter focus CSS to App.css');
  } else {
    console.warn('Target not found in App.css');
  }
} else {
  console.log('chapter-focus-banner already exists in App.css');
}

if (isCrlf) {
  css = css.replace(/\n/g, '\r\n');
}

fs.writeFileSync('src/App.css', css, 'utf-8');
console.log('App.css updated successfully!');
