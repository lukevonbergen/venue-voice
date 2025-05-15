import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/react";
import LandingPage from './pages/LandingPage';
import 'antd/dist/reset.css';
import DashboardPage from './pages/Dashboard';
import CustomerFeedbackPage from './pages/CustomerFeedback';
import SignUpPage from './pages/SignUp';
import ManageQuestions from './pages/ManageQuestions';
import Heatmap from './pages/Heatmap';
import TablesDashboard from './pages/Dashboard_Tables';
import SettingsPage from './pages/SettingsPage';
import TemplatesPage from './pages/QRTemplates';
import ReportsPage from './pages/ReportsPage';
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
import Settings_Staff from './pages/settings_staff';
import ContactPage from './pages/ContactPage';
import SecurityPage from './pages/SecurityPage';
import TermsAndConditionsPage from './pages/Terms';
import PrivacyPolicyPage from './pages/Privacy';
import AboutPage from './pages/AboutPage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import './index.css';

import { VenueProvider } from './context/VenueContext';
import DashboardFrame from './pages/DashboardFrame';

function App() {
  useEffect(() => {
    const hubspotScript = document.createElement('script');
    hubspotScript.src = '//js.hs-scripts.com/48822376.js';
    hubspotScript.async = true;
    hubspotScript.defer = true;
    hubspotScript.id = 'hs-script-loader';
    document.body.appendChild(hubspotScript);
    return () => {
      document.body.removeChild(hubspotScript);
    };
  }, []);

  useEffect(() => {
    const gtagScript = document.createElement('script');
    gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-QQHE0F4NQR';
    gtagScript.async = true;
    document.head.appendChild(gtagScript);
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    gtag('js', new Date());
    gtag('config', 'G-QQHE0F4NQR');
    return () => {
      document.head.removeChild(gtagScript);
    };
  }, []);

  return (
    <Routes>
      {/* 🌍 Public Pages */}
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

      {/* 🔐 Dashboard Pages (inside VenueProvider + DashboardFrame) */}
      <Route
        path="/dashboard"
        element={
          <VenueProvider>
            <DashboardFrame>
              <DashboardPage />
            </DashboardFrame>
          </VenueProvider>
        }
      />
      <Route
        path="/dashboard/questions"
        element={
          <VenueProvider>
            <DashboardFrame>
              <ManageQuestions />
            </DashboardFrame>
          </VenueProvider>
        }
      />
      <Route
        path="/dashboard/tablefeedback"
        element={
          <VenueProvider>
            <DashboardFrame>
              <TablesDashboard />
            </DashboardFrame>
          </VenueProvider>
        }
      />
      <Route
        path="/dashboard/reports"
        element={
          <VenueProvider>
            <DashboardFrame>
              <ReportsPage />
            </DashboardFrame>
          </VenueProvider>
        }
      />
      <Route
        path="/dashboard/settings"
        element={
          <VenueProvider>
            <DashboardFrame>
              <SettingsPage />
            </DashboardFrame>
          </VenueProvider>
        }
      />
      <Route
        path="/dashboard/settings/staff"
        element={
          <VenueProvider>
            <DashboardFrame>
              <Settings_Staff />
            </DashboardFrame>
          </VenueProvider>
        }
      />
      <Route
        path="/dashboard/templates"
        element={
          <VenueProvider>
            <DashboardFrame>
              <TemplatesPage />
            </DashboardFrame>
          </VenueProvider>
        }
      />
      <Route
        path="/dashboard/feedbackfeed"
        element={
          <VenueProvider>
            <DashboardFrame>
              <FeedbackFeed />
            </DashboardFrame>
          </VenueProvider>
        }
      />
      <Route
        path="/dashboard/heatmap"
        element={
          <VenueProvider>
            <DashboardFrame>
              <Heatmap />
            </DashboardFrame>
          </VenueProvider>
        }
      />
    </Routes>
  );
}

const AppWrapper = () => (
  <Router>
    <App />
    <Analytics />
    <SpeedInsights />
  </Router>
);

export default AppWrapper;