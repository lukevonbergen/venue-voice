import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const AboutUsPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <div className="relative pt-32 pb-16 sm:pt-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 space-y-3 tracking-tight">
              <span className="block">About</span>
              <span className="block bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Chatters
              </span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
              Real-time table feedback that helps venues solve problems before they become public reviews.
            </p>
          </div>
        </div>
      </div>

      {/* The Story Section */}
      <div className="bg-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Chatters Exists</h2>
              <p className="text-gray-600 mb-4">
                Chatters started with one problem: venues getting hit with bad reviews when it's already too late to do anything about it. We saw pubs losing revenue, comping meals, and suffering reputational damage—*not because they didn’t care, but because they didn’t know something was wrong in the moment*.
              </p>
              <p className="text-gray-600 mb-4">
                So we built a simple system: QR codes on tables that let guests give feedback instantly. If something's off, staff are alerted right away. It’s feedback while the guest is still sitting at the table—not after they’ve gone online.
              </p>
              <p className="text-gray-600 mb-4">
                Chatters is designed to prevent bad reviews, recover unhappy guests, and make teams more responsive without adding more complexity.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <img
                src="https://images.unsplash.com/photo-1552566626-52f8b828add9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                alt="Local Pub"
                className="rounded-lg"
              />
              <p className="mt-4 text-sm text-gray-500 text-center">
                The original inspiration: a pub, a delayed review, and a missed opportunity.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* The Solution Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">What We Do</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              Chatters helps hospitality venues take control of their guest experience in real time—no waiting, no guesswork, just honest feedback that drives better service.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Table QR Feedback',
                  description: 'Let guests scan a code and give feedback in seconds—while they’re still seated.',
                  icon: '📱',
                },
                {
                  title: 'Live Alerts',
                  description: 'Staff get notified the moment something goes wrong, so they can act fast.',
                  icon: '🚨',
                },
                {
                  title: 'Review Protection',
                  description: 'Catch problems before they become 1-star reviews online.',
                  icon: '🛡️',
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="p-6 bg-slate-50 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
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

      {/* Mission and Vision Section */}
      <div className="bg-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Why We Care</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              Our mission is simple: help great venues avoid bad reviews. We want every pub, bar, and restaurant to feel more in control, more connected to their guests, and more confident that small issues won’t become big ones.
            </p>
            <Link
              to="/demo"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              Book a Demo
            </Link>
          </div>
        </div>
      </div>

      <div className="text-center mt-12">
  <button
    onClick={() => { throw new Error("This is a test error for Sentry."); }}
    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
  >
    Trigger Sentry Test Error
  </button>
</div>

      <Footer />
    </div>
  );
};

export default AboutUsPage;
