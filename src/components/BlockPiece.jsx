import React, { useRef, memo } from 'react';
import { BLOCK_PALETTE } from '../constants/blocks';

export const BlockPiece = memo(({
  shape,
  isSelected,
  canFit,
  isUnplaceableShake = false,
  onSelect,
  onUnplaceableAttempt,
  onDragStart,
  onDragEnd,
  onTouchDragStart,
  onTouchDragMove,
  onTouchDragEnd
}) => {
  const touchStartPos = useRef({ x: 0, y: 0 });
  const hasMovedSignificant = useRef(false);
  const lastTouchTime = useRef(0);

  if (!shape || shape.placed) {
    return <div className="block-piece-placeholder" />;
  }

  const palette = BLOCK_PALETTE[shape.colorKey] || BLOCK_PALETTE.cyan;
  const matrix = shape.matrix;
  const rows = matrix.length;
  const cols = matrix[0].length;

  // Desktop HTML5 drag handler
  const handleDragStart = (e) => {
    if (!canFit) {
      e.preventDefault();
      if (onUnplaceableAttempt) {
        onUnplaceableAttempt(shape);
      }
      return;
    }
    try {
      // Blank drag image so custom animated neon follower avatar displays instead of native grey box
      const blankImg = new Image();
      blankImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      e.dataTransfer.setDragImage(blankImg, 0, 0);
    } catch {
      // Safe fallback
    }
    e.dataTransfer.setData('application/json', JSON.stringify(shape));
    if (onDragStart) onDragStart(shape, e.clientX, e.clientY);
  };

  const handleDragEnd = () => {
    if (onDragEnd) onDragEnd();
  };

  // Mobile Touch Handlers
  const handleTouchStart = (e) => {
    if (shape.placed) return;
    if (!canFit) {
      if (onUnplaceableAttempt) {
        onUnplaceableAttempt(shape);
      }
      return;
    }
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    hasMovedSignificant.current = false;

    if (onTouchDragStart) {
      onTouchDragStart(shape, touch.clientX, touch.clientY);
    }
  };

  const handleTouchMove = (e) => {
    if (!canFit || shape.placed) return;
    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - touchStartPos.current.x);
    const dy = Math.abs(touch.clientY - touchStartPos.current.y);

    if (dx > 8 || dy > 8) {
      hasMovedSignificant.current = true;
      if (e.cancelable) {
        e.preventDefault(); // Prevent page scroll during active piece drag
      }
    }

    if (onTouchDragMove) {
      onTouchDragMove(shape, touch.clientX, touch.clientY);
    }
  };

  const handleTouchEnd = (e) => {
    if (!canFit || shape.placed) return;
    const touch = e.changedTouches[0];

    if (hasMovedSignificant.current) {
      // Touch Drag & Drop completed
      if (onTouchDragEnd) {
        onTouchDragEnd(shape, touch.clientX, touch.clientY);
      }
    } else {
      // Simple Tap / Click
      if (onSelect) {
        onSelect(shape);
      }
      if (onTouchDragEnd) {
        onTouchDragEnd(shape, touch.clientX, touch.clientY, true); // Cancel drag
      }
    }
    lastTouchTime.current = Date.now();
    hasMovedSignificant.current = false;
  };

  const handleClick = () => {
    // Prevent ghost click fired by mobile browsers shortly after touchend
    if (Date.now() - lastTouchTime.current < 450) {
      return;
    }
    if (!canFit) {
      if (onUnplaceableAttempt) {
        onUnplaceableAttempt(shape);
      }
      return;
    }
    if (onSelect) {
      onSelect(shape);
    }
  };

  let pieceClassName = 'block-piece';
  if (isSelected) pieceClassName += ' selected';
  if (!canFit) pieceClassName += ' disabled unplaceable';
  if (isUnplaceableShake) pieceClassName += ' shake-unplaceable';

  return (
    <div
      className={pieceClassName}
      onClick={handleClick}
      draggable={canFit}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      style={{ touchAction: canFit ? 'none' : 'auto' }}
      title={
        !canFit
          ? 'No space on board for this piece right now'
          : isSelected
          ? 'Selected - click on grid to place'
          : 'Click or drag to place'
      }
    >
      {/* Lifted Neon Glow Aura when piece is selected in tray */}
      {isSelected && <div className="piece-lift-aura" style={{ boxShadow: `0 0 18px ${palette.glow}` }} />}

      {/* Subtle indicator when piece cannot fit anywhere */}
      {!canFit && !shape.placed && (
        <div className="no-space-badge">
          <span>NO SPACE</span>
        </div>
      )}

      <div
        className="block-matrix"
        style={{
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          gridTemplateColumns: `repeat(${cols}, 1fr)`
        }}
      >
        {matrix.map((row, r) =>
          row.map((val, c) => (
            <div
              key={`${r}-${c}`}
              className={`mini-cell ${val === 1 ? 'filled' : 'empty'}`}
              style={
                val === 1
                  ? {
                      background: palette.gradient,
                      borderColor: palette.border,
                      boxShadow: isSelected
                        ? `0 0 8px ${palette.glow}`
                        : `0 2px 4px rgba(0, 0, 0, 0.3)`
                    }
                  : {}
              }
            />
          ))
        )}
      </div>
    </div>
  );
});

BlockPiece.displayName = 'BlockPiece';
