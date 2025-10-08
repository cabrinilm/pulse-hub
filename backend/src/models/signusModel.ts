import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";

interface SignupInput {
  event_id: string;
}

interface Signup extends SignupInput {
  user_id: string;
  signup_date: string;
  payment_status: 'pending' | 'completed' | 'failed';
  presence_status: 'pending' | 'confirmed' | 'rejected';
}

class SignupsModel {
  
  // create 
  async createSignup(
    supabase: SupabaseClient<Database>,
    user_id: string,
    event_id: string
  ): Promise<Signup> {
    const { data, error } = await supabase
      .from("signups")
      .insert([
        {
          user_id,
          event_id,
        },
      ])
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new Error("Signup for this event already exists");
      }
      throw new Error(`Failed to create signup: ${error.message}`);
    }

    if (!data) {
      throw new Error("No data returned from signup creation");
    }

    return data as Signup;
  }

  // get 

  async listSignups(
    supabase: SupabaseClient<Database>,
    user_id: string
  ): Promise<Signup[]> {
    const { data, error } = await supabase
      .from("signups")
      .select("*")
      .eq("user_id", user_id); // RLS filtra baseados em visibilidade; isso é um fallback, mas RLS deve lidar

    if (error) {
      throw new Error(`Failed to list signups: ${error.message}`);
    }

    return data as Signup[];
  }
  
  //update 
  async updateSignup(
    supabase: SupabaseClient<Database>,
    user_id: string,
    event_id: string,
    updates: Partial<{ payment_status: string; presence_status: string }>
  ): Promise<Signup> {
    const { data, error } = await supabase
      .from("signups")
      .update(updates)
      .eq("user_id", user_id)
      .eq("event_id", event_id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update signup: ${error.message}`);
    }

    if (!data) {
      throw new Error("Signup not found");
    }

    return data as Signup;
  }
  // delete 
  

  // Métodos para get, update, delete serão adicionados nos próximos passos
}

export default new SignupsModel();