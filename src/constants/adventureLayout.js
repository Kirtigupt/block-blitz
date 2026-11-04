/**
 * Adventure Mode Winding Journey Trail Coordinate System for BLOCK BLITZ
 * Maps all 100 progressive levels across 10 Thematic Chapter Realms
 * into a sequential TOP-to-BOTTOM winding adventure progression road.
 *
 * Requirements:
 * - Level 1 starts at the TOP of the map.
 * - Levels progress sequentially from TOP to BOTTOM (y strictly increases).
 * - Level 100 is at the BOTTOM.
 * - Alternating organic S-curves between odd and even chapters.
 * - Smooth SVG bezier path overlay.
 */

// Zone dimensions in SVG coordinate space
export const CHAPTER_ZONE_HEIGHT = 820;
export const CHAPTER_ZONE_WIDTH = 400;

// Odd chapters (1, 3, 5, 7, 9): Curves right -> loops left -> centers at Boss
export const PATTERN_ODD = [
  { x: 26, y: 60 },   // Level 1: Left
  { x: 48, y: 135 },  // Level 2: Center-left
  { x: 72, y: 210 },  // Level 3: Center-right
  { x: 82, y: 285 },  // Level 4: Right peak
  { x: 68, y: 360 },  // Level 5: Right-center
  { x: 46, y: 435 },  // Level 6: Center
  { x: 24, y: 510 },  // Level 7: Left
  { x: 18, y: 585 },  // Level 8: Left peak
  { x: 32, y: 660 },  // Level 9: Center-left
  { x: 50, y: 745 }   // Level 10 (Boss): Centered Apex Summit
];

// Even chapters (2, 4, 6, 8, 10): Curves left -> loops right -> centers at Boss
export const PATTERN_EVEN = [
  { x: 68, y: 60 },   // Level 1 (e.g. 11, 31): Right
  { x: 48, y: 135 },  // Level 2: Center
  { x: 26, y: 210 },  // Level 3: Center-left
  { x: 18, y: 285 },  // Level 4: Left peak
  { x: 32, y: 360 },  // Level 5: Center-left
  { x: 54, y: 435 },  // Level 6: Center
  { x: 76, y: 510 },  // Level 7: Right
  { x: 82, y: 585 },  // Level 8: Right peak
  { x: 68, y: 660 },  // Level 9: Center-right
  { x: 50, y: 745 }   // Level 10 (Boss): Centered Apex Summit
];

// Export default pattern for backwards compatibility
export const CHAPTER_WINDING_PATTERN = PATTERN_ODD;

// Helper to get pattern for a chapter (1-indexed)
export const getChapterWindingPattern = (chapterNumber) => {
  return chapterNumber % 2 === 0 ? PATTERN_EVEN : PATTERN_ODD;
};

// Build SVG path curve string for points in a chapter
export const buildChapterPathD = (points, hasLeadIn = false, hasLeadOut = false) => {
  if (!points || points.length === 0) return '';
  let d = '';

  const first = points[0];
  if (hasLeadIn) {
    d = `M 50 0 C 50 25, ${first.x} 30, ${first.x} ${first.y}`;
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
    const last = points[points.length - 1];
    d += ` C ${last.x} ${last.y + 35}, 50 ${CHAPTER_ZONE_HEIGHT - 20}, 50 ${CHAPTER_ZONE_HEIGHT}`;
  }

  return d;
};

// Generates the 100-level winding node mapping
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
