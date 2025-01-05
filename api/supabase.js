import { createClient } from '@supabase/supabase-js';

// Replace these with your Supabase project URL and service_role key
const supabaseUrl = 'https://xjznwqvwlooarskroogf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhqem53cXZ3bG9vYXJza3Jvb2dmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTgxMjg3NCwiZXhwIjoyMDUxMzg4ODc0fQ.MpzksCX7a-0y_TgpgcAYc-wvB2JcWOzGcfpE8P2UgUM'; // Replace with your service_role key

// Initialize the Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;