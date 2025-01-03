import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/Dashboard';
import CustomerFeedbackPage from './pages/CustomerFeedback';
import './index.css';
import SignUpPage from './pages/SignUp';
import ManageQuestions from './pages/ManageQuestions';
import SignInPage from './pages/SignIn';

// Navbar component (moved outside of App for clarity)
const Navbar = () => {
  return (
    <div style={styles.navbar}>
      <Link to="/" style={styles.link}>Home</Link>
      <Link to="/dashboard" style={styles.link}>Dashboard</Link>
      <Link to="/feedback" style={styles.link}>Feedback</Link>
      <Link to="/signup" style={styles.link}>Sign Up</Link>
      <Link to="/signin" style={styles.link}>Sign In</Link>
    </div>
  );
};

function App() {
  const location = useLocation(); // Get the current route

  // Conditionally render the navbar if the route is not a feedback page or dashboard
  const showNavbar = !location.pathname.startsWith('/feedback') && !location.pathname.startsWith('/dashboard');

  return (
    <div>
      {showNavbar && <Navbar />} {/* Render navbar only if showNavbar is true */}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/feedback" element={<CustomerFeedbackPage />} />
        <Route path="/feedback/:venueId" element={<CustomerFeedbackPage />} />
        <Route path="/dashboard/questions" element={<ManageQuestions />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/signin" element={<SignInPage />} />
      </Routes>
    </div>
  );
}

// Wrap the App component with Router
const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);

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

export default AppWrapper;