// Full Heatmap.js with zone tabs, feedback modal, and full table + zone editing support
import React, { useEffect, useRef, useState } from 'react';
import supabase from '../utils/supabase';
import PageContainer from '../components/PageContainer';
import Draggable from 'react-draggable';
import { v4 as uuidv4 } from 'uuid';
import usePageTitle from '../hooks/usePageTitle';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

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

  const [selectedTable, setSelectedTable] = useState(null);
  const [feedbackModalData, setFeedbackModalData] = useState([]);

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
    const { data, error } = await supabase
      .from('zones')
      .select('*')
      .eq('venue_id', venueId)
      .order('order');

    if (!error) {
      setZones(data);
      if (data.length > 0 && !selectedZoneId) setSelectedZoneId(data[0].id);
    }
  };

  const loadTables = async (venueId) => {
    const container = layoutRef.current;
    if (!container) return;
    const { width, height } = container.getBoundingClientRect();
    const { data } = await supabase.from('table_positions').select('*').eq('venue_id', venueId);
    const loaded = data.map(t => ({ ...t, x_px: (t.x_percent / 100) * width, y_px: (t.y_percent / 100) * height }));
    setTables(loaded);
  };

  const fetchFeedback = async (venueId) => {
    const { data } = await supabase
      .from('feedback')
      .select('*')
      .eq('venue_id', venueId)
      .order('created_at', { ascending: false });

    const sessionMap = {}, latestSession = {}, ratings = {};
    for (const entry of data) {
      const table = entry.table_number;
      if (!table) continue;
      if (!latestSession[table]) {
        latestSession[table] = entry.session_id;
        sessionMap[table] = [entry];
      } else if (entry.session_id === latestSession[table]) {
        sessionMap[table].push(entry);
      }
    }

    for (const table in sessionMap) {
      const valid = sessionMap[table].filter(e => e.rating !== null && !e.is_actioned).map(e => e.rating);
      ratings[table] = valid.length > 0 ? valid.reduce((a, b) => a + b) / valid.length : null;
    }
    setFeedbackMap(ratings);
  };

  const openFeedbackModal = async (tableNumber) => {
    const { data } = await supabase
      .from('feedback')
      .select('*')
      .eq('venue_id', venueId)
      .eq('table_number', tableNumber)
      .order('created_at', { ascending: false });

    setFeedbackModalData(data);
    setSelectedTable(tableNumber);
  };

  const markResolved = async (feedbackId) => {
    await supabase.from('feedback').update({ is_actioned: true, resolved_at: new Date() }).eq('id', feedbackId);
    await fetchFeedback(venueId);
    setFeedbackModalData(prev => prev.map(f => f.id === feedbackId ? { ...f, is_actioned: true } : f));
  };

  const undoResolved = async (feedbackId) => {
    await supabase.from('feedback').update({ is_actioned: false, resolved_at: null }).eq('id', feedbackId);
    await fetchFeedback(venueId);
    setFeedbackModalData(prev => prev.map(f => f.id === feedbackId ? { ...f, is_actioned: false } : f));
  };

  const addTable = () => {
    const number = newTableNumber.trim();
    if (!number || tables.find(t => t.table_number === number)) return alert('Table number must be unique.');
    if (tables.length >= tableLimit) return alert('Max table limit reached.');
    const { width, height } = layoutRef.current.getBoundingClientRect();
    setTables(prev => [...prev, {
      id: `temp-${Date.now()}`,
      table_number: number,
      x_px: Math.round(width / 2),
      y_px: Math.round(height / 2),
      shape: newTableShape,
      venue_id: venueId,
      zone_id: selectedZoneId
    }]);
    setNewTableNumber('');
    setHasUnsavedChanges(true);
  };

  const removeTable = async (id) => {
    const isTemp = id.startsWith('temp-');
    setTables(prev => prev.filter(t => t.id !== id));
    if (!isTemp) await supabase.from('table_positions').delete().eq('id', id);
    setHasUnsavedChanges(true);
  };

  const clearAllTables = async () => {
    if (!venueId) return;
    if (!window.confirm('Are you sure you want to delete ALL tables?')) return;
    await supabase.from('table_positions').delete().eq('venue_id', venueId);
    setTables([]);
    setHasUnsavedChanges(false);
  };

  const createNewZone = async () => {
    const { data } = await supabase.from('zones').insert({ name: 'New Zone', venue_id: venueId, order: zones.length + 1 }).select('*').single();
    if (data) { await loadZones(venueId); setSelectedZoneId(data.id); }
  };

  const deleteZone = async (zoneId) => {
    const count = tables.filter(t => t.zone_id === zoneId).length;
    if (count > 0 && !window.confirm(`This zone contains ${count} table(s). Deleting the zone will remove them. Proceed?`)) return;
    await supabase.from('table_positions').delete().eq('zone_id', zoneId);
    await supabase.from('zones').delete().eq('id', zoneId);
    await loadZones(venueId);
    await loadTables(venueId);
  };

  const handleZoneRename = (id, name) => setZones(z => z.map(zone => zone.id === id ? { ...zone, name } : zone));
  const saveZoneRename = async (id) => {
    const z = zones.find(z => z.id === id);
    await supabase.from('zones').update({ name: z.name }).eq('id', id);
    setEditingZoneId(null);
  };

  const handleToggleEdit = () => {
    if (editMode && hasUnsavedChanges && !window.confirm('You have unsaved changes. Exit anyway?')) return;
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
    if (!error) { setEditMode(false); setHasUnsavedChanges(false); }
    setSaving(false);
  };

  const getFeedbackColor = (avg) => {
    if (avg === null || avg === undefined) return 'bg-blue-500';
    if (avg > 4) return 'bg-green-500';
    if (avg >= 2.5) return 'bg-amber-400';
    return 'bg-red-600';
  };

  const FeedbackModal = () => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl relative">
        <h3 className="text-lg font-semibold mb-4">Feedback for Table {selectedTable}</h3>
        <button onClick={() => setSelectedTable(null)} className="absolute top-2 right-2 text-gray-400 hover:text-black">✕</button>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {feedbackModalData.map(f => (
            <div key={f.id} className="border rounded p-3">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>Session: {f.session_id?.slice(0, 8)}</span>
                <span>{dayjs(f.created_at).fromNow()}</span>
              </div>
              <div className="mb-1 text-sm">Rating: {f.rating ?? 'N/A'}</div>
              {f.additional_feedback && <div className="text-sm italic text-gray-700">"{f.additional_feedback}"</div>}
              <div className="mt-2">
                {f.is_actioned ? (
                  <button onClick={() => undoResolved(f.id)} className="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded">Undo</button>
                ) : (
                  <button onClick={() => markResolved(f.id)} className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Mark Resolved</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <PageContainer>
      <h1 className="text-2xl font-bold mb-6">Table Heatmap</h1>

      <div className="bg-white border rounded p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Manage Table Layout</h2>
          <button onClick={handleToggleEdit} className="text-blue-600 underline text-sm">{editMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}</button>
        </div>

        {editMode && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <input type="text" placeholder="Table #" value={newTableNumber} onChange={(e) => setNewTableNumber(e.target.value)} className="text-sm border border-gray-300 rounded px-2 py-1" />
            <select value={newTableShape} onChange={(e) => setNewTableShape(e.target.value)} className="text-sm border border-gray-300 rounded px-2 py-1">
              <option value="square">Square</option>
              <option value="circle">Circle</option>
              <option value="long">Long</option>
            </select>
            <button onClick={addTable} className="text-sm bg-gray-800 text-white px-3 py-1 rounded hover:bg-gray-900">+ Add Table</button>
            <button onClick={saveLayout} disabled={saving} className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">{saving ? 'Saving...' : 'Save Layout'}</button>
            <button onClick={clearAllTables} className="text-sm text-red-600 border border-red-600 px-3 py-1 rounded hover:bg-red-50">Clear All Tables</button>
          </div>
        )}

        <div className="flex gap-2 mb-4 flex-wrap">
          {zones.map(zone => (
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
                  className={`px-4 py-1 rounded-full text-sm border transition ${selectedZoneId === zone.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
                >
                  {zone.name}
                </button>
              )}
              {editMode && (
                <button
                  onClick={() => deleteZone(zone.id)}
                  className="text-red-500 text-xs"
                  title="Delete zone"
                >🗑</button>
              )}
            </div>
          ))}
          {editMode && (
            <button onClick={createNewZone} className="text-sm border border-dashed border-gray-400 text-gray-500 rounded-full px-3 py-1 hover:bg-gray-50">+ Add Zone</button>
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
                  <div
                    className={`text-white flex items-center justify-center font-bold border-2 border-black shadow cursor-pointer ${tableShapeClasses}`}
                    onClick={() => !editMode && openFeedbackModal(t.table_number)}
                  >
                    {t.table_number}
                  </div>
                  {!editMode && (
                    <div
                      className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${feedbackColor} ${feedbackColor === 'bg-red-600' ? 'animate-pulse' : ''}`}
                      title={avgRating == null ? 'No feedback yet' : `Avg rating: ${avgRating.toFixed(1)}`}
                    />
                  )}
                  {editMode && (
                    <button onClick={() => removeTable(t.id)} className="absolute -top-3 -right-3 bg-red-600 text-white rounded-full w-5 h-5 text-xs">×</button>
                  )}
                </div>
              </div>
            );

            return editMode ? (
              <Draggable
                key={t.id}
                position={{ x: t.x_px, y: t.y_px }}
                bounds="parent"
                onStop={(e, data) => {
                  const x = Math.round(data.x / GRID_SIZE) * GRID_SIZE;
                  const y = Math.round(data.y / GRID_SIZE) * GRID_SIZE;
                  setTables(prev =>
                    prev.map(tab =>
                      tab.id === t.id ? { ...tab, x_px: x, y_px: y } : tab
                    )
                  );
                  setHasUnsavedChanges(true);
                }}
              >
                {node}
              </Draggable>
            ) : (
              <div key={t.id} className="absolute" style={{ left: t.x_px, top: t.y_px }}>
                {node}
              </div>
            );
          })}
        </div>
      </div>

      {selectedTable && <FeedbackModal />}
    </PageContainer>
  );
};

export default Heatmap;
