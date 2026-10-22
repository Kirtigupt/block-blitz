/**
 * Progressive 100-Level Campaign Configuration for BLOCK BLITZ
 * Features 10 thematic chapters, diverse tactical board patterns,
 * and 6 distinct mission objective types.
 */

export const CHAPTER_CONFIGS = [
  { chapter: 1, name: 'Apprentice Heights', range: '1-10', start: 1, end: 10, color: '#38bdf8', icon: 'Sparkles' },
  { chapter: 2, name: 'Neon Boulevard', range: '11-20', start: 11, end: 20, color: '#818cf8', icon: 'Zap' },
  { chapter: 3, name: 'Cyber Matrix', range: '21-30', start: 21, end: 30, color: '#c084fc', icon: 'Target' },
  { chapter: 4, name: 'Quantum Core', range: '31-40', start: 31, end: 40, color: '#f472b6', icon: 'Flame' },
  { chapter: 5, name: 'Arcade Galaxy', range: '41-50', start: 41, end: 50, color: '#fb923c', icon: 'Star' },
  { chapter: 6, name: 'Crystal Caverns', range: '51-60', start: 51, end: 60, color: '#34d399', icon: 'Gem' },
  { chapter: 7, name: 'Solar Flare', range: '61-70', start: 61, end: 70, color: '#facc15', icon: 'Sun' },
  { chapter: 8, name: 'Vortex Realm', range: '71-80', start: 71, end: 80, color: '#f43f5e', icon: 'Compass' },
  { chapter: 9, name: 'Hyper Nova', range: '81-90', start: 81, end: 90, color: '#a855f7', icon: 'Shield' },
  { chapter: 10, name: 'Zenith of Legends', range: '91-100', start: 91, end: 100, color: '#fbbf24', icon: 'Crown' }
];

// Helper to construct balanced levels
const createLevel = (level, chapter, title, type, target, pattern, patternColor, desc, bonus, color, isBoss = false) => ({
  level,
  chapter,
  title,
  type,
  target,
  pattern: pattern || 'clean',
  patternColor: patternColor || 'amber',
  description: desc,
  bonusPoints: bonus,
  accentColor: color,
  isBoss
});

