import { GRID_SIZE } from './blocks.js';

/**
 * 8x8 Board Pattern Library for BLOCK BLITZ
 * Each pattern strategically seeds 4-12 obstacle/gem cells on the 8x8 grid,
 * creating distinct tactical puzzles while leaving 52+ empty cells for block placement.
 */

export const PATTERN_DEFINITIONS = {
  // Clean empty board (standard)
  clean: {
    id: 'clean',
    name: 'Open Grid',
    coords: []
  },

  // Central Plus / Cross
  cross: {
    id: 'cross',
    name: 'Neon Cross',
    coords: [
      { row: 2, col: 3 },
      { row: 3, col: 2 }, { row: 3, col: 3 }, { row: 3, col: 4 },
      { row: 4, col: 3 }
    ]
  },

  // 4 Corner Outposts
  corners: {
    id: 'corners',
    name: 'Corner Outposts',
    coords: [
      { row: 0, col: 0 }, { row: 0, col: 7 },
      { row: 7, col: 0 }, { row: 7, col: 7 }
    ]
  },

  // Central Diamond formation
  diamond: {
    id: 'diamond',
    name: 'Crystal Diamond',
    coords: [
      { row: 2, col: 3 }, { row: 2, col: 4 },
      { row: 3, col: 2 }, { row: 3, col: 5 },
      { row: 4, col: 2 }, { row: 4, col: 5 },
      { row: 5, col: 3 }, { row: 5, col: 4 }
    ]
  },

  // Dual Vertical Pillars
  pillars: {
    id: 'pillars',
    name: 'Twin Pillars',
    coords: [
      { row: 2, col: 2 }, { row: 3, col: 2 }, { row: 4, col: 2 }, { row: 5, col: 2 },
      { row: 2, col: 5 }, { row: 3, col: 5 }, { row: 4, col: 5 }, { row: 5, col: 5 }
    ]
  },

  // Central Hollow Ring
  ring: {
    id: 'ring',
    name: 'Solar Ring',
    coords: [
      { row: 2, col: 2 }, { row: 2, col: 3 }, { row: 2, col: 4 }, { row: 2, col: 5 },
      { row: 5, col: 2 }, { row: 5, col: 3 }, { row: 5, col: 4 }, { row: 5, col: 5 },
      { row: 3, col: 2 }, { row: 4, col: 2 }, { row: 3, col: 5 }, { row: 4, col: 5 }
    ]
  },

  // Scattered Checker Gems
  checker: {
    id: 'checker',
    name: 'Checker Gems',
    coords: [
      { row: 1, col: 2 }, { row: 1, col: 5 },
      { row: 3, col: 1 }, { row: 3, col: 6 },
      { row: 4, col: 1 }, { row: 4, col: 6 },
      { row: 6, col: 2 }, { row: 6, col: 5 }
    ]
  },

  // Diagonal Slash
  slash: {
    id: 'slash',
    name: 'Diagonal Slash',
    coords: [
      { row: 1, col: 1 },
      { row: 2, col: 2 },
      { row: 3, col: 3 },
      { row: 4, col: 4 },
      { row: 5, col: 5 },
      { row: 6, col: 6 }
    ]
  },

  // Reverse Diagonal Slash
  anti_slash: {
    id: 'anti_slash',
    name: 'Reverse Slash',
    coords: [
      { row: 1, col: 6 },
      { row: 2, col: 5 },
      { row: 3, col: 4 },
      { row: 4, col: 3 },
      { row: 5, col: 2 },
      { row: 6, col: 1 }
    ]
  },

  // Fortress Inner Bastion
  fortress: {
    id: 'fortress',
    name: 'Inner Bastion',
    coords: [
      { row: 1, col: 1 }, { row: 1, col: 6 },
      { row: 6, col: 1 }, { row: 6, col: 6 },
      { row: 3, col: 3 }, { row: 3, col: 4 },
      { row: 4, col: 3 }, { row: 4, col: 4 }
    ]
  },

  // Step Pyramid
  pyramid: {
    id: 'pyramid',
    name: 'Neon Pyramid',
    coords: [
      { row: 2, col: 3 }, { row: 2, col: 4 },
      { row: 3, col: 2 }, { row: 3, col: 5 },
      { row: 4, col: 1 }, { row: 4, col: 6 }
    ]
  },

  // Constellation Cluster
  constellation: {
    id: 'constellation',
    name: 'Star Cluster',
    coords: [
      { row: 1, col: 4 },
      { row: 2, col: 2 }, { row: 2, col: 6 },
      { row: 4, col: 3 }, { row: 4, col: 5 },
      { row: 6, col: 4 }
    ]
  },

  // Arcade Heart
  heart: {
    id: 'heart',
    name: 'Arcade Heart',
    coords: [
      { row: 2, col: 2 }, { row: 2, col: 5 },
      { row: 3, col: 1 }, { row: 3, col: 3 }, { row: 3, col: 4 }, { row: 3, col: 6 },
      { row: 4, col: 2 }, { row: 4, col: 5 },
      { row: 5, col: 3 }, { row: 5, col: 4 }
    ]
  },

  // Horizontal Gate / Barricade
  gate: {
    id: 'gate',
    name: 'Horizontal Gate',
    coords: [
      { row: 3, col: 1 }, { row: 3, col: 2 },
      { row: 3, col: 5 }, { row: 3, col: 6 },
      { row: 4, col: 1 }, { row: 4, col: 2 },
      { row: 4, col: 5 }, { row: 4, col: 6 }
    ]
  },

  // Dual Crosses
  dual_cross: {
    id: 'dual_cross',
    name: 'Dual Nexus',
    coords: [
      // Left cross
      { row: 2, col: 2 },
      { row: 3, col: 1 }, { row: 3, col: 2 }, { row: 3, col: 3 },
      { row: 4, col: 2 },
      // Right cross
      { row: 3, col: 5 },
      { row: 4, col: 4 }, { row: 4, col: 5 }, { row: 4, col: 6 },
      { row: 5, col: 5 }
    ]
  },

  // Hourglass formation
  hourglass: {
    id: 'hourglass',
    name: 'Vortex Hourglass',
    coords: [
      { row: 2, col: 2 }, { row: 2, col: 3 }, { row: 2, col: 4 }, { row: 2, col: 5 },
      { row: 3, col: 3 }, { row: 3, col: 4 },
      { row: 4, col: 3 }, { row: 4, col: 4 },
      { row: 5, col: 2 }, { row: 5, col: 3 }, { row: 5, col: 4 }, { row: 5, col: 5 }
    ]
  },

  // Outer Brackets
  brackets: {
    id: 'brackets',
    name: 'Cyber Brackets',
    coords: [
      { row: 1, col: 1 }, { row: 1, col: 2 },
      { row: 2, col: 1 },
      { row: 5, col: 1 },
      { row: 6, col: 1 }, { row: 6, col: 2 },
      { row: 1, col: 5 }, { row: 1, col: 6 },
      { row: 2, col: 6 },
      { row: 5, col: 6 },
      { row: 6, col: 5 }, { row: 6, col: 6 }
    ]
  },

  // Center Target / Bullseye
  bullseye: {
    id: 'bullseye',
    name: 'Precision Bullseye',
    coords: [
      { row: 3, col: 3 }, { row: 3, col: 4 },
      { row: 4, col: 3 }, { row: 4, col: 4 },
      { row: 1, col: 3 }, { row: 1, col: 4 },
      { row: 6, col: 3 }, { row: 6, col: 4 },
      { row: 3, col: 1 }, { row: 4, col: 1 },
      { row: 3, col: 6 }, { row: 4, col: 6 }
    ]
  }
};

