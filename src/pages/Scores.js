import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Star,
  Smile,
  Heart,
  Coffee,
  Clock,
  Users,
  ToggleRight,
  ToggleLeft,
} from 'lucide-react';
import supabase from '../utils/supabase';
import DashboardFrame from './DashboardFrame';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import Modal from 'react-modal'; // Import react-modal

// Set app element for react-modal (required for accessibility)
Modal.setAppElement('#root');

const ScoresPage = () => {
  const [feedback, setFeedback] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [venueId, setVenueId] = useState(null);
  const [liveUpdatesEnabled, setLiveUpdatesEnabled] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal
  const navigate = useNavigate();

  // Fetch venue ID and feedback
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
        navigate('/pricing');
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

  // Calculate breakdown of Promoters, Passives, and Detractors
  const calculateNPSBreakdown = () => {
    const promoters = feedback.filter((f) => f.rating >= 9).length;
    const passives = feedback.filter((f) => f.rating === 7 || f.rating === 8).length;
    const detractors = feedback.filter((f) => f.rating <= 6).length;
    const totalResponses = feedback.length;

    return {
      promoters,
      passives,
      detractors,
      totalResponses,
    };
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
  const ScoreCard = ({ title, value, maxValue = 100, icon: Icon, onClick }) => (
    <div
      className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200 border border-gray-100 cursor-pointer"
      onClick={onClick} // Make the card clickable
    >
      <div className="flex flex-col items-center space-y-4">
        <div className="w-24 h-24">
          <CircularProgressbar
            value={value}
            maxValue={maxValue}
            text={`${value}%`}
            styles={{
              path: { stroke: '#3B82F6' }, // Blue color for the progress bar
              text: { fill: '#1F2937', fontSize: '24px', fontWeight: 'bold' }, // Dark gray for text
            }}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Icon className="w-6 h-6 text-blue-600" />
          <span className="text-gray-700 font-medium">{title}</span>
        </div>
      </div>
    </div>
  );

  // Modal Styles
  const modalStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      width: '400px',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
  };

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
            icon={Smile}
            onClick={() => setIsModalOpen(true)} // Open modal on click
          />
          <ScoreCard
            title="Service Score"
            value={calculateAverageScore('service')}
            maxValue={5}
            icon={Star}
          />
          <ScoreCard
            title="Food Score"
            value={calculateAverageScore('food')}
            maxValue={5}
            icon={Coffee}
          />
          <ScoreCard
            title="Ambiance Score"
            value={calculateAverageScore('ambiance')}
            maxValue={5}
            icon={Heart}
          />
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <ScoreCard
            title="Overall Average"
            value={calculateOverallAverage()}
            maxValue={5}
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

        {/* NPS Breakdown Modal */}
        <Modal
          isOpen={isModalOpen}
          onRequestClose={() => setIsModalOpen(false)}
          style={modalStyles}
          contentLabel="NPS Breakdown"
        >
          <h2 className="text-xl font-bold mb-4">NPS Breakdown</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-700">Promoters (9-10)</span>
              <span className="font-bold">{calculateNPSBreakdown().promoters}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Passives (7-8)</span>
              <span className="font-bold">{calculateNPSBreakdown().passives}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Detractors (0-6)</span>
              <span className="font-bold">{calculateNPSBreakdown().detractors}</span>
            </div>
            <div className="flex justify-between border-t pt-4">
              <span className="text-gray-700">Total Responses</span>
              <span className="font-bold">{calculateNPSBreakdown().totalResponses}</span>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardFrame>
  );
};

export default ScoresPage;