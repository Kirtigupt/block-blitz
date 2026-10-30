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
 * Accurately calculate the target board grid cell (row, col) from pointer screen coordinates.
 * - Uses the actual board grid bounding rectangle and subpixel cell measurements.
 * - Perfectly accounts for cell sizes, grid gaps, padding, borders, and CSS scaling.
 * - For touch events, applies an ergonomic lift offset (calibrated to cell height) so user's finger does not obscure the target cell.
 * - Snaps cleanly to the nearest cell across gap areas, preventing dead zones or preview flickering.
 * - Validates boundary limits with a sensible snap threshold, returning null when dragged genuinely outside the board.
 * 
 * @param {number} clientX - Screen pointer X coordinate
 * @param {number} clientY - Screen pointer Y coordinate
 * @param {HTMLElement} gridElement - The .game-grid DOM element
 * @param {Object} shape - Active shape being placed
 * @param {boolean} isTouch - Whether this is a touch event requiring finger lift offset
 * @returns {{ row: number, col: number, effectiveX: number, effectiveY: number } | null}
 */
export const getGridCellFromPointer = (clientX, clientY, gridElement, shape = null, isTouch = false) => {
  if (!gridElement) return null;

  const rect = gridElement.getBoundingClientRect();
  if (!rect || rect.width === 0 || rect.height === 0) return null;

  // Measure actual rendered cells if available for exact subpixel cell size and gap pitch
  const cells = gridElement.querySelectorAll('.grid-cell');
  let cellWidth = rect.width / GRID_SIZE;
  let cellHeight = rect.height / GRID_SIZE;
  let pitchX = rect.width / GRID_SIZE;
  let pitchY = rect.height / GRID_SIZE;
  let originX = rect.left;
  let originY = rect.top;

  if (cells && cells.length >= 9) {
    const c0 = cells[0].getBoundingClientRect();
    const c1 = cells[1].getBoundingClientRect();
    const c8 = cells[8].getBoundingClientRect();
    if (c0.width > 0 && c0.height > 0) {
      cellWidth = c0.width;
      cellHeight = c0.height;
      originX = c0.left;
      originY = c0.top;
      pitchX = (c1.left - c0.left) || cellWidth;
      pitchY = (c8.top - c0.top) || cellHeight;
    }
  }

  // Ergonomic vertical lift for mobile touch drag so the thumb doesn't hide the preview
  // Calibrated dynamically to cell height (approximately 1.15x cell height + 8px)
  const touchLiftY = isTouch ? Math.round(cellHeight * 1.15 + 8) : 0;
  const effectiveX = clientX;
  const effectiveY = clientY - touchLiftY;

  // Boundary check with generous snap tolerance margin (1 cell width around perimeter)
  const snapMarginX = Math.max(cellWidth * 0.9, 36);
  const snapMarginY = Math.max(cellHeight * 0.9, 36);

  const totalGridWidth = (GRID_SIZE - 1) * pitchX + cellWidth;
  const totalGridHeight = (GRID_SIZE - 1) * pitchY + cellHeight;

  if (
    effectiveX < originX - snapMarginX ||
    effectiveX > originX + totalGridWidth + snapMarginX ||
    effectiveY < originY - snapMarginY ||
    effectiveY > originY + totalGridHeight + snapMarginY
  ) {
    return null;
  }

  // Symmetrical nearest-cell calculation that cleanly divides gaps between cells
  const dx = effectiveX - originX;
  const dy = effectiveY - originY;

  const rawCol = Math.round((dx - cellWidth / 2) / pitchX);
  const rawRow = Math.round((dy - cellHeight / 2) / pitchY);

  const col = Math.max(0, Math.min(GRID_SIZE - 1, rawCol));
  const row = Math.max(0, Math.min(GRID_SIZE - 1, rawRow));

  return {
    row,
    col,
    effectiveX,
    effectiveY,
    cellWidth,
    cellHeight,
    pitchX,
    pitchY,
    originX,
    originY,
    touchLiftY
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
