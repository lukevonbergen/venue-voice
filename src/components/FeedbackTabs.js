import React, { useEffect, useState } from 'react';
import supabase from '../utils/supabase';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ITEMS_PER_PAGE = 20;

const FeedbackTabs = ({ venueId, questionsMap }) => {
  const [sessionFeedback, setSessionFeedback] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [actionedFeedback, setActionedFeedback] = useState([]);
  const [activeTab, setActiveTab] = useState('alerts');
  const [selectedSession, setSelectedSession] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [sortOrder, setSortOrder] = useState('desc');
  const [tableFilter, setTableFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    if (venueId) {
      loadFeedback(venueId);
      setupRealtime(venueId);
    }
  }, [venueId]);

  const loadFeedback = async (venueId) => {
    const { data } = await supabase
      .from('feedback')
      .select('*')
      .eq('venue_id', venueId);

    const grouped = {};
    for (const row of data || []) {
      if (!grouped[row.session_id]) grouped[row.session_id] = [];
      grouped[row.session_id].push(row);
    }

    const sessions = Object.entries(grouped).map(([session_id, items]) => {
      const isActioned = items.every(i => i.is_actioned);
      const lowScore = items.some(i => i.rating !== null && i.rating <= 2);
      return { session_id, items, isActioned, lowScore };
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
      const ids = session.items.map(i => i.id);
      await supabase.from('feedback').update({ is_actioned: true }).in('id', ids);
      await loadFeedback(venueId);
      onClose();
    };

    if (!session) return null;

    return (
      <div
        id="modal-overlay"
        onClick={(e) => e.target.id === 'modal-overlay' && onClose()}
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
    <>
      <div className="flex gap-6 border-b mb-6">
        <button className={`${activeTab === 'alerts' ? 'text-red-600 border-b-2 border-red-500' : 'text-gray-500'} pb-2`} onClick={() => setActiveTab('alerts')}>Alerts</button>
        <button className={`${activeTab === 'actioned' ? 'text-green-600 border-b-2 border-green-500' : 'text-gray-500'} pb-2`} onClick={() => setActiveTab('actioned')}>Actioned</button>
        <button className={`${activeTab === 'all' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500'} pb-2`} onClick={() => setActiveTab('all')}>All Feedback</button>
      </div>

      {sessionsToShow.map((session) => (
        <div
          key={session.session_id}
          className="border p-4 rounded mb-4 bg-white hover:bg-gray-50"
        >
          <div className="flex justify-between items-center">
            <div onClick={() => { setSelectedSession(session); setShowModal(true); }} className="cursor-pointer">
              <h3 className="text-sm font-semibold text-gray-800">
                Table {session.items[0].table_number} – {new Date(session.items[0].created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(session.items[0].created_at).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h3>
              <p className="text-xs text-blue-600">Click to view</p>
            </div>
            <div className="flex items-center gap-2">
              {session.lowScore && !session.isActioned && <Bell className="text-red-500" size={18} />}
              <button
                onClick={() => navigate('/dashboard/heatmap')}
                className="text-sm bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
              >
                View Heatmap
              </button>
            </div>
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

      {showModal && (
        <FeedbackModal session={selectedSession} onClose={() => {
          setShowModal(false);
          setSelectedSession(null);
        }} />
      )}
    </>
  );
};

export default FeedbackTabs;
