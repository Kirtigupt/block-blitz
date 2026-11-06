const fs = require('fs');

// 1. Read LevelMap.jsx
let levelMapCode = fs.readFileSync('src/components/LevelMap.jsx', 'utf-8');
const isCrlf = levelMapCode.includes('\r\n');
if (isCrlf) {
  levelMapCode = levelMapCode.replace(/\r\n/g, '\n');
}

console.log('Original LevelMap.jsx length:', levelMapCode.length);

// 2. Check for pillsBarRef and mobilePillsBarRef
if (!levelMapCode.includes('pillsBarRef')) {
  // Insert refs near chapterSectionRefs
  levelMapCode = levelMapCode.replace(
    '  const chapterSectionRefs = useRef({});',
    `  const chapterSectionRefs = useRef({});\n  const pillsBarRef = useRef(null);\n  const mobilePillsBarRef = useRef(null);\n\n  // Keep active chapter tab centered in view\n  useEffect(() => {\n    const scrollTab = (barRef) => {\n      if (!barRef.current) return;\n      const activeBtn = barRef.current.querySelector('.ch-pill-item.active');\n      if (activeBtn) {\n        activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });\n      }\n    };\n    scrollTab(pillsBarRef);\n    scrollTab(mobilePillsBarRef);\n  }, [activeChapterFilter]);`
  );
  console.log('Added pillsBarRef and auto-scroll tab effect');
}

// 3. Update chapterPaths to consider activeChapterFilter
const oldChapterPathsTarget = `      const hasLeadIn = ch.chapter > 1;
      const hasLeadOut = true;`;

const newChapterPaths = `      // When isolated in single chapter mode, starts cleanly at first node.
      const hasLeadIn = activeChapterFilter === 0 && ch.chapter > 1;
      // In All Realms, chapters connect upward. In single chapter mode, Chapter 10 connects to Zenith Citadel.
      const hasLeadOut = activeChapterFilter === 0 || ch.chapter === 10;`;

if (levelMapCode.includes(oldChapterPathsTarget)) {
  levelMapCode = levelMapCode.replace(oldChapterPathsTarget, newChapterPaths);
  console.log('Updated chapterPaths lead-in and lead-out logic');
}

// 4. Update chapterPaths dependencies from [unlockedLevel] to [unlockedLevel, activeChapterFilter]
levelMapCode = levelMapCode.replace(
  '    return map;\n  }, [unlockedLevel]);',
  '    return map;\n  }, [unlockedLevel, activeChapterFilter]);'
);

// 5. Replace chapterViewLevels with displayedChapters
const oldChapterViewLevelsRegex = /\/\/ Levels for specific chapter view[\s\S]*?const ascentChapters = useMemo\(\(\) => \[\.\.\.CHAPTER_CONFIGS\]\.reverse\(\), \[\]\);/;

const newDisplayedChaptersCode = `  // Ascent chapters list: Chapter 10 at top, down to Chapter 1 at bottom
  const ascentChapters = useMemo(() => [...CHAPTER_CONFIGS].reverse(), []);

  // Displayed chapters: either all 10 in ascent order (CH 10 -> CH 1) or only the single filtered chapter
  const displayedChapters = useMemo(() => {
    if (activeChapterFilter === 0) {
      return ascentChapters;
    }
    const filtered = CHAPTER_CONFIGS.find((c) => c.chapter === activeChapterFilter);
    return filtered ? [filtered] : [];
  }, [activeChapterFilter, ascentChapters]);`;

if (oldChapterViewLevelsRegex.test(levelMapCode)) {
  levelMapCode = levelMapCode.replace(oldChapterViewLevelsRegex, newDisplayedChaptersCode);
  console.log('Replaced chapterViewLevels with displayedChapters');
} else {
  console.warn('Could not match oldChapterViewLevelsRegex');
}

// 6. Update handleChapterTabSelect to properly handle chapter switching and scrolling
const oldHandleChapterTabSelectRegex = /const handleChapterTabSelect = \(chapterNum\) => \{[\s\S]*?\n  \};/;

