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
    document.body.classList.add('no-scroll'); // Add a class to disable scrolling
    return () => {
      document.body.classList.remove('no-scroll'); // Remove the class on unmount
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