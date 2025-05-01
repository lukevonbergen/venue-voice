import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../utils/supabase';
import DashboardFrame from './DashboardFrame';
import FeedbackFeed from '../components/dashboard/FeedbackFeed';

const DashboardPage = () => {
  const [venueId, setVenueId] = useState(null);
  const [sessionFeedback, setSessionFeedback] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/signin');
        return;
      }

      const { data: venue, error } = await supabase
        .from('venues')
        .select('id')
        .eq('email', user.email)
        .single();

      if (error || !venue) {
        console.error('Failed to fetch venue:', error);
        return;
      }

      setVenueId(venue.id);
      loadFeedback(venue.id);
      setupRealtime(venue.id);
    };

    init();
  }, [navigate]);

  const loadFeedback = async (venue_id) => {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('venue_id', venue_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching feedback:', error);
      return;
    }

    groupFeedbackBySession(data);
  };

  const groupFeedbackBySession = (feedbackRows) => {
    const grouped = {};
    const flagged = [];

    for (const entry of feedbackRows) {
      if (!grouped[entry.session_id]) grouped[entry.session_id] = [];
      grouped[entry.session_id].push(entry);
    }

    const sessions = Object.entries(grouped).map(([session_id, items]) => {
      const lowScore = items.some((i) => i.rating !== null && i.rating <= 2);
      if (lowScore) flagged.push({ session_id, items });
      return { session_id, items };
    });

    setSessionFeedback(sessions);
    setAlerts(flagged);
  };

  const setupRealtime = (venueId) => {
    supabase
      .channel('feedback-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'feedback',
        filter: `venue_id=eq.${venueId}`
      }, (payload) => {
        loadFeedback(venueId);
      })
      .subscribe();
  };

  return (
    <DashboardFrame>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Table Feedback Dashboard</h1>

        {alerts.length > 0 && (
          <div className="bg-red-100 border border-red-300 text-red-800 p-4 rounded-lg mb-6">
            <h2 className="font-bold mb-2">⚠️ Live Alerts</h2>
            {alerts.map((alert, i) => (
              <div key={i} className="mb-2">
                <p className="text-sm font-medium">Session: {alert.session_id}</p>
                <ul className="ml-4 list-disc text-sm text-red-700">
                  {alert.items.map((f, j) => (
                    <li key={j}>{f.question_id ? `Q${f.question_id}` : 'Free text'}: {f.rating ?? f.additional_feedback}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sessionFeedback.map((session, i) => (
            <div key={i} className="bg-white p-4 rounded-xl shadow-sm border">
              <h3 className="font-semibold text-gray-800 mb-2 text-sm">Session ID: {session.session_id}</h3>
              <ul className="space-y-1 text-sm text-gray-700">
                {session.items.map((f, j) => (
                  <li key={j}>
                    {f.question_id ? `Q${f.question_id}` : 'Extra'}: {f.rating ?? f.additional_feedback}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </DashboardFrame>
  );
};

export default DashboardPage;
