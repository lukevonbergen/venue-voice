// ✅ New version coming right now
// We'll switch to storing all question feedback locally and posting a single session's feedback in one go
// Grouped by session_id, without using nps_scores

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import supabase from '../utils/supabase';
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
    else setCurrent(-1); // Go to free-text
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

  if (!venue || !questions.length) return <div>Loading...</div>;
  if (isFinished) return <div>Thanks for your feedback!</div>;

  return (
    <div>
      {!tableNumber ? (
        <div>
          <h2>Select Table Number</h2>
          <select onChange={(e) => setTableNumber(e.target.value)}>
            <option value="">Select</option>
            {Array.from({ length: venue.table_count || 10 }, (_, i) => (
              <option key={i} value={i + 1}>Table {i + 1}</option>
            ))}
          </select>
        </div>
      ) : current >= 0 ? (
        <div>
          <h2>{questions[current].question}</h2>
          {[ '😠', '😞', '😐', '😊', '😍' ].map((emoji) => (
            <button key={emoji} onClick={() => handleEmojiAnswer(emoji)}>{emoji}</button>
          ))}
        </div>
      ) : (
        <div>
          <h2>Additional Feedback?</h2>
          <textarea value={freeText} onChange={(e) => setFreeText(e.target.value)}></textarea>
          <button onClick={handleSubmit}>Submit</button>
        </div>
      )}
    </div>
  );
};

export default CustomerFeedbackPage;
