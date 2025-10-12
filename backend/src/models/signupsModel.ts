import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";

interface SignupInput {
  event_id: string;
}

interface Signup extends SignupInput {
  user_id: string;
  signup_date: string;
  payment_status: "pending" | "completed" | "failed";
  presence_status: "pending" | "confirmed" | "rejected";
  events?: {
    id: string;
    title: string;
    description: string;
    event_date: string;
    location: string;
    is_public: boolean;
  };
}

class SignupsModel {
  // create

  async createSignup(
    supabase: SupabaseClient<Database>,
    user_id: string,
    event_id: string
  ): Promise<Signup> {
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, is_public, creator_id")
      .eq("id", event_id)
      .single();
    if (eventError || !event) {
      throw new Error("Event not found or not authorized");
    }

    const { error: insertError } = await supabase
      .from("signups")
      .insert([{ user_id, event_id }]);

    if (insertError) {
      if (insertError.code === "23505") {
        throw new Error("Signup for this event already exists");
      }
      if (insertError.message.includes("violates row-level security")) {
        throw new Error("Not authorized for this private event");
      }
      throw new Error(`Failed to create signup: ${insertError.message}`);
    }

    const { data, error: selectError } = await supabase
      .from("signups")
      .select("*")
      .eq("user_id", user_id)
      .eq("event_id", event_id)
      .single();

    if (selectError || !data) {
      throw new Error(
        `Failed to retrieve created signup: ${selectError?.message || "No data"}`
      );
    }

    return data as Signup;
  }

  async addUserToEvent(
    supabase: SupabaseClient<Database>,
    creator_id: string,
    event_id: string,
    username: string
  ): Promise<Signup> {
    // Busca user_id por username em profiles
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_id")  // Use user_id se for o nome da coluna (ajuste se for id)
      .eq("username", username)
      .single();
  
    if (profileError || !profile) {
      throw new Error("User not found");
    }
  
    const user_id = profile.user_id;
  
    // Verifica se o evento é privado e o requester é creator (backup à RLS)
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("is_public, creator_id")
      .eq("id", event_id)
      .single();
  
    if (eventError || !event) {
      throw new Error("Event not found");
    }
  
    if (event.is_public) {
      throw new Error("This feature is only for private events");
    }
  
    if (event.creator_id !== creator_id) {
      throw new Error("Not authorized to add user to this event");
    }
  
    
    const { data: signup, error: insertError } = await supabase
      .from("signups")
      .insert([{ user_id, event_id, presence_status: "pending", payment_status: "pending" }])
      .select()
      .single();
  
    if (insertError) {
      throw new Error(insertError.message);
    }
  
    return signup as Signup;
  }

  // list

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

    return (data as Signup[]) || [];
  }

  async getEventSignupStats(
    supabase: SupabaseClient<Database>,
    event_id: string
  ): Promise<{
    signup_count: number;
    confirmed_count: number;
    rejected_count: number;
  }> {
    const { data, error } = await supabase
      .from("signups")
      .select("presence_status")
      .eq("event_id", event_id);

    if (error || !data) {
      throw new Error(
        `Failed to fetch signups: ${error?.message || "No data"}`
      );
    }

    const stats = data.reduce((acc: Record<string, number>, row) => {
      const status = row.presence_status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const signup_count = data.length;
    const confirmed_count = stats["confirmed"] || 0;
    const rejected_count = stats["rejected"] || 0;

    return { signup_count, confirmed_count, rejected_count };
  }

  // update

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
      throw new Error("Signup not found or not authorized");
    }

    return data as Signup;
  }

  // delete

  async deleteSignup(
    supabase: SupabaseClient<Database>,
    user_id: string,
    event_id: string
  ): Promise<void> {
    const { count, error } = await supabase
      .from("signups")
      .delete({ count: "exact" })
      .eq("user_id", user_id)
      .eq("event_id", event_id);

    if (error) {
      throw new Error(`Failed to delete signup: ${error.message}`);
    }

    if (count === 0) {
      throw new Error("Signup not found");
    }
  }
}

export default new SignupsModel();
