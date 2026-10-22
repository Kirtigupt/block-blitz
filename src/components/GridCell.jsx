import React, { memo } from 'react';
import { BLOCK_PALETTE } from '../constants/blocks';

export const GridCell = memo(({
  row,
  col,
  cellData,
  isPreview,
  isValidPreview,
  previewColorKey,
  isClearing,
  clearDelay = 0,
  isCrossIntersection = false,
  isTransitioning = false,
  isJustPlaced = false,
  onClick,
  onMouseEnter,
  onDragOver,
  onDrop
}) => {
  const isOccupied = cellData !== null;
  const activeColorKey = cellData?.colorKey || (isPreview && isValidPreview ? previewColorKey : null);
  const palette = activeColorKey ? BLOCK_PALETTE[activeColorKey] : null;

  let cellClassName = 'grid-cell';
  if (isOccupied) cellClassName += ' occupied';
  if (cellData?.isPattern) cellClassName += ' pattern-gem';
  if (isJustPlaced) cellClassName += ' cell-just-placed';
  if (isPreview) {
    cellClassName += isValidPreview ? ' preview-valid' : ' preview-invalid';
    if (isTransitioning) cellClassName += ' preview-transition-pulse';
  }
  if (isClearing) {
    cellClassName += ' clearing';
    if (isCrossIntersection) cellClassName += ' cross-intersection';
  }

  const style = {};
  if (isClearing) {
    style.animationDelay = `${clearDelay}ms`;
  }

  if (isOccupied && palette) {
    style.background = palette.gradient;
    style.boxShadow = `0 0 10px ${palette.glow}, inset 0 1px 2px rgba(255, 255, 255, 0.4), inset 0 -1px 2px rgba(0, 0, 0, 0.4)`;
    style.borderColor = palette.border;
  } else if (isPreview && isValidPreview) {
    const glowColor = palette?.glow || 'rgba(6, 182, 212, 0.4)';
    const borderColor = palette?.border || '#22d3ee';
    style.background = `radial-gradient(circle, ${glowColor} 0%, rgba(6, 182, 212, 0.25) 100%)`;
    style.borderColor = borderColor;
    style.boxShadow = `0 0 14px ${glowColor}, inset 0 0 8px rgba(34, 211, 238, 0.5)`;
  } else if (isPreview && !isValidPreview) {
    style.background = 'radial-gradient(circle, rgba(239, 68, 68, 0.45) 0%, rgba(185, 28, 28, 0.2) 100%)';
    style.borderColor = '#ef4444';
    style.boxShadow = '0 0 14px rgba(239, 68, 68, 0.7), inset 0 0 8px rgba(239, 68, 68, 0.4)';
  }

  return (
    <div
      className={cellClassName}
      style={style}
      onClick={() => onClick(row, col)}
      onMouseEnter={() => onMouseEnter(row, col)}
      onDragOver={(e) => onDragOver(e, row, col)}
      onDrop={(e) => onDrop(e, row, col)}
      data-row={row}
      data-col={col}
    >
      {/* Inner highlight for glossy 3D effect */}
      {isOccupied && <div className="cell-gloss" />}

      {/* Pattern Gem Diamond Shimmer */}
      {cellData?.isPattern && (
        <div className="pattern-gem-core">
          <span className="gem-diamond-shimmer">◈</span>
        </div>
      )}

      {/* Ripple ring on snap placement */}
      {isJustPlaced && <div className="cell-place-ripple" />}

      {/* Particle & light burst elements during line clear sweep */}
      {isClearing && (
        <>
          {/* Travelling light sweep beam highlight */}
          <div className="cell-light-sweep" style={{ animationDelay: `${clearDelay}ms` }} />

          {/* Expanding energy wave ring behind clearing cell */}
          <div className="cell-energy-shockwave" style={{ animationDelay: `${clearDelay}ms` }} />

          {/* Dissolving block fragments breaking apart into small glowing square shards */}
          <div className="cell-shatter-emitter" style={{ animationDelay: `${clearDelay}ms` }}>
            <span
              className="cell-fragment cf-tl"
              style={{
                background: palette?.gradient || '#38bdf8',
                borderColor: palette?.border || '#fff',
                boxShadow: `0 0 8px ${palette?.glow || '#38bdf8'}`
              }}
            />
            <span
              className="cell-fragment cf-tr"
              style={{
                background: palette?.gradient || '#a855f7',
                borderColor: palette?.border || '#fff',
                boxShadow: `0 0 8px ${palette?.glow || '#a855f7'}`
              }}
            />
            <span
              className="cell-fragment cf-bl"
              style={{
                background: palette?.gradient || '#06b6d4',
                borderColor: palette?.border || '#fff',
                boxShadow: `0 0 8px ${palette?.glow || '#06b6d4'}`
              }}
            />
            <span
              className="cell-fragment cf-br"
              style={{
                background: palette?.gradient || '#ec4899',
                borderColor: palette?.border || '#fff',
                boxShadow: `0 0 8px ${palette?.glow || '#ec4899'}`
              }}
            />

            {/* Core starburst spark */}
            <span className="clear-spark cs-core">✦</span>

            {/* Extra cross-intersection flares */}
            {isCrossIntersection && (
              <>
                <span className="clear-spark cs-flare-a">★</span>
                <span className="clear-spark cs-flare-b">✦</span>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
});

GridCell.displayName = 'GridCell';
