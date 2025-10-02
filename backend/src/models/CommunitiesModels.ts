import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

interface Community {
  id: string;
  name: string;
  description: string | null;
  creator_id: string;
  created_at: string;
  updated_at: string;
}

const NAME_REGEX = /^[a-zA-Z0-9\s]{3,50}$/;

class CommunityModel {
  private validateName(name: string): { isValid: boolean; error?: string } {
    if (!NAME_REGEX.test(name)) {
      return {
        isValid: false,
        error: 'Community name must be 3-50 characters and contain only alphanumeric characters or spaces',
      };
    }
    return { isValid: true };
  }

  // Create a new community
  async create(name: string, description: string | null, creatorId: string): Promise<Community> {
    try {
      // Validate name
      const validation = this.validateName(name);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Insert community into Supabase (RLS enforces creator_id = auth.uid())
      const { data, error } = await supabase
        .from('communities')
        .insert([{ name, description, creator_id: creatorId }])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('Community name already exists');
        }
        throw new Error(`Failed to create community: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data returned from community creation');
      }

      return data as Community;
    } catch (err) {
      throw new Error(`Create community error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }
  // Get all communities (public view via RLS)
  async getAll(): Promise<Community[]> {
    try {
      const { data, error } = await supabase
        .from('communities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch communities: ${error.message}`);
      }

      return data as Community[] || [];
    } catch (err) {
      throw new Error(`Get all communities error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }
  // Get a single community by ID
  async getById(id: string): Promise<Community | null> {
    try {
      const { data, error } = await supabase
        .from('communities')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No community found
        }
        throw new Error(`Failed to fetch community: ${error.message}`);
      }

      return data as Community;
    } catch (err) {
      throw new Error(`Get community by ID error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

}

export default new CommunityModel();