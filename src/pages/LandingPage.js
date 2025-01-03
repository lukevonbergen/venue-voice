import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
      {/* Floating Navbar */}
      <nav className="fixed w-full top-4 z-50 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/95 rounded-2xl shadow-lg backdrop-blur-sm">
            <div className="px-6 py-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg"></div>
                  <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    FeedbackFlow
                  </span>
                </div>
                <div className="flex items-center space-x-6">
                  <Link to="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
                  <Link to="/features" className="text-gray-600 hover:text-gray-900">Features</Link>
                  <Link to="/signin" className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
                    Sign In
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-16 sm:pt-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-extrabold text-white space-y-3">
              <span className="block">Transform Customer Feedback</span>
              <span className="block text-purple-200">Into Business Growth</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-purple-100">
              Real-time customer insights that help you make better business decisions. 
              Simple to set up, powerful to use.
            </p>
            <div className="mt-8 flex justify-center space-x-4">
              <Link to="/signup" 
                className="px-8 py-3 text-base font-medium rounded-xl text-purple-700 bg-white hover:bg-purple-50 transition-colors">
                Start Free Trial
              </Link>
              <a href="#demo" 
                className="px-8 py-3 text-base font-medium rounded-xl text-white border-2 border-white/20 hover:bg-white/10 transition-colors">
                Watch Demo
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { stat: '93%', desc: 'Customer Satisfaction' },
              { stat: '2.5x', desc: 'Revenue Growth' },
              { stat: '10min', desc: 'Setup Time' },
            ].map((item, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center">
                <div className="text-4xl font-bold text-white mb-2">{item.stat}</div>
                <div className="text-purple-200">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Everything you need to succeed</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: 'QR Code Integration',
              desc: 'Generate custom QR codes for instant feedback collection at your venue'
            },
            {
              title: 'Real-time Analytics',
              desc: 'Track customer satisfaction metrics and identify trends as they happen'
            },
            {
              title: 'Smart Insights',
              desc: 'AI-powered recommendations to improve customer experience'
            },
            {
              title: 'Custom Questions',
              desc: 'Create tailored surveys that match your business needs'
            },
            {
              title: 'Team Collaboration',
              desc: 'Share insights and coordinate responses across your team'
            },
            {
              title: 'Integration Ready',
              desc: 'Connect with your existing tools through our powerful API'
            }
          ].map((feature, i) => (
            <div key={i} className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-50 group-hover:opacity-75 transition duration-200"></div>
              <div className="relative p-6 bg-black/30 backdrop-blur-sm rounded-2xl">
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-purple-100">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white">Trusted by Industry Leaders</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              quote: "FeedbackFlow transformed how we understand our customers. It's been invaluable for our growth.",
              author: "Sarah Johnson",
              role: "Restaurant Owner"
            },
            {
              quote: "The real-time insights helped us improve our service quality by 40% in just two months.",
              author: "Michael Chen",
              role: "Hotel Manager"
            },
            {
              quote: "Setup was incredibly easy and the results were immediate. Exactly what we needed.",
              author: "Emma Davis",
              role: "Café Owner"
            }
          ].map((testimonial, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
              <p className="text-purple-100 mb-4">"{testimonial.quote}"</p>
              <div className="text-white font-semibold">{testimonial.author}</div>
              <div className="text-purple-200 text-sm">{testimonial.role}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-purple-600/90 to-pink-600/90 rounded-3xl p-12 text-center backdrop-blur-sm">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to get started?</h2>
          <p className="text-purple-100 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses using FeedbackFlow to improve customer satisfaction and drive growth.
          </p>
          <Link to="/signup" 
            className="inline-block px-8 py-3 text-base font-medium rounded-xl bg-white text-purple-700 hover:bg-purple-50 transition-colors">
            Start Your Free Trial
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;