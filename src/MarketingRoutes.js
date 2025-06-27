import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { supabase } from './utils/supabase';
import { toast } from 'react-hot-toast';

// Import all your marketing pages
import LandingPage from './pages/LandingPage';
import PricingPage from './pages/Pricing';
import FeaturesPage from './pages/Features';
import ContactPage from './pages/ContactPage';
import SecurityPage from './pages/SecurityPage';
import TermsAndConditionsPage from './pages/Terms';
import PrivacyPolicyPage from './pages/Privacy';
import AboutPage from './pages/AboutPage';
import DemoPage from './pages/DemoPage';
import QRCodePage_Feature from './pages/Features_QRCode';
import NPS_Feature from './pages/Features_NPSScore';
import RealTimeStats_Feature from './pages/Features_RealTimeStats';
import CustomBranding_Feature from './pages/Features_CustomBranding';
import CustomQuestions_Feature from './pages/Features_CustomQuestions';
import Dashboards_Feature from './pages/Features_Dashboards';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import SignInPage from './pages/SignIn';
import SignUpPage from './pages/SignUp';
import CustomerFeedbackPage from './pages/CustomerFeedback';

const MarketingRoutes = () => {
  const location = useLocation();

  useEffect(() => {
    const handleAuthRedirect = async () => {
      if (window.location.hash.includes('access_token')) {
        await supabase.auth.getSessionFromUrl({ storeSession: true });

        const isSignup = window.location.hash.includes('type=signup');
        const isRecovery = window.location.hash.includes('type=recovery');

        if (isSignup) {
          toast.success('Account confirmed! Welcome aboard.');
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 1000);
        } else if (isRecovery) {
          window.location.href = '/reset-password';
        }
      }
    };
    handleAuthRedirect();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
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
      <Route path="/feedback" element={<CustomerFeedbackPage />} />
      <Route path="/feedback/:venueId" element={<CustomerFeedbackPage />} />
    </Routes>
  );
};

export default MarketingRoutes;