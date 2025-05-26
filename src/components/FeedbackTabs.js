import React, { useEffect, useState } from 'react';
import supabase from '../utils/supabase';
import { Bell, Calendar, Clock, Timer, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

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
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [staffList, setStaffList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (venueId) {
      loadFeedback(venueId);
      setupRealtime(venueId);
    }
  }, [venueId]);

  useEffect(() => {
    if (!venueId) return;

    const loadStaff = async () => {
      const { data } = await supabase
        .from('staff')
        .select('id, first_name, last_name')
        .eq('venue_id', venueId);
      setStaffList(data || []);
    };

    loadStaff();
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
    if (!selectedStaffId) return alert('Please select a staff member');

    const ids = session.items.map(i => i.id);
    const { error } = await supabase
      .from('feedback')
      .update({
        is_actioned: true,
        resolved_by: selectedStaffId,
        resolved_at: new Date()
      })
      .in('id', ids);

    if (error) {
      alert('Something went wrong updating feedback');
      return;
    }

    await loadFeedback(venueId);
    onClose();
    setSelectedStaffId('');
  };

  if (!session) return null;

  const timestamp = session.items[0].created_at;

  return (
    <div
      id="modal-overlay"
      onClick={(e) => e.target.id === 'modal-overlay' && onClose()}
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
    >
      <div className="bg-white w-full max-w-md p-6 rounded shadow-lg relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl">&times;</button>

        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Table {session.items[0].table_number}
          </h2>
          <p className="text-sm text-gray-500">
            {dayjs(timestamp).format('dddd D MMMM, h:mma')} • {dayjs(timestamp).fromNow()}
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Resolved by</label>
          <select
            value={selectedStaffId}
            onChange={(e) => setSelectedStaffId(e.target.value)}
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value="">Select Staff Member</option>
            {staffList.map(s => (
              <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          {session.items.map((f, j) => (
            <div key={j} className="p-3 bg-gray-50 rounded border">
              <p className="text-sm font-medium text-gray-800 mb-1">
                {questionsMap[f.question_id]}
              </p>
              <p className="text-sm text-gray-600">Rating: {f.rating}</p>
              {f.additional_feedback && (
                <p className="mt-2 italic text-gray-700 text-sm">"{f.additional_feedback}"</p>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={markSessionAsActioned}
          disabled={!selectedStaffId}
          className={`mt-6 w-full px-4 py-2 rounded text-white text-sm flex items-center justify-center gap-2 ${selectedStaffId ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-300 cursor-not-allowed'}`}
        >
          <UserCheck size={16} />
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

      {sessionsToShow.length > 0 ? (
        sessionsToShow.map((session) => (
          <div
            key={session.session_id}
            className="border p-4 rounded mb-4 bg-white hover:bg-gray-50"
          >
            <div className="flex justify-between items-start">
              <div onClick={() => { setSelectedSession(session); setShowModal(true); }} className="cursor-pointer">
                <div className="text-sm font-semibold text-gray-800 mb-1">
                  Table {session.items[0].table_number}
                </div>

                <div className="flex items-center text-xs text-gray-600 gap-1 mb-1">
                  <Calendar size={14} />
                  {dayjs(session.items[0].created_at).format('dddd D MMMM')}
                </div>

                <div className="flex items-center text-xs text-gray-600 gap-1 mb-1">
                  <Clock size={14} />
                  {dayjs(session.items[0].created_at).format('h:mma')}
                </div>

                <div className="flex items-center text-xs text-gray-400 italic gap-1">
                  <Timer size={14} />
                  {dayjs(session.items[0].created_at).fromNow()}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {session.lowScore && !session.isActioned && <Bell className="text-red-500" size={18} />}
                <button
                  onClick={() => navigate('/dashboard/heatmap')}
                  className="text-sm bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                >
                  View on Heatmap
                </button>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center text-gray-600 my-20">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3159/3159066.png"
            alt="No feedback"
            className="w-20 mx-auto mb-4 opacity-60"
          />
          <h3 className="text-lg font-semibold">No feedback to action</h3>
          <p className="text-sm mt-1">You're doing great. Keep it up 🚀</p>
        </div>
      )}

      {totalSessions > 0 && (
        <>
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
        </>
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