export const LEVEL_CONFIGS = [
  // ==========================================
  // CHAPTER 1: Apprentice Heights (Levels 1-10)
  // ==========================================
  createLevel(1, 1, 'First Sparks', 'lines', 2, 'clean', 'cyan', 'Clear 2 lines to start your run', 250, '#38bdf8'),
  createLevel(2, 1, 'Line Breaker', 'lines', 3, 'clean', 'cyan', 'Clear 3 lines', 350, '#38bdf8'),
  createLevel(3, 1, 'Corner Guard', 'clear_pattern', 4, 'corners', 'amber', 'Break the 4 corner outpost gems', 500, '#fbbf24'),
  createLevel(4, 1, 'Score Surge', 'score', 800, 'clean', 'purple', 'Score 800 points', 600, '#818cf8'),
  createLevel(5, 1, 'Crossroads', 'lines', 4, 'cross', 'cyan', 'Clear 4 lines through the Neon Cross', 750, '#38bdf8'),
  createLevel(6, 1, 'Streak Spark', 'streak', 2, 'clean', 'orange', 'Trigger a 2x Combo Streak', 900, '#fb923c'),
  createLevel(7, 1, 'Shape Crafter', 'placed', 8, 'clean', 'emerald', 'Place 8 pieces strategically', 1000, '#34d399'),
  createLevel(8, 1, 'Double Strike', 'multilines', 1, 'clean', 'pink', 'Clear 2 lines at once (Double Clear)', 1200, '#f472b6'),
  createLevel(9, 1, 'Diamond Lattice', 'clear_pattern', 6, 'diamond', 'purple', 'Clear 6 gems from the Crystal Diamond', 1400, '#c084fc'),
  createLevel(10, 1, 'Apprentice Pinnacle', 'lines', 6, 'slash', 'amber', 'Clear 6 lines across the Diagonal Slash', 1800, '#f59e0b', true),

  // ==========================================
  // CHAPTER 2: Neon Boulevard (Levels 11-20)
  // ==========================================
  createLevel(11, 2, 'Neon Drive', 'lines', 6, 'clean', 'cyan', 'Clear 6 lines on the boulevard', 1600, '#38bdf8'),
  createLevel(12, 2, 'Twin Pillars', 'clear_pattern', 6, 'pillars', 'blue', 'Clear 6 pillar gems', 1800, '#60a5fa'),
  createLevel(13, 2, 'Point Surge', 'score', 1800, 'clean', 'purple', 'Score 1,800 points', 2000, '#818cf8'),
  createLevel(14, 2, 'Checker Field', 'lines', 7, 'checker', 'amber', 'Clear 7 lines amidst checker obstacles', 2200, '#fbbf24'),
  createLevel(15, 2, 'Combo Dynamo', 'streak', 3, 'clean', 'orange', 'Achieve a 3x Combo Streak', 2400, '#fb923c'),
  createLevel(16, 2, 'Twin Blasts', 'multilines', 2, 'clean', 'pink', 'Perform 2 Double or Triple Clears', 2600, '#f472b6'),
  createLevel(17, 2, 'Grid Endurance', 'placed', 12, 'clean', 'emerald', 'Place 12 pieces without overflowing', 2800, '#34d399'),
  createLevel(18, 2, 'Solar Perimeter', 'clear_pattern', 8, 'ring', 'cyan', 'Break 8 gems of the Solar Ring', 3000, '#22d3ee'),
  createLevel(19, 2, 'Neon Overdrive', 'score', 2800, 'clean', 'purple', 'Score 2,800 points', 3200, '#c084fc'),
  createLevel(20, 2, 'Boulevard Sovereign', 'lines', 9, 'dual_cross', 'amber', 'Clear 9 lines across the Dual Nexus', 3600, '#f59e0b', true),

  // ==========================================
  // CHAPTER 3: Cyber Matrix (Levels 21-30)
  // ==========================================
  createLevel(21, 3, 'Matrix Entry', 'lines', 8, 'clean', 'cyan', 'Clear 8 lines inside the Cyber Matrix', 3200, '#38bdf8'),
  createLevel(22, 3, 'Bastion Gate', 'clear_pattern', 6, 'fortress', 'emerald', 'Clear 6 bastion gems', 3400, '#34d399'),
  createLevel(23, 3, 'Power Surge', 'score', 3200, 'clean', 'purple', 'Score 3,200 points in the Matrix', 3600, '#a855f7'),
  createLevel(24, 3, 'Star Cluster', 'lines', 9, 'constellation', 'cyan', 'Clear 9 lines through the Star Cluster', 3800, '#22d3ee'),
  createLevel(25, 3, 'Chain Reaction', 'streak', 3, 'clean', 'orange', 'Hold a 3x Combo Streak', 4000, '#f97316'),
  createLevel(26, 3, 'Double Helix', 'multilines', 2, 'clean', 'pink', 'Perform 2 simultaneous multi-line clears', 4200, '#ec4899'),
  createLevel(27, 3, 'Data Stream', 'placed', 14, 'brackets', 'blue', 'Survive and place 14 pieces', 4400, '#3b82f6'),
  createLevel(28, 3, 'Pyramid Shift', 'clear_pattern', 6, 'pyramid', 'amber', 'Clear 6 pyramid obstacle gems', 4600, '#fbbf24'),
  createLevel(29, 3, 'Score Hyper', 'score', 4000, 'clean', 'purple', 'Score 4,000 points', 4800, '#c084fc'),
  createLevel(30, 3, 'Matrix Warden', 'lines', 11, 'bullseye', 'rose', 'Clear 11 lines through the Bullseye Matrix', 5400, '#f43f5e', true),

  // ==========================================
  // CHAPTER 4: Quantum Core (Levels 31-40)
  // ==========================================
  createLevel(31, 4, 'Core Ignition', 'lines', 9, 'clean', 'cyan', 'Clear 9 lines in the Quantum Core', 4500, '#38bdf8'),
  createLevel(32, 4, 'Quantum Hourglass', 'clear_pattern', 8, 'hourglass', 'purple', 'Clear 8 vortex hourglass gems', 4800, '#a855f7'),
  createLevel(33, 4, 'Energy Vortex', 'score', 4500, 'clean', 'pink', 'Score 4,500 points', 5000, '#ec4899'),
  createLevel(34, 4, 'Reverse Slash', 'lines', 10, 'anti_slash', 'amber', 'Clear 10 lines along the Reverse Slash', 5200, '#f59e0b'),
  createLevel(35, 4, 'Quantum Streak', 'streak', 4, 'clean', 'orange', 'Achieve an intense 4x Combo Streak', 5500, '#f97316'),
  createLevel(36, 4, 'Multi-Beam Cascade', 'multilines', 3, 'clean', 'cyan', 'Trigger 3 Double or Triple Clears', 5800, '#06b6d4'),
  createLevel(37, 4, 'Particle Lattice', 'placed', 15, 'gate', 'emerald', 'Place 15 pieces navigating the Gate', 6000, '#10b981'),
  createLevel(38, 4, 'Diamond Compression', 'clear_pattern', 8, 'diamond', 'purple', 'Clear all 8 diamond core gems', 6200, '#c084fc'),
  createLevel(39, 4, 'High Voltage', 'score', 5500, 'clean', 'amber', 'Score 5,500 points', 6500, '#eab308'),
  createLevel(40, 4, 'Singularity Gate', 'lines', 12, 'ring', 'rose', 'Clear 12 lines through the Quantum Ring', 7200, '#ef4444', true),

  // ==========================================
  // CHAPTER 5: Arcade Galaxy (Levels 41-50)
  // ==========================================
  createLevel(41, 5, 'Starlight Grid', 'lines', 11, 'clean', 'cyan', 'Clear 11 lines under starlight', 6000, '#38bdf8'),
  createLevel(42, 5, 'Heart of Arcade', 'clear_pattern', 8, 'heart', 'rose', 'Clear 8 arcade heart gems', 6300, '#f43f5e'),
  createLevel(43, 5, 'Cosmic Score', 'score', 6000, 'clean', 'purple', 'Reach 6,000 galaxy score', 6600, '#a855f7'),
  createLevel(44, 5, 'Pillar Constellation', 'lines', 12, 'pillars', 'blue', 'Clear 12 lines through the Pillars', 6900, '#3b82f6'),
  createLevel(45, 5, 'Supernova Streak', 'streak', 4, 'clean', 'orange', 'Reach a blazing 4x Combo Streak', 7200, '#f97316'),
  createLevel(46, 5, 'Triple Blast Rush', 'multilines', 3, 'clean', 'pink', 'Perform 3 Double/Triple Clears', 7500, '#ec4899'),
  createLevel(47, 5, 'Orbit Placer', 'placed', 16, 'checker', 'emerald', 'Place 16 pieces across checker orbital', 7800, '#10b981'),
  createLevel(48, 5, 'Cosmic Brackets', 'clear_pattern', 8, 'brackets', 'amber', 'Clear 8 bracket barrier gems', 8100, '#f59e0b'),
  createLevel(49, 5, 'Galactic Overdrive', 'score', 7200, 'clean', 'cyan', 'Score 7,200 points in orbit', 8500, '#06b6d4'),
  createLevel(50, 5, 'Galactic Sovereign', 'lines', 14, 'bullseye', 'purple', 'Clear 14 lines on the Bullseye Core', 9500, '#8b5cf6', true),

  // ==========================================
  // CHAPTER 6: Crystal Caverns (Levels 51-60)
  // ==========================================
  createLevel(51, 6, 'Cavern Depths', 'lines', 12, 'clean', 'cyan', 'Clear 12 lines in the luminous cavern', 7500, '#38bdf8'),
  createLevel(52, 6, 'Gem Clusters', 'clear_pattern', 6, 'constellation', 'emerald', 'Clear 6 crystalline gems', 7800, '#34d399'),
  createLevel(53, 6, 'Crystal Riches', 'score', 7500, 'clean', 'amber', 'Score 7,500 points', 8100, '#fbbf24'),
  createLevel(54, 6, 'Subterranean Cross', 'lines', 13, 'cross', 'cyan', 'Clear 13 lines around the Cavern Cross', 8400, '#22d3ee'),
  createLevel(55, 6, 'Echoing Combos', 'streak', 4, 'clean', 'orange', 'Maintain a 4x Combo Streak', 8700, '#f97316'),
  createLevel(56, 6, 'Dual Resonance', 'multilines', 3, 'clean', 'pink', 'Clear 2+ lines simultaneously 3 times', 9000, '#f472b6'),
  createLevel(57, 6, 'Spelunker Strategy', 'placed', 18, 'pyramid', 'blue', 'Place 18 pieces amidst pyramid crystals', 9300, '#60a5fa'),
  createLevel(58, 6, 'Hourglass Geode', 'clear_pattern', 8, 'hourglass', 'purple', 'Break 8 geode hourglass gems', 9600, '#c084fc'),
  createLevel(59, 6, 'Prismatic Rush', 'score', 8500, 'clean', 'emerald', 'Score 8,500 points', 10000, '#10b981'),
  createLevel(60, 6, 'Crystal Archon', 'lines', 15, 'dual_cross', 'amber', 'Clear 15 lines through Dual Nexus crystals', 11000, '#f59e0b', true),

  // ==========================================
  // CHAPTER 7: Solar Flare (Levels 61-70)
  // ==========================================
  createLevel(61, 7, 'Solar Ignition', 'lines', 13, 'clean', 'amber', 'Clear 13 lines under solar wind', 9000, '#facc15'),
  createLevel(62, 7, 'Crown of Fire', 'clear_pattern', 8, 'ring', 'orange', 'Clear 8 solar ring fire gems', 9400, '#f97316'),
  createLevel(63, 7, 'Flare Score', 'score', 9000, 'clean', 'rose', 'Score 9,000 solar points', 9800, '#f43f5e'),
  createLevel(64, 7, 'Corona Gate', 'lines', 14, 'gate', 'amber', 'Clear 14 lines across Corona Gate', 10200, '#fbbf24'),
  createLevel(65, 7, 'Solar Fury', 'streak', 4, 'clean', 'orange', 'Ignite a blazing 4x Combo Streak', 10600, '#ea580c'),
  createLevel(66, 7, 'Solar Cascade', 'multilines', 4, 'clean', 'pink', 'Perform 4 Double or Triple Clears', 11000, '#ec4899'),
  createLevel(67, 7, 'Radiant Survival', 'placed', 20, 'slash', 'cyan', 'Place 20 pieces across solar slash', 11400, '#06b6d4'),
  createLevel(68, 7, 'Fortress of Light', 'clear_pattern', 8, 'fortress', 'purple', 'Clear 8 fortress bastion gems', 11800, '#a855f7'),
  createLevel(69, 7, 'Prominence Blitz', 'score', 10500, 'clean', 'amber', 'Score 10,500 points', 12500, '#f59e0b'),
  createLevel(70, 7, 'Solaris Prime', 'lines', 16, 'diamond', 'rose', 'Clear 16 lines through the Solaris Diamond', 13500, '#ef4444', true),

  // ==========================================
  // CHAPTER 8: Vortex Realm (Levels 71-80)
  // ==========================================
  createLevel(71, 8, 'Vortex Horizon', 'lines', 14, 'clean', 'purple', 'Clear 14 lines entering the Vortex', 11000, '#a855f7'),
  createLevel(72, 8, 'Abyssal Brackets', 'clear_pattern', 8, 'brackets', 'cyan', 'Clear 8 abyssal bracket gems', 11500, '#22d3ee'),
  createLevel(73, 8, 'Maelstrom Points', 'score', 11000, 'clean', 'rose', 'Score 11,000 points', 12000, '#f43f5e'),
  createLevel(74, 8, 'Diagonal Maelstrom', 'lines', 15, 'anti_slash', 'blue', 'Clear 15 lines against reverse flow', 12500, '#3b82f6'),
  createLevel(75, 8, 'Vortex Master', 'streak', 5, 'clean', 'orange', 'Attain a legendary 5x Combo Streak', 13000, '#f97316'),
  createLevel(76, 8, 'Tidal Surge', 'multilines', 4, 'clean', 'pink', 'Perform 4 simultaneous multi-line clears', 13500, '#ec4899'),
  createLevel(77, 8, 'Gravitational Hold', 'placed', 22, 'checker', 'emerald', 'Place 22 pieces inside gravity well', 14000, '#10b981'),
  createLevel(78, 8, 'Hourglass Rift', 'clear_pattern', 8, 'hourglass', 'amber', 'Clear 8 hourglass rift obstacles', 14500, '#f59e0b'),
  createLevel(79, 8, 'Cosmic Drain', 'score', 12500, 'clean', 'purple', 'Score 12,500 points', 15000, '#c084fc'),
  createLevel(80, 8, 'Vortex Titan', 'lines', 18, 'bullseye', 'rose', 'Clear 18 lines on the Bullseye Titan', 16500, '#e11d48', true),

  // ==========================================
  // CHAPTER 9: Hyper Nova (Levels 81-90)
  // ==========================================
  createLevel(81, 9, 'Nova Inception', 'lines', 16, 'clean', 'cyan', 'Clear 16 lines in the nova field', 14000, '#38bdf8'),
  createLevel(82, 9, 'Heart of Supernova', 'clear_pattern', 8, 'heart', 'rose', 'Clear 8 supernova heart gems', 14500, '#fb7185'),
  createLevel(83, 9, 'Nova Blast Score', 'score', 13500, 'clean', 'purple', 'Score 13,500 nova points', 15000, '#8b5cf6'),
  createLevel(84, 9, 'Pillars of Eternity', 'lines', 17, 'pillars', 'blue', 'Clear 17 lines through Eternity Pillars', 15500, '#60a5fa'),
  createLevel(85, 9, 'Nova Cascade', 'streak', 5, 'clean', 'orange', 'Sustain a 5x Combo Streak', 16000, '#ea580c'),
  createLevel(86, 9, 'Hyper Dual Clears', 'multilines', 4, 'clean', 'pink', 'Perform 4 Double or Triple Clears', 16500, '#db2777'),
  createLevel(87, 9, 'Supercluster Placer', 'placed', 24, 'constellation', 'emerald', 'Place 24 pieces amidst star cluster', 17000, '#059669'),
  createLevel(88, 9, 'Gate of Infinity', 'clear_pattern', 8, 'gate', 'amber', 'Break 8 Infinity Gate gems', 17500, '#d97706'),
  createLevel(89, 9, 'Omega Score', 'score', 15000, 'clean', 'purple', 'Score 15,000 points', 18000, '#7c3aed'),
  createLevel(90, 9, 'Supernova Empress', 'lines', 20, 'dual_cross', 'rose', 'Clear 20 lines on Dual Nexus Core', 20000, '#f43f5e', true),

  // ==========================================
  // CHAPTER 10: Zenith of Legends (Levels 91-100)
  // ==========================================
  createLevel(91, 10, 'Ascension Gate', 'lines', 18, 'clean', 'cyan', 'Clear 18 lines to enter the Zenith', 17000, '#38bdf8'),
  createLevel(92, 10, 'Diamond of Destiny', 'clear_pattern', 8, 'diamond', 'amber', 'Break all 8 Destiny Diamond gems', 17500, '#fbbf24'),
  createLevel(93, 10, 'Ascendant Score', 'score', 16000, 'clean', 'purple', 'Score 16,000 legendary points', 18000, '#a855f7'),
  createLevel(94, 10, 'Pyramid of the Ancients', 'lines', 19, 'pyramid', 'emerald', 'Clear 19 lines on the Ancient Pyramid', 18500, '#10b981'),
  createLevel(95, 10, 'Zenith Streak', 'streak', 5, 'clean', 'orange', 'Reach the legendary 5x Combo Streak', 19000, '#f97316'),
  createLevel(96, 10, 'Master Multi-Clear', 'multilines', 5, 'clean', 'pink', 'Perform 5 simultaneous multi-clears', 20000, '#ec4899'),
  createLevel(97, 10, 'Endurance of Gods', 'placed', 26, 'fortress', 'blue', 'Survive and place 26 pieces', 21000, '#3b82f6'),
  createLevel(98, 10, 'Mythic Surge', 'score', 18000, 'clean', 'amber', 'Score 18,000 legendary points', 22000, '#f59e0b'),
  createLevel(99, 10, 'Penultimate Ring', 'clear_pattern', 8, 'ring', 'rose', 'Clear 8 celestial ring gems', 23000, '#ef4444'),
  createLevel(100, 10, 'Eternal Grandmaster', 'lines', 25, 'bullseye', 'amber', 'Clear 25 lines to become the Eternal Grandmaster', 25000, '#fbbf24', true)
];

