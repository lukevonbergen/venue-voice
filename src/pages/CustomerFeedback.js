import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { v4 as uuidv4 } from 'uuid';

const CustomerFeedbackPage = () => {
  const { venueId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [venue, setVenue] = useState(null);
  const [sessionId] = useState(uuidv4());
  const [tableNumber, setTableNumber] = useState('');
  const [current, setCurrent] = useState(0);
  const [feedbackAnswers, setFeedbackAnswers] = useState([]);
  const [freeText, setFreeText] = useState('');
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const { data: questionsData } = await supabase
        .from('questions')
        .select('*')
        .eq('venue_id', venueId)
        .eq('active', true)
        .order('order');

      const { data: venueData } = await supabase
        .from('venues')
        .select('logo, primary_color, secondary_color, table_count')
        .eq('id', venueId)
        .single();

      setQuestions(questionsData || []);
      setVenue(venueData);
    };

    loadData();
  }, [venueId]);

  const handleEmojiAnswer = (emoji) => {
    const rating = { '😠': 1, '😞': 2, '😐': 3, '😊': 4, '😍': 5 }[emoji] || null;
    const question = questions[current];
    setFeedbackAnswers(prev => [...prev, {
      venue_id: venueId,
      question_id: question.id,
      session_id: sessionId,
      sentiment: emoji,
      rating,
      table_number: tableNumber || null,
    }]);

    if (current < questions.length - 1) setCurrent(current + 1);
    else setCurrent(-1); // Move to free-text input
  };

  const handleSubmit = async () => {
    const entries = [...feedbackAnswers];
    if (freeText.trim()) {
      entries.push({
        venue_id: venueId,
        question_id: null,
        sentiment: null,
        rating: null,
        additional_feedback: freeText,
        table_number: tableNumber || null,
        session_id: sessionId,
      });
    }

    const { error } = await supabase.from('feedback').insert(entries);
    if (!error) setIsFinished(true);
  };

  if (!venue || !questions.length) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600 text-lg">
        Loading feedback form...
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="flex justify-center items-center min-h-screen text-green-600 text-xl font-semibold">
        Thanks for your feedback!
      </div>
    );
  }

  const primary = venue.primary_color || '#111827';
  const secondary = venue.secondary_color || '#f3f4f6';

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: secondary }}>
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-6 text-center" style={{ color: primary }}>
        {venue.logo && (
          <div className="mb-6">
            <img src={venue.logo} alt="Venue Logo" className="h-14 mx-auto" />
          </div>
        )}

        {!tableNumber ? (
          <div>
            <h2 className="text-xl font-semibold mb-4">Select Your Table</h2>
            <select
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="w-full border px-4 py-3 rounded-lg text-base"
              style={{
                borderColor: primary,
                backgroundColor: secondary,
              }}
            >
              <option value="">Choose your table</option>
              {Array.from({ length: venue.table_count || 10 }, (_, i) => (
                <option key={i} value={i + 1}>Table {i + 1}</option>
              ))}
            </select>
          </div>
        ) : current >= 0 ? (
          <div>
            <h2 className="text-lg font-semibold mb-6">{questions[current].question}</h2>
            <div className="flex justify-between gap-3 flex-wrap px-4">
              {['😠', '😞', '😐', '😊', '😍'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleEmojiAnswer(emoji)}
                  className="w-16 h-16 rounded-full text-3xl shadow-sm border hover:scale-110 transition"
                  style={{
                    borderColor: primary,
                    backgroundColor: secondary,
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-semibold mb-4">Anything else you'd like to tell us?</h2>
            <textarea
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              rows={4}
              placeholder="Leave any additional comments..."
              className="w-full p-3 border rounded-lg text-base mb-4"
              style={{
                borderColor: primary,
                backgroundColor: secondary,
              }}
            />
            <button
              onClick={handleSubmit}
              className="w-full py-3 rounded-lg font-semibold text-white text-lg"
              style={{ backgroundColor: primary }}
            >
              Submit Feedback
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerFeedbackPage;