/**
 * Generate an 8x8 grid seeded with a specific pattern.
 */
export const createPatternGrid = (patternKey = 'clean', colorKey = 'amber') => {
  const grid = Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => null)
  );

  const pattern = PATTERN_DEFINITIONS[patternKey] || PATTERN_DEFINITIONS.clean;
  if (!pattern || !pattern.coords || pattern.coords.length === 0) {
    return grid;
  }

  for (const coord of pattern.coords) {
    if (coord.row >= 0 && coord.row < GRID_SIZE && coord.col >= 0 && coord.col < GRID_SIZE) {
      grid[coord.row][coord.col] = {
        colorKey: colorKey || 'amber',
        shapeId: 'pattern',
        isPattern: true,
        patternId: pattern.id,
        placedAt: 0
      };
    }
  }

  return grid;
};

/**
 * Count how many patterned obstacle cells currently remain on the grid.
 */
export const countRemainingPatternCells = (grid) => {
  if (!grid) return 0;
  let count = 0;
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c]?.isPattern) {
        count++;
      }
    }
  }
  return count;
};

/**
 * Get display info for a pattern.
 */
export const getPatternInfo = (patternKey) => {
  return PATTERN_DEFINITIONS[patternKey] || PATTERN_DEFINITIONS.clean;
};
