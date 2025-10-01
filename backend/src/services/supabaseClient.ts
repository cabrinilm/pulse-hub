import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv'

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and anon key must be defined in .env');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
