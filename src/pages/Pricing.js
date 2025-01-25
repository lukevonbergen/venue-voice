import React from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

const PricingPage = () => {
  const pricingPlans = [
    {
      title: 'Growth',
      price: '£29',
      description: 'For growing businesses with more feedback needs',
      features: [
        'Unlimited feedback submissions/month',
        'Advanced analytics',
        'AI-powered insights (Coming soon)',
        'Customisable forms',
        'Priority email support',
      ],
      cta: 'Start now',
      ctaLink: '/signup',
      popular: true,
      annualPrice: '£23/month (billed annually)',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Use the Navbar component */}
      <Navbar />

      {/* New Pricing Section */}
      <section className="bg-white">
        <div className="mx-auto w-full max-w-7xl px-5 py-16 md:px-10 md:py-20">
          <div className="rounded-xl bg-gray-100 px-6 py-12 sm:px-12 sm:py-16 md:py-20">
            {/* Heading Container */}
            <div className="mx-auto mb-8 flex max-w-3xl flex-col text-center md:mb-12 lg:mb-16">
              <h2 className="text-3xl font-bold md:text-5xl">Simple &amp; Affordable Pricing</h2>
              <div className="mx-auto mt-4 rounded-3xl bg-gray-300 px-6 py-2">
                <p className="text-sm sm:text-base">30 days money-back guarantee</p>
              </div>
            </div>

            {/* Pricing Plan Content */}
            <div className="mx-auto grid h-auto w-full gap-4 rounded-md px-0 py-12 lg:grid-cols-1">
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
                        <li key={i} className="flex items-center justify-center space-x-3">
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
      </section>

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
                question: 'Can I cancel my plan?',
                answer: 'Yes, you can cancel your plan at anytime.',
              },
              {
                question: 'Is there a free trial?',
                answer: 'Yes, we offer a 2 week free trial!',
              },
              {
                question: 'What payment methods do you accept?',
                answer: 'We accept all major credit cards and PayPal.',
              },
              {
                question: 'Where can I access my invoices?',
                answer: 'Your invoices will automatically be sent to you at the end of each billing cycle.',
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
      <Footer />
    </div>
  );
};

export default PricingPage;