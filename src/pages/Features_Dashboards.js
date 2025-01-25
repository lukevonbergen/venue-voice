import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const DashboardsPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <div className="relative pt-32 pb-16 sm:pt-40 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 space-y-3 tracking-tight">
              <span className="block">Powerful</span>
              <span className="block bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Dashboards
              </span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
              Monitor customer feedback, track performance, and make data-driven decisions with Chatters’ customizable dashboards.
            </p>
          </div>
        </div>
      </div>

      {/* Why Dashboards Matter Section */}
      <div className="bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Dashboards Matter</h2>
              <p className="text-gray-600 mb-4">
                In today’s data-driven world, having access to real-time insights is crucial for business success. Chatters’ dashboards provide a centralized hub for:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-4">
                <li><strong>Tracking Key Metrics:</strong> Monitor NPS, customer satisfaction, feedback trends, and more.</li>
                <li><strong>Identifying Issues:</strong> Spot negative trends or recurring problems before they escalate.</li>
                <li><strong>Making Informed Decisions:</strong> Use actionable insights to improve operations and customer experience.</li>
              </ul>
              <p className="text-gray-600 mb-4">
                With Chatters’ dashboards, you can stay on top of your venue’s performance and make data-driven decisions with confidence.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                alt="Dashboard Example"
                className="rounded-lg"
              />
              <p className="mt-4 text-sm text-gray-500 text-center">
                A customizable dashboard showing real-time customer feedback and performance metrics.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Key Features of Chatters’ Dashboards</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              Chatters’ dashboards are designed to give you the insights you need to grow your business. Here’s what you can expect:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Real-Time Data',
                  description: 'See customer feedback and performance metrics updated in real-time.',
                  icon: '📈',
                },
                {
                  title: 'Customizable Views',
                  description: 'Tailor your dashboard to display the metrics that matter most to your venue.',
                  icon: '🛠️',
                },
                {
                  title: 'AI-Powered Insights',
                  description: 'Get actionable recommendations based on your data.',
                  icon: '🤖',
                },
                {
                  title: 'Trend Analysis',
                  description: 'Track feedback trends over time to identify patterns and opportunities.',
                  icon: '📅',
                },
                {
                  title: 'Multi-Platform Access',
                  description: 'Access your dashboards from any device, anywhere.',
                  icon: '📱',
                },
                {
                  title: 'Exportable Reports',
                  description: 'Download detailed reports for presentations or further analysis.',
                  icon: '📄',
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
            <h2 className="text-3xl font-bold text-gray-900 mb-6">How Dashboards Work</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              Chatters makes it easy to monitor and analyze customer feedback with powerful dashboards. Here’s how it works:
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
                  description: 'Chatters processes feedback and updates your dashboard in real-time.',
                  icon: '📊',
                },
                {
                  title: 'Take Action',
                  description: 'Use insights to address issues, improve service, and delight customers.',
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
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to Explore Chatters’ Dashboards?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              Start monitoring customer feedback and performance metrics with Chatters’ powerful dashboards.
            </p>
            <Link
              to="/demo"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              Try Dashboards Today
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DashboardsPage;