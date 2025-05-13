// Enhanced Heatmap.js with shape selection, unique table numbers, and merge detection
import React, { useEffect, useState } from 'react';
import supabase from '../utils/supabase';
import DashboardFrame from './DashboardFrame';
import Draggable from 'react-draggable';
import Modal from 'react-modal';

const getColor = (rating, isUnresolved) => {
  if (isUnresolved) return 'red';
  if (rating === null || rating === undefined) return 'gray';
  if (rating <= 2) return 'red';
  if (rating === 3) return 'orange';
  return 'green';
};

const areClose = (a, b) => {
  const distance = Math.sqrt((a.x_percent - b.x_percent) ** 2 + (a.y_percent - b.y_percent) ** 2);
  return distance < 5;
};

const groupTables = (positions) => {
  const groups = [];
  const used = new Set();
  for (let i = 0; i < positions.length; i++) {
    if (used.has(i)) continue;
    const group = [positions[i]];
    used.add(i);
    for (let j = i + 1; j < positions.length; j++) {
      if (!used.has(j) && areClose(positions[i], positions[j])) {
        group.push(positions[j]);
        used.add(j);
      }
    }
    groups.push(group);
  }
  return groups;
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

useEffect(() => {
  const fetchVenueAndData = async () => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    console.log('👤 Supabase User:', userData, userError);

    if (!userData?.user) {
      console.warn('⚠️ No user found');
      return;
    }

    const { data: venueData, error: venueError } = await supabase
      .from('venues')
      .select('id')
      .eq('email', userData.user.email)
      .single();

    console.log('🏢 Venue lookup:', venueData, venueError);

    if (!venueData) {
      console.warn('⚠️ No venue found for user email:', userData.user.email);
      return;
    }

    const venueId = venueData.id;
    setVenueId(venueId);

    await fetchTablePositions(venueId);
    await fetchLatestFeedback(venueId);
    setLoading(false); // Ensure this is set here
  };

  fetchVenueAndData();
}, []);


  const fetchTablePositions = async (venueId) => {
    const { data } = await supabase.from('table_positions').select('*').eq('venue_id', venueId);
    setPositions(data || []);
  };

  const fetchLatestFeedback = async (venueId) => {
    const { data } = await supabase.from('feedback').select('*').eq('venue_id', venueId).order('created_at', { ascending: false });
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
    setPositions((prev) => prev.map(t => t.id === table.id ? { ...t, x_percent: xPercent, y_percent: yPercent } : t));
  };

  const addTable = () => {
    if (!newTableNumber || positions.some(p => p.table_number === newTableNumber)) {
      alert('Please enter a unique table number.');
      return;
    }
    const id = `temp-${Date.now()}`;
    setPositions(prev => [...prev, {
      id,
      venue_id: venueId,
      table_number: newTableNumber,
      x_percent: 10,
      y_percent: 10,
      shape: newShape
    }]);
    setNewTableNumber('');
  };

  const removeTable = (id) => {
    setPositions(prev => prev.filter(t => t.id !== id));
    supabase.from('table_positions').delete().eq('id', id);
  };

  const saveTables = async () => {
    setSaving(true);
    const payload = positions.map(({ id, ...rest }) => rest);
    const { error } = await supabase.from('table_positions').upsert(payload);
    if (!error) {
      await fetchLatestFeedback(venueId);
      setEditMode(false);
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

  const grouped = groupTables(positions);

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
              </>
            )}
          </div>
        </div>

        <div id="layout-area" className="relative w-full h-[600px] bg-white border rounded">
          {grouped.map((group, i) => {
            const tableNumbers = group.map(g => g.table_number).join(', ');
            const avgX = group.reduce((sum, g) => sum + g.x_percent, 0) / group.length;
            const avgY = group.reduce((sum, g) => sum + g.y_percent, 0) / group.length;
            const rating = group.map(g => latestRatings[g.table_number]).filter(Boolean);
            const pulse = group.some(g => unresolvedTables[g.table_number]);
            const bg = getColor(rating[0], pulse);
            const shape = group[0].shape || 'square';
            const shapeClass = shape === 'circle' ? 'rounded-full w-14 h-14' : shape === 'long' ? 'w-24 h-10' : 'w-14 h-14';

            const content = (
              <div
                onClick={() => !editMode && handleTableClick(group[0].table_number)}
                className={`${shapeClass} flex items-center justify-center text-white font-bold shadow cursor-pointer ${pulse ? 'animate-pulse' : ''} border-2 border-black`}
                style={{ backgroundColor: bg }}
              >
                {tableNumbers}
              </div>
            );

            return editMode ? (
              <Draggable key={i} defaultPosition={{ x: (avgX / 100) * 800, y: (avgY / 100) * 600 }} bounds="parent" onStop={(e, d) => handleDragStop(e, d, group[0])}>
                <div className="absolute">
                  {content}
                  <button onClick={() => removeTable(group[0].id)} className="absolute -top-3 -right-3 bg-red-600 text-white rounded-full w-5 h-5 text-xs">×</button>
                </div>
              </Draggable>
            ) : (
              <div
                key={i}
                style={{ position: 'absolute', top: `${avgY}%`, left: `${avgX}%`, transform: 'translate(-50%, -50%)' }}
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
      </div>
    </DashboardFrame>
  );
};

export default Heatmap;
