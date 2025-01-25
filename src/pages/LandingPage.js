import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import HeroSection from '../components/landingpage/HeroSection';
import HowItWorksSection from '../components/landingpage/HowItWorksSection';
import FeaturesSection from '../components/landingpage/FeaturesSection';
import CallToActionSection from '../components/landingpage/CallToActionSection';
import DemoModal from '../components/landingpage/DemoModal';

const LandingPage = () => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  const openDemoModal = () => setIsDemoModalOpen(true);
  const closeDemoModal = () => setIsDemoModalOpen(false);

  useEffect(() => {
    if (isDemoModalOpen) {
      const script = document.createElement('script');
      script.src = 'https://static.hsappstatic.net/MeetingsEmbed/ex/MeetingsEmbedCode.js';
      script.async = true;
      document.body.appendChild(script);
      return () => document.body.removeChild(script);
    }
  }, [isDemoModalOpen]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <CallToActionSection openDemoModal={openDemoModal} />
      <Footer />
      <DemoModal isDemoModalOpen={isDemoModalOpen} closeDemoModal={closeDemoModal} />
    </div>
  );
};

export default LandingPage;