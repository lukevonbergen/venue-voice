import React, { useEffect, useState } from 'react';
import supabase from '../utils/supabase';
import DashboardFrame from './DashboardFrame';

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

  if (loading) return <p className="p-8 text-gray-600">Loading heatmap...</p>;

  return (
    <DashboardFrame>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Live Feedback Heatmap</h1>

        <div className="relative w-full h-[500px] bg-white border rounded-lg shadow-sm">
          {positions.map((table) => (
            <div
              key={table.id}
              className="absolute flex items-center justify-center text-white font-bold text-sm"
              style={{
                top: `${table.y_percent}%`,
                left: `${table.x_percent}%`,
                transform: 'translate(-50%, -50%)',
                width: 40,
                height: 40,
                borderRadius: '9999px',
                backgroundColor: getColor(latestRatings[table.table_number]),
                boxShadow: '0 0 6px rgba(0,0,0,0.2)',
                cursor: 'pointer',
              }}
              title={`Table ${table.table_number} — Rating: ${latestRatings[table.table_number] ?? 'N/A'}`}
            >
              {table.table_number}
            </div>
          ))}
        </div>
      </div>
    </DashboardFrame>
  );
};

export default Heatmap;
