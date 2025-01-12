import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Smile,
  Star,
  Heart,
  Coffee,
  ToggleRight,
  ToggleLeft,
} from 'lucide-react';
import supabase from '../utils/supabase';
import DashboardFrame from './DashboardFrame';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import Modal from 'react-modal';

// Set app element for react-modal (required for accessibility)
Modal.setAppElement('#root');

const ScoresPage = () => {
  const [npsScores, setNpsScores] = useState([]); // State for NPS scores
  const [venueId, setVenueId] = useState(null);
  const [liveUpdatesEnabled, setLiveUpdatesEnabled] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch venue ID and NPS scores
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
      fetchNpsScores(venueData.id); // Fetch NPS scores for the venue
      if (liveUpdatesEnabled) {
        setupRealtimeUpdates(venueData.id);
      }
    }
  };

  // Fetch NPS scores for the venue
  const fetchNpsScores = async (venueId) => {
    const { data, error } = await supabase
      .from('nps_scores') // Fetch from nps_scores table
      .select('score') // Only fetch the score column
      .eq('venue_id', venueId); // Filter by venue_id

    if (error) {
      console.error('Error fetching NPS scores:', error);
    } else {
      setNpsScores(data);
    }
  };

  // Set up real-time updates for NPS scores
  const setupRealtimeUpdates = (venueId) => {
    const npsSubscription = supabase
      .channel('nps_scores')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'nps_scores', filter: `venue_id=eq.${venueId}` },
        (payload) => {
          console.log('New NPS score received:', payload.new);
          setNpsScores((prevScores) => [...prevScores, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(npsSubscription);
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
    const promoters = npsScores.filter((s) => s.score >= 9).length;
    const detractors = npsScores.filter((s) => s.score <= 6).length;
    const totalResponses = npsScores.length;

    if (totalResponses === 0) return 0;

    const nps = (promoters - detractors) / totalResponses; // Remove * 100
    return nps.toFixed(1); // Keep one decimal place for precision
  };

  // Calculate breakdown of Promoters, Passives, and Detractors
  const calculateNPSBreakdown = () => {
    const promoters = npsScores.filter((s) => s.score >= 9).length;
    const passives = npsScores.filter((s) => s.score === 7 || s.score === 8).length;
    const detractors = npsScores.filter((s) => s.score <= 6).length;
    const totalResponses = npsScores.length;

    return {
      promoters,
      passives,
      detractors,
      totalResponses,
      promoterPercentage: totalResponses > 0 ? ((promoters / totalResponses) * 100).toFixed(1) : 0,
      passivePercentage: totalResponses > 0 ? ((passives / totalResponses) * 100).toFixed(1) : 0,
      detractorPercentage: totalResponses > 0 ? ((detractors / totalResponses) * 100).toFixed(1) : 0,
    };
  };

  // UI Components
  const ScoreCard = ({ title, value, maxValue = 100, icon: Icon, onClick }) => (
    <div
      className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200 border border-gray-100 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex flex-col items-center space-y-4">
        <div className="w-24 h-24">
          <CircularProgressbar
            value={value}
            maxValue={maxValue}
            text={`${value}%`}
            styles={{
              path: { stroke: '#3B82F6' },
              text: { fill: '#1F2937', fontSize: '24px', fontWeight: 'bold' },
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

  const CategoryCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200 border border-gray-100">
      <div className="flex flex-col items-center space-y-4">
        <div className="flex items-center space-x-2">
          <Icon className={`w-6 h-6 text-${color}-600`} />
          <span className="text-gray-700 font-medium">{title}</span>
        </div>
        <span className="text-2xl font-bold">{value}</span>
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
            onClick={() => setIsModalOpen(true)}
          />
          <CategoryCard
            title="Promoters"
            value={calculateNPSBreakdown().promoters}
            icon={TrendingUp}
            color="green"
          />
          <CategoryCard
            title="Passives"
            value={calculateNPSBreakdown().passives}
            icon={TrendingDown}
            color="yellow"
          />
          <CategoryCard
            title="Detractors"
            value={calculateNPSBreakdown().detractors}
            icon={TrendingDown}
            color="red"
          />
        </div>

        {/* Total Responses Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Total Responses</h2>
          <div className="flex justify-between">
            <span className="text-gray-700">Total</span>
            <span className="font-bold">{calculateNPSBreakdown().totalResponses}</span>
          </div>
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