import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

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
  async create(
    supabase: SupabaseClient<Database>, 
    name: string, 
    description: string | null, 
    creatorId: string
  ): Promise<Community> {
    const validation = this.validateName(name);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

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
  }

  // Get all communities
  async getAll(supabase: SupabaseClient<Database>): Promise<Community[]> {
    const { data, error } = await supabase
      .from('communities')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch communities: ${error.message}`);
    }

    return data as Community[] || [];
  }

  // Get a single community by ID
  async getById(supabase: SupabaseClient<Database>, id: string): Promise<Community | null> {
    const { data, error } = await supabase
      .from('communities')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to fetch community: ${error.message}`);
    }

    return data as Community;
  }

  // Update a community
  async update(
    supabase: SupabaseClient<Database>, 
    id: string, 
    name: string | null, 
    description: string | null
  ): Promise<Community> {
    if (name) {
      const validation = this.validateName(name);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }
    }

    const updates: Partial<Community> = {};
    if (name) updates.name = name;
    if (description !== null) updates.description = description;
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('communities')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('Community name already exists');
      }
      throw new Error(`Failed to update community: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data returned from community update');
    }

    return data as Community;
  }

  // Delete a community
  async delete(supabase: SupabaseClient<Database>, id: string): Promise<void> {
    const { error } = await supabase
      .from('communities')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete community: ${error.message}`);
    }
  }
}

export default new CommunityModel();
