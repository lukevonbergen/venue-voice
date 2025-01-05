import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Key, Database, AlertCircle, Mail } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

const SecurityPage = () => {
  const securityFeatures = [
    {
      title: 'Data Encryption',
      description: 'All data is encrypted in transit (TLS) and at rest (AES-256) to ensure maximum security.',
      icon: Lock,
    },
    {
      title: 'Secure Infrastructure',
      description: 'Powered by Supabase, our infrastructure meets SOC 2 Type II compliance standards.',
      icon: Database,
    },
    {
      title: 'Access Controls',
      description: 'Role-based access controls ensure only authorized personnel can access sensitive data.',
      icon: Key,
    },
    {
      title: 'No Third-Party Sharing',
      description: 'We do not share your data with third parties. Ever.',
      icon: Shield,
    },
    {
      title: 'Data Deletion',
      description: 'Request data deletion at any time, and we’ll comply with applicable laws like GDPR.',
      icon: AlertCircle,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50 relative overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <div className="relative pt-32 pb-16 sm:pt-40 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 space-y-3 tracking-tight">
              <span className="block">Your Data,</span>
              <span className="block bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Protected
              </span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
              At Feedie.app, we prioritize the security and privacy of your data. Learn how we keep your information safe and compliant.
            </p>
          </div>
        </div>
      </div>

      {/* Security Features Section */}
      <div className="bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {securityFeatures.map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
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

      {/* CTA Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Have more questions about security?</h2>
          <Link
            to="/contact"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            <Mail className="h-5 w-5 mr-2" />
            Contact Us
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SecurityPage;