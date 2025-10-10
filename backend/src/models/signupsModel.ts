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

    // Fetch e log do evento para depuração
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, is_public, creator_id")
      .eq("id", event_id)
      .single();
    if (eventError || !event) {
      console.error("Error fetching event:", eventError);
      throw new Error("Event not found or not authorized"); // Ajuste para erro mais específico, evitando 500 genérico
    }
    console.log("Event details:", {
      id: event.id,
      is_public: event.is_public,
      creator_id: event.creator_id
    });
    console.log("Is user_id equal to auth.uid()?", user_id === authUser?.user?.id);

    // Insert sem .select()
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

    // Select separado após insert (agora o row é visível)
    const { data, error: selectError } = await supabase
      .from("signups")
      .select("*")
      .eq("user_id", user_id)
      .eq("event_id", event_id)
      .single();

    if (selectError || !data) {
      throw new Error(`Failed to retrieve created signup: ${selectError?.message || "No data"}`);
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
