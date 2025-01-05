import { createClient } from '@supabase/supabase-js';

// Replace these with your Supabase project URL and API key
const supabaseUrl = 'https://xjznwqvwlooarskroogf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhqem53cXZ3bG9vYXJza3Jvb2dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU4MTI4NzQsImV4cCI6MjA1MTM4ODg3NH0.eID9MO_INcBJOnJSm_uBPE-PVMuHQfW1_hWCE-3ihzY';

// Initialize the Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;