import React, { useState, useEffect } from 'react';

const VenueDashboard = () => {
  const [sentiment, setSentiment] = useState({ happy: 0, neutral: 0, sad: 0 });
  const [issues, setIssues] = useState([]);

  // Simulate real-time feedback updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSentiment({
        happy: Math.floor(Math.random() * 100),
        neutral: Math.floor(Math.random() * 100),
        sad: Math.floor(Math.random() * 100),
      });
      // Simulate issue alerts
      if (Math.random() > 0.8) {
        setIssues((prev) => [...prev, `Issue reported at Table ${Math.floor(Math.random() * 10)}`]);
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.container}>
      <h2>Venue Dashboard</h2>
      <div style={styles.sentiment}>
        <h3>Live Sentiment Tracking</h3>
        <p>😊 Happy: {sentiment.happy}</p>
        <p>😐 Neutral: {sentiment.neutral}</p>
        <p>😠 Sad: {sentiment.sad}</p>
      </div>
      <div style={styles.issues}>
        <h3>Issue Alerts</h3>
        {issues.length > 0 ? (
          issues.map((issue, index) => <p key={index}>{issue}</p>)
        ) : (
          <p>No issues reported.</p>
        )}
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
  sentiment: {
    margin: '20px 0',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    backgroundColor: '#f9f9f9',
  },
  issues: {
    margin: '20px 0',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    backgroundColor: '#f9f9f9',
  },
};

export default VenueDashboard;