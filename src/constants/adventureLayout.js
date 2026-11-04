/**
 * Adventure Mode Winding Journey Trail Coordinate System for BLOCK BLITZ
 * Maps all 100 progressive levels across 10 Thematic Chapter Realms
 * into a winding serpentine adventure progression road.
 */

// S-curve X coordinates (% across the width of the adventure trail)
export const CHAPTER_WINDING_PATTERN = [
  { x: 24, y: 65 },   // Level 1: Left
  { x: 44, y: 140 },  // Level 2: Center-left
  { x: 70, y: 215 },  // Level 3: Center-right
  { x: 84, y: 290 },  // Level 4: Far-right
  { x: 72, y: 365 },  // Level 5: Right-center
  { x: 48, y: 440 },  // Level 6: Center
  { x: 24, y: 515 },  // Level 7: Left
  { x: 18, y: 590 },  // Level 8: Far-left
  { x: 38, y: 665 },  // Level 9: Center-left
  { x: 50, y: 745 }   // Level 10 (Boss): Centered Apex Summit!
];

// Zone height in SVG units
export const CHAPTER_ZONE_HEIGHT = 820;
export const CHAPTER_ZONE_WIDTH = 400;

// Build SVG path curve string for 10 points in a chapter
export const buildChapterPathD = (points) => {
  if (!points || points.length === 0) return '';
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const midY = (prev.y + curr.y) / 2;
    d += ` C ${prev.x} ${midY}, ${curr.x} ${midY}, ${curr.x} ${curr.y}`;
  }
  return d;
};

// Generates the 100-level winding node mapping
export const ADVENTURE_MOSAIC_MAPPING = Array.from({ length: 100 }, (_, idx) => {
  const level = idx + 1;
  const chapter = Math.ceil(level / 10);
  const indexInChapter = (level - 1) % 10;
  const pos = CHAPTER_WINDING_PATTERN[indexInChapter];

  return {
    level,
    chapter,
    indexInChapter,
    xPercent: pos.x,
    yCoord: pos.y,
    // Keep row/col properties for backwards compatibility
    row: chapter * 10 + indexInChapter,
    col: Math.round(pos.x / 10)
  };
});
