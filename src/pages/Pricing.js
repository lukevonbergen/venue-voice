// PricingPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import Navbar from './Navbar'; // Import the Navbar component

const PricingPage = () => {
  const pricingPlans = [
    {
      title: 'Growth',
      price: '£29',
      description: 'For growing businesses with more feedback needs',
      features: [
        'Up to 1,000 feedback submissions/month',
        'Advanced analytics',
        'AI-powered insights',
        'Customizable forms',
        'Priority email support',
      ],
      cta: 'Start Free Trial',
      ctaLink: '/signup',
      popular: true,
      annualPrice: '£23/month (billed annually)',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50 relative overflow-hidden">
      {/* Dotted Background */}
      <div className="absolute inset-0 bg-dotted-pattern bg-[length:40px_40px] opacity-10"></div>

      {/* Use the Navbar component */}
      <Navbar />

      {/* Pricing Section */}
      <div className="relative pt-32 pb-16 sm:pt-40 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 space-y-3 tracking-tight">
              <span className="block">Simple, Transparent</span>
              <span className="block bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Pricing
              </span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
              Choose a plan that fits your business needs. Start small, scale as you grow.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`relative p-8 bg-white rounded-3xl shadow-lg border ${
                  plan.popular ? 'border-green-500' : 'border-gray-100'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 -mt-4 -mr-4 bg-green-600 text-white text-xs font-semibold px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900">{plan.title}</h2>
                  <p className="mt-2 text-gray-600">{plan.description}</p>
                  <div className="mt-6">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    {plan.price !== 'Free' && plan.price !== 'Custom' && (
                      <span className="text-gray-500">/month</span>
                    )}
                    {plan.annualPrice && (
                      <p className="text-sm text-gray-500 mt-2">{plan.annualPrice}</p>
                    )}
                  </div>
                  <ul className="mt-8 space-y-4">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center space-x-3">
                        <Check className="h-5 w-5 text-green-500" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8">
                    <Link
                      to={plan.ctaLink}
                      className={`w-full px-6 py-3 rounded-lg text-center font-medium ${
                        plan.popular
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      } transition-colors`}
                    >
                      {plan.cta}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Have questions? We've got answers. Check out our FAQ below.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                question: 'Can I switch plans later?',
                answer: 'Yes, you can upgrade or downgrade your plan at any time.',
              },
              {
                question: 'Is there a free trial?',
                answer: 'Yes, we offer a 14-day free trial for all paid plans.',
              },
              {
                question: 'What payment methods do you accept?',
                answer: 'We accept all major credit cards and PayPal.',
              },
              {
                question: 'Do you offer discounts for nonprofits?',
                answer: 'Yes, we offer special pricing for nonprofits. Contact us for details.',
              },
            ].map((faq, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                <p className="mt-2 text-gray-600">{faq.answer}</p>
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

export default PricingPage;