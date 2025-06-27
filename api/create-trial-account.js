import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, password, firstName, lastName, venueName } = req.body;

  if (!email || !password || !firstName || !lastName || !venueName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
    if (authError) throw new Error(authError.message);

    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    const { error: venueError } = await supabase
      .from('venues')
      .insert([{ email, first_name: firstName, last_name: lastName, name: venueName, is_paid: false, trial_ends_at: trialEndsAt.toISOString() }]);

    if (venueError) throw new Error(venueError.message);

    return res.status(200).json({ message: 'Account created with trial' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}