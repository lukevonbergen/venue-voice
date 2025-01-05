import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import supabase from '../utils/supabase';

const SignUpPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
  
    // Validate password match
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }
  
    try {
      // Step 1: Sign up the user with Supabase Auth
      console.log('Signing up user with Supabase Auth...');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
  
      if (authError) {
        console.error('Supabase Auth Error:', authError);
        throw new Error(authError.message);
      }
  
      console.log('User signed up successfully:', authData.user);
  
      // Step 2: Create a record in the venues table
      console.log('Creating venue record in Supabase...');
      const { data: venueData, error: venueError } = await supabase
        .from('venues')
        .insert([{ name, email }])
        .select()
        .single();
  
      if (venueError) {
        console.error('Supabase Venue Error:', venueError);
        throw new Error(venueError.message);
      }
  
      console.log('Venue created successfully:', venueData);
  
      // Step 3: Redirect to Stripe checkout
      console.log('Creating Stripe checkout session...');
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
  
      if (!response.ok) {
        const errorData = await response.json(); // Parse the error response
        console.error('Stripe Checkout Error:', errorData);
        throw new Error('Failed to create Stripe checkout session.');
      }
  
      const { id } = await response.json();
      console.log('Stripe checkout session created successfully. Redirecting...');
      window.location.href = `https://checkout.stripe.com/pay/${id}`;
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
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Venue Name
              </label>
              <input
                type="text"
                id="name"
                placeholder="Enter your venue name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <span>Loading...</span>
              ) : (
                <>
                  <span>Sign Up</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            You Already have an account?{' '}
            <Link to="/signin" className="text-green-600 hover:text-green-700">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;