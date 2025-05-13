import React, { useEffect, useState } from 'react';
import supabase from '../utils/supabase';
import DashboardFrame from './DashboardFrame';
import Draggable from 'react-draggable';

const getColor = (rating) => {
  if (rating === null || rating === undefined) return 'gray';
  if (rating <= 2) return 'red';
  if (rating === 3) return 'orange';
  return 'green';
};

const Heatmap = () => {
  const [venueId, setVenueId] = useState(null);
  const [positions, setPositions] = useState([]);
  const [latestRatings, setLatestRatings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
        await fetchLatestRatings(venueId);
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

  const fetchLatestRatings = async (venueId) => {
    const { data, error } = await supabase
      .from('feedback')
      .select('table_number, rating, session_id, created_at')
      .eq('venue_id', venueId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching feedback:', error);
      return;
    }

    const sessionMap = new Map();
    for (const entry of data) {
      if (!entry.table_number) continue;
      if (!sessionMap.has(entry.table_number)) {
        sessionMap.set(entry.table_number, []);
      }
      sessionMap.get(entry.table_number).push(entry);
    }

    const ratingMap = {};
    sessionMap.forEach((entries, table) => {
      const ratings = entries.map(e => e.rating).filter(Boolean);
      const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;
      ratingMap[table] = avg ? parseFloat(avg.toFixed(1)) : null;
    });

    setLatestRatings(ratingMap);
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
      alert('Layout saved');
    }
    setSaving(false);
  };

  if (loading) return <p className="p-8 text-gray-600">Loading heatmap...</p>;

  return (
    <DashboardFrame>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Live Feedback Heatmap</h1>
          <div className="space-x-2">
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
          </div>
        </div>

        <div
          id="layout-area"
          className="relative w-full h-[600px] bg-white border rounded-lg shadow-sm"
        >
          {positions.map((table) => (
            <Draggable
              key={table.id}
              defaultPosition={{
                x: `${(table.x_percent / 100) * 800}`,
                y: `${(table.y_percent / 100) * 600}`,
              }}
              bounds="parent"
              onStop={(e, data) => handleDragStop(e, data, table)}
            >
              <div
                className="absolute w-12 h-12 flex items-center justify-center rounded-full shadow-md cursor-pointer text-white font-bold"
                style={{ backgroundColor: getColor(latestRatings[table.table_number]) }}
                title={`Table ${table.table_number} — Rating: ${latestRatings[table.table_number] ?? 'N/A'}`}
              >
                {table.table_number}
              </div>
            </Draggable>
          ))}
        </div>
      </div>
    </DashboardFrame>
  );
};

export default Heatmap;
