import React from 'react';
import { BlockPiece } from './BlockPiece';
import { canShapeFitAnywhere } from '../utils/gameLogic';

export const BlockTray = ({
  shapes,
  grid,
  selectedShape,
  unplaceableShakeId,
  showHints = true,
  onSelectShape,
  onUnplaceableAttempt,
  onDragStart,
  onDragEnd,
  onTouchDragStart,
  onTouchDragMove,
  onTouchDragEnd
}) => {
  return (
    <div className="block-tray-container">
      <div className="block-tray">
        {shapes.map((shape) => {
          const isSelected = selectedShape?.instanceId === shape.instanceId;
          const canFit = !shape.placed && canShapeFitAnywhere(grid, shape);
          const isUnplaceableShake = unplaceableShakeId === shape.instanceId;

          return (
            <div key={shape.instanceId} className="block-tray-slot">
              <BlockPiece
                shape={shape}
                isSelected={isSelected}
                canFit={canFit}
                isUnplaceableShake={isUnplaceableShake}
                onSelect={onSelectShape}
                onUnplaceableAttempt={onUnplaceableAttempt}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onTouchDragStart={onTouchDragStart}
                onTouchDragMove={onTouchDragMove}
                onTouchDragEnd={onTouchDragEnd}
              />
            </div>
          );
        })}
      </div>
      {showHints && (
        <div className="tray-hint">
          {selectedShape ? (
            <span className="hint-active">Click or release on any cell to place</span>
          ) : (
            <span className="hint-default">Drag or tap a block above to place</span>
          )}
        </div>
      )}
    </div>
  );
};
