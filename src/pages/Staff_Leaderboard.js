import React, { useEffect, useState } from 'react';
import supabase from '../utils/supabase';
import PageContainer from '../components/PageContainer';
import usePageTitle from '../hooks/usePageTitle';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const StaffLeaderboard = ({ venueId }) => {
    usePageTitle('Staff Leaderboard');
  const [staffStats, setStaffStats] = useState([]);
  const [timeFilter, setTimeFilter] = useState('7d'); // options: '7d', '30d', 'all'

  useEffect(() => {
    if (venueId) fetchStaffLeaderboard(venueId);
  }, [venueId, timeFilter]);

const fetchStaffLeaderboard = async (venueId) => {
    console.log('Fetching leaderboard for venue:', venueId);
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
  console.log('Fetched feedback:', feedbackData);
  if (feedbackError) {
    console.error('Error fetching feedback:', feedbackError);
    return;
  }

  const staffCounts = {};
  const staffIds = new Set();

  for (const fb of feedbackData) {
    if (!fb.resolved_by) continue;
    staffCounts[fb.resolved_by] = (staffCounts[fb.resolved_by] || 0) + 1;
    staffIds.add(fb.resolved_by);
  }

  console.log('Staff counts:', staffCounts);
    console.log('Staff IDs:', [...staffIds]);


  if (staffIds.size === 0) {
    setStaffStats([]);
    return;
  }

  const { data: staffData, error: staffError } = await supabase

    .from('staff')
    .select('id, first_name, last_name')
    .in('id', [...staffIds]);

  if (staffError) {
    console.error('Error fetching staff info:', staffError);
    return;
  }

  const combined = staffData.map(s => ({
    id: s.id,
    name: `${s.first_name} ${s.last_name}`,
    count: staffCounts[s.id] || 0
  }));

  const sorted = combined.sort((a, b) => b.count - a.count);
  setStaffStats(sorted);
};


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
        <div className="bg-white shadow-md rounded overflow-hidden">
          {staffStats.map((s, i) => (
            <div
              key={s.id}
              className="flex items-center justify-between px-4 py-3 border-b last:border-b-0 hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{renderMedal(i)}</span>
                <span className="font-medium text-gray-800">{s.name}</span>
              </div>
              <span className="text-sm text-gray-600">{s.count} feedback resolved</span>
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