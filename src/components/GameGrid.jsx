import React, { useMemo } from 'react';
import { GridCell } from './GridCell';
import { GRID_SIZE } from '../constants/blocks';
import { canPlaceShape, getShapeCoordinates, getGridCellFromPointer } from '../utils/gameLogic';

export const GameGrid = ({
  grid,
  selectedShape,
  hoverPos,
  clearingCells,
  clearingLines,
  screenShake,
  justPlacedCells,
  onCellClick,
  onCellHover,
  onGridLeave,
  onDropShape
}) => {
  // Precompute preview cells when a shape is selected and a cell is hovered
  const previewInfo = useMemo(() => {
    if (!selectedShape || !hoverPos) {
      return { map: new Map(), isValid: false };
    }

    const { row, col } = hoverPos;
    const isValid = canPlaceShape(grid, selectedShape, row, col);
    const coords = getShapeCoordinates(selectedShape, row, col);

    const map = new Map();
    coords.forEach(({ row: r, col: c }) => {
      if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
        map.set(`${r},${c}`, isValid);
      }
    });

    return { map, isValid };
  }, [grid, selectedShape, hoverPos]);

  const handleDragOver = (e, row, col) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    onCellHover(row, col);
  };

  const handleDrop = (e, row, col) => {
    e.preventDefault();
    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (dataStr) {
        const droppedShape = JSON.parse(dataStr);
        onDropShape(droppedShape, row, col);
        return;
      }
    } catch {
      // Fallback to currently selected shape if drag data wasn't parsed
    }
    if (selectedShape) {
      onCellClick(row, col);
    }
  };

  const handleContainerDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    const gridEl = e.currentTarget.classList.contains('game-grid')
      ? e.currentTarget
      : e.currentTarget.querySelector('.game-grid');
    const hit = getGridCellFromPointer(e.clientX, e.clientY, gridEl, selectedShape, false);
    if (hit) {
      onCellHover(hit.row, hit.col);
    }
  };

  const handleContainerDrop = (e) => {
    e.preventDefault();
    if (e.target.closest('.grid-cell')) return;
    const gridEl = e.currentTarget.classList.contains('game-grid')
      ? e.currentTarget
      : e.currentTarget.querySelector('.game-grid');
    const hit = getGridCellFromPointer(e.clientX, e.clientY, gridEl, selectedShape, false);
    if (!hit) return;
    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (dataStr) {
        const droppedShape = JSON.parse(dataStr);
        onDropShape(droppedShape, hit.row, hit.col);
        return;
      }
    } catch {
      // Fallback
    }
    if (selectedShape) {
      onCellClick(hit.row, hit.col);
    }
  };

  const handleGridClick = (e) => {
    if (!selectedShape) return;
    if (e.target.closest('.grid-cell')) return;
    const gridEl = e.currentTarget.classList.contains('game-grid')
      ? e.currentTarget
      : e.currentTarget.querySelector('.game-grid');
    const hit = getGridCellFromPointer(e.clientX, e.clientY, gridEl, selectedShape, false);
    if (hit) {
      onCellClick(hit.row, hit.col);
    }
  };

  let containerClassName = 'grid-container';
  if (screenShake === 'intense') containerClassName += ' screen-shake-intense';
  else if (screenShake === 'subtle') containerClassName += ' screen-shake-subtle';

  const rowsCleared = clearingLines?.rows || [];
  const colsCleared = clearingLines?.cols || [];

  return (
    <div
      className={containerClassName}
      onMouseLeave={onGridLeave}
      onDragOver={handleContainerDragOver}
      onDrop={handleContainerDrop}
      onClick={handleGridClick}
    >
      {/* Expanding energy wave illumination across cleared rows */}
      {rowsCleared.map((r) => (
        <div
          key={`row-wave-${r}`}
          className="line-energy-wave row-wave"
          style={{ top: `calc(${r} * (var(--cell-size) + var(--grid-gap)) + 10px)` }}
        />
      ))}

      {/* Expanding energy wave illumination down cleared columns */}
      {colsCleared.map((c) => (
        <div
          key={`col-wave-${c}`}
          className="line-energy-wave col-wave"
          style={{ left: `calc(${c} * (var(--cell-size) + var(--grid-gap)) + 10px)` }}
        />
      ))}

      {/* Light Sweep Beams across cleared rows */}
      {rowsCleared.map((r) => (
        <div
          key={`row-sweep-${r}`}
          className="line-clear-beam row-beam"
          style={{ top: `calc(${r} * (var(--cell-size) + var(--grid-gap)) + 10px)` }}
        >
          <div className="beam-laser-head" />
          <div className="beam-laser-trail" />
        </div>
      ))}

      {/* Light Sweep Beams down cleared columns */}
      {colsCleared.map((c) => (
        <div
          key={`col-sweep-${c}`}
          className="line-clear-beam col-beam"
          style={{ left: `calc(${c} * (var(--cell-size) + var(--grid-gap)) + 10px)` }}
        >
          <div className="beam-laser-head vertical" />
          <div className="beam-laser-trail vertical" />
        </div>
      ))}

      {/* Intersecting flares for simultaneous row and column clears */}
      {rowsCleared.map((r) =>
        colsCleared.map((c) => (
          <div
            key={`flare-${r}-${c}`}
            className="line-cross-flare"
            style={{
              top: `calc(${r} * (var(--cell-size) + var(--grid-gap)) + 10px)`,
              left: `calc(${c} * (var(--cell-size) + var(--grid-gap)) + 10px)`
            }}
          >
            <span className="starburst-flare">✦</span>
            <span className="cross-ring-flare" />
          </div>
        ))
      )}

      <div className="game-grid">
        {grid.map((rowArr, r) =>
          rowArr.map((cellData, c) => {
            const key = `${r},${c}`;
            const hasPreview = previewInfo.map.has(key);
            const isValidPreview = previewInfo.isValid;
            const isClearing = clearingCells && clearingCells.has(key);

            // Staggered light sweep delay across cells
            let clearDelay = 0;
            const inRow = rowsCleared.includes(r);
            const inCol = colsCleared.includes(c);
            const isCross = inRow && inCol;
            const isJustPlaced = Boolean(justPlacedCells && justPlacedCells.has(key));

            if (inRow && !inCol) {
              clearDelay = c * 24;
            } else if (inCol && !inRow) {
              clearDelay = r * 24;
            } else if (isCross) {
              clearDelay = Math.min(r, c) * 16;
            }

            return (
              <GridCell
                key={key}
                row={r}
                col={c}
                cellData={cellData}
                isPreview={hasPreview}
                isValidPreview={isValidPreview}
                previewColorKey={selectedShape?.colorKey}
                isClearing={isClearing}
                clearDelay={clearDelay}
                isCrossIntersection={isCross}
                isJustPlaced={isJustPlaced}
                onClick={onCellClick}
                onMouseEnter={onCellHover}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              />
            );
          })
        )}
      </div>
    </div>
  );
};
