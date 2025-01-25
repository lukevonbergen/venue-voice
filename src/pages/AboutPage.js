import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const AboutUsPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <div className="relative pt-32 pb-16 sm:pt-40 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 space-y-3 tracking-tight">
              <span className="block">About</span>
              <span className="block bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Chatters
              </span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
              Our story begins with a local pub, delayed feedback, and a mission to help businesses thrive.
            </p>
          </div>
        </div>
      </div>

      {/* The Story Section */}
      <div className="bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">The Story Behind Chatters</h2>
              <p className="text-gray-600 mb-4">
                It all started with Luke, the founder of Chatters, and his local pub. The pub relied on <strong>Google Reviews</strong> to gather customer feedback, but there was a problem: the reviews came in <strong>weeks later</strong>, long after the customers had left.
              </p>
              <p className="text-gray-600 mb-4">
                By the time the feedback was received, it was too late to address the issues. Negative reviews piled up online, and the pub had to compensate unhappy customers with <strong>free drinks, meals, and discounts</strong>. This was not only costly but also damaging to their reputation.
              </p>
              <p className="text-gray-600 mb-4">
                Luke realised that businesses needed a way to collect and act on feedback <strong>in real-time</strong>. This led to the creation of Chatters—a platform designed to help businesses turn customer feedback into actionable insights instantly.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <img
                src="https://images.unsplash.com/photo-1552566626-52f8b828add9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                alt="Local Pub"
                className="rounded-lg"
              />
              <p className="mt-4 text-sm text-gray-500 text-center">
                A local pub struggling with delayed feedback—the inspiration behind Chatters.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* The Solution Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">The Solution: Real-Time Feedback</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              Chatters empowers businesses to collect, analyse, and act on customer feedback in real-time. No more waiting for weeks—address issues immediately and improve customer satisfaction.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Instant Feedback',
                  description: 'Collect feedback instantly with QR codes and custom forms.',
                  icon: '⏱️',
                },
                {
                  title: 'Actionable Insights',
                  description: 'AI-powered insights help you make data-driven decisions.',
                  icon: '📊',
                },
                {
                  title: 'Cost Savings',
                  description: 'Prevent negative reviews and reduce compensation costs.',
                  icon: '💰',
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

      {/* Mission and Vision Section */}
      <div className="bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission and Vision</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              At Chatters, our mission is to help businesses improve customer experience through real-time feedback and actionable insights. We envision a world where every business can thrive by listening to their customers.
            </p>
            <Link
              to="/demo"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              Try Chatters Today
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AboutUsPage;
