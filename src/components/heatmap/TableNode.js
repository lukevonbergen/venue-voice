import React from 'react';
import Draggable from 'react-draggable';

const TableNode = ({
  table,
  editMode,
  unresolved,
  onDragStop,
  onRemove,
  onClick
}) => {
  const bg = unresolved ? 'red' : 'gray';
  const pulse = unresolved;
  const shapeClass =
    table.shape === 'circle'
      ? 'rounded-full w-14 h-14'
      : table.shape === 'long'
      ? 'w-24 h-10'
      : 'w-14 h-14';

  const content = (
    <div
      onClick={() => !editMode && onClick(table.table_number)}
      className={`${shapeClass} flex items-center justify-center text-white font-bold shadow cursor-pointer ${pulse ? 'animate-pulse' : ''} border-2 border-black transition-transform hover:scale-105`}
      style={{ backgroundColor: bg }}
    >
      {table.table_number}
    </div>
  );

  if (editMode) {
    return (
      <Draggable
        key={table.id}
        position={{ x: table.x_px, y: table.y_px }}
        bounds="parent"
        onStop={(e, d) => onDragStop(e, d, table)}
      >
        <div className="absolute">
          {content}
          <button
            onClick={() => onRemove(table.id)}
            className="absolute -top-3 -right-3 bg-red-600 text-white rounded-full w-5 h-5 text-xs"
          >
            ×
          </button>
        </div>
      </Draggable>
    );
  }

  return (
    <div
      key={table.id}
      style={{
        position: 'absolute',
        top: `${table.y_percent}%`,
        left: `${table.x_percent}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {content}
    </div>
  );
};

export default TableNode;
