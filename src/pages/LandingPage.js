import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, BarChart2, Users, Zap, Globe, Lock, MessageSquare, Menu, X, Bell, Clock, Star } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

// Define the images for the zig-zag section
const featureImages = [
  "https://images.pexels.com/photos/1058277/pexels-photo-1058277.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  "/img/lp-img-vv.png",
  "https://images.pexels.com/photos/7016364/pexels-photo-7016364.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
];

const LandingPage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [currentAlert, setCurrentAlert] = useState(0);

  const alerts = [
    { table: "14", issue: "How was the food?", time: "4/5" },
    { table: "23", issue: "How's the music", time: "5/5" },
    { table: "7", issue: "How is the service?", time: "4/5" }
  ];

  // Cycle through alerts
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentAlert((prev) => (prev + 1) % alerts.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
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

      {/* New Hero Section */}
      <section className="pt-32 bg-gray-50 sm:pt-40">
  <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
    <div className="max-w-2xl mx-auto text-center">
      <h1 className="px-6 text-lg text-gray-600 font-pj">Real-time customer feedback platform</h1>
      <p className="mt-5 text-4xl font-bold leading-tight text-gray-900 sm:leading-tight sm:text-5xl lg:text-6xl lg:leading-tight font-pj">
        <span className="relative inline-flex sm:inline">
          <span className="relative">Prevent Bad Reviews</span>
        </span>
        <span className="block">Before They Happen</span>
      </p>

      <div className="px-8 sm:items-center sm:justify-center sm:px-0 sm:space-x-5 sm:flex mt-9">
        <a
          href="/pricing"
          title=""
          className="inline-flex items-center justify-center w-full px-8 py-3 text-lg font-bold text-white transition-all duration-200 bg-gray-900 border-2 border-transparent sm:w-auto rounded-xl font-pj hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
          role="button"
        >
          Pricing
        </a>

        <a
          href="/demo"
          title=""
          className="inline-flex items-center justify-center w-full px-6 py-3 mt-4 text-lg font-bold text-gray-900 transition-all duration-200 border-2 border-gray-400 sm:w-auto sm:mt-0 rounded-xl font-pj focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 hover:bg-gray-900 focus:bg-gray-900 hover:text-white focus:text-white hover:border-gray-900 focus:border-gray-900"
          role="button"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 18 18" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M8.18003 13.4261C6.8586 14.3918 5 13.448 5 11.8113V5.43865C5 3.80198 6.8586 2.85821 8.18003 3.82387L12.5403 7.01022C13.6336 7.80916 13.6336 9.44084 12.5403 10.2398L8.18003 13.4261Z"
              strokeWidth="2"
              strokeMiterlimit="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Schedule a Demo
        </a>
      </div>

      <p className="mt-8 text-base text-gray-500 font-pj">Easy Setup · No Hardware</p>
    </div>
  </div>

  {/* Image Section */}
  <div className="relative pb-12">
    <div className="absolute inset-0 h-2/3 bg-gray-50"></div>
    <div className="relative mx-auto">
      <div className="lg:max-w-6xl lg:mx-auto">
        <img className="transform scale-110" src="/img/hero-product-img-new.png" alt="Chatters Dashboard Showing NPS Score Dashboard" />
      </div>
    </div>
  </div>
</section>

      {/* Dynamic Statistics Section */}
      <div className="bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Us?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              See how we make a difference
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { value: "73%", label: "Issues Prevented", desc: "Proactively resolve issues before they escalate." },
              { value: "89%", label: "Faster Response", desc: "Significantly improve response times to guest needs." },
              { value: "94%", label: "Guest Satisfaction", desc: "Achieve higher guest satisfaction and positive reviews." }
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
                <h3 className="text-4xl font-bold text-green-600 mb-2">{stat.value}</h3>
                <p className="text-xl font-semibold text-gray-900 mb-2">{stat.label}</p>
                <p className="text-gray-600">{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Turn feedback into instant action in three simple steps
            </p>
          </div>
          
          {/* Timeline Steps */}
          <div className="flex flex-col md:flex-row justify-between items-start mt-12 relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-24 left-0 right-0 h-1 bg-green-200 z-0"></div>
            
            {/* Steps */}
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
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
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
      </div>

      {/* Features Section with Zigzag Layout */}
      <div className="bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need to Succeed</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Powerful features designed specifically for hospitality teams
            </p>
          </div>

          {/* Zigzag Features */}
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
              desc: "Stay informed and aligned with real-time customer feedback and NPS scores. Empower your team to address concerns and improve guest satisfaction collaboratively.",
              stats: "54% reduction in service delays",
              icon: Users
            }
          ].map((feature, i) => (
            <div key={i} className={`flex flex-col ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center mb-24`}>
              {/* Feature Content */}
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
              
              {/* Feature Image/Demo */}
              <div className="flex-1 p-8">
                <img src={featureImages[i]} alt={feature.title} className="rounded-2xl aspect-video object-cover" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-3xl shadow-xl p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Delight More Guests?</h2>
            <p className="text-gray-200 max-w-2xl mx-auto mb-8">
              Join other hospitality teams who are using Chatters to prevent issues and maintain service excellence.
            </p>
            <button
              onClick={openDemoModal}
              className="px-8 py-3 text-base font-medium rounded-xl text-green-600 bg-white hover:bg-gray-50 transition-colors flex items-center space-x-2 mx-auto"
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