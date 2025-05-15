// Full Heatmap.js with Zone Editor (Create, Rename, Delete with Reassignment Prompt)
import React, { useEffect, useRef, useState } from 'react';
import supabase from '../utils/supabase';
import PageContainer from '../components/PageContainer';
import Draggable from 'react-draggable';
import { v4 as uuidv4 } from 'uuid';
import usePageTitle from '../hooks/usePageTitle';

const GRID_SIZE = 20;

const Heatmap = () => {
  usePageTitle('Heatmap');
  const layoutRef = useRef(null);

  const [venueId, setVenueId] = useState(null);
  const [zones, setZones] = useState([]);
  const [selectedZoneId, setSelectedZoneId] = useState(null);
  const [editingZoneId, setEditingZoneId] = useState(null);
  const [tables, setTables] = useState([]);
  const [newTableNumber, setNewTableNumber] = useState('');
  const [newTableShape, setNewTableShape] = useState('square');
  const [saving, setSaving] = useState(false);
  const [tableLimit, setTableLimit] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [feedbackMap, setFeedbackMap] = useState({});

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

      await loadZones(venue.id);
      await loadTables(venue.id);
      await fetchFeedback(venue.id);
    };

    load();
  }, []);

  const loadZones = async (venueId) => {
    const { data: zonesData, error } = await supabase
      .from('zones')
      .select('*')
      .eq('venue_id', venueId)
      .order('order');

    if (error) {
      console.error('Error loading zones:', error);
      return;
    }

    setZones(zonesData);
    if (zonesData.length > 0 && !selectedZoneId) {
      setSelectedZoneId(zonesData[0].id);
    }
  };

  useEffect(() => {
    if (!venueId) return;

    const feedbackChannel = supabase
      .channel('feedback-heatmap')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'feedback',
          filter: `venue_id=eq.${venueId}`,
        },
        () => fetchFeedback(venueId)
      )
      .subscribe();

    const tablesChannel = supabase
      .channel('tables-heatmap')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'table_positions',
          filter: `venue_id=eq.${venueId}`,
        },
        () => loadTables(venueId)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(feedbackChannel);
      supabase.removeChannel(tablesChannel);
    };
  }, [venueId]);

  const loadTables = async (venueId) => {
    const container = layoutRef.current;
    if (!container) return;
    const { width, height } = container.getBoundingClientRect();

    const { data: tableData } = await supabase
      .from('table_positions')
      .select('*')
      .eq('venue_id', venueId);

    const loaded = tableData.map(t => ({
      ...t,
      x_px: (t.x_percent / 100) * width,
      y_px: (t.y_percent / 100) * height
    }));

    setTables(loaded);
  };

  const fetchFeedback = async (venueId) => {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('venue_id', venueId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch feedback', error);
      return;
    }

    const sessionMap = {};
    const latestSessionPerTable = {};
    const averageRatings = {};

    for (const entry of data) {
      const table = entry.table_number;
      if (!table) continue;

      if (!latestSessionPerTable[table]) {
        latestSessionPerTable[table] = entry.session_id;
        sessionMap[table] = [entry];
      } else if (entry.session_id === latestSessionPerTable[table]) {
        sessionMap[table].push(entry);
      }
    }

    for (const table in sessionMap) {
      const entries = sessionMap[table];
      const validRatings = entries
        .filter(e => e.rating !== null && e.is_actioned === false)
        .map(e => e.rating);

      const avg =
        validRatings.length > 0
          ? validRatings.reduce((a, b) => a + b, 0) / validRatings.length
          : null;

      averageRatings[table] = avg;
    }

    setFeedbackMap(averageRatings);
  };

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
      shape: newTableShape,
      venue_id: venueId,
      zone_id: selectedZoneId
    };

    setTables(prev => [...prev, newTable]);
    setNewTableNumber('');
    setHasUnsavedChanges(true);
  };

  const deleteZone = async (zoneId) => {
    const tablesInZone = tables.filter(t => t.zone_id === zoneId);
    if (tablesInZone.length > 0) {
      const confirm = window.confirm(`This zone contains ${tablesInZone.length} table(s). Deleting the zone will unassign those tables. Proceed?`);
      if (!confirm) return;
      await supabase.from('table_positions').update({ zone_id: null }).eq('zone_id', zoneId);
    }
    await supabase.from('zones').delete().eq('id', zoneId);
    await loadZones(venueId);
    await loadTables(venueId);
  };

  const createNewZone = async () => {
    const { data, error } = await supabase.from('zones').insert({
      name: 'New Zone',
      venue_id: venueId,
      order: zones.length + 1
    }).select('*').single();
    if (!error && data) {
      await loadZones(venueId);
      setSelectedZoneId(data.id);
    }
  };

  const handleZoneRename = (id, name) => {
    setZones(prev => prev.map(z => z.id === id ? { ...z, name } : z));
  };

  const saveZoneRename = async (id) => {
    const zone = zones.find(z => z.id === id);
    await supabase.from('zones').update({ name: zone.name }).eq('id', id);
    setEditingZoneId(null);
  };

  const handleToggleEdit = () => {
    if (editMode && hasUnsavedChanges) {
      const confirmExit = window.confirm('You have unsaved changes. Exit anyway?');
      if (!confirmExit) return;
    }
    setEditMode(!editMode);
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
      shape: t.shape,
      zone_id: t.zone_id ?? null
    }));
    const { error } = await supabase.from('table_positions').upsert(payload);
    if (error) console.error('Save error:', error);
    else {
      setEditMode(false);
      setHasUnsavedChanges(false);
    }
    setSaving(false);
  };

  const getFeedbackColor = (avg) => {
    if (avg === null || avg === undefined) return 'bg-blue-500';
    if (avg > 4) return 'bg-green-500';
    if (avg >= 2.5) return 'bg-amber-400';
    return 'bg-red-600';
  };

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4 flex-wrap">
          <h1 className="text-2xl font-bold">Table Heatmap</h1>
          {editMode && (
            <>
              <input type="text" placeholder="Table #" value={newTableNumber} onChange={(e) => setNewTableNumber(e.target.value)} className="px-2 py-1 text-sm border rounded" />
              <select value={newTableShape} onChange={(e) => setNewTableShape(e.target.value)} className="text-sm border rounded px-2 py-1">
                <option value="square">Square</option>
                <option value="circle">Circle</option>
                <option value="long">Long</option>
              </select>
              <button onClick={addTable} className="text-sm bg-gray-700 text-white px-3 py-1 rounded">+ Add Table</button>
              <button onClick={saveLayout} disabled={saving} className="text-sm bg-green-600 text-white px-3 py-1 rounded">{saving ? 'Saving...' : 'Save Layout'}</button>
              <button onClick={clearAllTables} className="text-sm text-red-600 border border-red-600 px-3 py-1 rounded">Clear All Tables</button>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleToggleEdit} className="text-blue-600 underline text-sm">{editMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}</button>
        </div>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {zones.map((zone) => (
          <div key={zone.id} className="flex items-center gap-1">
            {editMode && editingZoneId === zone.id ? (
              <input
                value={zone.name}
                onChange={(e) => handleZoneRename(zone.id, e.target.value)}
                onBlur={() => saveZoneRename(zone.id)}
                autoFocus
                className="px-2 py-1 border rounded text-sm"
              />
            ) : (
              <button
                onClick={() => setSelectedZoneId(zone.id)}
                onDoubleClick={() => editMode && setEditingZoneId(zone.id)}
                className={`px-4 py-1 rounded border ${selectedZoneId === zone.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}
              >
                {zone.name}
              </button>
            )}
            {editMode && (
              <button
                onClick={() => deleteZone(zone.id)}
                className="text-red-500 text-xs"
                title="Delete zone"
              >
                🗑
              </button>
            )}
          </div>
        ))}
        {editMode && (
          <button onClick={createNewZone} className="px-2 py-1 text-sm border border-dashed rounded text-gray-500">+ Add Zone</button>
        )}
      </div>

      <div ref={layoutRef} id="layout-area" className="relative w-full h-[600px] bg-white border rounded">
        {tables.filter(t => t.zone_id === selectedZoneId).map((t) => {
          const avgRating = feedbackMap[t.table_number];
          const feedbackColor = getFeedbackColor(avgRating);
          const tableShapeClasses = t.shape === 'circle' ? 'w-14 h-14 rounded-full bg-gray-700' : t.shape === 'long' ? 'w-28 h-10 rounded bg-gray-700' : 'w-14 h-14 rounded bg-gray-700';
          const node = (
            <div className="absolute">
              <div className="relative">
                <div className={`text-white flex items-center justify-center font-bold border-2 border-black shadow cursor-pointer ${tableShapeClasses}`}>{t.table_number}</div>
                {!editMode && (
                  <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${feedbackColor} ${feedbackColor === 'bg-red-600' ? 'animate-pulse' : ''}`} title={avgRating === null || avgRating === undefined ? 'No feedback yet' : `Avg rating: ${avgRating.toFixed(1)}`} />
                )}
              </div>
              {editMode && (
                <button onClick={() => removeTable(t.id)} className="absolute -top-3 -right-3 bg-red-600 text-white rounded-full w-5 h-5 text-xs">×</button>
              )}
            </div>
          );
          return editMode ? (
            <Draggable key={t.id} position={{ x: t.x_px, y: t.y_px }} bounds="parent" onStop={(e, data) => handleDragStop(e, data, t.id)}>{node}</Draggable>
          ) : (
            <div key={t.id} className="absolute" style={{ left: t.x_px, top: t.y_px }}>{node}</div>
          );
        })}
      </div>
    </PageContainer>
  );
};

export default Heatmap;