import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import supabase from '../utils/supabase';

const SignInPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      navigate('/dashboard'); // Redirect to the dashboard after successful sign-in
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 relative overflow-hidden flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        {/* Back to Homepage Link */}
        <div className="mb-4">
          <Link
            to="/"
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center space-x-1 transition-colors"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            <span>Back to homepage</span>
          </Link>
        </div>

        {/* White Box */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 transform transition-all hover:shadow-3xl">
          <div className="text-center">
            <div className="mb-8 inline-flex items-center space-x-2 bg-white/50 px-4 py-1 rounded-full border border-emerald-100">
              <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">Welcome</span>
              <span className="text-sm text-gray-600">Sign in to your account</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Sign In</h2>
            <p className="text-gray-600 mb-8">
              Access your venue dashboard and manage customer feedback effortlessly.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-6">
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
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
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
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-green-600 hover:text-green-700 font-semibold transition-colors">
              Sign up
            </Link>
          </div>

          {/* Forgot Password Link */}
          <div className="mt-4 text-center text-sm text-gray-600">
            <Link to="/forgot-password" className="text-green-600 hover:text-green-700 font-semibold transition-colors">
              Forgot your password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;