import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react'; // Import the Analytics component
import LandingPage from './pages/LandingPage';
import 'antd/dist/reset.css';
import DashboardPage from './pages/Dashboard';
import CustomerFeedbackPage from './pages/CustomerFeedback';
import SignUpPage from './pages/SignUp';
import ManageQuestions from './pages/ManageQuestions';
import TablesDashboard from './pages/Dashboard_Tables';
import SettingsPage from './pages/SettingsPage';
import NPSScores from './pages/NPSScores';
import QRCodePage_Feature from './pages/Features_QRCode';
import NPS_Feature from './pages/Features_NPSScore';
import RealTimeStats_Feature from './pages/Features_RealTimeStats';
import CustomBranding_Feature from './pages/Features_CustomBranding';
import CustomQuestions_Feature from './pages/Features_CustomQuestions';
import Dashboards_Feature from './pages/Features_Dashboards';
import FeedbackFeed from './pages/FeedbackFeed';
import SignInPage from './pages/SignIn';
import PricingPage from './pages/Pricing';
import FeaturesPage from './pages/Features';
import DemoPage from './pages/DemoPage';
import ContactPage from './pages/ContactPage';
import SecurityPage from './pages/SecurityPage';
import TermsAndConditionsPage from './pages/Terms';
import PrivacyPolicyPage from './pages/Privacy';
import AboutPage from './pages/AboutPage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import './index.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/feedback" element={<CustomerFeedbackPage />} />
      <Route path="/feedback/:venueId" element={<CustomerFeedbackPage />} />
      <Route path="/dashboard/questions" element={<ManageQuestions />} />
      <Route path="/dashboard/tablefeedback" element={<TablesDashboard />} />
      <Route path="/dashboard/nps" element={<NPSScores />} />
      <Route path="/dashboard/settings" element={<SettingsPage />} />
      <Route path="/dashboard/feedbackfeed" element={<FeedbackFeed />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/features" element={<FeaturesPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/security" element={<SecurityPage />} />
      <Route path="/terms" element={<TermsAndConditionsPage />} />
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/demo" element={<DemoPage />} />
      <Route path="/features/qr-codes" element={<QRCodePage_Feature />} />
      <Route path="/features/nps-score" element={<NPS_Feature />} />
      <Route path="/features/real-time-stats" element={<RealTimeStats_Feature />} />
      <Route path="/features/custom-branding" element={<CustomBranding_Feature />} />
      <Route path="/features/custom-questions" element={<CustomQuestions_Feature />} />
      <Route path="/features/dashboards" element={<Dashboards_Feature />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
    </Routes>
  );
}

const AppWrapper = () => (
  <Router>
    <App />
    <Analytics />
  </Router>
);

export default AppWrapper;