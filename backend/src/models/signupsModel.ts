import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../types/supabase";

interface SignupInput {
  event_id: string;
}

interface Signup extends SignupInput {
  user_id: string;
  signup_date: string;
  payment_status: "pending" | "completed" | "failed";
  presence_status: "pending" | "confirmed" | "rejected";
}

class SignupsModel {


  
  async createSignup(
    supabase: SupabaseClient<Database>,
    user_id: string,
    event_id: string
  ): Promise<Signup> {
    const { data: authUser } = await supabase.auth.getUser();
console.log("Auth user from model:", authUser?.user?.id);
   const { data, error } = await supabase    
      .from("signups")
      .insert([{ user_id, event_id }])
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new Error("Signup for this event already exists");
      }
      if (error.message.includes("violates row-level security")) {
        throw new Error("Not authorized for this private event");
      }
      throw new Error(`Failed to create signup: ${error.message}`);
    }

    if (!data) {
      throw new Error("No data returned from signup creation");
    }

    return data as Signup;
  }


  async listSignups(
    supabase: SupabaseClient<Database>,
    user_id: string
  ): Promise<Signup[]> {
    const { data, error } = await supabase
      .from("signups")
      .select(
        `
        *,
        events (
          id,
          title,
          description,
          event_date,
          location,
          is_public
        )
      `
      )
      .eq("user_id", user_id)
      .order("signup_date", { ascending: false });

    if (error) {
      throw new Error(`Failed to list signups: ${error.message}`);
    }

    return data as Signup[];
  }

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


  async deleteSignup(
    supabase: SupabaseClient<Database>,
    user_id: string,
    event_id: string
  ): Promise<boolean> {
    const { error } = await supabase
      .from("signups")
      .delete()
      .eq("user_id", user_id)
      .eq("event_id", event_id);

    if (error) {
      throw new Error(`Failed to delete signup: ${error.message}`);
    }

    return true;
  }
}

export default new SignupsModel();
