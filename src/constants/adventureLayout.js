/**
 * Adventure Mode Upward Journey Trail Coordinate System for BLOCK BLITZ
 * Maps all 100 progressive levels across 10 Thematic Chapter Realms
 * into a sequential BOTTOM-to-TOP upward adventure climb.
 *
 * Requirements:
 * - Level 1 is positioned at the BOTTOM.
 * - Levels 2, 3, 4, 5 and subsequent levels progress UPWARD.
 * - Level 100 is positioned at the TOP (Citadel Summit).
 * - Player climbs from the bottom towards the top to complete the adventure.
 * - Alternating organic S-curves between odd and even chapters.
 * - Smooth SVG bezier path overlay.
 */

// Zone dimensions in SVG coordinate space
export const CHAPTER_ZONE_HEIGHT = 820;
export const CHAPTER_ZONE_WIDTH = 400;

// Odd chapters (1, 3, 5, 7, 9): Ascends from bottom to top
// Index 0 = Level 1 (bottom left-center) -> Index 9 = Level 10 (Boss Summit)
export const PATTERN_ODD = [
  { x: 30, y: 745 },  // Level 1: Bottom left-center
  { x: 52, y: 670 },  // Level 2: Center
  { x: 74, y: 595 },  // Level 3: Center-right
  { x: 84, y: 520 },  // Level 4: Right peak
  { x: 70, y: 445 },  // Level 5 (Milestone): Weaving left
  { x: 48, y: 370 },  // Level 6: Center
  { x: 26, y: 295 },  // Level 7: Center-left
  { x: 18, y: 220 },  // Level 8: Left peak
  { x: 32, y: 145 },  // Level 9: Weaving center
  { x: 50, y: 70 }    // Level 10 (Boss): Apex Summit
];

// Even chapters (2, 4, 6, 8, 10): Alternating weave ascending from bottom to top
// Index 0 = Level 11 (bottom right-center) -> Index 9 = Level 20 (Boss Summit)
export const PATTERN_EVEN = [
  { x: 70, y: 745 },  // Level 11: Bottom right-center
  { x: 48, y: 670 },  // Level 12: Center
  { x: 26, y: 595 },  // Level 13: Center-left
  { x: 16, y: 520 },  // Level 14: Left peak
  { x: 30, y: 445 },  // Level 15 (Milestone): Weaving right
  { x: 52, y: 370 },  // Level 16: Center
  { x: 74, y: 295 },  // Level 17: Center-right
  { x: 84, y: 220 },  // Level 18: Right peak
  { x: 68, y: 145 },  // Level 19: Weaving center
  { x: 50, y: 70 }    // Level 20 (Boss): Apex Summit
];

// Export default pattern for backwards compatibility
export const CHAPTER_WINDING_PATTERN = PATTERN_ODD;

// Helper to get pattern for a chapter (1-indexed)
export const getChapterWindingPattern = (chapterNumber) => {
  return chapterNumber % 2 === 0 ? PATTERN_EVEN : PATTERN_ODD;
};

// Build SVG path curve string for points in a chapter (upward trajectory)
export const buildChapterPathD = (points, hasLeadIn = false, hasLeadOut = false) => {
  if (!points || points.length === 0) return '';
  let d = '';

  const first = points[0];
  const centerX = CHAPTER_ZONE_WIDTH / 2;

  if (hasLeadIn) {
    // Coming upward from chapter below (enters at bottom center: x: 200, y: 820)
    d = `M ${centerX} ${CHAPTER_ZONE_HEIGHT} C ${centerX} ${CHAPTER_ZONE_HEIGHT - 30}, ${first.x} ${first.y + 35}, ${first.x} ${first.y}`;
  } else {
    d = `M ${first.x} ${first.y}`;
  }

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const midY = (prev.y + curr.y) / 2;
    d += ` C ${prev.x} ${midY}, ${curr.x} ${midY}, ${curr.x} ${curr.y}`;
  }

  if (hasLeadOut && points.length >= 10) {
    // Exiting upward to chapter above (exits at top center: x: 200, y: 0)
    const last = points[points.length - 1];
    d += ` C ${last.x} ${last.y - 35}, ${centerX} 30, ${centerX} 0`;
  }

  return d;
};

// Generates the 100-level winding node mapping for upward progression
export const ADVENTURE_MOSAIC_MAPPING = Array.from({ length: 100 }, (_, idx) => {
  const level = idx + 1;
  const chapter = Math.ceil(level / 10);
  const indexInChapter = (level - 1) % 10;
  const pattern = getChapterWindingPattern(chapter);
  const pos = pattern[indexInChapter];

  return {
    level,
    chapter,
    indexInChapter,
    xPercent: pos.x,
    yCoord: pos.y,
    row: chapter * 10 + indexInChapter,
    col: Math.round(pos.x / 10)
  };
});
