import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      {/* Floating Navbar */}
      <nav className="fixed w-full top-0 z-50">
        <div className="backdrop-blur-md bg-white/30 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex-shrink-0">
                <span className="text-white font-bold text-xl">FeedbackFlow</span>
              </div>
              <div>
                <Link
                  to="/signin"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-16 sm:pt-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
              <span className="block">Collect Real-Time Feedback</span>
              <span className="block text-blue-400">From Your Customers</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-300 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Simple, powerful feedback collection for your venue. Get instant insights and improve customer satisfaction.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-lg shadow">
                <Link
                  to="/signup"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 transition-colors duration-200"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* QR Code Feature */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg blur opacity-50 group-hover:opacity-75 transition duration-200"></div>
            <div className="relative p-6 bg-black/40 backdrop-blur-lg rounded-lg">
              <h3 className="text-lg font-medium text-white mb-2">QR Code Feedback</h3>
              <p className="text-gray-300">
                Generate unique QR codes for instant customer feedback at your venue.
              </p>
            </div>
          </div>

          {/* Real-time Analytics */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg blur opacity-50 group-hover:opacity-75 transition duration-200"></div>
            <div className="relative p-6 bg-black/40 backdrop-blur-lg rounded-lg">
              <h3 className="text-lg font-medium text-white mb-2">Real-time Analytics</h3>
              <p className="text-gray-300">
                Monitor feedback trends and customer satisfaction in real-time.
              </p>
            </div>
          </div>

          {/* Customizable Surveys */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg blur opacity-50 group-hover:opacity-75 transition duration-200"></div>
            <div className="relative p-6 bg-black/40 backdrop-blur-lg rounded-lg">
              <h3 className="text-lg font-medium text-white mb-2">Customizable Surveys</h3>
              <p className="text-gray-300">
                Create and manage custom questions tailored to your business needs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;