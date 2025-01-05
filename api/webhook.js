import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { buffer } from 'micro';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Initialize Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export const config = {
  api: {
    bodyParser: false, // Disable body parsing
  },
};

export default async function handler(req, res) {
  console.log('Webhook request received:', req.method, req.url);

  // Only allow POST requests
  if (req.method !== 'POST') {
    console.error('Invalid request method:', req.method);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Get the Stripe signature and webhook secret
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  console.log('Stripe signature:', sig);
  console.log('Endpoint secret:', endpointSecret ? '***' : 'MISSING');

  let event;

  try {
    // Read the raw body from the request
    const rawBody = await buffer(req);
    console.log('Raw request body:', rawBody.toString());

    // Verify the webhook signature
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
    console.log('Webhook event constructed successfully:', event.type);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ message: 'Webhook error' });
  }

  // Debug: Log full event details
  console.log('Full event details:', JSON.stringify(event, null, 2));

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;

      // Debug: Log session details
      console.log('Checkout session completed:', JSON.stringify(session, null, 2));

      // Validate session data
      if (!session.customer_email) {
        console.error('Customer email is missing in session:', session);
        return res.status(400).json({ message: 'Customer email is missing' });
      }

      console.log('Customer email found:', session.customer_email);

      // Update the venues table with is_paid: true
      console.log('Updating venue for email:', session.customer_email);
      const { data, error } = await supabase
        .from('venues')
        .update({ is_paid: true })
        .ilike('email', session.customer_email); // Use ilike for case-insensitive matching

      if (error) {
        console.error('Error updating venue:', error);
        return res.status(500).json({ message: 'Database error' });
      }

      console.log('Venue update result:', data);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  // Return a valid JSON response
  res.status(200).json({ received: true });
}