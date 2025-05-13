// Fully working Heatmap.js with complete UI and feedback fetch fix
import React, { useEffect, useState } from 'react';
import supabase from '../utils/supabase';
import DashboardFrame from './DashboardFrame';
import Draggable from 'react-draggable';
import Modal from 'react-modal';
import { v4 as uuidv4 } from 'uuid';

const getColor = (rating, isUnresolved) => {
  if (isUnresolved) return 'red';
  if (rating === null || rating === undefined) return 'gray';
  if (rating <= 2) return 'red';
  if (rating === 3) return 'orange';
  return 'green';
};

const Heatmap = () => {
  const [venueId, setVenueId] = useState(null);
  const [positions, setPositions] = useState([]);
  const [latestRatings, setLatestRatings] = useState({});
  const [latestSessions, setLatestSessions] = useState({});
  const [unresolvedTables, setUnresolvedTables] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [newShape, setNewShape] = useState('square');
  const [newTableNumber, setNewTableNumber] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    const fetchVenueAndData = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;
      const { data: venueData } = await supabase
        .from('venues')
        .select('id')
        .eq('email', userData.user.email)
        .single();
      if (!venueData) return;
      setVenueId(venueData.id);
      await fetchTablePositions(venueData.id);
      await fetchLatestFeedback(venueData.id);
      setLoading(false);
    };
    fetchVenueAndData();
  }, []);

  const fetchTablePositions = async (venueId) => {
    const { data } = await supabase.from('table_positions').select('*').eq('venue_id', venueId);
    setPositions(data || []);
  };

  const fetchLatestFeedback = async (venueId) => {
    const { data, error } = await supabase
      .from('feedback')
      .select('id, venue_id, question_id, sentiment, rating, additional_feedback, table_number, is_actioned, session_id, created_at')
      .eq('venue_id', venueId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching feedback:', error);
      return;
    }

    if (!data || !Array.isArray(data)) {
      console.error('❌ Feedback returned no iterable data:', data);
      return;
    }

    const ratingMap = {}, sessionMap = {}, unresolvedMap = {}, latestSessionPerTable = {};
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
      const unresolved = entries.some(e => !e.is_actioned && e.rating <= 2);
      const ratings = entries.map(e => e.rating).filter(Boolean);
      const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;
      ratingMap[table] = avg ? parseFloat(avg.toFixed(1)) : null;
      unresolvedMap[table] = unresolved;
    }

    setLatestRatings(ratingMap);
    setUnresolvedTables(unresolvedMap);
    setLatestSessions(sessionMap);
  };

  const handleDragStop = (e, data, table) => {
    const container = document.getElementById('layout-area');
    const { width, height } = container.getBoundingClientRect();
    const xPercent = (data.x / width) * 100;
    const yPercent = (data.y / height) * 100;
    setPositions(prev => prev.map(t => t.id === table.id ? { ...t, x_percent: xPercent, y_percent: yPercent } : t));
  };

  const addTable = () => {
    const trimmed = newTableNumber.trim();
    if (!trimmed || positions.some(p => p.table_number === trimmed)) {
      alert('Table number must be unique.');
      return;
    }
    const id = `temp-${Date.now()}`;
    setPositions(prev => [...prev, {
      id,
      venue_id: venueId,
      table_number: trimmed,
      x_percent: 10,
      y_percent: 10,
      shape: newShape
    }]);
    setNewTableNumber('');
  };

  const removeTable = (id) => {
    const toDelete = positions.find(p => p.id === id);
    if (!toDelete) return;
    setPositions(prev => prev.filter(t => t.id !== id));
    if (!id.startsWith('temp-')) {
      supabase.from('table_positions').delete().eq('id', id);
    }
  };

  const clearAllTables = async () => {
    if (!venueId) return;
    const { data } = await supabase.from('table_positions').select('id').eq('venue_id', venueId);
    if (data?.length) {
      const ids = data.map(d => d.id);
      await supabase.from('table_positions').delete().in('id', ids);
    }
    setPositions([]);
    setConfirmClear(false);
  };

  const saveTables = async () => {
    setSaving(true);
    const clean = positions.filter(p => p.table_number && venueId);
    const payload = clean.map(t => ({
      id: t.id?.startsWith('temp-') ? uuidv4() : t.id,
      venue_id: venueId,
      table_number: t.table_number,
      x_percent: t.x_percent,
      y_percent: t.y_percent,
      shape: t.shape
    }));

    const { error } = await supabase.from('table_positions').upsert(payload);
    if (!error) {
      await fetchLatestFeedback(venueId);
      await fetchTablePositions(venueId);
      setEditMode(false);
    } else {
      console.error('❌ Supabase save error:', error);
    }
    setSaving(false);
  };

  const handleTableClick = (tableNumber) => {
    setSelectedTable({ number: tableNumber, entries: latestSessions[tableNumber] || [] });
    setModalOpen(true);
  };

  const markAsResolved = async () => {
    const ids = selectedTable.entries.map(e => e.id);
    if (!ids.length) return;
    await supabase.from('feedback').update({ is_actioned: true }).in('id', ids);
    await fetchLatestFeedback(venueId);
    setModalOpen(false);
  };

  if (loading) return <p className="p-8 text-gray-600">Loading heatmap...</p>;

  return (
    <DashboardFrame>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Live Feedback Heatmap</h1>
          <div className="space-x-2">
            <button onClick={() => setEditMode(!editMode)} className="bg-yellow-500 text-white px-4 py-2 rounded">
              {editMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
            </button>
            {editMode && (
              <>
                <input type="text" placeholder="Table #" value={newTableNumber} onChange={(e) => setNewTableNumber(e.target.value)} className="px-2 py-1 border rounded" />
                <select value={newShape} onChange={(e) => setNewShape(e.target.value)} className="px-2 py-1 border rounded">
                  <option value="square">Square</option>
                  <option value="circle">Circle</option>
                  <option value="long">Long</option>
                </select>
                <button onClick={addTable} className="bg-green-600 text-white px-4 py-2 rounded">+ Add Table</button>
                <button onClick={saveTables} disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded">
                  {saving ? 'Saving...' : 'Save Layout'}
                </button>
                <button onClick={() => setConfirmClear(true)} className="bg-red-600 text-white px-4 py-2 rounded">Clear All</button>
              </>
            )}
          </div>
        </div>

        <div id="layout-area" className="relative w-full h-[600px] bg-white border rounded">
          {positions.map((table, i) => {
            const { x_percent, y_percent, table_number, id, shape } = table;
            const bg = getColor(latestRatings[table_number], unresolvedTables[table_number]);
            const pulse = unresolvedTables[table_number];
            const shapeClass = shape === 'circle' ? 'rounded-full w-14 h-14' : shape === 'long' ? 'w-24 h-10' : 'w-14 h-14';

            const content = (
              <div
                onClick={() => !editMode && handleTableClick(table_number)}
                className={`${shapeClass} flex items-center justify-center text-white font-bold shadow cursor-pointer ${pulse ? 'animate-pulse' : ''} border-2 border-black`}
                style={{ backgroundColor: bg }}
              >
                {table_number}
              </div>
            );

            return editMode ? (
              <Draggable key={id} defaultPosition={{ x: (x_percent / 100) * 800, y: (y_percent / 100) * 600 }} bounds="parent" onStop={(e, d) => handleDragStop(e, d, table)}>
                <div className="absolute">
                  {content}
                  <button onClick={() => removeTable(id)} className="absolute -top-3 -right-3 bg-red-600 text-white rounded-full w-5 h-5 text-xs">×</button>
                </div>
              </Draggable>
            ) : (
              <div
                key={id}
                style={{ position: 'absolute', top: `${y_percent}%`, left: `${x_percent}%`, transform: 'translate(-50%, -50%)' }}
              >
                {content}
              </div>
            );
          })}
        </div>

        <Modal
          isOpen={modalOpen}
          onRequestClose={() => setModalOpen(false)}
          ariaHideApp={false}
          className="bg-white p-6 rounded-lg max-w-md mx-auto mt-20 shadow-xl border"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
        >
          <h2 className="text-xl font-bold mb-4">Table {selectedTable?.number} Feedback</h2>
          <div className="space-y-3 mb-4">
            {selectedTable?.entries.map((entry, i) => (
              <div key={i} className="text-sm border-b pb-2">
                <div><strong>Sentiment:</strong> {entry.sentiment || 'N/A'} (Rating: {entry.rating ?? 'N/A'})</div>
                {entry.additional_feedback && (<div><strong>Note:</strong> {entry.additional_feedback}</div>)}
              </div>
            ))}
          </div>
          <button onClick={markAsResolved} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Mark as Resolved
          </button>
        </Modal>

        <Modal
          isOpen={confirmClear}
          onRequestClose={() => setConfirmClear(false)}
          ariaHideApp={false}
          className="bg-white p-6 rounded-lg max-w-sm mx-auto shadow-xl border"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
        >
          <h2 className="text-lg font-bold mb-4">Clear All Tables?</h2>
          <p className="mb-4 text-gray-600">This will permanently remove all tables from your layout.</p>
          <div className="flex justify-end gap-4">
            <button onClick={() => setConfirmClear(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded">Cancel</button>
            <button onClick={clearAllTables} className="bg-red-600 text-white px-4 py-2 rounded">Confirm</button>
          </div>
        </Modal>
      </div>
    </DashboardFrame>
  );
};

export default Heatmap;
