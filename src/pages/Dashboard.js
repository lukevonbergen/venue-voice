import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../utils/supabase';
import DashboardFrame from './DashboardFrame';
import { Bell } from 'lucide-react';

const ITEMS_PER_PAGE = 20;

const DashboardPage = () => {
  const [venueId, setVenueId] = useState(null);
  const [sessionFeedback, setSessionFeedback] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [actionedFeedback, setActionedFeedback] = useState([]);
  const [questionsMap, setQuestionsMap] = useState({});
  const [activeTab, setActiveTab] = useState('alerts');
  const [selectedSession, setSelectedSession] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [sortOrder, setSortOrder] = useState('desc');
  const [tableFilter, setTableFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/signin');
        return;
      }

      const { data: venue } = await supabase
        .from('venues')
        .select('id')
        .eq('email', user.email)
        .single();

      if (!venue) return;

      setVenueId(venue.id);
      await loadQuestionsMap(venue.id);
      await loadFeedback(venue.id);
      setupRealtime(venue.id);
    };

    init();
  }, [navigate]);

  const loadQuestionsMap = async (venueId) => {
    const { data: questions } = await supabase
      .from('questions')
      .select('id, question')
      .eq('venue_id', venueId);

    const map = {};
    questions?.forEach(q => { map[q.id] = q.question });
    setQuestionsMap(map);
  };

  const loadFeedback = async (venueId) => {
    const { data } = await supabase
      .from('feedback')
      .select('*')
      .eq('venue_id', venueId);

    groupFeedbackBySession(data || []);
  };

  const groupFeedbackBySession = (rows) => {
    const grouped = {};
    const flagged = [];
    const actioned = [];

    for (const row of rows) {
      if (!grouped[row.session_id]) grouped[row.session_id] = [];
      grouped[row.session_id].push(row);
    }

    let sessions = Object.entries(grouped).map(([session_id, items]) => ({ session_id, items }));

    sessions = sessions.map(session => {
      const isActioned = session.items.every(i => i.is_actioned);
      const lowScore = session.items.some(i => i.rating !== null && i.rating <= 2);
      return { ...session, isActioned, lowScore };
    });

    setSessionFeedback(sessions);
    setAlerts(sessions.filter(s => s.lowScore && !s.isActioned));
    setActionedFeedback(sessions.filter(s => s.isActioned));
  };

  const setupRealtime = (venueId) => {
    supabase.channel('feedback-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'feedback',
        filter: `venue_id=eq.${venueId}`
      }, () => loadFeedback(venueId))
      .subscribe();
  };

  const filteredSortedSessions = (list) => {
    let filtered = tableFilter ? list.filter(s => s.items[0].table_number == tableFilter) : list;
    return filtered.sort((a, b) => sortOrder === 'desc'
      ? new Date(b.items[0].created_at) - new Date(a.items[0].created_at)
      : new Date(a.items[0].created_at) - new Date(b.items[0].created_at));
  };

  const paginatedSessions = (list) => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return list.slice(start, start + ITEMS_PER_PAGE);
  };

  const renderFeedbackItems = (items) => (
    <div className="space-y-3 mt-2">
      {items.filter(i => i.question_id).map((f, j) => (
        <div key={j} className="p-3 bg-gray-50 rounded border">
          <p className="text-sm font-medium text-gray-800">{questionsMap[f.question_id]}</p>
          <p className="text-sm text-gray-600">Rating: {f.rating}</p>
        </div>
      ))}
      {items.some(i => i.additional_feedback) && (
        <div className="p-3 bg-yellow-50 rounded border border-yellow-300">
          <p className="text-sm text-gray-800 italic">
            "{items.find(i => i.additional_feedback)?.additional_feedback}"
          </p>
        </div>
      )}
    </div>
  );

  const FeedbackModal = ({ session, onClose }) => {
    const markSessionAsActioned = async () => {
      const idsToUpdate = session.items.map(item => item.id);
      const { error } = await supabase
        .from('feedback')
        .update({ is_actioned: true })
        .in('id', idsToUpdate);
      if (!error) {
        await loadFeedback(venueId);
        onClose();
      }
    };

    if (!session) return null;

    const handleOverlayClick = (e) => {
      if (e.target.id === 'modal-overlay') onClose();
    };

    return (
      <div
        id="modal-overlay"
        onClick={handleOverlayClick}
        className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
      >
        <div className="bg-white w-full max-w-md p-6 rounded shadow-lg relative">
          <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl">&times;</button>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Table {session.items[0].table_number} – {new Date(session.items[0].created_at).toLocaleString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
          </h2>
          {renderFeedbackItems(session.items)}
          <button onClick={markSessionAsActioned} className="mt-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
            Mark as Actioned
          </button>
        </div>
      </div>
    );
  };

  const displayTab = activeTab === 'alerts' ? alerts
    : activeTab === 'actioned' ? actionedFeedback
    : sessionFeedback;

  const sessionsToShow = paginatedSessions(filteredSortedSessions(displayTab));
  const totalSessions = filteredSortedSessions(displayTab).length;

  return (
    <DashboardFrame>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-xl font-bold">Feedback Dashboard</h1>
          <div className="flex gap-4 items-center">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
            <select
              value={tableFilter}
              onChange={(e) => { setTableFilter(e.target.value); setCurrentPage(1); }}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="">All Tables</option>
              {[...new Set(sessionFeedback.map(s => s.items[0].table_number))].map(t => (
                <option key={t} value={t}>Table {t}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-6 border-b mb-6">
          <button className={`${activeTab === 'alerts' ? 'text-red-600 border-b-2 border-red-500' : 'text-gray-500'} pb-2`} onClick={() => setActiveTab('alerts')}>Alerts</button>
          <button className={`${activeTab === 'actioned' ? 'text-green-600 border-b-2 border-green-500' : 'text-gray-500'} pb-2`} onClick={() => setActiveTab('actioned')}>Actioned</button>
          <button className={`${activeTab === 'all' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500'} pb-2`} onClick={() => setActiveTab('all')}>All Feedback</button>
        </div>

        {sessionsToShow.map((session) => (
          <div
            key={session.session_id}
            onClick={() => { setSelectedSession(session); setShowModal(true); }}
            className="cursor-pointer border p-4 rounded mb-4 bg-white hover:bg-gray-50"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-semibold text-gray-800">
                  Table {session.items[0].table_number} – {new Date(session.items[0].created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(session.items[0].created_at).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
                </h3>
                <p className="text-xs text-blue-600">Click to view</p>
              </div>
              {session.lowScore && !session.isActioned && <Bell className="text-red-500" size={18} />}
            </div>
          </div>
        ))}

        <div className="text-sm text-gray-600 mt-4">
          Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, totalSessions)} of {totalSessions} feedback records
        </div>

        {totalSessions > ITEMS_PER_PAGE && (
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50"
            >Prev</button>
            <button
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={currentPage * ITEMS_PER_PAGE >= totalSessions}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50"
            >Next</button>
          </div>
        )}
      </div>

      {showModal && (
        <FeedbackModal session={selectedSession} onClose={() => { setShowModal(false); setSelectedSession(null); }} />
      )}
    </DashboardFrame>
  );
};

export default DashboardPage;
