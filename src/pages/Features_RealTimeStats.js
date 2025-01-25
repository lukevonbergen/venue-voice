import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const RealTimeStatsPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <div className="relative pt-32 pb-16 sm:pt-40 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 space-y-3 tracking-tight">
              <span className="block">Real-Time</span>
              <span className="block bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Stats & Insights
              </span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
              Monitor customer feedback, track performance, and make data-driven decisions with real-time analytics.
            </p>
          </div>
        </div>
      </div>

      {/* Why Real-Time Stats Matter Section */}
      <div className="bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Real-Time Stats Matter</h2>
              <p className="text-gray-600 mb-4">
                In today’s fast-paced world, businesses need to act quickly to stay ahead. Real-time stats provide instant visibility into customer feedback, allowing you to:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-4">
                <li><strong>Identify Issues Immediately:</strong> Address customer concerns before they escalate.</li>
                <li><strong>Track Performance:</strong> Monitor key metrics like NPS, customer satisfaction, and feedback trends.</li>
                <li><strong>Make Data-Driven Decisions:</strong> Use live data to optimize operations and improve customer experience.</li>
              </ul>
              <p className="text-gray-600 mb-4">
                With Chatters, you can access real-time stats from anywhere, ensuring you’re always in the loop.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                alt="Real-Time Stats Dashboard"
                className="rounded-lg"
              />
              <p className="mt-4 text-sm text-gray-500 text-center">
                A real-time dashboard showing live customer feedback and performance metrics.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Key Features of Real-Time Stats</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              Chatters’ real-time stats dashboard provides everything you need to stay on top of customer feedback and performance. Here’s what you can expect:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Live Feedback Updates',
                  description: 'See customer feedback as it comes in, with no delays.',
                  icon: '📈',
                },
                {
                  title: 'Customizable Dashboards',
                  description: 'Tailor your dashboard to display the metrics that matter most to your venue.',
                  icon: '📊',
                },
                {
                  title: 'AI-Powered Insights',
                  description: 'Get actionable insights and recommendations based on real-time data.',
                  icon: '🤖',
                },
                {
                  title: 'Trend Analysis',
                  description: 'Track feedback trends over time to identify patterns and opportunities.',
                  icon: '📅',
                },
                {
                  title: 'Alerts & Notifications',
                  description: 'Receive instant alerts for critical issues or significant changes in feedback.',
                  icon: '🔔',
                },
                {
                  title: 'Multi-Platform Access',
                  description: 'Access your real-time stats from any device, anywhere.',
                  icon: '📱',
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="p-6 bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
                >
                  <div className="text-3xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">How Real-Time Stats Work</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              Chatters makes it easy to monitor real-time stats and take action. Here’s how it works:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Collect Feedback',
                  description: 'Customers provide feedback via QR codes, surveys, or in-app prompts.',
                  icon: '📋',
                },
                {
                  title: 'Analyze Data',
                  description: 'Chatters processes feedback instantly and updates your dashboard in real-time.',
                  icon: '📊',
                },
                {
                  title: 'Take Action',
                  description: 'Use live insights to address issues, improve service, and delight customers.',
                  icon: '✅',
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="p-6 bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
                >
                  <div className="text-3xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to See Real-Time Stats in Action?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              Start monitoring customer feedback and performance metrics in real-time with Chatters.
            </p>
            <Link
              to="/demo"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              Try Real-Time Stats Today
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RealTimeStatsPage;