import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div style={styles.container}>
      <h1>Welcome to Venue Voice!</h1>
      <p>Helping venues and customers connect through real-time feedback.</p>
      <div style={styles.links}>
        <Link to="/dashboard" style={styles.link}>Venue Dashboard</Link>
        <Link to="/feedback" style={styles.link}>Leave Feedback</Link>
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
  links: {
    marginTop: '20px',
  },
  link: {
    margin: '0 10px',
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '5px',
  },
};

export default LandingPage;