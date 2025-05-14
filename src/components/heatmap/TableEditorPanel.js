import React from 'react';

const TableEditorPanel = ({
  editMode,
  newTableNumber,
  setNewTableNumber,
  newShape,
  setNewShape,
  onAddTable,
  onSave,
  saving,
  onClear,
  onToggleEdit
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold">Live Feedback Heatmap</h1>
      <div className="space-x-2">
        <button
          onClick={onToggleEdit}
          className="bg-yellow-500 text-white px-4 py-2 rounded"
        >
          {editMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
        </button>
        {editMode && (
          <>
            <input
              type="text"
              placeholder="Table #"
              value={newTableNumber}
              onChange={(e) => setNewTableNumber(e.target.value)}
              className="px-2 py-1 border rounded"
            />
            <select
              value={newShape}
              onChange={(e) => setNewShape(e.target.value)}
              className="px-2 py-1 border rounded"
            >
              <option value="square">Square</option>
              <option value="circle">Circle</option>
              <option value="long">Long</option>
            </select>
            <button
              onClick={onAddTable}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              + Add Table
            </button>
            <button
              onClick={onSave}
              disabled={saving}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              {saving ? 'Saving...' : 'Save Layout'}
            </button>
            <button
              onClick={onClear}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              Clear All
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default TableEditorPanel;
