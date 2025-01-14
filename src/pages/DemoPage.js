import React, { useState, useEffect } from 'react';
import { ArrowRight, Check, Zap, Users, BarChart2, Globe, Lock, MessageSquare } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

const DemoPage = () => {
  const [isHubSpotLoaded, setIsHubSpotLoaded] = useState(false);

  // Load the HubSpot meeting embed script dynamically
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://static.hsappstatic.net/MeetingsEmbed/ex/MeetingsEmbedCode.js';
    script.async = true;
    document.body.appendChild(script);
    setIsHubSpotLoaded(true);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50 relative">

      {/* Use the Navbar component */}
      <Navbar />

      {/* Hero Section with Side-by-Side Layout */}
      <div className="relative pt-32 pb-16 sm:pt-40 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side: Product Info */}
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 space-y-3 tracking-tight">
                <span className="block">See How Chatters Can</span>
                <span className="block bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Transform Your Business
                </span>
              </h1>
              <p className="text-xl text-gray-600">
                Discover how Chatters can help you turn customer feedback into actionable insights, automate collection, and make data-driven decisions in real-time.
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>No commitment required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Personalized demo</span>
                </div>
              </div>
            </div>

            {/* Right Side: HubSpot Embed */}
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <div className="meetings-iframe-container" data-src="https://meetings.hubspot.com/luke-von-bergen/chatters-demo?embed=true"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Chatters?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Chatters is designed to help you understand your customers better and make data-driven decisions that drive growth.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Real-time Feedback',
                desc: 'Get instant feedback from your customers and see trends as they happen.',
                icon: Zap
              },
              {
                title: 'AI-Powered Insights',
                desc: 'Leverage AI to uncover actionable insights and improve customer experience.',
                icon: BarChart2
              },
              {
                title: 'Easy Integration',
                desc: 'Seamlessly integrate with your existing tools and workflows.',
                icon: Globe
              },
              {
                title: 'Customizable Surveys',
                desc: 'Create surveys that match your brand and gather the data you need.',
                icon: MessageSquare
              },
              {
                title: 'Team Collaboration',
                desc: 'Share insights and collaborate with your team to drive improvements.',
                icon: Users
              },
              {
                title: 'Enterprise Security',
                desc: 'Rest easy knowing your data is secure with SOC 2 Type II compliance.',
                icon: Lock
              }
            ].map((benefit, i) => (
              <div key={i} className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
                <div className="relative p-6 bg-white rounded-2xl border border-gray-100">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-50">
                      <benefit.icon className="h-5 w-5 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{benefit.title}</h3>
                  </div>
                  <p className="text-gray-600">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default DemoPage;