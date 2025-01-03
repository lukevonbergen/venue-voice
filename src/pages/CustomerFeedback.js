import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import supabase from '../utils/supabase';
import { motion, AnimatePresence } from 'framer-motion';

const CustomerFeedbackPage = () => {
  const { venueId } = useParams();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [isFinished, setIsFinished] = useState(false);
  const [additionalFeedback, setAdditionalFeedback] = useState('');
  const [showAdditionalFeedback, setShowAdditionalFeedback] = useState(false);

  // Disable scrolling when this page is active
  useEffect(() => {
    document.body.classList.add('no-scroll');
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, []);

  // Fetch active questions for the venue
  useEffect(() => {
    const fetchQuestions = async () => {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('venue_id', venueId)
        .eq('active', true) // Only fetch active questions
        .order('order', { ascending: true }); // Fetch questions in order

      if (error) {
        console.error(error);
      } else {
        setQuestions(data);
      }
    };
    fetchQuestions();
  }, [venueId]);

  const handleFeedback = async (emoji) => {
    // Map emoji to rating
    const emojiToRating = {
      '😠': 1,
      '😞': 2,
      '😐': 3,
      '😊': 4,
      '😍': 5,
    };
    const rating = emojiToRating[emoji];

    // Save feedback to the database
    await supabase
      .from('feedback')
      .insert([
        {
          venue_id: venueId,
          question_id: questions[currentQuestionIndex].id,
          sentiment: emoji,
          rating: rating,
        },
      ]);

    // Move to the next question or show additional feedback
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowAdditionalFeedback(true); // Show the additional feedback section
    }
  };

  const handleAdditionalFeedback = async () => {
    // Save additional feedback to the database
    if (additionalFeedback.trim() !== '') {
      const { data, error } = await supabase
        .from('feedback')
        .insert([
          {
            venue_id: venueId,
            question_id: null, // Use null or a special value (e.g., -1) for additional feedback
            sentiment: null,   // No emoji for additional feedback
            rating: null,      // No rating for additional feedback
            additional_feedback: additionalFeedback,
          },
        ]);

      if (error) {
        console.error('Error inserting additional feedback:', error);
      } else {
        console.log('Additional feedback inserted successfully:', data);
      }
    }

    // Show the "Thank You" message
    setIsFinished(true);
  };

  if (questions.length === 0) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (isFinished) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-100 p-4">
        <h2 className="text-2xl font-bold mb-4">Thank You!</h2>
        <p className="text-gray-600">You can close this tab now.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-100 p-4 overflow-hidden">
      {/* Question Section with Slide Animation */}
      {!showAdditionalFeedback && (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="flex flex-col justify-center items-center text-center mb-8"
          >
            <h2 className="text-2xl font-bold mb-4">
              {questions[currentQuestionIndex].question}
            </h2>
            <p className="text-gray-600">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Emoji Buttons */}
      {!showAdditionalFeedback && (
        <div className="flex justify-center gap-4">
          {['😠', '😞', '😐', '😊', '😍'].map((emoji, index) => (
            <button
              key={index}
              className="text-4xl transition-transform hover:scale-125 active:scale-100"
              onClick={() => handleFeedback(emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Additional Feedback Section */}
      {showAdditionalFeedback && (
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-2xl font-bold mb-4">Do you have any additional feedback?</h2>
          <p className="text-gray-600 mb-4">This is optional, but we'd love to hear more!</p>
          <textarea
            className="w-full max-w-md p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
            placeholder="Type your feedback here..."
            value={additionalFeedback}
            onChange={(e) => setAdditionalFeedback(e.target.value)}
          />
          <div className="flex gap-4">
            <button
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              onClick={handleAdditionalFeedback}
            >
              Submit
            </button>
            <button
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              onClick={() => setIsFinished(true)} // Skip additional feedback
            >
              Skip
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerFeedbackPage;