import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import supabase from '../utils/supabase';
import { motion, AnimatePresence } from 'framer-motion';

const CustomerFeedbackPage = () => {
  const { venueId } = useParams();
  const location = useLocation();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [isFinished, setIsFinished] = useState(false);

  // Disable scrolling when this page is active
  useEffect(() => {
    document.body.classList.add('no-scroll');
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, []);

  // Fetch questions for the venue
  useEffect(() => {
    const fetchQuestions = async () => {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('venue_id', venueId);
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

    // Move to the next question or finish
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setIsFinished(true); // Show the "Thank You" message
    }
  };

  // Function to attempt closing the tab
  const closeTab = () => {
    if (window.opener) {
      // If the tab was opened via JavaScript, close it
      window.close();
    } else {
      // Otherwise, instruct the user to manually close the tab
      alert('Please manually close this tab.');
    }
  };

  if (questions.length === 0) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (isFinished) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-100 p-4">
        <h2 className="text-2xl font-bold mb-4">Thank You!</h2>
        <p className="text-gray-600 mb-4">
          You can now close this tab.
        </p>
        {/* Button to close the tab */}
        <button
          onClick={closeTab}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Close Tab
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-100 p-4 overflow-hidden">
      {/* Question Section with Slide Animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 100 }} // Slide in from the right
          animate={{ opacity: 1, x: 0 }} // Center position
          exit={{ opacity: 0, x: -100 }} // Slide out to the left
          transition={{ type: 'tween', duration: 0.3 }} // Smooth transition
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

      {/* Emoji Buttons */}
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
    </div>
  );
};

export default CustomerFeedbackPage;