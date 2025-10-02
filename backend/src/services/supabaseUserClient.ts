
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
if (!supabaseUrl) {
  throw new Error('SUPABASE_URL must be defined in .env');
}


export function getSupabaseUserClient(token: string): SupabaseClient {
  if (!token) {
    throw new Error('User token is required to create a Supabase user client');
  }


  return createClient(supabaseUrl, token);
}