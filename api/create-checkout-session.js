import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // Debug logs for environment variables
  console.log('Stripe Secret Key:', process.env.STRIPE_SECRET_KEY);
  console.log('Stripe Price ID:', process.env.STRIPE_PRICE_ID);
  console.log('Base URL:', process.env.NEXT_PUBLIC_BASE_URL);

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email } = req.body;

  try {
    // Validate the email
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Debug log for the email
    console.log('Creating checkout session for email:', email);

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: process.env.STRIPE_PRICE_ID,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/signup`,
      customer_email: email,
    });

    // Debug log for the session ID
    console.log('Checkout session created with ID:', session.id);

    // Return the session ID
    res.status(200).json({ id: session.id });
  } catch (error) {
    console.error('Stripe API Error:', error);

    // Handle specific Stripe errors
    if (error.type === 'StripeCardError') {
      return res.status(400).json({ error: error.message });
    } else if (error.type === 'StripeInvalidRequestError') {
      return res.status(400).json({ error: 'Invalid request to Stripe API' });
    } else {
      return res.status(500).json({ error: 'An unexpected error occurred' });
    }
  }
}