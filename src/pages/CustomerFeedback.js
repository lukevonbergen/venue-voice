import React, { useState, useEffect } from 'react';
import supabase from '../utils/supabase'; 
import { useParams } from 'react-router-dom';

const CustomerFeedbackPage = () => {
  const { venueId } = useParams();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [points, setPoints] = useState(100);

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
          rating: rating, // Include the rating
        },
      ]);
  
    // Move to the next question
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      alert('Thank you for your feedback! You earned 30 points.');
      setCurrentQuestionIndex(0); // Reset to the first question
    }
  };

  if (questions.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.question}>
        <h2>{questions[currentQuestionIndex].question}</h2>
      </div>
      <div style={styles.progress}>
        Question {currentQuestionIndex + 1} of {questions.length}
      </div>
      <div style={styles.buttonContainer}>
        {['😠', '😞', '😐', '😊', '😍'].map((emoji, index) => (
          <button
            key={index}
            style={styles.button}
            onClick={() => handleFeedback(emoji)}
            onMouseEnter={(e) => (e.target.style.transform = 'scale(1.2)')}
            onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
          >
            {emoji}
          </button>
        ))}
      </div>
      <div style={styles.rewards}>
        <h3>Your Rewards</h3>
        <p>Points: {points}</p>
        <p>Redeem for free drinks, queue skip, or VIP perks!</p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    textAlign: 'center',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  question: {
    transition: 'opacity 0.5s ease-in-out',
  },
  progress: {
    marginTop: '10px',
    fontSize: '1rem',
    color: '#666',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    margin: '20px 0',
  },
  button: {
    fontSize: '2rem',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  rewards: {
    marginTop: '20px',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    backgroundColor: '#f9f9f9',
  },
};

export default CustomerFeedbackPage;