const newHandleChapterTabSelect = `const handleChapterTabSelect = (chapterNum) => {
    sounds.playSelect();
    setActiveChapterFilter(chapterNum);

    if (chapterNum === 0) {
      // Return to All Realms view -> locate current stage
      const targetStage = Math.max(1, Math.min(currentLevel, unlockedLevel));
      setSelectedLevelNum(targetStage);
      setTimeout(() => {
        const targetNode = scrollContainerRef.current?.querySelector(\`.adv-trail-node[data-level="\${targetStage}"]\`);
        if (targetNode) {
          targetNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else if (targetStage === 1 && scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({
            top: scrollContainerRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 100);
    } else {
      const ch = CHAPTER_CONFIGS.find((c) => c.chapter === chapterNum);
      if (ch) {
        // If current selected level is outside this chapter, select appropriate stage in this chapter
        if (selectedLevelNum < ch.start || selectedLevelNum > ch.end) {
          const targetLevel = (unlockedLevel >= ch.start && unlockedLevel <= ch.end)
            ? unlockedLevel
            : ch.start;
          setSelectedLevelNum(targetLevel);
        }
      }
      setTimeout(() => {
        if (scrollContainerRef.current) {
          // If viewing Chapter 1, scroll to level 1 at bottom
          if (chapterNum === 1) {
            const node1 = scrollContainerRef.current.querySelector('.adv-trail-node[data-level="1"]');
            if (node1) {
              node1.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
              scrollContainerRef.current.scrollTo({ top: scrollContainerRef.current.scrollHeight, behavior: 'smooth' });
            }
          } else {
            // For other chapters, scroll smoothly to top of chapter
            scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }
      }, 100);
    }
  };`;

if (oldHandleChapterTabSelectRegex.test(levelMapCode)) {
  levelMapCode = levelMapCode.replace(oldHandleChapterTabSelectRegex, newHandleChapterTabSelect);
  console.log('Updated handleChapterTabSelect');
} else {
  console.warn('Could not match oldHandleChapterTabSelectRegex');
}

// 7. Attach refs to navigation bars
levelMapCode = levelMapCode.replace(
  '<nav className="desktop-chapter-pills-bar" aria-label="Desktop Chapter Navigation">',
  '<nav className="desktop-chapter-pills-bar" ref={pillsBarRef} aria-label="Desktop Chapter Navigation">'
);
levelMapCode = levelMapCode.replace(
  '<nav className="mobile-chapter-switcher-bar" aria-label="Mobile Chapter Switcher">',
  '<nav className="mobile-chapter-switcher-bar" ref={mobilePillsBarRef} aria-label="Mobile Chapter Switcher">'
);

