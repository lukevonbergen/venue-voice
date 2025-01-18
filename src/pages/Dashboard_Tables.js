import React, { useState, useEffect } from 'react';
import supabase from '../utils/supabase';
import InfiniteScroll from 'react-infinite-scroll-component';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DashboardFrame from './DashboardFrame';
import { FaCheckSquare } from 'react-icons/fa';

const TablesPage = () => {
  const [feedback, setFeedback] = useState([]);
  const [activeTab, setActiveTab] = useState('unactioned');
  const [sortBy, setSortBy] = useState('mostRecent');
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // Helper function to get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Fetch feedback from Supabase
  const fetchFeedback = async () => {
    const today = getTodayDate();

    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .not('table_number', 'is', null)
      .gte('timestamp', `${today}T00:00:00Z`)
      .lte('timestamp', `${today}T23:59:59Z`)
      .order('timestamp', { ascending: false })
      .range((page - 1) * 10, page * 10 - 1);

    if (error) {
      console.error('Error fetching feedback:', error);
      toast.error('Failed to fetch feedback');
    } else {
      // Group feedback by session_id or id if session_id is missing
      const groupedFeedback = data.reduce((acc, fb) => {
        const key = fb.session_id || fb.id;
        if (!acc[key]) {
          acc[key] = {
            id: fb.id,
            session_id: fb.session_id,
            table_number: fb.table_number,
            timestamp: fb.timestamp,
            is_actioned: fb.is_actioned,
            questions: [],
            additional_feedback: null,
          };
        }
        if (fb.question_id) {
          acc[key].questions.push({
            question_id: fb.question_id,
            question_text: fb.question_text, // Assuming question_text is available
            sentiment: fb.sentiment,
            rating: fb.rating,
          });
        }
        if (fb.additional_feedback) {
          acc[key].additional_feedback = fb.additional_feedback;
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
          const today = getTodayDate();
          const feedbackDate = new Date(payload.new.timestamp).toISOString().split('T')[0];
          if (feedbackDate === today) {
            setFeedback((prev) => [payload.new, ...prev]);
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
  const toggleActionedStatus = async (feedbackId, isActioned) => {
    if (!feedbackId) {
      console.error('Feedback ID is null or undefined');
      toast.error('Failed to update feedback status: Feedback ID is missing');
      return;
    }

    const { data, error } = await supabase
      .from('feedback')
      .update({ is_actioned: !isActioned })
      .eq('id', feedbackId)
      .select();

    if (error) {
      console.error('Error toggling feedback status:', error);
      toast.error(`Failed to update feedback status: ${error.message}`);
    } else {
      toast.success(`Feedback marked as ${!isActioned ? 'actioned' : 'unactioned'}`);
      fetchFeedback();
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

  // Calculate counts for unactioned and actioned feedback
  const unactionedCount = feedback.filter((fb) => !fb.is_actioned).length;
  const actionedCount = feedback.filter((fb) => fb.is_actioned).length;

  return (
    <DashboardFrame>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Today's Feedback</h1>

        {/* Tabs for Actioned/Unactioned Feedback */}
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => setActiveTab('unactioned')}
            className={`px-3 py-1 rounded-lg text-sm font-medium ${
              activeTab === 'unactioned'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Unactioned ({unactionedCount})
          </button>
          <button
            onClick={() => setActiveTab('actioned')}
            className={`px-3 py-1 rounded-lg text-sm font-medium ${
              activeTab === 'actioned'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Actioned ({actionedCount})
          </button>
        </div>

        {/* Feedback Cards */}
        <InfiniteScroll
          dataLength={feedback.length}
          next={loadMoreFeedback}
          hasMore={hasMore}
          loader={null} // Remove the "Loading..." text
        >
          <div className="space-y-3">
            {feedback
              .filter((fb) => (activeTab === 'unactioned' ? !fb.is_actioned : fb.is_actioned))
              .map((fb) => (
                <div key={fb.id} className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold">Table {fb.table_number}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(fb.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleActionedStatus(fb.id, fb.is_actioned)}
                      className={`p-1 rounded-full ${
                        fb.is_actioned
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <FaCheckSquare className="text-green-600" /> {/* Green tick */}
                    </button>
                  </div>

                  {/* Average Rating */}
                  <div className="mt-2">
                    <p className="font-semibold">Average Rating:</p>
                    <p className="text-sm text-gray-600">
                      {calculateAverageRating(fb.questions)} / 5
                    </p>
                  </div>

                  {/* Questions and Ratings */}
                  <div className="mt-2">
                    <p className="font-semibold">Questions:</p>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {fb.questions.map((question, index) => (
                        <li key={question.question_id}>
                          {index + 1}. {question.question_text} Rating {question.rating}/5
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Additional Feedback */}
                  {fb.additional_feedback && (
                    <div className="mt-2">
                      <p className="font-semibold">Additional Feedback:</p>
                      <p className="text-sm text-gray-600">{fb.additional_feedback}</p>
                    </div>
                  )}
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