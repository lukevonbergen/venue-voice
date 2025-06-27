import React, { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '../utils/supabase';
import { useNavigate } from 'react-router-dom';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const BillingPage = () => {
  const [subscriptionType, setSubscriptionType] = useState('monthly');
  const [userEmail, setUserEmail] = useState('');
  const [trialEndsAt, setTrialEndsAt] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: authData } = await supabase.auth.getUser();
      const email = authData?.user?.email;

      if (!email) {
        navigate('/signin');
        return;
      }

      setUserEmail(email);

      const { data: venue } = await supabase
        .from('venues')
        .select('trial_ends_at')
        .eq('email', email)
        .single();

      if (venue?.trial_ends_at) {
        setTrialEndsAt(venue.trial_ends_at);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleCheckout = async () => {
    setLoading(true);

    const priceId =
      subscriptionType === 'monthly'
        ? process.env.REACT_APP_STRIPE_PRICE_MONTHLY
        : process.env.REACT_APP_STRIPE_PRICE_YEARLY;

    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail, priceId }),
    });

    const { id } = await response.json();

    const stripe = await stripePromise;
    await stripe.redirectToCheckout({ sessionId: id });
  };

  const daysLeft = trialEndsAt
    ? Math.max(
        0,
        Math.ceil(
          (new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )
      )
    : null;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-md p-8 max-w-lg w-full">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Upgrade Your Plan</h2>
        {daysLeft !== null && (
          <p className="mb-4 text-gray-600">
            Your free trial ends in <strong>{daysLeft}</strong> day{daysLeft !== 1 && 's'}.
          </p>
        )}
        <div className="mb-6">
          <label className="block mb-2 font-medium text-sm text-gray-700">Select a plan:</label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="monthly"
                checked={subscriptionType === 'monthly'}
                onChange={() => setSubscriptionType('monthly')}
                className="mr-2"
              />
              Monthly (£X)
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="yearly"
                checked={subscriptionType === 'yearly'}
                onChange={() => setSubscriptionType('yearly')}
                className="mr-2"
              />
              Yearly (£Y)
            </label>
          </div>
        </div>
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
        >
          {loading ? 'Redirecting…' : 'Upgrade Now'}
        </button>
      </div>
    </div>
  );
};

export default BillingPage;