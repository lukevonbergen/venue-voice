import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../utils/supabase';
import DashboardFrame from './DashboardFrame';

const DashboardPage = () => {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
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

  // Add a new question
  const handleAddQuestion = async () => {
    if (questions.length >= 5) {
      alert('You can only add up to 5 questions.');
      return;
    }

    if (!newQuestion.trim()) {
      alert('Question cannot be empty.');
      return;
    }

    const { data, error } = await supabase
      .from('questions')
      .insert([{ venue_id: venueId, question: newQuestion }])
      .select();

    if (error) {
      console.error('Error adding question:', error);
    } else {
      setQuestions([...questions, data[0]]);
      setNewQuestion('');
    }
  };

  // Delete a question
  const handleDeleteQuestion = async (questionId) => {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', questionId);

    if (error) {
      console.error('Error deleting question:', error);
    } else {
      setQuestions(questions.filter((q) => q.id !== questionId));
    }
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

  // Generate the feedback URL for the venue
  const feedbackUrl = `${window.location.origin}/feedback/${venueId}`;

  return (
    <DashboardFrame>
      <h1 className="text-3xl font-bold mb-8">Venue Dashboard</h1>

      {/* Top Row: Overall Satisfaction and Per-Question Averages */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        {/* Overall Satisfaction Tile */}
        <div className="bg-blue-50 p-6 rounded-lg shadow-md flex flex-col justify-center items-center">
          <h3 className="text-lg font-semibold mb-2">Overall Satisfaction</h3>
          <p className="text-4xl font-bold">{calculateOverallAverageRating()}/5</p>
          <p className="text-sm text-gray-600 mt-2">
            {calculateOverallAverageRating() > 0 ? '↑' : '↓'}{' '}
            {Math.abs(calculateOverallAverageRating() - 4.2).toFixed(1)}% from last hour
          </p>
        </div>

        {/* Per-Question Average Tiles */}
        {questions.map((q) => (
          <div key={q.id} className="bg-green-50 p-6 rounded-lg shadow-md flex flex-col justify-center items-center">
            <h3 className="text-lg font-semibold mb-2">{q.question}</h3>
            <p className="text-4xl font-bold">{calculateAverageRating(q.id)}/5</p>
            <p className="text-sm text-gray-600 mt-2">
              {calculateAverageRating(q.id) > 0 ? '↑' : '↓'}{' '}
              {Math.abs(calculateAverageRating(q.id) - 4.0).toFixed(1)}% from last hour
            </p>
          </div>
        ))}
      </div>

      {/* Middle Row: Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Responses in the Last 30 Minutes */}
        <div className="bg-purple-50 p-6 rounded-lg shadow-md flex flex-col justify-center items-center">
          <h3 className="text-lg font-semibold mb-2">Last 30 mins</h3>
          <p className="text-4xl font-bold">{countResponses('30min')}</p>
          <p className="text-sm text-gray-600 mt-2">
            {countResponses('30min') > getPreviousCount('30min') ? '↑' : '↓'}{' '}
            {Math.abs(calculatePercentageChange(countResponses('30min'), getPreviousCount('30min')))}% from last hour
          </p>
        </div>

        {/* Responses in the Last Hour */}
        <div className="bg-yellow-50 p-6 rounded-lg shadow-md flex flex-col justify-center items-center">
          <h3 className="text-lg font-semibold mb-2">Last Hour</h3>
          <p className="text-4xl font-bold">{countResponses('1hour')}</p>
          <p className="text-sm text-gray-600 mt-2">
            {countResponses('1hour') > getPreviousCount('1hour') ? '↑' : '↓'}{' '}
            {Math.abs(calculatePercentageChange(countResponses('1hour'), getPreviousCount('1hour')))}% from yesterday
          </p>
        </div>

        {/* Total Responses Today */}
        <div className="bg-pink-50 p-6 rounded-lg shadow-md flex flex-col justify-center items-center">
          <h3 className="text-lg font-semibold mb-2">Today</h3>
          <p className="text-4xl font-bold">{countResponses('today')}</p>
          <p className="text-sm text-gray-600 mt-2">
            {countResponses('today') > getPreviousCount('today') ? '↑' : '↓'}{' '}
            {Math.abs(calculatePercentageChange(countResponses('today'), getPreviousCount('today')))}% from yesterday
          </p>
        </div>

        {/* Total Responses in the Last 7 Days */}
        <div className="bg-indigo-50 p-6 rounded-lg shadow-md flex flex-col justify-center items-center">
          <h3 className="text-lg font-semibold mb-2">Last 7 Days</h3>
          <p className="text-4xl font-bold">{countResponses('7days')}</p>
          <p className="text-sm text-gray-600 mt-2">
            {countResponses('7days') > getPreviousCount('7days') ? '↑' : '↓'}{' '}
            {Math.abs(calculatePercentageChange(countResponses('7days'), getPreviousCount('7days')))}% from last week
          </p>
        </div>
      </div>

      {/* Bottom Row: Question Management */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Manage Questions</h2>
        <div className="space-y-4">
          {questions.map((q) => (
            <div key={q.id} className="flex justify-between items-center p-4 border rounded-lg">
              <p className="text-lg">{q.question}</p>
              <button
                onClick={() => handleDeleteQuestion(q.id)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-4">
          <input
            type="text"
            placeholder="Enter a new question"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            className="flex-1 p-2 border rounded-lg"
          />
          <button
            onClick={handleAddQuestion}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Add Question
          </button>
        </div>
      </div>
    </DashboardFrame>
  );
};

export default DashboardPage;