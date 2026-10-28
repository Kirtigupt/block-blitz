/**
 * Adventure Mode Mosaic Coordinate System for BLOCK BLITZ
 * Maps all 100 progressive levels into an 11-column Trophy Sculpture
 * matching the commercial puzzle arcade Adventure screen.
 */

export const ADVENTURE_MOSAIC_MAPPING = [
  // Row 1: Crowning Trophy Summit (Level 100)
  { level: 100, row: 1, col: 6 },

  // Row 2: Upper Finial (Levels 97-99)
  { level: 97, row: 2, col: 5 },
  { level: 98, row: 2, col: 6 },
  { level: 99, row: 2, col: 7 },

  // Row 3: Trophy Cup Rim (Levels 94-96)
  { level: 94, row: 3, col: 5 },
  { level: 95, row: 3, col: 6 },
  { level: 96, row: 3, col: 7 },

  // Row 4: Upper Bowl (Levels 88-93)
  { level: 88, row: 4, col: 3 },
  { level: 89, row: 4, col: 4 },
  { level: 90, row: 4, col: 5 },
  { level: 91, row: 4, col: 6 },
  { level: 92, row: 4, col: 7 },
  { level: 93, row: 4, col: 8 },

  // Row 5: Mid-Upper Bowl (Levels 81-87)
  { level: 81, row: 5, col: 3 },
  { level: 82, row: 5, col: 4 },
  { level: 83, row: 5, col: 5 },
  { level: 84, row: 5, col: 6 },
  { level: 85, row: 5, col: 7 },
  { level: 86, row: 5, col: 8 },
  { level: 87, row: 5, col: 9 },

  // Row 6: Main Trophy Bowl (Levels 73-80)
  { level: 73, row: 6, col: 2 },
  { level: 74, row: 6, col: 3 },
  { level: 75, row: 6, col: 4 },
  { level: 76, row: 6, col: 5 },
  { level: 77, row: 6, col: 6 },
  { level: 78, row: 6, col: 7 },
  { level: 79, row: 6, col: 8 },
  { level: 80, row: 6, col: 9 },

  // Row 7: Lower Bowl (Levels 65-72)
  { level: 65, row: 7, col: 2 },
  { level: 66, row: 7, col: 3 },
  { level: 67, row: 7, col: 4 },
  { level: 68, row: 7, col: 5 },
  { level: 69, row: 7, col: 6 },
  { level: 70, row: 7, col: 7 },
  { level: 71, row: 7, col: 8 },
  { level: 72, row: 7, col: 9 },

  // Row 8: Flared Handles Tier (Levels 56-64)
  { level: 56, row: 8, col: 2 },
  { level: 57, row: 8, col: 3 },
  { level: 58, row: 8, col: 4 },
  { level: 59, row: 8, col: 5 },
  { level: 60, row: 8, col: 6 },
  { level: 61, row: 8, col: 7 },
  { level: 62, row: 8, col: 8 },
  { level: 63, row: 8, col: 9 },
  { level: 64, row: 8, col: 10 },

  // Row 9: Trophy Cup Taper (Levels 48-55)
  { level: 48, row: 9, col: 2 },
  { level: 49, row: 9, col: 3 },
  { level: 50, row: 9, col: 4 },
  { level: 51, row: 9, col: 5 },
  { level: 52, row: 9, col: 6 },
  { level: 53, row: 9, col: 7 },
  { level: 54, row: 9, col: 8 },
  { level: 55, row: 9, col: 9 },

  // Row 10: Cup Base Inset (Levels 41-47)
  { level: 41, row: 10, col: 3 },
  { level: 42, row: 10, col: 4 },
  { level: 43, row: 10, col: 5 },
  { level: 44, row: 10, col: 6 },
  { level: 45, row: 10, col: 7 },
  { level: 46, row: 10, col: 8 },
  { level: 47, row: 10, col: 9 },

  // Row 11: Narrow Stem Top (Levels 35-40)
  { level: 35, row: 11, col: 3 },
  { level: 36, row: 11, col: 4 },
  { level: 37, row: 11, col: 5 },
  { level: 38, row: 11, col: 6 },
  { level: 39, row: 11, col: 7 },
  { level: 40, row: 11, col: 8 },

  // Row 12: Narrow Stem Base (Levels 29-34)
  { level: 29, row: 12, col: 3 },
  { level: 30, row: 12, col: 4 },
  { level: 31, row: 12, col: 5 },
  { level: 32, row: 12, col: 6 },
  { level: 33, row: 12, col: 7 },
  { level: 34, row: 12, col: 8 },

  // Row 13: Pedestal Upper Tier (Levels 21-28)
  { level: 21, row: 13, col: 2 },
  { level: 22, row: 13, col: 3 },
  { level: 23, row: 13, col: 4 },
  { level: 24, row: 13, col: 5 },
  { level: 25, row: 13, col: 6 },
  { level: 26, row: 13, col: 7 },
  { level: 27, row: 13, col: 8 },
  { level: 28, row: 13, col: 9 },

  // Row 14: Pedestal Mid Tier (Levels 12-20)
  { level: 12, row: 14, col: 2 },
  { level: 13, row: 14, col: 3 },
  { level: 14, row: 14, col: 4 },
  { level: 15, row: 14, col: 5 },
  { level: 16, row: 14, col: 6 },
  { level: 17, row: 14, col: 7 },
  { level: 18, row: 14, col: 8 },
  { level: 19, row: 14, col: 9 },
  { level: 20, row: 14, col: 10 },

  // Row 15: Grand Base (Levels 1-11)
  { level: 1, row: 15, col: 1 },
  { level: 2, row: 15, col: 2 },
  { level: 3, row: 15, col: 3 },
  { level: 4, row: 15, col: 4 },
  { level: 5, row: 15, col: 5 },
  { level: 6, row: 15, col: 6 },
  { level: 7, row: 15, col: 7 },
  { level: 8, row: 15, col: 8 },
  { level: 9, row: 15, col: 9 },
  { level: 10, row: 15, col: 10 },
  { level: 11, row: 15, col: 11 }
];

export const TOTAL_ADVENTURE_ROWS = 15;
export const TOTAL_ADVENTURE_COLS = 11;
