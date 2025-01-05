import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import supabase from '../utils/supabase';
import { loadStripe } from '@stripe/stripe-js';
import { motion, AnimatePresence } from 'framer-motion';

const SignUpPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // Track current step
  const navigate = useNavigate();

  const steps = [
    { id: 1, label: 'First Name', value: firstName, onChange: setFirstName },
    { id: 2, label: 'Last Name', value: lastName, onChange: setLastName },
    { id: 3, label: 'Venue Name', value: name, onChange: setName },
    { id: 4, label: 'Email', value: email, onChange: setEmail },
    { id: 5, label: 'Password', value: password, onChange: setPassword },
    { id: 6, label: 'Confirm Password', value: confirmPassword, onChange: setConfirmPassword },
  ];

  const handleNext = () => {
    if (step < steps.length) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    try {
      // Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw new Error(authError.message);

      // Create venue record
      const { data: venueData, error: venueError } = await supabase
        .from('venues')
        .insert([{ name, email, first_name: firstName, last_name: lastName }])
        .select()
        .single();

      if (venueError) throw new Error(venueError.message);

      // Stripe Checkout
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create Stripe checkout session');
      }

      const { id } = await response.json();
      const stripe = await loadStripe('pk_test_51QdvLqPI4GNQuY8VOlP39H4Mx4e4qYJwSvz6JJHfgEWGkuunV2BJLrCrDJnZejna8fX7OX2elgJUJLY8W8NWu9gJ00AL2WIsaI');
      const { error: stripeError } = await stripe.redirectToCheckout({ sessionId: id });

      if (stripeError) throw new Error(stripeError.message);
    } catch (error) {
      console.error('Signup Error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Back to Homepage Link */}
        <div className="mb-4">
          <Link
            to="/"
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center space-x-1"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            <span>Back to homepage</span>
          </Link>
        </div>

        {/* White Box */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="text-center">
            <div className="mb-8 inline-flex items-center space-x-2 bg-white/50 px-4 py-1 rounded-full border border-emerald-100">
              <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">New</span>
              <span className="text-sm text-gray-600">Create your account</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Sign Up</h2>
            <p className="text-gray-600 mb-8">
              Join Feedie.app and start transforming customer feedback into actionable insights.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-6">
            <AnimatePresence mode="wait">
              {steps.map(
                (stepData) =>
                  step === stepData.id && (
                    <motion.div
                      key={stepData.id}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div>
                        <label htmlFor={stepData.label.toLowerCase().replace(' ', '-')} className="block text-sm font-medium text-gray-700 mb-2">
                          {stepData.label}
                        </label>
                        <input
                          type={stepData.label.includes('Password') ? 'password' : 'text'}
                          id={stepData.label.toLowerCase().replace(' ', '-')}
                          placeholder={`Enter your ${stepData.label.toLowerCase()}`}
                          value={stepData.value}
                          onChange={(e) => stepData.onChange(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                          required
                        />
                      </div>
                    </motion.div>
                  )
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Previous
                </button>
              )}
              {step < steps.length ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {isLoading ? 'Loading...' : 'Sign Up'}
                </button>
              )}
            </div>
          </form>

          {/* Progress Indicator */}
          <div className="mt-6 text-center text-sm text-gray-600">
            Step {step} of {steps.length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;