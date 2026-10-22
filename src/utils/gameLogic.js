import { BLOCK_SHAPES, GRID_SIZE } from '../constants/blocks.js';

// Create an empty 8x8 grid
export const createEmptyGrid = () => {
  return Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => null)
  );
};

/**
 * Calculate the visual anchor offset of a shape matrix.
 * This centers the piece naturally under the pointer/finger instead
 * of abruptly anchoring everything at the top-left (0, 0).
 */
export const getShapeAnchor = (shape) => {
  if (!shape || !shape.matrix) return { row: 0, col: 0 };
  const rows = shape.matrix.length;
  const cols = shape.matrix[0].length;
  return {
    row: Math.floor((rows - 1) / 2),
    col: Math.floor((cols - 1) / 2)
  };
};

/**
 * Generate a balanced set of 3 random shapes for the bottom tray.
 * Ensures:
 * 1. At least one small piece per set (maintains board maneuverability).
 * 2. At most one large piece per set (prevents unfair instant game-over rolls).
 * 3. Preserves randomness and variety across all shape types.
 */
export const getRandomShapes = (count = 3) => {
  const smallPool = BLOCK_SHAPES.filter((s) => s.tier === 'small');
  const mediumPool = BLOCK_SHAPES.filter((s) => s.tier === 'medium');
  const largePool = BLOCK_SHAPES.filter((s) => s.tier === 'large');

  const selectedTemplates = [];

  // Slot 1: Guaranteed small piece
  const s1 = smallPool[Math.floor(Math.random() * smallPool.length)];
  selectedTemplates.push(s1);

  // Slot 2: Small or medium piece
  const smallOrMedium = [...smallPool, ...mediumPool];
  const s2 = smallOrMedium[Math.floor(Math.random() * smallOrMedium.length)];
  selectedTemplates.push(s2);

  // Slot 3: Any tier (small, medium, or large)
  const allPool = [...smallPool, ...mediumPool, ...largePool];
  const s3 = allPool[Math.floor(Math.random() * allPool.length)];
  selectedTemplates.push(s3);

  // Shuffle positions so small piece is not always in the first tray slot
  for (let i = selectedTemplates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [selectedTemplates[i], selectedTemplates[j]] = [selectedTemplates[j], selectedTemplates[i]];
  }

  // Convert to playable shape instances with unique instanceIds
  return selectedTemplates.slice(0, count).map((template, idx) => ({
    ...template,
    instanceId: `${template.id}-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 5)}`,
    placed: false
  }));
};

/**
 * Check if a shape can be placed when targeted at board coordinate (targetRow, targetCol).
 * Translates target using the shape's natural center anchor.
 */
export const canPlaceShape = (grid, shape, targetRow, targetCol) => {
  if (!shape || !shape.matrix) return false;

  const anchor = getShapeAnchor(shape);
  const originRow = targetRow - anchor.row;
  const originCol = targetCol - anchor.col;

  const rows = shape.matrix.length;
  const cols = shape.matrix[0].length;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (shape.matrix[r][c] === 1) {
        const boardRow = originRow + r;
        const boardCol = originCol + c;

        // Boundary checks
        if (
          boardRow < 0 ||
          boardRow >= GRID_SIZE ||
          boardCol < 0 ||
          boardCol >= GRID_SIZE
        ) {
          return false;
        }

        // Overlap checks
        if (grid[boardRow][boardCol] !== null) {
          return false;
        }
      }
    }
  }

  return true;
};

/**
 * Get list of all board coordinates occupied when targeting (targetRow, targetCol).
 */
export const getShapeCoordinates = (shape, targetRow, targetCol) => {
  if (!shape || !shape.matrix) return [];
  const coords = [];
  const anchor = getShapeAnchor(shape);
  const originRow = targetRow - anchor.row;
  const originCol = targetCol - anchor.col;

  const rows = shape.matrix.length;
  const cols = shape.matrix[0].length;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (shape.matrix[r][c] === 1) {
        coords.push({
          row: originRow + r,
          col: originCol + c
        });
      }
    }
  }
  return coords;
};

