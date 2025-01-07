import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, BarChart2, Users, Zap, Globe, Lock, MessageSquare, Menu, X } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

const LandingPage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50 relative">

      {/* Use the Navbar component */}
      <Navbar />

      {/* Rest of the Landing Page Content */}
      {/* Hero Section */}
      <div className="relative pt-32 pb-16 sm:pt-40 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-8 inline-flex items-center space-x-2 bg-white/50 px-4 py-1 rounded-full border border-emerald-100">
              <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">Coming soon</span>
              <span className="text-sm text-gray-600">AI-powered feedback analysis</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 space-y-3 tracking-tight">
              <span className="block">Customer Feedback that</span>
              <span className="block bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Drives Growth
              </span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
              Turn customer feedback into actionable insights. Automate collection, 
              analyse sentiment, and make data-driven decisions in real-time.
            </p>
            <div className="mt-8 flex justify-center space-x-4">
              <Link to="/demo"
                className="px-8 py-3 text-base font-medium rounded-xl text-white bg-green-600 hover:bg-green-700 transition-colors flex items-center space-x-2">
                <span>Book a demo</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="/pricing" 
                className="px-8 py-3 text-base font-medium rounded-xl text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors flex items-center space-x-2">
                <span>Pricing</span>
                <div className="h-5 w-5 rounded-full bg-green-600 flex items-center justify-center">
                  <ArrowRight className="h-3 w-3 text-white" />
                </div>
              </a>
            </div>
            <div className="mt-8 flex justify-center items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Quick setup</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Instant feedback</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Screenshot Section */}
      <div className="bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Feedback, Visualised</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              See how Chatters transforms raw feedback into actionable insights with beautiful, easy-to-understand dashboards.
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need to Succeed</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Powerful features that help you collect, analyse, and act on customer feedback efficiently.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'QR Code Integration',
                desc: 'Generate custom QR codes for instant feedback collection at your venue',
                icon: Globe
              },
              {
                title: 'Real-time Analytics',
                desc: 'Track customer satisfaction metrics and identify trends as they happen',
                icon: BarChart2
              },
              {
                title: 'Smart AI Insights',
                desc: 'AI-powered recommendations to improve customer experience',
                icon: Zap
              },
              {
                title: 'Custom Forms',
                desc: 'Create tailored surveys that match your business needs',
                icon: MessageSquare
              },
              {
                title: 'Team Collaboration',
                desc: 'Share insights and coordinate responses across your team',
                icon: Users
              },
              {
                title: 'Enterprise Security',
                desc: 'Bank-grade security with SOC 2 Type II compliance',
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">See Chatters in Action</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Book a demo with our team and discover how Chatters can transform your customer feedback process.
            </p>
          </div>
          <div className="bg-white rounded-3xl p-8 shadow-xl max-w-2xl mx-auto">
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <button
                type="submit"
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Schedule a Demo
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;