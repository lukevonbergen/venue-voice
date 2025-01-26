import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, priceId, firstName, lastName, venueName, password } = req.body;

  try {
    // Validate the email and price ID
    if (!email || !priceId) {
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
      metadata: {
        firstName,
        lastName,
        venueName,
        password,
      },
    });

    // Return the session ID
    res.status(200).json({ id: session.id });
  } catch (error) {
    console.error('Stripe API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}