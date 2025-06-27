// /pages/api/webhook.js
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { buffer } from 'micro';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    const rawBody = await buffer(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ message: 'Webhook error' });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { customer_email: email, metadata } = session;
    const { firstName, lastName, venueName } = metadata;

    try {
      const { data: existingVenue } = await supabase
        .from('venues')
        .select('id')
        .eq('email', email)
        .single();

      if (!existingVenue) {
        const tempPassword = Math.random().toString(36).slice(-8);

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password: tempPassword,
        });

        if (authError) throw new Error(authError.message);

        const { error: venueError } = await supabase
          .from('venues')
          .insert([{
            name: venueName,
            email,
            first_name: firstName,
            last_name: lastName,
            is_paid: true,
            trial_ends_at: null,
          }]);

        if (venueError) throw new Error(venueError.message);

        console.log('New venue created and marked as paid');
      } else {
        const { error } = await supabase
          .from('venues')
          .update({ is_paid: true })
          .eq('email', email);

        if (error) throw new Error(error.message);

        console.log('Existing venue marked as paid');
      }
    } catch (err) {
      console.error('Webhook processing error:', err);
      return res.status(500).json({ message: err.message });
    }
  }

  res.status(200).json({ received: true });
}