// api/webhook.js
import Stripe from 'stripe';
import { supabase } from '../../utils/supabase'; // Adjust the path as needed

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const customerEmail = session.customer_email;

    // Update the venue's payment status in Supabase
    const { data: venue, error } = await supabase
      .from('venues')
      .update({ is_paid: true })
      .eq('email', customerEmail);

    if (error) {
      console.error('Payment status update error:', error);
    } else {
      console.log('Updated venue payment status:', venue);
    }
  }

  res.json({ received: true });
}