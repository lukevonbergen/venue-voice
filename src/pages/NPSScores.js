// New ReportsPage.js
// - Shows percentage of actioned feedback sessions
// - Real-time updates supported

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../utils/supabase';
import DashboardFrame from './DashboardFrame';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const ReportsPage = () => {
  const [venueId, setVenueId] = useState(null);
  const [feedbackSessions, setFeedbackSessions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate('/signin');

      const { data: venue } = await supabase
        .from('venues')
        .select('id')
        .eq('email', user.email)
        .single();

      if (!venue) return;

      setVenueId(venue.id);
      fetchFeedback(venue.id);
      setupRealtime(venue.id);
    };
    init();
  }, [navigate]);

  const fetchFeedback = async (venueId) => {
    const { data } = await supabase
      .from('feedback')
      .select('*')
      .eq('venue_id', venueId);

    const grouped = {};
    for (const row of data || []) {
      if (!grouped[row.session_id]) grouped[row.session_id] = [];
      grouped[row.session_id].push(row);
    }

    const sessions = Object.values(grouped).map(items => ({
      isActioned: items.every(i => i.is_actioned),
      createdAt: items[0].created_at,
      table: items[0].table_number,
    }));

    setFeedbackSessions(sessions);
  };

  const setupRealtime = (venueId) => {
    supabase.channel('feedback-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'feedback',
        filter: `venue_id=eq.${venueId}`
      }, () => fetchFeedback(venueId))
      .subscribe();
  };

  const actionedCount = feedbackSessions.filter(s => s.isActioned).length;
  const totalCount = feedbackSessions.length;
  const completionRate = totalCount > 0 ? ((actionedCount / totalCount) * 100).toFixed(1) : 0;

  return (
    <DashboardFrame>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Feedback Action Rate</h1>

        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center space-y-4">
          <div className="w-40 h-40">
            <CircularProgressbar
              value={completionRate}
              text={`${completionRate}%`}
              styles={{
                path: { stroke: '#10B981' },
                text: { fill: '#111827', fontSize: '20px' },
              }}
            />
          </div>
          <p className="text-gray-700 text-center">
            {actionedCount} of {totalCount} sessions have been actioned.
          </p>
        </div>
      </div>
    </DashboardFrame>
  );
};

export default ReportsPage;
