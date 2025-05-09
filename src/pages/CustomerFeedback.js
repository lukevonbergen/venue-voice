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

  if (!venue || !questions.length) return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>;
  if (isFinished) return <div style={{ textAlign: 'center', padding: '2rem' }}>Thanks for your feedback!</div>;

  const primary = venue.primary_color || '#333';
  const secondary = venue.secondary_color || '#eee';

  return (
    <div style={{
      fontFamily: 'sans-serif',
      padding: '2rem 1rem',
      maxWidth: '500px',
      margin: '0 auto',
      textAlign: 'center',
      color: primary
    }}>
      {venue.logo && (
        <div style={{ marginBottom: '1.5rem' }}>
          <img src={venue.logo} alt="Venue Logo" style={{ maxHeight: '60px' }} />
        </div>
      )}
      {!tableNumber ? (
        <div>
          <h2>Select Your Table</h2>
          <select
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            style={{
              padding: '0.75rem',
              fontSize: '1.1rem',
              marginTop: '1rem',
              borderRadius: '8px',
              width: '80%',
              maxWidth: '300px',
              border: `2px solid ${primary}`,
              backgroundColor: secondary
            }}
          >
            <option value="">Select</option>
            {Array.from({ length: venue.table_count || 10 }, (_, i) => (
              <option key={i} value={i + 1}>Table {i + 1}</option>
            ))}
          </select>
        </div>
      ) : current >= 0 ? (
        <div>
          <h2 style={{ marginBottom: '2rem', fontSize: '1.4rem' }}>{questions[current].question}</h2>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            padding: '1rem 0'
          }}>
            {['😠', '😞', '😐', '😊', '😍'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleEmojiAnswer(emoji)}
                style={{
                  fontSize: '2.5rem',
                  padding: '1rem',
                  borderRadius: '50%',
                  border: `2px solid ${primary}`,
                  backgroundColor: secondary,
                  width: '60px',
                  height: '60px',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
                  cursor: 'pointer'
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <h2 style={{ marginBottom: '1rem' }}>Additional Feedback?</h2>
          <textarea
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            rows="5"
            placeholder="Type anything else you'd like to say..."
            style={{
              width: '90%',
              maxWidth: '400px',
              padding: '1rem',
              fontSize: '1rem',
              borderRadius: '8px',
              border: `1px solid ${primary}`,
              backgroundColor: secondary,
              marginBottom: '1.5rem'
            }}
          ></textarea>
          <br />
          <button
            onClick={handleSubmit}
            style={{
              padding: '0.75rem 2rem',
              fontSize: '1.1rem',
              borderRadius: '8px',
              backgroundColor: primary,
              color: '#fff',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Submit
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomerFeedbackPage;
