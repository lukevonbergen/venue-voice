import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL; // Private
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY; //Anon
 
export const supabase = createClient(supabaseUrl, supabaseAnonKey);