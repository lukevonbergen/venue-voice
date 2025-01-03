import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../utils/supabase';
import QRCodeGenerator from '../components/QRCodeGenerator';

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

  // Count responses in the last hour
  const countResponsesLastHour = () => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
    const recentFeedback = feedback.filter((f) => f.timestamp >= oneHourAgo);
    return recentFeedback.length;
  };

  // Count total responses today
  const countTodaysResponses = () => {
    const today = new Date().toISOString().split('T')[0];
    const todaysFeedback = feedback.filter((f) => f.timestamp.startsWith(today));
    return todaysFeedback.length;
  };

  // Generate the feedback URL for the venue
  const feedbackUrl = `${window.location.origin}/feedback/${venueId}`;

  return (
    <div className="p-6 font-sans bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Venue Dashboard</h1>
  
      {/* Top Row: Overall Satisfaction and Per-Question Averages */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        {/* Overall Satisfaction Tile */}
        <div className="bg-blue-100 p-6 rounded-lg shadow-md flex flex-col justify-center items-center">
          <h3 className="text-lg font-semibold mb-2">Overaldddl Satisfaction</h3>
          <p className="text-4xl font-bold">{calculateOverallAverageRating()}/5</p>
        </div>
  
        {/* Per-Question Average Tiles */}
        {questions.map((q) => (
          <div key={q.id} className="bg-green-100 p-6 rounded-lg shadow-md flex flex-col justify-center items-center">
            <h3 className="text-lg font-semibold mb-2">{q.question}</h3>
            <p className="text-4xl font-bold">{calculateAverageRating(q.id)}/5</p>
          </div>
        ))}
      </div>

      {/* Middle Row: Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Responses in the Last Hour */}
        <div className="bg-purple-100 p-6 rounded-lg shadow-md flex flex-col justify-center items-center">
          <h3 className="text-lg font-semibold mb-2">Responses (Last Hour)</h3>
          <p className="text-4xl font-bold">{countResponsesLastHour()}</p>
        </div>
  
        {/* Total Responses Today */}
        <div className="bg-yellow-100 p-6 rounded-lg shadow-md flex flex-col justify-center items-center">
          <h3 className="text-lg font-semibold mb-2">Total Responses (Today)</h3>
          <p className="text-4xl font-bold">{countTodaysResponses()}</p>
        </div>
  
        {/* Placeholder Tile 1 */}
        <div className="bg-pink-100 p-6 rounded-lg shadow-md flex flex-col justify-center items-center">
          <h3 className="text-lg font-semibold mb-2">Placeholder 1</h3>
          <p className="text-4xl font-bold">-</p>
        </div>
  
        {/* Placeholder Tile 2 */}
        <div className="bg-indigo-100 p-6 rounded-lg shadow-md flex flex-col justify-center items-center">
          <h3 className="text-lg font-semibold mb-2">Placeholder 2</h3>
          <p className="text-4xl font-bold">-</p>
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
    </div>
  )};

export default DashboardPage;