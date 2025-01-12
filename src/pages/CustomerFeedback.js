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
  const [venueBranding, setVenueBranding] = useState({
    logo: null,
    primaryColor: '#1890ff', // Default primary color
    secondaryColor: '#ffffff', // Default secondary color
  });

  // Disable scrolling when this page is active
  useEffect(() => {
    document.body.classList.add('no-scroll');
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, []);

  // Fetch active questions and branding for the venue
  useEffect(() => {
    const fetchData = async () => {
      // Fetch active questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('venue_id', venueId)
        .eq('active', true)
        .order('order', { ascending: true });

      if (questionsError) {
        console.error('Error fetching questions:', questionsError);
      } else {
        // Add NPS question at the end
        const npsQuestion = {
          id: 'nps', // Unique identifier for NPS question
          question: 'How likely are you to recommend us?',
          venue_id: venueId,
          order: questionsData.length + 1,
          active: true,
        };
        setQuestions([...questionsData, npsQuestion]);
      }

      // Fetch venue branding (logo, colors)
      const { data: brandingData, error: brandingError } = await supabase
        .from('venues')
        .select('logo, primary_color, secondary_color')
        .eq('id', venueId)
        .single();

      if (brandingError) {
        console.error('Error fetching branding:', brandingError);
      } else {
        setVenueBranding({
          logo: brandingData.logo,
          primaryColor: brandingData.primary_color || '#1890ff', // Fallback to default
          secondaryColor: brandingData.secondary_color || '#52c41a', // Fallback to default
        });
      }
    };

    fetchData();
  }, [venueId]);

  // Check if the current question is the NPS question
  const isNPSQuestion = () => {
    return questions[currentQuestionIndex]?.id === 'nps';
  };

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

  const handleNPSRating = async (rating) => {
    // Save NPS rating to the database
    await supabase
      .from('feedback')
      .insert([
        {
          venue_id: venueId,
          question_id: 'nps', // Use 'nps' as the question_id for NPS
          rating: rating, // Save the NPS rating (1-10)
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
    <div
      className="flex flex-col h-screen p-4 overflow-hidden"
      style={{
        backgroundColor: venueBranding.secondaryColor, // Use secondary color as background
      }}
    >
      {/* Logo at the Top */}
      {venueBranding.logo && (
        <div className="flex justify-center pt-4">
          <img
            src={venueBranding.logo}
            alt="Venue Logo"
            className="max-w-full max-h-[30px] object-contain" // Adjust max height as needed
          />
        </div>
      )}

      {/* Centered Content (Questions or Additional Feedback) */}
      <div className="flex-1 flex flex-col justify-center items-center">
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

        {/* Emoji Buttons or NPS Rating Input */}
        {!showAdditionalFeedback && (
          <>
            {isNPSQuestion() ? (
              // NPS Rating Slider (1-10)
              <div className="w-full max-w-md px-4">
                <div className="relative">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    defaultValue="5"
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, ${venueBranding.primaryColor} 0%, ${venueBranding.primaryColor} 50%, #e5e7eb 50%, #e5e7eb 100%)`,
                    }}
                    onChange={(e) => handleNPSRating(Number(e.target.value))}
                  />
                  <div className="flex justify-between text-sm text-gray-600 mt-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <span key={num}>{num}</span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // Emoji Buttons for Non-NPS Questions
              <div className="flex justify-center gap-6">
                {['😠', '😞', '😐', '😊', '😍'].map((emoji, index) => (
                  <button
                    key={index}
                    className="text-5xl transition-transform hover:scale-125 active:scale-100"
                    onClick={() => handleFeedback(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* Additional Feedback Section */}
        {showAdditionalFeedback && (
          <div className="flex flex-col items-center gap-4">
            <h2 className="text-2xl font-bold mb-4">Any additional feedback?</h2>
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

      {/* Powered by Chatters at the Bottom */}
      <div className="flex justify-center pb-4">
        <div className="text-sm text-gray-600">
          Powered by <strong>Chatters</strong>
        </div>
      </div>
    </div>
  );
};

export default CustomerFeedbackPage;