import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase.ts";

interface ProfileInput {
  username: string;
  full_name?: string;
  avatar?: string;
}

interface Profile extends ProfileInput {
  user_id: string;
  created_at: string;
  updated_at: string;
}

class ProfilesModel {
  // cria profile
  async createProfile(
    supabase: SupabaseClient<Database>,
    user_id: string,
    profile: ProfileInput
  ): Promise<Profile> {
    const { username, full_name, avatar } = profile;

    const { data, error } = await supabase
      .from("profiles")
      .insert([
        {
          user_id,
          username,
          full_name,
          avatar,
        },
      ])
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new Error("Profile with this username already exists");
      }
      throw new Error(`Failed to create profile: ${error.message}`);
    }

    if (!data) {
      throw new Error("No data returned from profile creation");
    }

    return data as Profile;
  }

  // retorna profile pelo user_id
  async getProfile(
    supabase: SupabaseClient<Database>,
    user_id: string
  ): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user_id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch profile: ${error.message}`);
    }

    return data as Profile | null;
  }

  // update
  async updateProfile(
    supabase: SupabaseClient<Database>,
    user_id: string,
    updates: Partial<ProfileInput>
  ): Promise<Profile> {
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("user_id", user_id)
      .select()
      .single();

    if (error) {
      if (
        error.message.includes("duplicate") ||
        error.details?.includes("username")
      ) {
        throw new Error("Username already exists");
      }
      throw new Error(`Failed to update profile: ${error.message}`);
    }

    if (!data) {
      throw new Error("Profile not found");
    }

    return data as Profile;
  }

  // deleta profile
  async deleteProfile(
    supabase: SupabaseClient<Database>,
    user_id: string
  ): Promise<void> {
    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("user_id", user_id);

    if (error) {
      throw new Error(`Failed to delete profile: ${error.message}`);
    }
  }
}

export default new ProfilesModel();
