import React, { useEffect, useRef, useState } from 'react';
import supabase from '../utils/supabase';
import PageContainer from '../components/PageContainer';
import Draggable from 'react-draggable';
import { v4 as uuidv4 } from 'uuid';

const GRID_SIZE = 20; // 👈 adjust here for tighter/looser snapping

const Heatmap = () => {
  const layoutRef = useRef(null);

  const [venueId, setVenueId] = useState(null);
  const [tables, setTables] = useState([]);
  const [newTableNumber, setNewTableNumber] = useState('');
  const [saving, setSaving] = useState(false);
  const [tableLimit, setTableLimit] = useState(null);
  const [deletedIds, setDeletedIds] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const email = userData?.user?.email;
      if (!email) return;

      const { data: venue } = await supabase
        .from('venues')
        .select('id, table_count')
        .eq('email', email)
        .single();

      if (!venue) return;
      setVenueId(venue.id);
      setTableLimit(venue.table_count);

      const container = layoutRef.current;
      if (!container) return;

      const { width, height } = container.getBoundingClientRect();

      const { data: tableData } = await supabase
        .from('table_positions')
        .select('*')
        .eq('venue_id', venue.id);

      const loaded = tableData.map(t => ({
        ...t,
        x_px: (t.x_percent / 100) * width,
        y_px: (t.y_percent / 100) * height
      }));

      setTables(loaded);
    };

    load();
  }, []);

  const snapToGrid = (value) => Math.round(value / GRID_SIZE) * GRID_SIZE;

  const addTable = () => {
    const number = newTableNumber.trim();
    if (!number) return;
    if (tables.find(t => t.table_number === number)) {
      alert('Table number must be unique.');
      return;
    }
    if (tables.length >= tableLimit) {
      alert('Max table limit reached.');
      return;
    }

    const container = layoutRef.current;
    const { width, height } = container.getBoundingClientRect();

    const newTable = {
      id: `temp-${Date.now()}`,
      table_number: number,
      x_px: snapToGrid(width / 2 - 35),
      y_px: snapToGrid(height / 2 - 35),
      shape: 'square',
      venue_id: venueId
    };

    setTables(prev => [...prev, newTable]);
    setNewTableNumber('');
    setHasUnsavedChanges(true);
  };

  const removeTable = (id) => {
    const isTemp = id.startsWith('temp-');
    if (!isTemp) setDeletedIds(prev => [...prev, id]);
    setTables(prev => prev.filter(t => t.id !== id));
    setHasUnsavedChanges(true);
  };

  const handleDragStop = (e, data, tableId) => {
    const snappedX = snapToGrid(data.x);
    const snappedY = snapToGrid(data.y);

    setTables(prev =>
      prev.map(t =>
        t.id === tableId
          ? { ...t, x_px: snappedX, y_px: snappedY }
          : t
      )
    );
    setHasUnsavedChanges(true);
  };

  const saveLayout = async () => {
    if (!venueId || !layoutRef.current) return;
    setSaving(true);

    const { width, height } = layoutRef.current.getBoundingClientRect();

    const payload = tables.map(t => ({
      id: t.id.startsWith('temp-') ? uuidv4() : t.id,
      venue_id: t.venue_id,
      table_number: t.table_number,
      x_percent: (t.x_px / width) * 100,
      y_percent: (t.y_px / height) * 100,
      shape: t.shape
    }));

    if (deletedIds.length) {
      await supabase.from('table_positions').delete().in('id', deletedIds);
    }

    const { error } = await supabase.from('table_positions').upsert(payload);
    if (error) {
      console.error('Save error:', error);
    } else {
      setDeletedIds([]);
      setEditMode(false);
      setHasUnsavedChanges(false);
    }

    setSaving(false);
  };

  const handleToggleEdit = () => {
    if (editMode && hasUnsavedChanges) {
      const confirmExit = window.confirm('You have unsaved changes. Exit anyway?');
      if (!confirmExit) return;
    }
    setEditMode(!editMode);
  };

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Table Heatmap</h1>
          {editMode && (
            <>
              <input
                type="text"
                placeholder="Table #"
                value={newTableNumber}
                onChange={(e) => setNewTableNumber(e.target.value)}
                className="px-2 py-1 text-sm border rounded"
              />
              <button
                onClick={addTable}
                className="text-sm bg-gray-700 text-white px-3 py-1 rounded"
              >
                + Add Table
              </button>
              <button
                onClick={saveLayout}
                disabled={saving}
                className="text-sm bg-green-600 text-white px-3 py-1 rounded"
              >
                {saving ? 'Saving...' : 'Save Layout'}
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleEdit}
            className="text-blue-600 underline text-sm"
          >
            {editMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
          </button>
        </div>
      </div>

      <div
        ref={layoutRef}
        id="layout-area"
        className="relative w-full h-[600px] bg-white border rounded"
      >
        {tables.map((t) => {
          const node = (
            <div className="absolute">
              <div
                className="w-14 h-14 bg-gray-700 text-white rounded flex items-center justify-center font-bold border-2 border-black shadow cursor-pointer"
              >
                {t.table_number}
              </div>
              {editMode && (
                <button
                  onClick={() => removeTable(t.id)}
                  className="absolute -top-3 -right-3 bg-red-600 text-white rounded-full w-5 h-5 text-xs"
                >
                  ×
                </button>
              )}
            </div>
          );

          return editMode ? (
            <Draggable
              key={t.id}
              position={{ x: t.x_px, y: t.y_px }}
              bounds="parent"
              onStop={(e, data) => handleDragStop(e, data, t.id)}
            >
              {node}
            </Draggable>
          ) : (
            <div
              key={t.id}
              className="absolute"
              style={{ left: t.x_px, top: t.y_px }}
            >
              {node}
            </div>
          );
        })}
      </div>
    </PageContainer>
  );
};

export default Heatmap;