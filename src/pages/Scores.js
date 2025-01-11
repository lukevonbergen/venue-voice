import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Star, Smile, Heart, Coffee, Clock, Users } from 'lucide-react';
import supabase from '../utils/supabase';
import DashboardFrame from './DashboardFrame';

const ScoresPage = () => {
  const [feedback, setFeedback] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [venueId, setVenueId] = useState(null);
  const [liveUpdatesEnabled, setLiveUpdatesEnabled] = useState(true);
  const navigate = useNavigate();

  // Fetch venue ID and feedback
  useEffect(() => {
    const fetchSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/signin'); // Redirect to sign-in if not authenticated
      } else {
        fetchVenueId(user.email);
      }
    };

    fetchSession();
  }, [navigate]);

  // Fetch venue ID
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
        navigate('/pricing'); // Redirect to pricing if not paid
        return;
      }

      setVenueId(venueData.id);
      fetchFeedback(venueData.id);
      fetchQuestions(venueData.id);
      if (liveUpdatesEnabled) {
        setupRealtimeUpdates(venueData.id);
      }
    }
  };

  // Fetch feedback for the venue
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

  // Fetch questions for the venue
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

  // Toggle live updates
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

  // Calculate NPS (Net Promoter Score)
  const calculateNPS = () => {
    const promoters = feedback.filter((f) => f.rating >= 9).length;
    const detractors = feedback.filter((f) => f.rating <= 6).length;
    const totalResponses = feedback.length;

    if (totalResponses === 0) return 0;

    const nps = ((promoters - detractors) / totalResponses) * 100;
    return nps.toFixed(1);
  };

  // Calculate average score for a specific question type
  const calculateAverageScore = (questionType) => {
    const relevantQuestions = questions.filter((q) => q.question.toLowerCase().includes(questionType.toLowerCase()));
    if (relevantQuestions.length === 0) return 0;

    const relevantFeedback = feedback.filter((f) =>
      relevantQuestions.some((q) => q.id === f.question_id)
    );

    if (relevantFeedback.length === 0) return 0;

    const totalRating = relevantFeedback.reduce((sum, f) => sum + f.rating, 0);
    return (totalRating / relevantFeedback.length).toFixed(1);
  };

  // Calculate overall average score
  const calculateOverallAverage = () => {
    if (feedback.length === 0) return 0;

    const totalRating = feedback.reduce((sum, f) => sum + f.rating, 0);
    return (totalRating / feedback.length).toFixed(1);
  };

  // Count responses in a specific timeframe
  const countResponses = (timeInterval) => {
    const now = new Date();
    let startTime;

    switch (timeInterval) {
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

  // UI Components
  const ScoreCard = ({ title, value, trend, trendValue, icon: Icon }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200 border border-gray-100">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <span className="text-gray-500 text-sm font-medium">{title}</span>
          <div className="flex items-baseline space-x-2">
            <h2 className="text-3xl font-bold text-gray-900">{value}</h2>
            {trend && (
              <div className={`flex items-center ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span className="ml-1 text-sm font-medium">{trendValue}%</span>
              </div>
            )}
          </div>
        </div>
        <div className="p-2 bg-blue-50 rounded-lg">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
      </div>
    </div>
  );

  return (
    <DashboardFrame>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title and Live Updates Toggle */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Scores</h1>
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

        {/* Scores Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <ScoreCard
            title="NPS Score"
            value={calculateNPS()}
            trend={calculateNPS() > 50 ? 'up' : 'down'}
            trendValue={Math.abs(calculateNPS() - 50).toFixed(1)}
            icon={Smile}
          />
          <ScoreCard
            title="Service Score"
            value={calculateAverageScore('service')}
            trend={calculateAverageScore('service') > 4.0 ? 'up' : 'down'}
            trendValue={Math.abs(calculateAverageScore('service') - 4.0).toFixed(1)}
            icon={Star}
          />
          <ScoreCard
            title="Food Score"
            value={calculateAverageScore('food')}
            trend={calculateAverageScore('food') > 4.0 ? 'up' : 'down'}
            trendValue={Math.abs(calculateAverageScore('food') - 4.0).toFixed(1)}
            icon={Coffee}
          />
          <ScoreCard
            title="Ambiance Score"
            value={calculateAverageScore('ambiance')}
            trend={calculateAverageScore('ambiance') > 4.0 ? 'up' : 'down'}
            trendValue={Math.abs(calculateAverageScore('ambiance') - 4.0).toFixed(1)}
            icon={Heart}
          />
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <ScoreCard
            title="Overall Average"
            value={calculateOverallAverage()}
            icon={Star}
          />
          <ScoreCard
            title="Responses (Last Hour)"
            value={countResponses('1hour')}
            icon={Clock}
          />
          <ScoreCard
            title="Responses (Today)"
            value={countResponses('today')}
            icon={Users}
          />
        </div>
      </div>
    </DashboardFrame>
  );
};

export default ScoresPage;