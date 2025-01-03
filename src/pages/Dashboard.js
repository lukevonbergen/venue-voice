import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Clock, Users, Calendar, AlertTriangle } from 'lucide-react';
import supabase from '../utils/supabase';
import DashboardFrame from './DashboardFrame';
import FeedbackGraph from '../components/FeedbackGraph';

const DashboardPage = () => {
  const [questions, setQuestions] = useState([]);
  const [venueId, setVenueId] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const navigate = useNavigate();

  // Check if the user is authenticated
  useEffect(() => {
    const fetchSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/signin');
      } else {
        console.log('Logged-in user email:', user.email);
        fetchVenueId(user.email);
      }
    };

    fetchSession();
  }, [navigate]);

  // Fetch venue ID and questions
  const fetchVenueId = async (email) => {
    console.log('Fetching venue ID for email:', email);

    const { data: venueData, error: venueError } = await supabase
      .from('venues')
      .select('id')
      .eq('email', email)
      .single();

    if (venueError) {
      console.error('Error fetching venue ID:', venueError);
    } else {
      console.log('Venue ID fetched successfully:', venueData.id);
      setVenueId(venueData.id);
      fetchQuestions(venueData.id);
      fetchFeedback(venueData.id);
      setupRealtimeUpdates(venueData.id); // Set up real-time updates
    }
  };

  // Fetch active questions for the venue
  const fetchQuestions = async (venueId) => {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('venue_id', venueId)
      .eq('active', true); // Only fetch active questions

    if (error) {
      console.error('Error fetching questions:', error);
    } else {
      setQuestions(data);
    }
  };

  // Fetch feedback for the venue
  const fetchFeedback = async (venueId) => {
    console.log('Fetching feedback for venue ID:', venueId);

    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('venue_id', venueId);

    if (error) {
      console.error('Error fetching feedback:', error);
    } else {
      console.log('Feedback fetched successfully:', data);
      setFeedback(data);
    }
  };

  // Set up real-time updates for feedback
  const setupRealtimeUpdates = (venueId) => {
    const feedbackSubscription = supabase
      .channel('feedback')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'feedback', filter: `venue_id=eq.${venueId}` },
        (payload) => {
          console.log('New feedback received:', payload.new);
          setFeedback((prevFeedback) => [...prevFeedback, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(feedbackSubscription);
    };
  };

  // Calculate average rating for a specific question
  const calculateAverageRating = (questionId) => {
    const relevantFeedback = feedback.filter((f) => f.question_id === questionId);
    if (relevantFeedback.length === 0) return 0;

    const totalRating = relevantFeedback.reduce((sum, f) => sum + f.rating, 0);
    return (totalRating / relevantFeedback.length).toFixed(1);
  };

  // Calculate overall average rating across all questions
  const calculateOverallAverageRating = () => {
    if (feedback.length === 0) return 0;

    const totalRating = feedback.reduce((sum, f) => sum + f.rating, 0);
    return (totalRating / feedback.length).toFixed(1);
  };

  // Count responses in timeframes
  const countResponses = (timeInterval) => {
    const now = new Date();
    let startTime;

    switch (timeInterval) {
      case '30min':
        startTime = new Date(now.getTime() - 30 * 60 * 1000).toISOString();
        break;
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
        throw new Error('Invalid time interval');
    }

    const filteredFeedback = feedback.filter((f) => f.timestamp >= startTime);
    return filteredFeedback.length;
  };

  // Calculate percentage change compared to the previous time interval
  const calculatePercentageChange = (currentCount, previousCount) => {
    if (previousCount === 0) return 0; // Avoid division by zero
    return (((currentCount - previousCount) / previousCount) * 100).toFixed(1);
  };

  // Get the count for the previous time interval
  const getPreviousCount = (timeInterval) => {
    const now = new Date();
    let startTime, endTime;

    switch (timeInterval) {
      case '30min':
        startTime = new Date(now.getTime() - 60 * 60 * 1000).toISOString(); // Last hour
        endTime = new Date(now.getTime() - 30 * 60 * 1000).toISOString(); // Last 30 minutes
        break;
      case '1hour':
        startTime = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(); // Last 2 hours
        endTime = new Date(now.getTime() - 60 * 60 * 1000).toISOString(); // Last hour
        break;
      case 'today':
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        startTime = new Date(yesterday).toISOString(); // Yesterday
        endTime = new Date(now.toISOString().split('T')[0]).toISOString(); // Today
        break;
      case '7days':
        startTime = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(); // Last 14 days
        endTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(); // Last 7 days
        break;
      default:
        throw new Error('Invalid time interval');
    }

    const filteredFeedback = feedback.filter(
      (f) => f.timestamp >= startTime && f.timestamp < endTime
    );
    return filteredFeedback.length;
  };

  // Map questions to actionable suggestions
  const questionToSuggestionMap = {
    'Do you like the music?': 'Consider updating the playlist or adjusting the volume.',
    'How was the service?': 'Provide additional staff training to improve service quality.',
    'Was the venue clean?': 'Increase the frequency of cleaning schedules.',
    'How was the food?': 'Consider revising the menu or improving food quality.',
    // Add more mappings as needed
  };

  // Generate suggested actions based on low-rated questions
  const generateSuggestedActions = () => {
    const suggestedActions = [];
    const ratingThreshold = 3.5; // Threshold for low ratings

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

  return (
    <DashboardFrame>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Venue Dashboard</h1>
          <div className="bg-blue-50 px-4 py-2 rounded-lg">
            <span className="text-blue-600 font-medium">Live Updates Active</span>
          </div>
        </div>

        {/* Overall Satisfaction */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <SatisfactionCard
            title="Overall Satisfaction"
            rating={calculateOverallAverageRating()}
            trend={calculateOverallAverageRating() > 4.2 ? 'up' : 'down'}
            difference={Math.abs(calculateOverallAverageRating() - 4.2).toFixed(1)}
          />
          
          {questions.map((q) => (
            <SatisfactionCard
              key={q.id}
              title={q.question}
              rating={calculateAverageRating(q.id)}
              trend={calculateAverageRating(q.id) > 4.0 ? 'up' : 'down'}
              difference={Math.abs(calculateAverageRating(q.id) - 4.0).toFixed(1)}
            />
          ))}
        </div>

        {/* Response Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Last 30 Minutes"
            value={countResponses('30min')}
            trend={countResponses('30min') > getPreviousCount('30min') ? 'up' : 'down'}
            trendValue={Math.abs(calculatePercentageChange(countResponses('30min'), getPreviousCount('30min')))}
            compareText="Compared to previous 30 mins"
            icon={Clock}
          />
          <MetricCard
            title="Last Hour"
            value={countResponses('1hour')}
            trend={countResponses('1hour') > getPreviousCount('1hour') ? 'up' : 'down'}
            trendValue={Math.abs(calculatePercentageChange(countResponses('1hour'), getPreviousCount('1hour')))}
            compareText="Compared to previous hour"
            icon={Users}
          />
          <MetricCard
            title="Today"
            value={countResponses('today')}
            trend={countResponses('today') > getPreviousCount('today') ? 'up' : 'down'}
            trendValue={Math.abs(calculatePercentageChange(countResponses('today'), getPreviousCount('today')))}
            compareText="Compared to yesterday"
            icon={Calendar}
          />
          <MetricCard
            title="Last 7 Days"
            value={countResponses('7days')}
            trend={countResponses('7days') > getPreviousCount('7days') ? 'up' : 'down'}
            trendValue={Math.abs(calculatePercentageChange(countResponses('7days'), getPreviousCount('7days')))}
            compareText="Compared to previous week"
            icon={TrendingUp}
          />
        </div>

        {/* Suggested Actions */}
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Suggested Actions</h2>
            <span className="text-sm text-gray-500">Based on recent feedback</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      </div>
    </DashboardFrame>
  );
};

export default DashboardPage;