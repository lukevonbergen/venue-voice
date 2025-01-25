import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import HeroSection from '../components/landingpage/HeroSection';
import WhyChooseUsSection from '../components/landingpage/WhyChooseUsSection';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50 relative">
      <Navbar />
      <HeroSection />
      <WhyChooseUsSection />
      <HowItWorksSection />
      <FeaturesSection />
      <CallToActionSection openDemoModal={openDemoModal} />
      <Footer />
      <DemoModal isDemoModalOpen={isDemoModalOpen} closeDemoModal={closeDemoModal} />
    </div>
  );
};

export default LandingPage;