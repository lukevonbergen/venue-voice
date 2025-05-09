// Enhanced ReportsPage.js
// - Adds multiple dashboard tiles: Total Feedback, Actioned Sessions, Alerts, Feedback This Week, Unique Tables

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../utils/supabase';
import DashboardFrame from './DashboardFrame';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import {
  CheckCircle,
  AlertTriangle,
  BarChart3,
  CalendarClock,
  LayoutGrid
} from 'lucide-react';

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
      lowScore: items.some(i => i.rating !== null && i.rating <= 2)
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
  const alertsCount = feedbackSessions.filter(s => s.lowScore && !s.isActioned).length;
  const recentCount = feedbackSessions.filter(s => new Date(s.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length;
  const uniqueTables = [...new Set(feedbackSessions.map(s => s.table))];
  const completionRate = totalCount > 0 ? ((actionedCount / totalCount) * 100).toFixed(1) : 0;

  const Tile = ({ title, value, icon: Icon, color = 'gray' }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200 border border-gray-100 flex items-center space-x-4">
      <Icon className={`w-6 h-6 text-${color}-600`} />
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );

  return (
    <DashboardFrame>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Reports Overview</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center space-y-4 border">
            <div className="w-32 h-32">
              <CircularProgressbar
                value={completionRate}
                text={`${completionRate}%`}
                styles={{
                  path: { stroke: '#10B981' },
                  text: { fill: '#111827', fontSize: '18px' },
                }}
              />
            </div>
            <p className="text-gray-700 text-center">
              {actionedCount} of {totalCount} sessions have been actioned
            </p>
          </div>

          <Tile title="Total Feedback Sessions" value={totalCount} icon={BarChart3} color="blue" />
          <Tile title="Sessions Actioned" value={actionedCount} icon={CheckCircle} color="green" />
          <Tile title="Unresolved Alerts" value={alertsCount} icon={AlertTriangle} color="red" />
          <Tile title="Feedback This Week" value={recentCount} icon={CalendarClock} color="purple" />
          <Tile title="Tables Participated" value={uniqueTables.length} icon={LayoutGrid} color="yellow" />
        </div>
      </div>
    </DashboardFrame>
  );
};

export default ReportsPage;
