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
  const [timeFilter, setTimeFilter] = useState('7d');

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

    const sessionMap = {};
    for (const entry of feedbackData) {
      if (!entry.session_id) continue;
      if (!sessionMap[entry.session_id]) sessionMap[entry.session_id] = [];
      sessionMap[entry.session_id].push(entry);
    }

    const sessionCounts = {};
    for (const items of Object.values(sessionMap)) {
      const allActioned = items.every(i => i.is_actioned);
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
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold text-gray-800">Staff Leaderboard</h1>
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="all">All time</option>
          </select>
        </div>

        {staffStats.length > 0 ? (
          <div className="flex justify-center items-end gap-6 mt-10">
            {staffStats.slice(0, 3).map((s, i) => (
              <div key={s.id} className={`flex flex-col items-center ${i === 0 ? 'order-last' : ''}`}>
                <div
                  className={`rounded-t-md bg-gray-100 text-gray-800 px-4 py-2 font-medium shadow-sm text-sm ${
                    i === 0 ? 'text-base font-semibold' : ''
                  }`}
                >
                  {renderMedal(i)} {s.name}
                </div>
                <div
                  className={`rounded-b-md font-bold text-white shadow-md w-24 flex items-center justify-center ${
                    i === 0 ? 'bg-yellow-500 h-32 text-xl' :
                    i === 1 ? 'bg-gray-400 h-24 text-lg' :
                    'bg-orange-400 h-20 text-base'
                  }`}
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
      </div>
    </PageContainer>
  );
};

export default StaffLeaderboard;