// 8. Replace the main canvas content (from VIEW A check to end of VIEW B)
const oldMainCanvasRegex = /\{\/\* VIEW A: ALL STAGES[\s\S]*?\{\/\* Floating Quick-Locate Pill/;

// Build the clean, unified main canvas
const newMainCanvas = `{/* UNIFIED ADVENTURE TRAIL JOURNEY (ALL REALMS OR SINGLE CHAPTER) */}
            <div className="adventure-mosaic-grid campaign-tiles-grid adventure-trail-journey">

              {/* GRAND FINALE: SOVEREIGN ZENITH CITADEL (SHOWN IN ALL REALMS OR CHAPTER 10) */}
              {(activeChapterFilter === 0 || activeChapterFilter === 10) && (
                <div
                  className="adventure-trophy-banner grand-finale-banner zenith-citadel-banner"
                  role="region"
                  aria-label="Sovereign Zenith Citadel Apex Destination"
                >
                  <div className="adventure-trophy-pedestal citadel-pedestal">
                    <div className="trophy-ambient-glow citadel-aurora-glow" />
                    <svg
                      viewBox="0 0 120 120"
                      className={\`adventure-trophy-svg citadel-spire-svg \${completedCount >= TOTAL_LEVELS ? 'trophy-champion' : ''}\`}
                      aria-hidden="true"
                    >
                      <defs>
                        <linearGradient id="citadelGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#fef08a" />
                          <stop offset="50%" stopColor="#facc15" />
                          <stop offset="100%" stopColor="#d97706" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M 28 32 C 14 32 10 50 24 62 C 30 68 38 68 42 65"
                        fill="none"
                        stroke="url(#citadelGoldGrad)"
                        strokeWidth="6"
                        strokeLinecap="round"
                      />
                      <path
                        d="M 92 32 C 106 32 110 50 96 62 C 90 68 82 68 78 65"
                        fill="none"
                        stroke="url(#citadelGoldGrad)"
                        strokeWidth="6"
                        strokeLinecap="round"
                      />
                      <path
                        d="M 32 22 L 88 22 C 88 22 88 58 60 68 C 32 58 32 22 32 22 Z"
                        fill="url(#citadelGoldGrad)"
                      />
                      <rect x="30" y="20" width="60" height="5" rx="2.5" fill="rgba(255, 255, 255, 0.35)" />
                      <path
                        d="M 60 34 L 63 42 L 72 42 L 65 47 L 68 55 L 60 50 L 52 55 L 55 47 L 48 42 L 57 42 Z"
                        fill="#ffffff"
                      />
                      <path d="M 54 68 L 66 68 L 64 82 L 56 82 Z" fill="url(#citadelGoldGrad)" />
                      <rect x="42" y="82" width="36" height="8" rx="2" fill="rgba(255, 255, 255, 0.2)" />
                      <rect x="34" y="90" width="52" height="10" rx="3" fill="url(#citadelGoldGrad)" />
                      <polygon points="20,95 24,55 28,95" fill="rgba(250, 204, 21, 0.45)" />
                      <polygon points="92,95 96,55 100,95" fill="rgba(250, 204, 21, 0.45)" />
                    </svg>
                  </div>

                  <div className="trophy-finale-badge zenith-apex-badge">
                    <Crown size={14} className="finale-crown-icon" />
                    <span>SUMMIT CITADEL • ALTITUDE 10,000M</span>
                  </div>

                  <h2 className="adventure-trophy-headline zenith-headline">
                    {completedCount >= TOTAL_LEVELS
                      ? 'SOVEREIGN CHAMPION OF BLOCK BLITZ'
                      : 'THE SOVEREIGN ZENITH CITADEL'}
                  </h2>
                  <p className="adventure-trophy-subtitle zenith-subtitle">
                    {completedCount >= TOTAL_LEVELS
                      ? 'All 100 realms conquered! You reign supreme as the Sovereign Arcade Champion.'
                      : \`The ultimate destination. Ascend through all 10 Cyber Realms and defeat Stage 100 to claim the Sovereign Throne. (\${TOTAL_LEVELS - completedCount} stages remaining)\`}
                  </p>

                  <div className="campaign-overall-progress-track" title={\`\${progressPercent}% Campaign Conquered\`}>
                    <div
                      className="campaign-overall-progress-fill"
                      style={{ width: \`\${progressPercent}%\` }}
                    />
                  </div>
                </div>
              )}

              {/* DEDICATED CHAPTER FOCUS HEADER (SHOWN WHEN VIEWING CHAPTER 1 THROUGH 9) */}
              {activeChapterFilter >= 1 && activeChapterFilter <= 9 && activeChapterData && (
                <div
                  className="chapter-focus-header"
                  role="region"
                  aria-label={\`Chapter \${activeChapterData.chapter}: \${activeChapterData.name}\`}
                >
                  <div className="chapter-focus-banner" style={{ '--chapter-accent': activeChapterData.color }}>
                    <div className="chapter-focus-badge">
                      {getChapterIcon(activeChapterData.icon, activeChapterData.color, 16)}
                      <span className="chapter-focus-tag">CHAPTER {activeChapterData.chapter}</span>
                      <span className="chapter-focus-alt">ALTITUDE: {(activeChapterData.chapter * 1000).toLocaleString()}M</span>
                    </div>
                    <h2 className="chapter-focus-title">{activeChapterData.name}</h2>
                    <p className="chapter-focus-stages">
                      Stages {activeChapterData.start}–{activeChapterData.end} • {activeChapterData.chapter % 2 === 0 ? 'Cyber Matrix Trail' : 'Ascent Cyber Pathway'}
                    </p>
                    <div className="chapter-focus-progress-wrap">
                      <div className="chapter-focus-stat-row">
                        <span className="chapter-focus-stat-label">
                          {chapterProgressMap[activeChapterData.chapter]?.completed} of {chapterProgressMap[activeChapterData.chapter]?.total} Stages Cleared
                        </span>
                        <span className="chapter-focus-stat-percent">
                          {chapterProgressMap[activeChapterData.chapter]?.percent}% Conquered
                        </span>
                      </div>
                      <div className="campaign-overall-progress-track">
                        <div
                          className="campaign-overall-progress-fill"
                          style={{
                            width: \`\${chapterProgressMap[activeChapterData.chapter]?.percent}%\`,
                            background: \`linear-gradient(90deg, \${activeChapterData.color}, #38bdf8)\`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* THE DISPLAYED CHAPTER REALMS (RENDERED CHAPTER 10 DOWN TO CHAPTER 1 OR SINGLE CHAPTER) */}
              {displayedChapters.map((chapter) => {
                const prog = chapterProgressMap[chapter.chapter];
                const pathData = chapterPaths[chapter.chapter];
                const chapterLevels = LEVEL_CONFIGS.filter((l) => l.chapter === chapter.chapter);

                return (
                  <section
                    key={chapter.chapter}
                    ref={(el) => { chapterSectionRefs.current[chapter.chapter] = el; }}
                    className={\`chapter-realm-zone realm-ch-\${chapter.chapter}\`}
                    style={{ '--realm-theme-color': chapter.color }}
                    aria-label={\`Chapter \${chapter.chapter}: \${chapter.name}\`}
                  >
                    {/* WINDING PATHWAY FOR THIS REALM (10 SEQUENTIAL STAGES BOTTOM TO TOP) */}
                    <div className="realm-trail-canvas">
                      {/* SVG Serpentine Road Track Overlay */}
                      <svg
                        className="realm-svg-track journey-path-svg-overlay"
                        viewBox={\`0 0 \${CHAPTER_ZONE_WIDTH} \${CHAPTER_ZONE_HEIGHT}\`}
                        preserveAspectRatio="none"
                        aria-hidden="true"
                      >
                        <defs>
                          <linearGradient id={\`realmGrad-\${chapter.chapter}\`} x1="0%" y1="100%" x2="0%" y2="0%">
                            <stop offset="0%" stopColor={chapter.color} stopOpacity="0.85" />
                            <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.95" />
                            <stop offset="100%" stopColor="#f59e0b" stopOpacity="1" />
                          </linearGradient>
                          <filter id={\`glow-\${chapter.chapter}\`} x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="4" result="blur" />
                            <feMerge>
                              <feMergeNode in="blur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                        </defs>

                        {/* Dormant Road Track Conduit */}
                        <path
                          d={pathData.fullPath}
                          className="journey-path-dormant realm-track-base"
                          stroke="rgba(255, 255, 255, 0.12)"
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                        />
                        <path
                          d={pathData.fullPath}
                          className="journey-path-dormant realm-track-dash"
                          stroke={chapter.color}
                          strokeOpacity="0.3"
                          strokeWidth="3"
                          strokeDasharray="6 8"
                          strokeLinecap="round"
                          fill="none"
                        />

                        {/* Active Illuminated Energy Stream */}
                        {pathData.unlockedPath && (
                          <path
                            d={pathData.unlockedPath}
                            className="journey-path-active realm-track-active"
                            stroke={\`url(#realmGrad-\${chapter.chapter})\`}
                            strokeWidth="7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                            filter={\`url(#glow-\${chapter.chapter})\`}
                          />
                        )}
                      </svg>

                      {/* THE 10 STAGES IN THIS REALM */}
                      {chapterLevels.map((lvl, idx) => {
                        const pattern = getChapterWindingPattern(chapter.chapter);
                        const pos = pattern[idx];
                        const isCompleted = completedLevels.has(lvl.level);
                        const isCurrent = lvl.level === unlockedLevel;
                        const isLocked = lvl.level > unlockedLevel;
                        const isSelected = lvl.level === selectedLevelNum;
                        const isApex = lvl.level === 100;
                        const isBoss = Boolean(lvl.isBoss || lvl.level % 10 === 0);
                        const isMilestone = !isBoss && !isApex && lvl.level % 5 === 0;

                        return (
                          <div
                            key={lvl.level}
                            ref={isSelected ? selectedCardRef : null}
                            data-level={lvl.level}
                            className={\`adventure-block level-tile-stone level-card-item journey-node adv-trail-node \${
                              isCompleted ? 'completed' : ''
                            } \${isCurrent ? 'current-unlocked' : ''} \${
                              isLocked ? 'locked-stone' : 'unlocked-stone'
                            } \${isSelected ? 'selected-stone' : ''} \${
                              isApex ? 'apex-sovereign-node boss-stone' : isBoss ? 'boss-stone' : isMilestone ? 'milestone-stone' : 'standard-stone'
                            }\`}
                            style={{
                              left: \`\${pos.x}%\`,
                              top: \`\${pos.y}px\`,
                              '--node-accent': lvl.accentColor || chapter.color
                            }}
                            onClick={() => handleTileClick(lvl.level)}
                            onDoubleClick={() => handleTileDoubleClick(lvl.level)}
                            role="button"
                            tabIndex={0}
                            aria-label={\`Level \${lvl.level}: \${lvl.title}. \${
                              isCompleted ? 'Completed' : isLocked ? 'Locked' : 'Unlocked'
                            }\`}
                          >
                            {/* Apex Sovereign Shimmering Corona Rings (Level 100) */}
                            {isApex && (
                              <div className="adv-apex-corona" aria-hidden="true">
                                <span className="apex-corona-ring ring-1" />
                                <span className="apex-corona-ring ring-2" />
                              </div>
                            )}

                            {/* Active Radar Beacon Waves */}
                            {isCurrent && (
                              <div className="adv-beacon-rings" aria-hidden="true">
                                <span className="adv-radar-ring r1" />
                                <span className="adv-radar-ring r2" />
                              </div>
                            )}

                            {/* 3D Animated Hero Player Pin ("YOU ARE HERE") */}
                            {isCurrent && (
                              <div className="adventure-pointer-marker" aria-hidden="true">
                                <div className="adv-hero-pin">
                                  <span className="adv-pin-label">YOU</span>
                                  <div className="adv-pin-triangle" />
                                </div>
                              </div>
                            )}

                            {/* Completed 3-Star Crown Arch */}
                            {isCompleted && (
                              <div className="adv-stars-arch" aria-hidden="true">
                                <Star size={9} className="adv-star-mini filled" />
                                <Star size={11} className="adv-star-mini center filled" />
                                <Star size={9} className="adv-star-mini filled" />
                              </div>
                            )}

                            {/* Boss & Milestone Badges */}
                            {isApex ? (
                              <div className="adv-boss-crown-badge adv-apex-badge" title="Ultimate Sovereign Apex Stage 100">
                                <Crown size={14} strokeWidth={2.8} />
                                <span className="apex-badge-label">APEX</span>
                              </div>
                            ) : isBoss ? (
                              <div
                                className="adv-boss-crown-badge"
                                title="Boss Milestone Stage"
                              >
                                <Crown size={12} strokeWidth={2.8} />
                              </div>
                            ) : isMilestone ? (
                              <div className="adv-milestone-gem-badge" title="Chapter Checkpoint">
                                <Gem size={10} strokeWidth={2.6} />
                              </div>
                            ) : null}

                            {/* 3D Gloss Highlight */}
                            <div className="adv-node-gloss" />

                            {/* 3D Node Core Sphere */}
                            <div className="adv-orb-core">
                              {!isBoss && !isMilestone && !isApex && (
                                <span className="adv-micro-obj-badge" aria-hidden="true">
                                  {getObjectiveIcon(lvl.type, isCompleted ? '#bae6fd' : isCurrent ? '#713f12' : isLocked ? '#475569' : chapter.color)}
                                </span>
                              )}
                              <span
                                className={\`adv-node-number \${
                                  isCompleted
                                    ? 'completed-num'
                                    : isCurrent
                                    ? 'current-num'
                                    : isLocked
                                    ? 'locked-num'
                                    : 'unlocked-num'
                                }\`}
                              >
                                {lvl.level}
                              </span>
                            </div>

                            {/* Completed Radiant Checkmark Badge */}
                            {isCompleted && (
                              <div className="adv-completed-indicator" aria-hidden="true">
                                <Check size={9} strokeWidth={3.5} />
                              </div>
                            )}

                            {/* Locked Node Padlock */}
                            {isLocked && (
                              <div className="adv-node-micro-lock" aria-hidden="true">
                                <Lock size={9} strokeWidth={2.4} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* CHAPTER WAYPOINT GATEWAY ARCHWAY (Threshold at base of Realm) */}
                    <div className="realm-gateway-arch realm-waypoint-gate">
                      <div
                        className="realm-gateway-top-line"
                        style={{ background: \`linear-gradient(90deg, transparent, \${chapter.color}, transparent)\` }}
                      />
                      <div className="realm-gateway-content">
                        <div
                          className="realm-gateway-badge"
                          style={{ borderColor: \`\${chapter.color}70\`, background: \`\${chapter.color}18\` }}
                        >
                          {getChapterIcon(chapter.icon, chapter.color, 15)}
                          <span className="realm-badge-tag">CHAPTER {chapter.chapter}</span>
                          <span className="realm-altitude-tag">ALT: {(chapter.chapter * 1000).toLocaleString()}M</span>
                        </div>
                        <h3 className="realm-gateway-title">{chapter.name}</h3>
                        <div className="realm-gateway-meta">
                          <span className="realm-stages-tag">Stages {chapter.start}–{chapter.end}</span>
                          <span className="realm-bullet">•</span>
                          <span className="realm-cleared-tag">
                            {prog?.isCompleted ? 'REALM CONQUERED' : \`\${prog?.completed || 0}/10 CLEARED\`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Transitional Connector Conduit between Consecutive Realms (Only in All Realms view) */}
                    {activeChapterFilter === 0 && chapter.chapter > 1 && (
                      <div className="realm-connector-conduit" aria-hidden="true">
                        <div
                          className={\`conduit-vertical-stream \${
                            unlockedLevel >= chapter.start ? 'stream-active' : 'stream-dormant'
                          }\`}
                          style={{
                            '--stream-start': CHAPTER_CONFIGS[chapter.chapter - 2]?.color || '#38bdf8',
                            '--stream-end': chapter.color
                          }}
                        />
                      </div>
                    )}
                  </section>
                );
              })}

              {/* EXPEDITION BASECAMP BANNER (SHOWN IN ALL REALMS OR CHAPTER 1) */}
              {(activeChapterFilter === 0 || activeChapterFilter === 1) && (
                <div
                  className="adventure-departure-banner expedition-basecamp-banner"
                  role="region"
                  aria-label="Expedition Basecamp Launch Pad"
                >
                  <div className="departure-badge basecamp-badge">
                    <Compass size={13} className="basecamp-icon" />
                    <span>EXPEDITION BASECAMP</span>
                    <span className="departure-stages-pill">GROUND ZERO • 0M</span>
                  </div>
                  <h2 className="departure-headline">ASCENT TO THE CITADEL</h2>
                  <p className="departure-subtext">
                    Level 1 starts right here at the launch pad. Battle upwards sequentially through all 10 Cyber Realms to reach the Zenith Citadel at Stage 100.
                  </p>
                  <div className="departure-quick-actions">
                    <div className="campaign-overall-progress-track" title={\`\${progressPercent}% Campaign Conquered\`}>
                      <div
                        className="campaign-overall-progress-fill"
                        style={{ width: \`\${progressPercent}%\` }}
                      />
                    </div>
                    <div className="departure-stats-strip">
                      <span className="departure-stat-item">
                        <Trophy size={12} className="dep-icon-trophy" />
                        <strong>{completedCount}</strong> / {TOTAL_LEVELS} Cleared
                      </span>
                      <button
                        type="button"
                        className="departure-locate-btn"
                        onClick={handleLocateCurrentLevel}
                        title="Jump view to your current unlocked stage"
                      >
                        <span className="dep-locate-dot" />
                        <span>LOCATE STAGE {unlockedLevel}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </main>

        {/* Floating Quick-Locate Pill`;

if (oldMainCanvasRegex.test(levelMapCode)) {
  levelMapCode = levelMapCode.replace(oldMainCanvasRegex, newMainCanvas);
  console.log('Successfully replaced main canvas with unified adventure trail journey!');
} else {
  console.warn('Could not match oldMainCanvasRegex');
}

if (isCrlf) {
  levelMapCode = levelMapCode.replace(/\n/g, '\r\n');
}

fs.writeFileSync('src/components/LevelMap.jsx', levelMapCode, 'utf-8');
console.log('LevelMap.jsx updated successfully!');
