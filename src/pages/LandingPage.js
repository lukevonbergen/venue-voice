import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, BarChart2, Users, Zap, Globe, Lock, MessageSquare, Menu, X, Bell, Clock, Star } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

const LandingPage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [currentAlert, setCurrentAlert] = useState(0);
  const [isVisible, setIsVisible] = useState({});

  // Enhanced alerts with more realistic scenarios
  const alerts = [
    { table: "14", issue: "Waiting for drinks - 12 mins", time: "2/5", urgent: true },
    { table: "23", issue: "Food temperature concern", time: "3/5", urgent: true },
    { table: "7", issue: "Celebrating anniversary!", time: "5/5", urgent: false },
    { table: "19", issue: "Ready for bill - 8 mins", time: "3/5", urgent: true }
  ];

  // Statistics counter animation
  const [stats, setStats] = useState({
    issuesPrevented: 0,
    responseTime: 0,
    satisfaction: 0
  });

  const finalStats = {
    issuesPrevented: 73,
    responseTime: 89,
    satisfaction: 94
  };

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({...prev, [entry.target.id]: true}));
            
            if (entry.target.id === 'stats-section') {
              const duration = 2000;
              const steps = 50;
              const increment = {
                issuesPrevented: finalStats.issuesPrevented / steps,
                responseTime: finalStats.responseTime / steps,
                satisfaction: finalStats.satisfaction / steps
              };
              
              let currentStep = 0;
              const interval = setInterval(() => {
                if (currentStep < steps) {
                  setStats(prev => ({
                    issuesPrevented: Math.min(Math.round(prev.issuesPrevented + increment.issuesPrevented), finalStats.issuesPrevented),
                    responseTime: Math.min(Math.round(prev.responseTime + increment.responseTime), finalStats.responseTime),
                    satisfaction: Math.min(Math.round(prev.satisfaction + increment.satisfaction), finalStats.satisfaction)
                  }));
                  currentStep++;
                } else {
                  clearInterval(interval);
                }
              }, duration / steps);
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('section').forEach((section) => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  // Alert rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentAlert((prev) => (prev + 1) % alerts.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const openDemoModal = () => setIsDemoModalOpen(true);
  const closeDemoModal = () => setIsDemoModalOpen(false);

  // HubSpot meetings widget
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

      {/* Hero Section */}
      <section id="hero" className="relative pt-32 pb-16 sm:pt-40 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Live Alert Demo */}
            <div className={`mb-8 inline-flex items-center space-x-2 bg-white shadow-lg px-6 py-3 rounded-full border ${
              alerts[currentAlert].urgent ? 'border-red-200 animate-pulse' : 'border-emerald-100'
            }`}>
              <Bell className={`h-5 w-5 ${alerts[currentAlert].urgent ? 'text-red-600' : 'text-green-600'}`} />
              <span className="text-sm text-gray-600">
                Table {alerts[currentAlert].table}: {alerts[currentAlert].issue}
                <span className={`ml-2 ${alerts[currentAlert].urgent ? 'text-red-600' : 'text-green-600'}`}>
                  •  {alerts[currentAlert].time}
                </span>
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 space-y-3 tracking-tight opacity-0 animate-fade-in">
              <span className="block">Prevent Bad Reviews</span>
              <span className="block bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Before They Happen
              </span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
              Give your team real-time alerts when guests need attention. 
              Resolve issues instantly, and turn potential complaints into positive experiences.
            </p>

            {/* Statistics Section */}
            <section id="stats-section" className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform">
                <div className="text-3xl font-bold text-green-600">{stats.issuesPrevented}%</div>
                <div className="text-gray-600">Issues Prevented</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform">
                <div className="text-3xl font-bold text-green-600">{stats.responseTime}%</div>
                <div className="text-gray-600">Faster Response</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform">
                <div className="text-3xl font-bold text-green-600">{stats.satisfaction}%</div>
                <div className="text-gray-600">Guest Satisfaction</div>
              </div>
            </section>

            {/* CTA Buttons */}
            <div className="mt-12 flex justify-center space-x-4">
              <button
                onClick={openDemoModal}
                className="px-8 py-3 text-base font-medium rounded-xl text-white bg-green-600 hover:bg-green-700 transition-all transform hover:scale-105 flex items-center space-x-2"
              >
                <span>Book a demo</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <a href="/pricing" 
                className="px-8 py-3 text-base font-medium rounded-xl text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-all transform hover:scale-105 flex items-center space-x-2">
                <span>View pricing</span>
                <div className="h-5 w-5 rounded-full bg-green-600 flex items-center justify-center">
                  <ArrowRight className="h-3 w-3 text-white" />
                </div>
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="mt-8 flex justify-center items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>5-minute setup</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>No hardware needed</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Works instantly</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Turn feedback into instant action in three simple steps
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start mt-12 relative">
            <div className="hidden md:block absolute top-24 left-0 right-0 h-1 bg-green-200 z-0"></div>
            
            {[
              {
                icon: Globe,
                title: "Guest Scans QR",
                desc: "Strategically placed QR codes make it easy for guests to share feedback"
              },
              {
                icon: MessageSquare,
                title: "Instant Alert",
                desc: "Your team gets notified immediately when attention is needed"
              },
              {
                icon: Check,
                title: "Swift Resolution",
                desc: "Address concerns before they become negative reviews"
              }
            ].map((step, i) => (
              <div key={i} className="flex-1 relative z-10 px-4 mb-8 md:mb-0">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 transform hover:scale-105 transition-transform">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <step.icon className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need to Succeed</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Powerful features designed specifically for hospitality teams
            </p>
          </div>

          {[
            {
              title: "Real-time Issue Alerts",
              desc: "Get instant notifications when guests need attention. Resolve concerns before they escalate into complaints.",
              stats: "73% of potential negative reviews prevented",
              icon: Bell
            },
            {
              title: "Smart Performance Analytics",
              desc: "Track service quality trends and identify improvement opportunities with intuitive dashboards.",
              stats: "89% improvement in response time",
              icon: BarChart2
            },
            {
              title: "Team Insights & Feedback Alignment",
              desc: "Stay informed and aligned with real-time customer feedback and NPS scores.",
              stats: "54% reduction in service delays",
              icon: Users
            }
          ].map((feature, i) => (
            <div key={i} className={`flex flex-col ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center mb-24 transform hover:scale-105 transition-transform`}>
              <div className="flex-1 p-8">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-50">
                    <feature.icon className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{feature.title}</h3>
                </div>
                <p className="text-gray-600 text-lg mb-4">{feature.desc}</p>
                <div className="inline-flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-full">
                  <Star className="h-4 w-4 text-green-600" />
                  <span className="text-green-800 font-medium">{feature.stats}</span>
                </div>
              </div>
              
              <div className="flex-1 p-8">
                <div className="bg-gray-100 rounded-2xl aspect-video"></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Section */}
      <section id="cta" className="bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 text-center transform hover:scale-105 transition-transform">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Delight More Guests?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              Join other hospitality teams who are using Chatters to prevent issues and maintain service excellence.
            </p>
            <button
              onClick={openDemoModal}
              className="px-8 py-3 text-base font-medium rounded-xl text-white bg-green-600 hover:bg-green-700 transition-colors flex items-center space-x-2 mx-auto transform hover:scale-105 transition-transform"
            >
              <span>Book your demo</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

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