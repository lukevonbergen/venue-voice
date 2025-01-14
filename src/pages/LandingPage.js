import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, BarChart2, Users, Zap, Globe, Lock, MessageSquare, Menu, X } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

const LandingPage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const openDemoModal = () => {
    setIsDemoModalOpen(true);
  };

  const closeDemoModal = () => {
    setIsDemoModalOpen(false);
  };

  useEffect(() => {
    if (isDemoModalOpen) {
      const script = document.createElement('script');
      script.src = 'https://static.hsappstatic.net/MeetingsEmbed/ex/MeetingsEmbedCode.js';
      script.async = true;
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }
  }, [isDemoModalOpen]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50 relative">
      <Navbar />

      {/* Hero Section */}
      <div className="relative pt-32 pb-16 sm:pt-40 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-8 inline-flex items-center space-x-2 bg-white/50 px-4 py-1 rounded-full border border-emerald-100">
              <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">New</span>
              <span className="text-sm text-gray-600">Real-time issue resolution</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 space-y-3 tracking-tight">
              <span className="block">Turn Guest Feedback Into</span>
              <span className="block bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Immediate Action
              </span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
              Stop issues before they spread. Get instant alerts when guests need attention, 
              and empower your team to deliver exceptional experiences in real-time.
            </p>
            <div className="mt-8 flex justify-center space-x-4">
              <button
                onClick={openDemoModal}
                className="px-8 py-3 text-base font-medium rounded-xl text-white bg-green-600 hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <span>See it in action</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <a href="/pricing" 
                className="px-8 py-3 text-base font-medium rounded-xl text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors flex items-center space-x-2">
                <span>View pricing</span>
                <div className="h-5 w-5 rounded-full bg-green-600 flex items-center justify-center">
                  <ArrowRight className="h-3 w-3 text-white" />
                </div>
              </a>
            </div>
            <div className="mt-8 flex justify-center items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>5-minute setup</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Real-time alerts</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>No long-term contract</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Screenshot Section */}
      <div className="bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Venue's Pulse, At a Glance</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Monitor guest satisfaction in real-time with intuitive dashboards that highlight what needs your attention now.
            </p>
          </div>
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <img
              src="/img/lp-img-vv.png"
              alt="Chatters Dashboard"
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>

      {/* Features Tiles Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Built for Operations Teams</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Every feature is designed to help you maintain service excellence and prevent issues from escalating.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Instant Feedback Collection',
                desc: 'Strategic QR code placement lets guests share concerns the moment they arise',
                icon: Globe
              },
              {
                title: 'Live Performance Tracking',
                desc: 'Monitor service quality across all areas of your venue as it happens',
                icon: BarChart2
              },
              {
                title: 'Smart Issue Detection',
                desc: 'AI-powered alerts help you spot and address problems before they spread',
                icon: Zap
              },
              {
                title: 'Customisable Surveys',
                desc: 'Get exactly the insights you need with tailored feedback forms',
                icon: MessageSquare
              },
              {
                title: 'Team Coordination',
                desc: 'Keep everyone aligned with instant alerts and clear action items',
                icon: Users
              },
              {
                title: 'Enterprise-Grade Security',
                desc: 'Your data is protected with SOC 2 Type II certified security',
                icon: Lock
              }
            ].map((feature, i) => (
              <div key={i} className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
                <div className="relative p-6 bg-white rounded-2xl border border-gray-100">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-50">
                      <feature.icon className="h-5 w-5 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                  </div>
                  <p className="text-gray-600">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Book a Demo Section */}
      <div className="bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Take Control?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join other operations teams who are using Chatters to maintain service excellence and prevent guest dissatisfaction.
            </p>
          </div>
          <div className="flex justify-center">
            <button
              onClick={openDemoModal}
              className="px-8 py-3 text-base font-medium rounded-xl text-white bg-green-600 hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <span>Book your demo</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <Footer />

      {/* Demo Modal */}
      {isDemoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-4xl relative">
            <button
              onClick={closeDemoModal}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="h-6 w-6 text-gray-600" />
            </button>
            <div className="p-8">
              <div
                className="meetings-iframe-container"
                data-src="https://meetings.hubspot.com/luke-von-bergen/chatters-demo?embed=true"
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;