import React, { useState, useEffect } from 'react';
import supabase from '../utils/supabase';
import InfiniteScroll from 'react-infinite-scroll-component';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FeedbackTableCard from '../components/tables/FeedbackTableCard';
import FeedbackTabs from '../components/tables/FeedbackTabs';
import SortFilterDropdown from '../components/tables/SortFilterDropdown';
import DashboardFrame from './DashboardFrame';

const TablesPage = () => {
  const [feedback, setFeedback] = useState([]);
  const [activeTab, setActiveTab] = useState('unactioned');
  const [sortBy, setSortBy] = useState('mostRecent');
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const fetchFeedback = async () => {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .not('table_number', 'is', null)
      .eq('is_actioned', activeTab === 'actioned')
      .order('timestamp', { ascending: false })
      .range((page - 1) * 10, page * 10 - 1);

    if (error) {
      console.error('Error fetching feedback:', error);
      toast.error('Failed to fetch feedback');
    } else {
      setFeedback((prev) => (page === 1 ? data : [...prev, ...data]));
      setHasMore(data.length === 10);
    }
  };

  const setupRealtimeUpdates = () => {
    const feedbackSubscription = supabase
      .channel('feedback')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'feedback', filter: 'table_number=not.is.null' },
        (payload) => {
          if (!payload.new.is_actioned && activeTab === 'unactioned') {
            setFeedback((prev) => [payload.new, ...prev]);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'feedback', filter: 'table_number=not.is.null' },
        (payload) => {
          setFeedback((prev) =>
            prev.map((fb) => (fb.id === payload.new.id ? payload.new : fb))
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

  const toggleActionedStatus = async (feedbackId, isActioned) => {
    const { data, error } = await supabase
      .from('feedback')
      .update({ is_actioned: !isActioned })
      .eq('id', feedbackId)
      .select(); // Use .select() to return the updated row

    if (error) {
      console.error('Error toggling feedback status:', error);
      toast.error(`Failed to update feedback status: ${error.message}`);
    } else {
      console.log('Updated feedback:', data); // Log the updated row
      toast.success(`Feedback marked as ${!isActioned ? 'actioned' : 'unactioned'}`);
      // Refetch feedback after update
      fetchFeedback();
    }
  };

  const loadMoreFeedback = () => {
    setPage((prev) => prev + 1);
  };

  return (
    <DashboardFrame>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Tables Feedback</h1>

        <div className="flex justify-between items-center mb-6">
          <FeedbackTabs activeTab={activeTab} setActiveTab={setActiveTab} feedback={feedback} />
          <SortFilterDropdown sortBy={sortBy} setSortBy={setSortBy} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {feedback.map((fb) => (
            <FeedbackTableCard
              key={fb.id}
              feedback={fb}
              onToggleActioned={() => toggleActionedStatus(fb.id, fb.is_actioned)}
            />
          ))}
        </div>

        <InfiniteScroll
          dataLength={feedback.length}
          next={loadMoreFeedback}
          hasMore={hasMore}
          loader={<p>Loading...</p>}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {feedback.map((fb) => (
              <FeedbackTableCard
                key={fb.id}
                feedback={fb}
                onToggleActioned={() => toggleActionedStatus(fb.id, fb.is_actioned)}
              />
            ))}
          </div>
        </InfiniteScroll>

        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </DashboardFrame>
  );
};

export default TablesPage;