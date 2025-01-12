import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Clock, Users, Calendar, AlertTriangle, ToggleLeft, ToggleRight } from 'lucide-react';
import supabase from '../utils/supabase';
import DashboardFrame from './DashboardFrame';

const DashboardPage = () => {
  const [questions, setQuestions] = useState([]);
  const [venueId, setVenueId] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [lastHourFeedback, setLastHourFeedback] = useState([]);
  const [liveUpdatesEnabled, setLiveUpdatesEnabled] = useState(true);
  const [timeFilter, setTimeFilter] = useState('1hour');
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
      const lastHourData = await fetchLastHourFeedback(venueData.id);
      setLastHourFeedback(lastHourData);
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

  const fetchLastHourFeedback = async (venueId) => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('venue_id', venueId)
      .not('additional_feedback', 'is', null)
      .gte('timestamp', oneHourAgo)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching last hour feedback:', error);
    } else {
      return data;
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

          if (payload.new.additional_feedback) {
            const newFeedback = await fetchLastHourFeedback(venueId);
            setLastHourFeedback(newFeedback);
          }
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

  const filterFeedbackByTime = (timeFilter) => {
    const now = new Date();
    let startTime;

    switch (timeFilter) {
      case '1hour':
        startTime = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
        break;
      case 'today':
        startTime = new Date(now.toISOString().split('T')[0]).toISOString();
        break;
      case '7days':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        break;
      default:
        startTime = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
    }

    return feedback.filter((f) => f.timestamp >= startTime);
  };

  const filteredFeedback = filterFeedbackByTime(timeFilter);

  const calculateFeedbackCount = (feedback, startTime, endTime) => {
    return feedback.filter((f) => f.timestamp >= startTime && f.timestamp < endTime).length;
  };

  const calculatePercentageChange = (currentCount, previousCount) => {
    if (previousCount === 0) return 0;
    return (((currentCount - previousCount) / previousCount) * 100).toFixed(1);
  };

  const now = new Date();

  const last30MinutesCount = calculateFeedbackCount(
    filteredFeedback,
    new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
    now.toISOString()
  );
  const previous30MinutesCount = calculateFeedbackCount(
    feedback,
    new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
    new Date(now.getTime() - 30 * 60 * 1000).toISOString()
  );
  const last30MinutesTrend = calculatePercentageChange(last30MinutesCount, previous30MinutesCount);

  const lastHourCount = calculateFeedbackCount(
    filteredFeedback,
    new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
    now.toISOString()
  );
  const previousHourCount = calculateFeedbackCount(
    feedback,
    new Date(now.getTime() - 120 * 60 * 1000).toISOString(),
    new Date(now.getTime() - 60 * 60 * 1000).toISOString()
  );
  const lastHourTrend = calculatePercentageChange(lastHourCount, previousHourCount);

  const todayCount = calculateFeedbackCount(
    filteredFeedback,
    new Date(now.toISOString().split('T')[0]).toISOString(),
    now.toISOString()
  );
  const yesterdayCount = calculateFeedbackCount(
    feedback,
    new Date(new Date(now).setDate(now.getDate() - 1)).toISOString().split('T')[0],
    new Date(now.toISOString().split('T')[0]).toISOString()
  );
  const todayTrend = calculatePercentageChange(todayCount, yesterdayCount);

  const last7DaysCount = calculateFeedbackCount(
    filteredFeedback,
    new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    now.toISOString()
  );
  const previous7DaysCount = calculateFeedbackCount(
    feedback,
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

  const MetricCard = ({ title, value, trend, trendValue, compareText, icon: Icon }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 transition-all duration-200 hover:shadow-md border border-gray-100">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <span className="text-gray-500 text-sm font-medium">{title}</span>
          <div className="flex items-baseline space-x-2">
            <h2 className="text-3xl font-bold text-gray-900">{value}</h2>
            <div className={`flex items-center ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span className="ml-1 text-sm font-medium">{trendValue}%</span>
            </div>
          </div>
          <p className="text-gray-400 text-xs">{compareText}</p>
        </div>
        <div className="p-2 bg-blue-50 rounded-lg">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
      </div>
    </div>
  );

  const SatisfactionCard = ({ title, rating, trend, difference }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200 border border-gray-100">
      <h3 className="text-gray-500 text-sm font-medium mb-4">{title}</h3>
      <div className="flex items-center justify-between">
        <div className="flex items-baseline">
          <span className="text-4xl font-bold text-gray-900">{rating}</span>
          <span className="text-xl text-gray-400 ml-1">/5</span>
        </div>
        <div className={`flex items-center ${parseFloat(rating) > 4.0 ? 'text-green-600' : 'text-red-600'}`}>
          {parseFloat(rating) > 4.0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span className="ml-1 text-sm font-medium">{difference} from last hour</span>
        </div>
      </div>
    </div>
  );

  const ActionCard = ({ question, rating, suggestion }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200 border border-gray-100">
      <div className="flex items-start space-x-4">
        <div className="p-2 bg-amber-50 rounded-lg">
          <AlertTriangle className="w-6 h-6 text-amber-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{question}</h3>
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-500 mr-2">Current Rating:</span>
              <span className="text-sm font-bold text-gray-900">{rating}/5</span>
            </div>
          </div>
          <p className="text-gray-600 text-sm">{suggestion}</p>
        </div>
      </div>
    </div>
  );

  const FeedbackFeed = ({ feedback }) => (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Live Feedback Feed</h2>
      <div className="space-y-4">
        {feedback.map((f, index) => (
          <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
            <div className="flex items-center justify-between">
              <p className="text-gray-700">{f.additional_feedback}</p>
              <span className="text-sm text-gray-400">
                {new Date(f.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        {feedback.length === 0 && (
          <p className="text-gray-500 text-center">No feedback in the selected time frame.</p>
        )}
      </div>
    </div>
  );

  return (
    <DashboardFrame>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Page Title, Live Updates Toggle, and Time Filter */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-0">Venue Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Filter by:</span>
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="1hour">Last Hour</option>
                <option value="today">Today</option>
                <option value="7days">Last 7 Days</option>
              </select>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Live Updates</span>
              <button
                onClick={toggleLiveUpdates}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  liveUpdatesEnabled ? 'bg-green-50 hover:bg-green-100' : 'bg-red-50 hover:bg-red-100'
                }`}
              >
                {liveUpdatesEnabled ? (
                  <ToggleRight className="w-6 h-6 text-green-600" />
                ) : (
                  <ToggleLeft className="w-6 h-6 text-red-600" />
                )}
              </button>
            </div>
          </div>
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
          {/* Feedback Trends Over Time (Placeholder for Chart) */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Feedback Trends Over Time</h2>
            <p className="text-gray-500">Chart placeholder for feedback trends.</p>
          </div>

          {/* Feedback Distribution by Rating (Placeholder for Chart) */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Feedback Distribution by Rating</h2>
            <p className="text-gray-500">Chart placeholder for feedback distribution.</p>
          </div>
        </div>

        {/* Bottom Section: Suggested Actions and Live Feedback Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Suggested Actions */}
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

          {/* Live Feedback Feed */}
          <FeedbackFeed feedback={filteredFeedback} />
        </div>
      </div>
    </DashboardFrame>
  );
};

export default DashboardPage;