/**
 * Check if a shape can fit ANYWHERE on the current board.
 * Evaluates all valid footprint origins from (0, 0) to (GRID_SIZE - rows, GRID_SIZE - cols).
 */
export const canShapeFitAnywhere = (grid, shape) => {
  if (!shape || shape.placed || !shape.matrix) return false;

  const rows = shape.matrix.length;
  const cols = shape.matrix[0].length;
  const anchor = getShapeAnchor(shape);

  for (let originR = 0; originR <= GRID_SIZE - rows; originR++) {
    for (let originC = 0; originC <= GRID_SIZE - cols; originC++) {
      const targetR = originR + anchor.row;
      const targetC = originC + anchor.col;
      if (canPlaceShape(grid, shape, targetR, targetC)) {
        return true;
      }
    }
  }

  return false;
};

/**
 * Check Game Over: true if none of the unplaced available shapes can fit anywhere on the grid.
 */
export const isGameOver = (grid, availableShapes) => {
  const remainingShapes = availableShapes.filter((s) => !s.placed);
  if (remainingShapes.length === 0) {
    return false; // All placed, tray will refresh
  }

  for (const shape of remainingShapes) {
    if (canShapeFitAnywhere(grid, shape)) {
      return false;
    }
  }

  return true;
};

/**
 * Place shape on grid at targeted anchor position and return new grid.
 */
export const placeShapeOnGrid = (grid, shape, targetRow, targetCol) => {
  if (!canPlaceShape(grid, shape, targetRow, targetCol)) {
    return { success: false, newGrid: grid };
  }

  const newGrid = grid.map((row) => [...row]);
  const anchor = getShapeAnchor(shape);
  const originRow = targetRow - anchor.row;
  const originCol = targetCol - anchor.col;

  const rows = shape.matrix.length;
  const cols = shape.matrix[0].length;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (shape.matrix[r][c] === 1) {
        newGrid[originRow + r][originCol + c] = {
          colorKey: shape.colorKey,
          shapeId: shape.id,
          placedAt: Date.now()
        };
      }
    }
  }

  return { success: true, newGrid };
};

/**
 * Detect full rows and full columns simultaneously.
 */
export const detectFullLines = (grid) => {
  const fullRows = [];
  const fullCols = [];

  // Check rows
  for (let r = 0; r < GRID_SIZE; r++) {
    let rowComplete = true;
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === null) {
        rowComplete = false;
        break;
      }
    }
    if (rowComplete) {
      fullRows.push(r);
    }
  }

  // Check columns
  for (let c = 0; c < GRID_SIZE; c++) {
    let colComplete = true;
    for (let r = 0; r < GRID_SIZE; r++) {
      if (grid[r][c] === null) {
        colComplete = false;
        break;
      }
    }
    if (colComplete) {
      fullCols.push(c);
    }
  }

  return { fullRows, fullCols, totalLines: fullRows.length + fullCols.length };
};

/**
 * Clear the identified full lines from the grid.
 */
export const clearLinesFromGrid = (grid, fullRows, fullCols) => {
  if (fullRows.length === 0 && fullCols.length === 0) {
    return grid;
  }

  const newGrid = grid.map((row, r) =>
    row.map((cell, c) => {
      if (fullRows.includes(r) || fullCols.includes(c)) {
        return null;
      }
      return cell;
    })
  );

  return newGrid;
};

/**
 * Calculate block placement points (1 per tile block).
 */
export const getBlockTileCount = (shape) => {
  if (!shape || !shape.matrix) return 0;
  return shape.matrix.reduce(
    (sum, row) => sum + row.reduce((rowSum, val) => rowSum + val, 0),
    0
  );
};

/**
 * Calculate line clear points and combo streak bonuses.
 */
export const calculateScore = (clearedLines, currentStreak) => {
  if (clearedLines <= 0) return 0;

  const lineBaseScores = {
    1: 100,
    2: 300,
    3: 600,
    4: 1000,
    5: 1500,
    6: 2200
  };

  const baseScore = lineBaseScores[clearedLines] || clearedLines * 400;
  const streakBonus = currentStreak > 1 ? (currentStreak - 1) * 75 : 0;

  return baseScore + streakBonus;
};
