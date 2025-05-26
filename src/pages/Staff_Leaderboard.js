import React, { useEffect, useState } from 'react';
import supabase from '../utils/supabase';
import PageContainer from '../components/PageContainer';
import usePageTitle from '../hooks/usePageTitle';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useVenue } from '../context/VenueContext';
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
      .select('id, resolved_by, resolved_at')
      .eq('venue_id', venueId)
      .eq('is_actioned', true);

    if (fromDate) feedbackQuery = feedbackQuery.gte('resolved_at', fromDate);

    const { data: feedbackData, error: feedbackError } = await feedbackQuery;
    if (feedbackError) return;

    const staffCounts = {};
    const staffIds = new Set();

    for (const fb of feedbackData) {
      if (!fb.resolved_by) continue;
      staffCounts[fb.resolved_by] = (staffCounts[fb.resolved_by] || 0) + 1;
      staffIds.add(fb.resolved_by);
    }

    if (staffIds.size === 0) {
      setStaffStats([]);
      return;
    }

    const { data: staffData, error: staffError } = await supabase
      .from('staff')
      .select('id, first_name, last_name')
      .in('id', [...staffIds]);

    if (staffError) return;

    const combined = staffData.map(s => ({
      id: s.id,
      name: `${s.first_name} ${s.last_name}`,
      count: staffCounts[s.id] || 0
    }));

    const sorted = combined.sort((a, b) => b.count - a.count);
    setStaffStats(sorted);
  };

  useEffect(() => {
    if (venueId) fetchStaffLeaderboard(venueId);
  }, [venueId, timeFilter]);

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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 justify-center items-end max-w-4xl mx-auto">
          {staffStats.slice(0, 3).map((s, i) => (
            <div
              key={s.id}
              className={`flex flex-col items-center justify-end bg-white shadow rounded p-4 ${i === 0 ? 'h-52' : i === 1 ? 'h-40' : 'h-36'}`}
            >
              <span className="text-3xl">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
              <div className="font-semibold text-lg mt-2 text-gray-800">{s.name}</div>
              <div className="text-sm text-gray-600">{s.count} resolved</div>
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