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

  useEffect(() => {
    const fetchVenueAndData = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) throw new Error('User not logged in');

        const { data: venueData, error: venueError } = await supabase
          .from('venues')
          .select('id')
          .eq('email', userData.user.email)
          .single();

        if (venueError) throw venueError;

        const venueId = venueData.id;
        setVenueId(venueId);
        await fetchTablePositions(venueId);
        await fetchLatestFeedback(venueId);
      } catch (error) {
        console.error('Error loading venue or data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVenueAndData();
  }, []);

  const fetchTablePositions = async (venueId) => {
    const { data, error } = await supabase
      .from('table_positions')
      .select('*')
      .eq('venue_id', venueId);

    if (error) {
      console.error('Error fetching table positions:', error);
    } else {
      setPositions(data);
    }
  };

  const fetchLatestFeedback = async (venueId) => {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('venue_id', venueId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching feedback:', error);
      return;
    }

    const ratingMap = {};
    const sessionMap = {};
    const unresolvedMap = {};

    const latestSessionPerTable = {};

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
      const unresolved = entries.some((e) => !e.is_actioned && e.rating <= 2);
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

    setPositions((prev) =>
      prev.map((t) =>
        t.id === table.id ? { ...t, x_percent: xPercent, y_percent: yPercent } : t
      )
    );
  };

  const addTable = () => {
    const nextNumber = positions.length + 1;
    setPositions((prev) => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        venue_id: venueId,
        table_number: nextNumber,
        x_percent: 10,
        y_percent: 10,
        isNew: true,
      },
    ]);
  };

  const saveTables = async () => {
    setSaving(true);
    const payload = positions.map(({ id, isNew, ...rest }) => rest);
    const { error } = await supabase.from('table_positions').upsert(payload);
    if (error) {
      console.error('Error saving table layout:', error);
    } else {
      await fetchLatestFeedback(venueId);
      setEditMode(false);
    }
    setSaving(false);
  };

  const handleTableClick = (tableNumber) => {
    setSelectedTable({
      number: tableNumber,
      entries: latestSessions[tableNumber] || [],
    });
    setModalOpen(true);
  };

  const markAsResolved = async () => {
    const idsToUpdate = selectedTable.entries.map((e) => e.id);
    const { error } = await supabase
      .from('feedback')
      .update({ is_actioned: true })
      .in('id', idsToUpdate);

    if (!error) {
      await fetchLatestFeedback(venueId);
      setModalOpen(false);
    }
  };

  if (loading) return <p className="p-8 text-gray-600">Loading heatmap...</p>;

  return (
    <DashboardFrame>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Live Feedback Heatmap</h1>
          <div className="space-x-2">
            <button
              onClick={() => setEditMode((prev) => !prev)}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
            >
              {editMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
            </button>
            {editMode && (
              <>
                <button
                  onClick={addTable}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  + Add Table
                </button>
                <button
                  onClick={saveTables}
                  disabled={saving}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  {saving ? 'Saving...' : 'Save Layout'}
                </button>
              </>
            )}
          </div>
        </div>

        <div
          id="layout-area"
          className="relative w-full h-[600px] bg-white border rounded-lg shadow-sm"
        >
          {positions.map((table) => {
            const position = {
              x: (table.x_percent / 100) * 800,
              y: (table.y_percent / 100) * 600,
            };
            const pulse = unresolvedTables[table.table_number];
            const content = (
              <div
                className={`absolute w-12 h-12 flex items-center justify-center rounded shadow-md text-white font-bold cursor-pointer ${
                  pulse ? 'animate-pulse' : ''
                }`}
                style={{
                  backgroundColor: getColor(latestRatings[table.table_number], pulse),
                }}
                onClick={() => !editMode && handleTableClick(table.table_number)}
                title={`Table ${table.table_number}`}
              >
                {table.table_number}
              </div>
            );

            return editMode ? (
              <Draggable
                key={table.id}
                defaultPosition={position}
                bounds="parent"
                onStop={(e, data) => handleDragStop(e, data, table)}
              >
                {content}
              </Draggable>
            ) : (
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
                {entry.additional_feedback && (
                  <div><strong>Note:</strong> {entry.additional_feedback}</div>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={markAsResolved}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Mark as Resolved
          </button>
        </Modal>
      </div>
    </DashboardFrame>
  );
};

export default Heatmap;
