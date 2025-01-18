import React, { useState, useEffect } from 'react';
import supabase from '../utils/supabase';
import InfiniteScroll from 'react-infinite-scroll-component';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DashboardFrame from './DashboardFrame';

const TablesPage = () => {
  const [feedback, setFeedback] = useState([]);
  const [activeTab, setActiveTab] = useState('unactioned');
  const [sortBy, setSortBy] = useState('mostRecent');
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // Helper function to get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Returns date in YYYY-MM-DD format
  };

  // Fetch feedback from Supabase
  const fetchFeedback = async () => {
    const today = getTodayDate(); // Get today's date

    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .not('table_number', 'is', null)
      .eq('is_actioned', activeTab === 'actioned')
      .gte('timestamp', `${today}T00:00:00Z`) // Filter for today's feedback
      .lte('timestamp', `${today}T23:59:59Z`)
      .order('timestamp', { ascending: false })
      .range((page - 1) * 10, page * 10 - 1);

    if (error) {
      console.error('Error fetching feedback:', error);
      toast.error('Failed to fetch feedback');
    } else {
      // Group feedback by session_id
      const groupedFeedback = data.reduce((acc, fb) => {
        if (!acc[fb.session_id]) {
          acc[fb.session_id] = {
            session_id: fb.session_id,
            table_number: fb.table_number,
            timestamp: fb.timestamp,
            is_actioned: fb.is_actioned,
            questions: [],
            additional_feedback: null,
          };
        }
        if (fb.question_id) {
          acc[fb.session_id].questions.push({
            question_id: fb.question_id,
            sentiment: fb.sentiment,
            rating: fb.rating,
          });
        }
        if (fb.additional_feedback) {
          acc[fb.session_id].additional_feedback = fb.additional_feedback;
        }
        return acc;
      }, {});

      const feedbackList = Object.values(groupedFeedback);
      setFeedback((prev) => (page === 1 ? feedbackList : [...prev, ...feedbackList]));
      setHasMore(data.length === 10);
    }
  };

  // Set up real-time updates
  const setupRealtimeUpdates = () => {
    const feedbackSubscription = supabase
      .channel('feedback')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'feedback', filter: 'table_number=not.is.null' },
        (payload) => {
          if (!payload.new.is_actioned && activeTab === 'unactioned') {
            const today = getTodayDate();
            const feedbackDate = new Date(payload.new.timestamp).toISOString().split('T')[0];
            if (feedbackDate === today) {
              setFeedback((prev) => [payload.new, ...prev]);
            }
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'feedback', filter: 'table_number=not.is.null' },
        (payload) => {
          setFeedback((prev) =>
            prev.map((fb) => (fb.session_id === payload.new.session_id ? payload.new : fb))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(feedbackSubscription);
    };
  };

  useEffect(() => {
    fetchFeedback();
    const unsubscribe = setupRealtimeUpdates();
    return () => unsubscribe();
  }, [activeTab, page]);

  // Toggle feedback actioned status
  const toggleActionedStatus = async (sessionId, isActioned) => {
    const { data, error } = await supabase
      .from('feedback')
      .update({ is_actioned: !isActioned })
      .eq('session_id', sessionId)
      .select();

    if (error) {
      console.error('Error toggling feedback status:', error);
      toast.error(`Failed to update feedback status: ${error.message}`);
    } else {
      console.log('Updated feedback:', data);
      toast.success(`Feedback marked as ${!isActioned ? 'actioned' : 'unactioned'}`);
      fetchFeedback(); // Refetch feedback after update
    }
  };

  // Load more feedback for infinite scroll
  const loadMoreFeedback = () => {
    setPage((prev) => prev + 1);
  };

  // Calculate average rating for a feedback entry
  const calculateAverageRating = (questions) => {
    if (!questions || questions.length === 0) return 0;
    const total = questions.reduce((sum, question) => sum + (question.rating || 0), 0);
    return (total / questions.length).toFixed(1);
  };

  return (
    <DashboardFrame>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Today's Feedback</h1>

        {/* Tabs for Actioned/Unactioned Feedback */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('unactioned')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              activeTab === 'unactioned'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Unactioned ({feedback.filter((fb) => !fb.is_actioned).length})
          </button>
          <button
            onClick={() => setActiveTab('actioned')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              activeTab === 'actioned'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Actioned ({feedback.filter((fb) => fb.is_actioned).length})
          </button>
        </div>

        {/* Feedback Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {feedback.map((fb) => (
            <div key={fb.session_id} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold">Table {fb.table_number}</h3>
              <p className="text-sm text-gray-500">
                {new Date(fb.timestamp).toLocaleString()}
              </p>

              {/* Average Rating */}
              <div className="mt-4">
                <p className="font-semibold">Average Rating:</p>
                <p className="text-sm text-gray-600">
                  {calculateAverageRating(fb.questions)} / 5
                </p>
              </div>

              {/* Additional Feedback */}
              {fb.additional_feedback && (
                <div className="mt-4">
                  <p className="font-semibold">Additional Feedback:</p>
                  <p className="text-sm text-gray-600">{fb.additional_feedback}</p>
                </div>
              )}

              {/* Toggle Actioned Status */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => toggleActionedStatus(fb.session_id, fb.is_actioned)}
                  className={`p-2 rounded-full ${
                    fb.is_actioned
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  ✓
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Infinite Scroll */}
        <InfiniteScroll
          dataLength={feedback.length}
          next={loadMoreFeedback}
          hasMore={hasMore}
          loader={<p>Loading...</p>}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {feedback.map((fb) => (
              <div key={fb.session_id} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold">Table {fb.table_number}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(fb.timestamp).toLocaleString()}
                </p>

                {/* Average Rating */}
                <div className="mt-4">
                  <p className="font-semibold">Average Rating:</p>
                  <p className="text-sm text-gray-600">
                    {calculateAverageRating(fb.questions)} / 5
                  </p>
                </div>

                {/* Additional Feedback */}
                {fb.additional_feedback && (
                  <div className="mt-4">
                    <p className="font-semibold">Additional Feedback:</p>
                    <p className="text-sm text-gray-600">{fb.additional_feedback}</p>
                  </div>
                )}

                {/* Toggle Actioned Status */}
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => toggleActionedStatus(fb.session_id, fb.is_actioned)}
                    className={`p-2 rounded-full ${
                      fb.is_actioned
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    ✓
                  </button>
                </div>
              </div>
            ))}
          </div>
        </InfiniteScroll>

        {/* Toast Notifications */}
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </DashboardFrame>
  );
};

export default TablesPage;