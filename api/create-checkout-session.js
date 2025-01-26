import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, priceId } = req.body;

  // Debug logs to check the request payload
  console.log('Received email:', email);
  console.log('Received priceId:', priceId);

  try {
    // Validate the email and price ID
    if (!email || !priceId) {
      console.error('Email or priceId is missing');
      return res.status(400).json({ error: 'Email and price ID are required' });
    }

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId, // Use the selected price ID
          quantity: 1,
        },
      ],
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
    return res.status(500).json({ error: error.message });
  }
}