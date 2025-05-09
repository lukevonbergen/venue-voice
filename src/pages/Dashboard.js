import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../utils/supabase';
import DashboardFrame from './DashboardFrame';

const DashboardPage = () => {
  const [venueId, setVenueId] = useState(null);
  const [sessionFeedback, setSessionFeedback] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [actionedFeedback, setActionedFeedback] = useState([]);
  const [questionsMap, setQuestionsMap] = useState({});
  const [activeTab, setActiveTab] = useState('alerts');
  const [selectedSession, setSelectedSession] = useState(null);
  const [showModal, setShowModal] = useState(false);
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
      await loadQuestionsMap(venue.id);
      await loadFeedback(venue.id);
      setupRealtime(venue.id);
    };

    init();
  }, [navigate]);

  const loadQuestionsMap = async (venueId) => {
    const { data: questions, error } = await supabase
      .from('questions')
      .select('id, question')
      .eq('venue_id', venueId);

    if (!error) {
      const map = {};
      questions.forEach(q => { map[q.id] = q.question });
      setQuestionsMap(map);
    }
  };

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
    const actioned = [];

    for (const entry of feedbackRows) {
      if (!grouped[entry.session_id]) grouped[entry.session_id] = [];
      grouped[entry.session_id].push(entry);
    }

    const sessions = Object.entries(grouped).map(([session_id, items]) => {
      const lowScore = items.some((i) => i.rating !== null && i.rating <= 2);
      const isActioned = items.every((i) => i.is_actioned);
      if (lowScore && !isActioned) flagged.push({ session_id, items });
      if (isActioned) actioned.push({ session_id, items });
      return { session_id, items };
    });

    setSessionFeedback(sessions);
    setAlerts(flagged);
    setActionedFeedback(actioned);
  };

  const setupRealtime = (venueId) => {
    supabase
      .channel('feedback-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'feedback',
        filter: `venue_id=eq.${venueId}`
      }, () => {
        loadFeedback(venueId);
      })
      .subscribe();
  };

  const formatTime = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const markSessionAsActioned = async (sessionId) => {
    const updates = alerts.find((s) => s.session_id === sessionId)?.items.map(item => item.id);
    if (!updates) return;

    const { error } = await supabase
      .from('feedback')
      .update({ is_actioned: true })
      .in('id', updates);

    if (error) {
      console.error('Failed to mark feedback as actioned:', error);
    } else {
      await loadFeedback(venueId);
    }
  };

  const renderFeedbackItems = (items) => (
    <div className="space-y-3">
      {items.map((f, j) => (
        <div key={j} className="p-3 bg-gray-50 rounded border border-gray-200">
          <p className="font-medium text-sm text-gray-800">
            {f.question_id ? questionsMap[f.question_id] : 'Additional Feedback'}
          </p>
          {f.rating !== null && (
            <p className="text-sm text-gray-600 mt-1">Rating: {f.rating}</p>
          )}
          {f.additional_feedback && (
            <p className="text-sm text-gray-600 mt-1 italic">"{f.additional_feedback}"</p>
          )}
        </div>
      ))}
    </div>
  );

  const FeedbackModal = ({ session, onClose }) => {
    if (!session) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white w-full max-w-md mx-auto rounded-lg shadow-lg p-5 relative">
          <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl">&times;</button>
          <h2 className="text-lg font-semibold mb-3 text-gray-800">
            Table {session.items[0].table_number} – {formatTime(session.items[0].created_at)}
          </h2>
          {renderFeedbackItems(session.items)}
        </div>
      </div>
    );
  };

  const renderSessionButton = (session, actionButton = null) => (
    <button
      key={session.session_id}
      onClick={() => {
        setSelectedSession(session);
        setShowModal(true);
      }}
      className="w-full text-left bg-white hover:bg-gray-50 border p-4 rounded shadow-sm transition"
    >
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-800 text-sm">
          Table {session.items[0].table_number} – {formatTime(session.items[0].created_at)}
        </h3>
        {actionButton || <span className="text-sm text-blue-500 underline">View</span>}
      </div>
    </button>
  );

  return (
    <DashboardFrame>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-xl font-semibold mb-4">Feedback Dashboard</h1>

        <div className="flex space-x-4 mb-6 border-b">
          <button className={`pb-2 border-b-2 ${activeTab === 'alerts' ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500'}`} onClick={() => setActiveTab('alerts')}>Alerts</button>
          <button className={`pb-2 border-b-2 ${activeTab === 'all' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`} onClick={() => setActiveTab('all')}>All Feedback</button>
          <button className={`pb-2 border-b-2 ${activeTab === 'actioned' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500'}`} onClick={() => setActiveTab('actioned')}>Actioned</button>
        </div>

        {activeTab === 'alerts' && alerts.length === 0 && <p className="text-gray-500">No live alerts currently 🎉</p>}

        {activeTab === 'alerts' && alerts.length > 0 && (
          <div className="space-y-4">
            {alerts.map((session) => (
              renderSessionButton(
                session,
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    markSessionAsActioned(session.session_id);
                  }}
                  className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-md hover:bg-green-200"
                >
                  Mark as Actioned
                </button>
              )
            ))}
          </div>
        )}

        {activeTab === 'all' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sessionFeedback.map((session) => renderSessionButton(session))}
          </div>
        )}

        {activeTab === 'actioned' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {actionedFeedback.map((session) => renderSessionButton(session))}
          </div>
        )}
      </div>

      {showModal && (
        <FeedbackModal
          session={selectedSession}
          onClose={() => {
            setSelectedSession(null);
            setShowModal(false);
          }}
        />
      )}
    </DashboardFrame>
  );
};

export default DashboardPage;
