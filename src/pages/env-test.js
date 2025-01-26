import React from 'react';

const EnvTest = () => {
  return (
    <div>
      <h1>Environment Variables Test</h1>
      <p>Monthly Price ID: {process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY}</p>
      <p>Yearly Price ID: {process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY}</p>
      <p>Stripe Publishable Key: {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}</p>
    </div>
  );
};

export default EnvTest;