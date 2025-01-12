import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Users, Calendar, TrendingUp } from 'lucide-react';
import supabase from '../utils/supabase';
import DashboardFrame from './DashboardFrame';
import FeedbackTrendsChart from '../components/dashboard/FeedbackTrendsChart';
import FeedbackDistributionChart from '../components/dashboard/FeedbackDistributionChart';
import MetricCard from '../components/dashboard/MetricCard';
import SatisfactionCard from '../components/dashboard/SatisfactionCard';
import ActionCard from '../components/dashboard/ActionCard';
import FeedbackFeed from '../components/dashboard/FeedbackFeed';
import LiveUpdatesToggle from '../components/dashboard/LiveUpdatesToggle';

const DashboardPage = () => {
  const [questions, setQuestions] = useState([]);
  const [venueId, setVenueId] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [liveUpdatesEnabled, setLiveUpdatesEnabled] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/signin');
      } else {
        fetchVenueId(user.email);
      }
    };

    fetchSession();
  }, [navigate]);

  const fetchVenueId = async (email) => {
    const { data: venueData, error: venueError } = await supabase
      .from('venues')
      .select('id, is_paid')
      .eq('email', email)
      .single();

    if (venueError) {
      console.error('Error fetching venue ID:', venueError);
    } else {
      if (!venueData.is_paid) {
        navigate('/pricing');
        return;
      }

      setVenueId(venueData.id);
      fetchQuestions(venueData.id);
      fetchFeedback(venueData.id);
      if (liveUpdatesEnabled) {
        setupRealtimeUpdates(venueData.id);
      }
    }
  };

  const fetchQuestions = async (venueId) => {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('venue_id', venueId)
      .eq('active', true);

    if (error) {
      console.error('Error fetching questions:', error);
    } else {
      setQuestions(data);
    }
  };

  const fetchFeedback = async (venueId) => {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('venue_id', venueId);

    if (error) {
      console.error('Error fetching feedback:', error);
    } else {
      setFeedback(data);
    }
  };

  const setupRealtimeUpdates = (venueId) => {
    const feedbackSubscription = supabase
      .channel('feedback')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'feedback', filter: `venue_id=eq.${venueId}` },
        async (payload) => {
          setFeedback((prevFeedback) => [...prevFeedback, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(feedbackSubscription);
    };
  };

  const toggleLiveUpdates = () => {
    setLiveUpdatesEnabled((prev) => !prev);
    if (venueId) {
      if (liveUpdatesEnabled) {
        supabase.removeAllChannels();
      } else {
        setupRealtimeUpdates(venueId);
      }
    }
  };

  const calculateAverageRating = (questionId) => {
    const relevantFeedback = feedback.filter((f) => f.question_id === questionId);
    if (relevantFeedback.length === 0) return 0;

    const totalRating = relevantFeedback.reduce((sum, f) => sum + f.rating, 0);
    return (totalRating / relevantFeedback.length).toFixed(1);
  };

  const calculateOverallAverageRating = () => {
    if (feedback.length === 0) return 0;

    const totalRating = feedback.reduce((sum, f) => sum + f.rating, 0);
    return (totalRating / feedback.length).toFixed(1);
  };

  const filterFeedbackByTime = (startTime, endTime = new Date().toISOString()) => {
    return feedback.filter((f) => f.timestamp >= startTime && f.timestamp < endTime);
  };

  const calculateFeedbackCount = (startTime, endTime) => {
    return filterFeedbackByTime(startTime, endTime).length;
  };

  const calculatePercentageChange = (currentCount, previousCount) => {
    if (previousCount === 0) return 0;
    return (((currentCount - previousCount) / previousCount) * 100).toFixed(1);
  };

  const now = new Date();

  // Feedback counts for metric cards
  const last30MinutesCount = calculateFeedbackCount(
    new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
    now.toISOString()
  );
  const previous30MinutesCount = calculateFeedbackCount(
    new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
    new Date(now.getTime() - 30 * 60 * 1000).toISOString()
  );
  const last30MinutesTrend = calculatePercentageChange(last30MinutesCount, previous30MinutesCount);

  const lastHourCount = calculateFeedbackCount(
    new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
    now.toISOString()
  );
  const previousHourCount = calculateFeedbackCount(
    new Date(now.getTime() - 120 * 60 * 1000).toISOString(),
    new Date(now.getTime() - 60 * 60 * 1000).toISOString()
  );
  const lastHourTrend = calculatePercentageChange(lastHourCount, previousHourCount);

  const todayCount = calculateFeedbackCount(
    new Date(now.toISOString().split('T')[0]).toISOString(),
    now.toISOString()
  );
  const yesterdayCount = calculateFeedbackCount(
    new Date(new Date(now).setDate(now.getDate() - 1)).toISOString().split('T')[0],
    new Date(now.toISOString().split('T')[0]).toISOString()
  );
  const todayTrend = calculatePercentageChange(todayCount, yesterdayCount);

  const last7DaysCount = calculateFeedbackCount(
    new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    now.toISOString()
  );
  const previous7DaysCount = calculateFeedbackCount(
    new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  );
  const last7DaysTrend = calculatePercentageChange(last7DaysCount, previous7DaysCount);

  const questionToSuggestionMap = {
    'How is the music?': 'Consider updating the playlist or adjusting the volume.',
    'How was the service?': 'Provide additional staff training to improve service quality.',
    'Was the venue clean?': 'Increase the frequency of cleaning schedules.',
    'How was the food?': 'Consider revising the menu or improving food quality.',
  };

  const generateSuggestedActions = () => {
    const suggestedActions = [];
    const ratingThreshold = 3.5;

    questions.forEach((q) => {
      const averageRating = calculateAverageRating(q.id);
      if (averageRating < ratingThreshold && questionToSuggestionMap[q.question]) {
        suggestedActions.push({
          question: q.question,
          rating: averageRating,
          suggestion: questionToSuggestionMap[q.question],
        });
      }
    });

    return suggestedActions;
  };

  return (
    <DashboardFrame>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Page Title and Live Updates Toggle */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-0">Venue Dashboard</h1>
          <LiveUpdatesToggle liveUpdatesEnabled={liveUpdatesEnabled} toggleLiveUpdates={toggleLiveUpdates} />
        </div>

        {/* Top Section: Overall Satisfaction and Key Metrics */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          {/* Overall Satisfaction */}
          <SatisfactionCard
            title="Overall Satisfaction"
            rating={calculateOverallAverageRating()}
            trend={calculateOverallAverageRating() > 4.2 ? 'up' : 'down'}
            difference={Math.abs(calculateOverallAverageRating() - 4.2).toFixed(1)}
          />

          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <MetricCard
              title="Last 30 Minutes"
              value={last30MinutesCount}
              trend={last30MinutesTrend >= 0 ? 'up' : 'down'}
              trendValue={Math.abs(last30MinutesTrend)}
              compareText="Compared to previous 30 mins"
              icon={Clock}
            />
            <MetricCard
              title="Last Hour"
              value={lastHourCount}
              trend={lastHourTrend >= 0 ? 'up' : 'down'}
              trendValue={Math.abs(lastHourTrend)}
              compareText="Compared to previous hour"
              icon={Users}
            />
            <MetricCard
              title="Today"
              value={todayCount}
              trend={todayTrend >= 0 ? 'up' : 'down'}
              trendValue={Math.abs(todayTrend)}
              compareText="Compared to yesterday"
              icon={Calendar}
            />
            <MetricCard
              title="Last 7 Days"
              value={last7DaysCount}
              trend={last7DaysTrend >= 0 ? 'up' : 'down'}
              trendValue={Math.abs(last7DaysTrend)}
              compareText="Compared to previous week"
              icon={TrendingUp}
            />
          </div>
        </div>

        {/* Middle Section: Feedback Trends and Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <FeedbackTrendsChart feedback={feedback} /> {/* All-time feedback */}
          <FeedbackDistributionChart feedback={feedback} /> {/* All-time feedback */}
        </div>

        {/* Bottom Section: Suggested Actions and Live Feedback Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2 sm:mb-0">Suggested Actions</h2>
              <span className="text-sm text-gray-500">Based on recent feedback</span>
            </div>
            <div className="space-y-4">
              {generateSuggestedActions().map((action, index) => (
                <ActionCard
                  key={index}
                  question={action.question}
                  rating={action.rating}
                  suggestion={action.suggestion}
                />
              ))}
            </div>
          </div>

          <FeedbackFeed feedback={feedback} /> {/* All-time feedback */}
        </div>
      </div>
    </DashboardFrame>
  );
};

export default DashboardPage;