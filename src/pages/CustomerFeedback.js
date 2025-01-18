import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import supabase from '../utils/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid'; // Import uuid for generating session IDs
import { toast } from 'react-toastify'; // Import toast
import 'react-toastify/dist/ReactToastify.css'; // Import toast styles

// Helper function to calculate luminance
const getLuminance = (color) => {
  const hex = color.replace(/^#/, '');
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance;
};

const CustomerFeedbackPage = () => {
  const { venueId } = useParams();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [isFinished, setIsFinished] = useState(false);
  const [additionalFeedback, setAdditionalFeedback] = useState('');
  const [showAdditionalFeedback, setShowAdditionalFeedback] = useState(false);
  const [venueBranding, setVenueBranding] = useState({
    logo: null,
    primaryColor: '#1890ff',
    secondaryColor: '#ffffff',
    tableCount: 0, // Add tableCount to venueBranding
  });
  const [tableNumber, setTableNumber] = useState('');
  const [hasCollectedTableNumber, setHasCollectedTableNumber] = useState(false);
  const [sessionId, setSessionId] = useState(null); // Add sessionId state

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
        toast.error('Failed to fetch questions'); // Use toast here
      } else {
        // Add NPS question at the end
        const npsQuestion = {
          id: 'nps',
          question: 'How likely are you to recommend us?',
          venue_id: venueId,
          order: questionsData.length + 1,
          active: true,
        };
        setQuestions([...questionsData, npsQuestion]);
      }

      // Fetch venue branding and table_count
      const { data: brandingData, error: brandingError } = await supabase
        .from('venues')
        .select('logo, primary_color, secondary_color, table_count') // Add table_count here
        .eq('id', venueId)
        .single();

      if (brandingError) {
        console.error('Error fetching branding:', brandingError);
        toast.error('Failed to fetch branding'); // Use toast here
      } else {
        setVenueBranding({
          logo: brandingData.logo,
          primaryColor: brandingData.primary_color || '#1890ff',
          secondaryColor: brandingData.secondary_color || '#52c41a',
          tableCount: brandingData.table_count || 0, // Add tableCount to venueBranding
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
    const emojiToRating = {
      '😠': 1,
      '😞': 2,
      '😐': 3,
      '😊': 4,
      '😍': 5,
    };
    const rating = emojiToRating[emoji];

    // Log all questions except the NPS question
    const feedbackData = questions
      .filter((question) => question.id !== 'nps') // Exclude the NPS question
      .map((question) => ({
        venue_id: venueId,
        question_id: question.id,
        sentiment: emoji,
        rating: rating,
        table_number: tableNumber || null, // Include table number
        session_id: sessionId, // Include session_id
      }));

    console.log('Feedback data being sent:', feedbackData); // Debugging

    // Save all feedback entries to the database
    const { data, error } = await supabase
      .from('feedback')
      .insert(feedbackData)
      .select(); // Use .select() to return the inserted data

    if (error) {
      console.error('Error saving feedback:', error);
      toast.error(`Failed to save feedback: ${error.message}`); // Show detailed error message
    } else {
      console.log('Feedback saved successfully:', data); // Debugging
      // Move to the next question or show additional feedback
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        setShowAdditionalFeedback(true);
      }
    }
  };

  const handleNPSRating = async (rating) => {
    // Log the NPS rating without a session_id
    const { data, error } = await supabase
      .from('feedback')
      .insert([
        {
          venue_id: venueId,
          question_id: 'nps', // Use 'nps' as the question_id for the NPS question
          sentiment: null,
          rating: rating,
          table_number: tableNumber || null, // Include table number
          session_id: null, // Exclude session_id for the NPS question
        },
      ])
      .select(); // Use .select() to return the inserted data

    if (error) {
      console.error('Error saving NPS rating:', error);
      toast.error(`Failed to save NPS rating: ${error.message}`); // Show detailed error message
    } else {
      console.log('NPS rating saved successfully:', data); // Debugging
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        setShowAdditionalFeedback(true);
      }
    }
  };

  const handleAdditionalFeedback = async () => {
    if (additionalFeedback.trim() !== '') {
      const { data, error } = await supabase
        .from('feedback')
        .insert([
          {
            venue_id: venueId,
            question_id: null,
            sentiment: null,
            rating: null,
            additional_feedback: additionalFeedback,
            table_number: tableNumber || null, // Include table number
            session_id: sessionId, // Include session_id
          },
        ])
        .select(); // Use .select() to return the inserted data

      if (error) {
        console.error('Error saving additional feedback:', error);
        toast.error(`Failed to save additional feedback: ${error.message}`); // Show detailed error message
      } else {
        console.log('Additional feedback saved successfully:', data); // Debugging
      }
    }

    setIsFinished(true);
  };

  // Calculate text color based on background luminance
  const textColor = getLuminance(venueBranding.secondaryColor) > 0.5 ? '#000000' : '#ffffff';

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

  // Show table number input if not collected yet
  if (!hasCollectedTableNumber) {
    return (
      <div
        className="flex flex-col h-screen p-4 overflow-hidden"
        style={{
          backgroundColor: venueBranding.secondaryColor,
        }}
      >
        {/* Logo at the Top */}
        {venueBranding.logo && (
          <div className="flex justify-center pt-4">
            <img
              src={venueBranding.logo}
              alt="Venue Logo"
              className="max-w-full max-h-[30px] object-contain"
            />
          </div>
        )}

        {/* Table Number Dropdown */}
        <div className="flex-1 flex flex-col justify-center items-center">
          <h2 className="text-2xl font-bold mb-4" style={{ color: textColor }}>
            What is your table number? (Optional)
          </h2>
          <select
            className="w-full max-w-md p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
          >
            <option value="">Select your table number</option>
            {Array.from({ length: venueBranding.tableCount || 0 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                Table {i + 1}
              </option>
            ))}
          </select>
          <button
            className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            onClick={() => {
              setSessionId(uuidv4()); // Generate a unique session ID
              setHasCollectedTableNumber(true);
            }}
          >
            Next
          </button>
        </div>

        {/* Powered by Chatters at the Bottom */}
        <div className="flex justify-center pb-4">
          <div className="text-sm" style={{ color: textColor }}>
            Powered by <strong>Chatters</strong>
          </div>
        </div>
      </div>
    );
  }

  // Main feedback UI
  return (
    <div
      className="flex flex-col h-screen p-4 overflow-hidden"
      style={{
        backgroundColor: venueBranding.secondaryColor,
      }}
    >
      {/* Logo at the Top */}
      {venueBranding.logo && (
        <div className="flex justify-center pt-4">
          <img
            src={venueBranding.logo}
            alt="Venue Logo"
            className="max-w-full max-h-[30px] object-contain"
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
              <h2 className="text-2xl font-bold mb-4" style={{ color: textColor }}>
                {questions[currentQuestionIndex].question}
              </h2>
              <p className="text-gray-600" style={{ color: textColor }}>
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Emoji Buttons or NPS Rating Input */}
        {!showAdditionalFeedback && (
          <>
            {isNPSQuestion() ? (
              // NPS Rating Buttons (1-10)
              <div className="grid grid-cols-5 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                  <button
                    key={rating}
                    className="w-12 h-12 flex items-center justify-center border rounded-lg transition-colors text-sm font-medium"
                    style={{
                      backgroundColor: venueBranding.primaryColor,
                      color: '#ffffff',
                    }}
                    onClick={() => handleNPSRating(rating)}
                  >
                    {rating}
                  </button>
                ))}
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
            <h2 className="text-2xl font-bold mb-4" style={{ color: textColor }}>
              Any additional feedback?
            </h2>
            <p className="text-gray-600 mb-4" style={{ color: textColor }}>
              This is optional, but we'd love to hear more!
            </p>
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
                onClick={() => setIsFinished(true)}
              >
                Skip
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Powered by Chatters at the Bottom */}
      <div className="flex justify-center pb-4">
        <div className="text-sm" style={{ color: textColor }}>
          Powered by <strong>Chatters</strong>
        </div>
      </div>
    </div>
  );
};

export default CustomerFeedbackPage;