export const TOTAL_LEVELS = LEVEL_CONFIGS.length; // Exactly 100

/**
 * Retrieve level configuration for any level number (1-100+).
 */
export const getLevelConfig = (levelNumber) => {
  const safeLevel = Math.max(1, parseInt(levelNumber, 10) || 1);

  if (safeLevel <= LEVEL_CONFIGS.length) {
    return LEVEL_CONFIGS[safeLevel - 1];
  }

  // Fallback for procedural infinite levels beyond 100
  const extra = safeLevel - LEVEL_CONFIGS.length;
  const isScore = extra % 2 === 1;
  return {
    level: safeLevel,
    chapter: 10,
    title: `Infinite Legend ${safeLevel}`,
    type: isScore ? 'score' : 'lines',
    target: isScore ? 18000 + extra * 1000 : 25 + Math.floor(extra / 2),
    pattern: 'bullseye',
    patternColor: 'amber',
    description: isScore ? `Score ${(18000 + extra * 1000).toLocaleString()} points` : `Clear ${25 + Math.floor(extra / 2)} lines`,
    bonusPoints: 25000 + extra * 500,
    accentColor: '#fbbf24',
    isBoss: true
  };
};

/**
 * Get chapter info for a specific level.
 */
export const getChapterForLevel = (levelNumber) => {
  const safeLevel = Math.max(1, parseInt(levelNumber, 10) || 1);
  return CHAPTER_CONFIGS.find((ch) => safeLevel >= ch.start && safeLevel <= ch.end) || CHAPTER_CONFIGS[CHAPTER_CONFIGS.length - 1];
};

/**
 * Calculate progress percentage towards current level objective (clamped 0 to 100).
 */
export const calculateLevelProgressPercent = (currentProgress, target) => {
  if (!target || target <= 0) return 100;
  const ratio = (currentProgress || 0) / target;
  return Math.min(100, Math.max(0, Math.round(ratio * 100)));
};
