import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Zap, Users, Globe, Lock, MessageSquare, BarChart2, Mail, Settings, Shield } from 'lucide-react';
import Navbar from './Navbar'; // Import the Navbar component

const FeaturesPage = () => {
  const features = [
    {
      title: 'QR Code Integration',
      description: 'Generate custom QR codes for instant feedback collection at your venue.',
      icon: Globe,
    },
    {
      title: 'Real-time Analytics',
      description: 'Track customer satisfaction metrics and identify trends as they happen.',
      icon: BarChart2,
    },
    {
      title: 'Smart AI Insights',
      description: 'AI-powered recommendations to improve customer experience.',
      icon: Zap,
    },
    {
      title: 'Custom Forms',
      description: 'Create tailored surveys that match your business needs.',
      icon: MessageSquare,
    },
    {
      title: 'Team Collaboration',
      description: 'Share insights and coordinate responses across your team.',
      icon: Users,
    },
    {
      title: 'Enterprise Security',
      description: 'Bank-grade security with SOC 2 Type II compliance.',
      icon: Lock,
    },
    {
      title: 'Email Notifications',
      description: 'Get notified instantly when new feedback is submitted.',
      icon: Mail,
    },
    {
      title: 'Customizable Dashboards',
      description: 'Tailor your analytics dashboard to focus on the metrics that matter most.',
      icon: Settings,
    },
    {
      title: 'Data Encryption',
      description: 'All data is encrypted in transit and at rest for maximum security.',
      icon: Shield,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50 relative overflow-hidden">

        <Navbar />

      {/* Features Section */}
      <div className="relative pt-32 pb-16 sm:pt-40 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 space-y-3 tracking-tight">
              <span className="block">Everything You Need to</span>
              <span className="block bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Succeed
              </span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
              Powerful features designed to help you collect, analyse, and act on customer feedback efficiently.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative p-6 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-50">
                    <feature.icon className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                </div>
                <p className="mt-4 text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Hear from businesses that have transformed their customer feedback process with Feedie.app.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: 'Jane Doe',
                role: 'CEO, Acme Inc.',
                testimonial:
                  'Feedie.app has completely changed how we handle customer feedback. The insights are invaluable!',
              },
              {
                name: 'John Smith',
                role: 'Founder, Startup Co.',
                testimonial:
                  'The AI-powered recommendations have helped us improve our customer experience significantly.',
              },
              {
                name: 'Sarah Lee',
                role: 'Marketing Manager, Brandify',
                testimonial:
                  'The real-time analytics dashboard is a game-changer. We can now make data-driven decisions instantly.',
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="p-6 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
              >
                <p className="text-gray-600 italic">"{testimonial.testimonial}"</p>
                <div className="mt-4 flex items-center space-x-3">
                  <div className="h-10 w-10 bg-green-50 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-semibold">{testimonial.name[0]}</span>
                  </div>
                  <div>
                    <p className="text-gray-900 font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Feedie.app
                </span>
              </div>
              <p className="text-sm text-gray-500">
                Turn customer feedback into actionable insights. Automate collection, analyse sentiment, and make data-driven decisions in real-time.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Product</h3>
              <ul className="space-y-2">
                <li><Link to="/features" className="text-sm text-gray-500 hover:text-gray-900">Features</Link></li>
                <li><Link to="/pricing" className="text-sm text-gray-500 hover:text-gray-900">Pricing</Link></li>
                <li><Link to="/docs" className="text-sm text-gray-500 hover:text-gray-900">Documentation</Link></li>
                <li><Link to="/demo" className="text-sm text-gray-500 hover:text-gray-900">Demo</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Company</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-sm text-gray-500 hover:text-gray-900">About Us</Link></li>
                <li><Link to="/careers" className="text-sm text-gray-500 hover:text-gray-900">Careers</Link></li>
                <li><Link to="/blog" className="text-sm text-gray-500 hover:text-gray-900">Blog</Link></li>
                <li><Link to="/contact" className="text-sm text-gray-500 hover:text-gray-900">Contact</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Legal</h3>
              <ul className="space-y-2">
                <li><Link to="/privacy" className="text-sm text-gray-500 hover:text-gray-900">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-sm text-gray-500 hover:text-gray-900">Terms of Service</Link></li>
                <li><Link to="/security" className="text-sm text-gray-500 hover:text-gray-900">Security</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-100 mt-8 pt-8 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Feedie.app. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FeaturesPage;