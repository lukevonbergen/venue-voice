import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../utils/supabase';
import DashboardFrame from './DashboardFrame';

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

  // Fetch questions for the venue
  const fetchQuestions = async (venueId) => {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('venue_id', venueId);

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

  return (
    <DashboardFrame>
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Venue Dashboard</h1>

      {/* Top Row: Overall Satisfaction and Per-Question Averages */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {/* Overall Satisfaction Tile */}
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-center items-center col-span-2">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Overall Satisfaction</h3>
          <p className="text-4xl font-bold text-gray-800">{calculateOverallAverageRating()}/5</p>
          <p
            className={`text-sm mt-2 ${
              calculateOverallAverageRating() > 4.2 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {calculateOverallAverageRating() > 4.2 ? '↑' : '↓'}{' '}
            {Math.abs(calculateOverallAverageRating() - 4.2).toFixed(1)} from last hour
          </p>
        </div>

        {/* Per-Question Average Tiles */}
        {questions.map((q) => (
          <div key={q.id} className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-center items-center col-span-2">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">{q.question}</h3>
            <p className="text-4xl font-bold text-gray-800">{calculateAverageRating(q.id)}/5</p>
            <p
              className={`text-sm mt-2 ${
                calculateAverageRating(q.id) > 4.0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {calculateAverageRating(q.id) > 4.0 ? '↑' : '↓'}{' '}
              {Math.abs(calculateAverageRating(q.id) - 4.0).toFixed(1)} from last hour
            </p>
          </div>
        ))}
      </div>

      {/* Middle Row: Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Responses in the Last 30 Minutes */}
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-center items-center col-span-2">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Last 30 mins</h3>
          <p className="text-4xl font-bold text-gray-800">{countResponses('30min')}</p>
          <p
            className={`text-sm mt-2 ${
              countResponses('30min') > getPreviousCount('30min') ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {countResponses('30min') > getPreviousCount('30min') ? '↑' : '↓'}{' '}
            {Math.abs(calculatePercentageChange(countResponses('30min'), getPreviousCount('30min')))}% from last hour
          </p>
        </div>

        {/* Responses in the Last Hour */}
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-center items-center col-span-2">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Last Hour</h3>
          <p className="text-4xl font-bold text-gray-800">{countResponses('1hour')}</p>
          <p
            className={`text-sm mt-2 ${
              countResponses('1hour') > getPreviousCount('1hour') ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {countResponses('1hour') > getPreviousCount('1hour') ? '↑' : '↓'}{' '}
            {Math.abs(calculatePercentageChange(countResponses('1hour'), getPreviousCount('1hour')))}% from yesterday
          </p>
        </div>

        {/* Total Responses Today */}
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-center items-center col-span-2">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Today</h3>
          <p className="text-4xl font-bold text-gray-800">{countResponses('today')}</p>
          <p
            className={`text-sm mt-2 ${
              countResponses('today') > getPreviousCount('today') ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {countResponses('today') > getPreviousCount('today') ? '↑' : '↓'}{' '}
            {Math.abs(calculatePercentageChange(countResponses('today'), getPreviousCount('today')))}% from yesterday
          </p>
        </div>

        {/* Total Responses in the Last 7 Days */}
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-center items-center col-span-2">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Last 7 Days</h3>
          <p className="text-4xl font-bold text-gray-800">{countResponses('7days')}</p>
          <p
            className={`text-sm mt-2 ${
              countResponses('7days') > getPreviousCount('7days') ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {countResponses('7days') > getPreviousCount('7days') ? '↑' : '↓'}{' '}
            {Math.abs(calculatePercentageChange(countResponses('7days'), getPreviousCount('7days')))}% from last week
          </p>
        </div>
      </div>
    </DashboardFrame>
  );
};

export default DashboardPage;