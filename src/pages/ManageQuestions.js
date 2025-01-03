import React, { useState, useEffect } from 'react';
import supabase from '../utils/supabase';
import DashboardFrame from './DashboardFrame';
import { QRCodeSVG } from 'qrcode.react'; // Correct import

const ManageQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editingQuestionText, setEditingQuestionText] = useState('');
  const [venueId, setVenueId] = useState(null);

  // Fetch venue ID and questions
  useEffect(() => {
    const fetchSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        fetchVenueId(user.email);
      }
    };

    fetchSession();
  }, []);

  // Fetch venue ID
  const fetchVenueId = async (email) => {
    const { data: venueData, error: venueError } = await supabase
      .from('venues')
      .select('id')
      .eq('email', email)
      .single();

    if (venueError) {
      console.error('Error fetching venue ID:', venueError);
    } else {
      setVenueId(venueData.id);
      fetchQuestions(venueData.id);
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

    if (newQuestion.length > 100) {
      alert('Question cannot exceed 100 characters.');
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

  // Start editing a question
  const startEditingQuestion = (questionId, questionText) => {
    setEditingQuestionId(questionId);
    setEditingQuestionText(questionText);
  };

  // Save edited question
  const saveEditedQuestion = async () => {
    if (!editingQuestionText.trim()) {
      alert('Question cannot be empty.');
      return;
    }

    if (editingQuestionText.length > 100) {
      alert('Question cannot exceed 100 characters.');
      return;
    }

    const { error } = await supabase
      .from('questions')
      .update({ question: editingQuestionText })
      .eq('id', editingQuestionId);

    if (error) {
      console.error('Error updating question:', error);
    } else {
      const updatedQuestions = questions.map((q) =>
        q.id === editingQuestionId ? { ...q, question: editingQuestionText } : q
      );
      setQuestions(updatedQuestions);
      setEditingQuestionId(null);
      setEditingQuestionText('');
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

  // Suggested questions for easy adding
  const suggestedQuestions = [
    'How was the service today?',
    'How would you rate the atmosphere?',
    'Was your order prepared correctly?',
    'How likely are you to recommend us?',
    'How clean was the venue?',
  ];

  // Generate the feedback URL for the venue
  const feedbackUrl = `${window.location.origin}/feedback/${venueId}`;

  return (
    <DashboardFrame>
      <div className="p-6 bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold mb-8">Manage Questions</h1>

        {/* QR Code Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Feedback QR Code</h2>
          <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
            <QRCodeSVG value={feedbackUrl} size={200} /> {/* Use QRCodeSVG */}
            <p className="text-gray-600 mt-4">Scan this QR code to provide feedback.</p>
            <p className="text-sm text-gray-500 mt-2">
              <a href={feedbackUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                {feedbackUrl}
              </a>
            </p>
          </div>
        </div>

        {/* Suggested Questions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Suggested Questions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestedQuestions.map((question, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-lg shadow-md cursor-pointer hover:bg-gray-100"
                onClick={() => setNewQuestion(question)}
              >
                <p className="text-gray-700">{question}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Add New Question */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Add New Question</h2>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Enter a new question"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              className="flex-1 p-2 border rounded-lg"
              maxLength={100}
            />
            <button
              onClick={handleAddQuestion}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Add
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {newQuestion.length}/100 characters
          </p>
        </div>

        {/* Current Questions */}
        <div>
          <h2 className="text-xl font-bold mb-4">Current Questions</h2>
          <div className="space-y-4">
            {questions.map((q) => (
              <div key={q.id} className="bg-white p-4 rounded-lg shadow-md">
                {editingQuestionId === q.id ? (
                  <div className="flex gap-4">
                    <input
                      type="text"
                      value={editingQuestionText}
                      onChange={(e) => setEditingQuestionText(e.target.value)}
                      className="flex-1 p-2 border rounded-lg"
                      maxLength={100}
                    />
                    <button
                      onClick={saveEditedQuestion}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingQuestionId(null)}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <p className="text-gray-700">{q.question}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditingQuestion(q.id, q.question)}
                        className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardFrame>
  );
};

export default ManageQuestions;