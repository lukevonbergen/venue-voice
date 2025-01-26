import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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

      navigate('/dashboard');
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-600 to-indigo-600">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 transform transition-all hover:scale-105">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Welcome Back!</h2>
        <p className="text-center text-gray-600 mb-8">
          Sign in to access your dashboard and manage your account.
        </p>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center">
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
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-105 flex items-center justify-center"
          >
            {isLoading ? (
              <span>Signing in...</span>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="text-purple-600 hover:text-purple-700 font-semibold">
            Sign up
          </Link>
        </div>

        <div className="mt-4 text-center text-sm text-gray-600">
          <Link to="/forgot-password" className="text-purple-600 hover:text-purple-700 font-semibold">
            Forgot your password?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;