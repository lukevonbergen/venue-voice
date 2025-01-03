import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/Dashboard';
import CustomerFeedbackPage from './pages/CustomerFeedback';
import './index.css';
import SignUpPage from './pages/SignUp'; // Import SignUpPage
import SignInPage from './pages/SignIn'; // Import SignInPage

function App() {
  return (
    <Router>
      <div style={styles.navbar}>
        <Link to="/" style={styles.link}>Home</Link>
        <Link to="/dashboard" style={styles.link}>Dashboard</Link>
        <Link to="/feedback" style={styles.link}>Feedback</Link>
        <Link to="/signup" style={styles.link}>Sign Up</Link> {/* Add Sign Up link */}
        <Link to="/signin" style={styles.link}>Sign In</Link> {/* Add Sign In link */}
      </div>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/feedback" element={<CustomerFeedbackPage />} />
        <Route path="/feedback/:venueId" element={<CustomerFeedbackPage />} />
        <Route path="/signup" element={<SignUpPage />} /> {/* Add Sign Up route */}
        <Route path="/signin" element={<SignInPage />} /> {/* Add Sign In route */}
      </Routes>
    </Router>
  );
}

const styles = {
  navbar: {
    padding: '10px',
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #ddd',
    textAlign: 'center',
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

export default App;