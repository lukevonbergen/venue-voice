import React, { useEffect, useState } from 'react';
import supabase from '../utils/supabase';
import PageContainer from '../components/PageContainer';
import usePageTitle from '../hooks/usePageTitle';
import { useVenue } from '../context/VenueContext';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const StaffLeaderboard = () => {
  const { venueId } = useVenue();
  usePageTitle('Staff Leaderboard');
  const [staffStats, setStaffStats] = useState([]);
  const [timeFilter, setTimeFilter] = useState('7d'); // '7d', '30d', 'all'

  const fetchStaffLeaderboard = async (venueId) => {
    let fromDate;
    const now = dayjs();
    if (timeFilter === '7d') fromDate = now.subtract(7, 'day').toISOString();
    if (timeFilter === '30d') fromDate = now.subtract(30, 'day').toISOString();

    let feedbackQuery = supabase
      .from('feedback')
      .select('id, session_id, resolved_by, resolved_at, is_actioned')
      .eq('venue_id', venueId);

    if (fromDate) feedbackQuery = feedbackQuery.gte('resolved_at', fromDate);

    const { data: feedbackData, error: feedbackError } = await feedbackQuery;
    if (feedbackError) return;

    // Group feedback by session
    const sessionMap = {};
    for (const entry of feedbackData) {
      if (!entry.session_id) continue;
      if (!sessionMap[entry.session_id]) sessionMap[entry.session_id] = [];
      sessionMap[entry.session_id].push(entry);
    }

    const sessionCounts = {}; // { staffId: count }
    for (const [sessionId, items] of Object.entries(sessionMap)) {
      const allActioned = items.every(item => item.is_actioned);
      const resolver = items[0]?.resolved_by;
      if (allActioned && resolver) {
        sessionCounts[resolver] = (sessionCounts[resolver] || 0) + 1;
      }
    }

    const staffIds = Object.keys(sessionCounts);
    if (staffIds.length === 0) return setStaffStats([]);

    const { data: staffData, error: staffError } = await supabase
      .from('staff')
      .select('id, first_name, last_name')
      .in('id', staffIds);

    if (staffError) return;

    const combined = staffData.map(s => ({
      id: s.id,
      name: `${s.first_name} ${s.last_name}`,
      count: sessionCounts[s.id] || 0
    })).sort((a, b) => b.count - a.count);

    setStaffStats(combined);
  };

  useEffect(() => {
    if (venueId) fetchStaffLeaderboard(venueId);
  }, [venueId, timeFilter]);

  const renderMedal = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return '🏅';
  };

  return (
    <PageContainer>
      <h1 className="text-2xl font-bold mb-4">Staff Leaderboard</h1>

      <div className="mb-6">
        <label className="mr-2 font-medium text-sm">Filter by:</label>
        <select
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="all">All time</option>
        </select>
      </div>

      {staffStats.length > 0 ? (
        <div className="flex gap-4 items-end justify-center mt-10">
          {staffStats.slice(0, 3).map((s, i) => (
            <div key={s.id} className={`text-center ${i === 0 ? 'order-last' : ''}`}>
              <div
                className={`rounded-t-lg bg-yellow-100 px-6 py-4 shadow font-semibold text-gray-800 ${i === 0 ? 'text-lg' : 'text-base'}`}
              >
                {renderMedal(i)} {s.name}
              </div>
              <div
                className={`bg-yellow-400 w-24 mx-auto rounded-b-lg shadow-md text-white font-bold flex items-center justify-center ${i === 0 ? 'h-32' : i === 1 ? 'h-24' : 'h-20'}`}
              >
                {s.count}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-600 mt-16">
          <img
            src="https://cdn-icons-png.flaticon.com/512/4129/4129335.png"
            alt="No data"
            className="w-24 mx-auto mb-4 opacity-60"
          />
          <h3 className="text-lg font-semibold">No feedback resolved yet</h3>
          <p className="text-sm">Encourage your team to action feedback to appear here!</p>
        </div>
      )}
    </PageContainer>
  );
};

export default StaffLeaderboard;