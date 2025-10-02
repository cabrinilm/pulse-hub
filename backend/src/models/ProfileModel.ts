import type { PostgrestError } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

interface Profile {
  user_id: string;
  username: string;
  avatar?: string | null;
}

export class ProfileModel {
  static async createOrUpdate(
    userId: string,
    username: string,
    avatar: string | null = null,
    supabaseUser: SupabaseClient 
  ): Promise<{ success: boolean; error?: PostgrestError }> {
    const normalizedUsername = username.toLowerCase();

    if (!/^[a-zA-Z0-9]{3,20}$/.test(normalizedUsername)) {
      return {
        success: false,
        error: { message: 'Username must be 3-20 alphanumeric characters', code: 'invalid_input', details: '', hint: '' } as PostgrestError
      };
    }

    const { error } = await supabaseUser
      .from('profiles')
      .upsert({ user_id: userId, username: normalizedUsername, avatar }, { onConflict: 'user_id' });

    if (error) {
      return { success: false, error };
    }

    return { success: true };
  }

  static async get(
    userId: string,
    supabaseUser: SupabaseClient // <- Client do usuário logado
  ): Promise<{ data: Profile | null; error?: PostgrestError }> {
    const { data, error } = await supabaseUser
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
