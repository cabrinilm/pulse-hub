import { supabase } from '../services/supabaseClient';
import type { PostgrestError } from '@supabase/supabase-js';

// Define TypeScript interface for Profile
// Reason: Ensures type safety for profile data; maps to profiles table
interface Profile {
  user_id: string;
  username: string;
  avatar?: string | null;
}

// Profile model class for CRUD operations
// Reason: Encapsulates DB logic, reusable across routes
export class ProfileModel {
  // Create or update a profile
  // Learning: upsert handles insert/update; RLS enforces user_id = auth.uid()
  static async createOrUpdate(userId: string, username: string, avatar: string | null = null): Promise<{ success: boolean; error?: PostgrestError }> {
    // Normalize username to lowercase for case-insensitive uniqueness
    const normalizedUsername = username.toLowerCase();

    // Validate username format (alphanumeric, 3-20 chars)
    if (!/^[a-zA-Z0-9]{3,20}$/.test(normalizedUsername)) {
      return { success: false, error: { message: 'Username must be 3-20 alphanumeric characters', code: 'invalid_input', details: '', hint: '' } as PostgrestError };
    }

    // Upsert profile (RLS ensures user_id = auth.uid())
    const { error } = await supabase
      .from('profiles')
      .upsert({ user_id: userId, username: normalizedUsername, avatar }, { onConflict: 'user_id' });

    if (error) {
      return { success: false, error };
    }

    return { success: true };
  }

  // Get a profile by user_id
  // Learning: single() ensures one record; RLS allows public view or user-specific access
  static async get(userId: string): Promise<{ data: Profile | null; error?: PostgrestError }> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      return { data: null, error };
    }

    return { data: data as Profile };
  }
}