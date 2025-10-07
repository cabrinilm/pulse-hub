import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";

interface Signups {
  user_id: string;
  event_id: string;
  signup_date: string;
  payment_status: "pending" | "completed" | "failed";
  presence_status: "pending" | "confirmed" | "rejected";
}

class SignupsModel {

   // post 
  async signupEvent(
    supabase: SupabaseClient<Database>,
    user_id: string,
    signupEvent: {
      event_id: string;
      payment_status: "pending" | "completed" | "failed";
      presence_status: "pending" | "confirmed" | "rejected";
    }
  ): Promise<Signups> {
    const validPaymentStatus = ["pending", "completed", "failed"];
    const validPresenceStatus = ["pending", "confirmed", "rejected"];

    // if (!validPaymentStatus.includes(signupEvent.payment_status)) {
    //   throw new Error("Invalid payment_status");
    // }

    if (!validPresenceStatus.includes(signupEvent.presence_status)) {
      throw new Error("Invalid presence_status");
    }

    const { data, error } = await supabase
      .from("signups")
      .insert([
        {
          user_id,
          event_id: signupEvent.event_id,
          payment_status: signupEvent.payment_status ?? "pending",
          presence_status: signupEvent.presence_status,
        },
      ])
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new Error("User already signed up for this event");
      }
      if (error.code === "42501") {
        throw new Error(
          "Forbidden: user is not authorized to signup for this event or event doesnt exist"
        );
      }
      throw new Error(`Failed to signup for event: ${error.message}`);
    }

    if (!data) {
      throw new Error("No data returned from signup creation");
    }

    return data as Signups;
  }

  // update

  async updatePresence(
    supabase: SupabaseClient<Database>,
    user_id: string,
    event_id: string,
    presence_status: "pending" | "confirmed" | "rejected"
  ): Promise<Signups | null> {
    const { data, error } = await supabase
      .from("signups")
      .update({ presence_status })
      .eq("user_id", user_id)
      .eq("event_id", event_id)
      .select()
      .maybeSingle();

    if (error) {
      if (error.code === "42501") {
        throw new Error(
          "Forbidden: user is not authorized to update this signup"
        );
      }
      throw new Error(`Failed to update presence: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    return data as Signups;
  }

  // delete 
  async delete(
    supabase: SupabaseClient<Database>,
    event_id: string,
    user_id: string
  ): Promise<boolean> {
    const { data, error } = await supabase
      .from("signups")
      .delete()
      .eq("event_id", event_id)
      .eq("user_id", user_id)
      .select();

    if (error) {
      if (error.code === "42501") {
        throw new Error(
          "Forbidden: user is not authorized to delete this signup"
        );
      }
      throw new Error(`Failed to delete signup: ${error.message}`);
    }

    return !!data && data.length > 0;
  }

  // get 

  async getAllSignups(
    supabase: SupabaseClient<Database>,
    user_id: string
  
  ): Promise<Signups[]> {

    const { data, error } = await supabase
      .from("signups")
      .select("*")
      .eq("user_id", user_id);
  
    if (error) {
      if (error.code === "42501") {
        throw new Error("Forbidden: user is not authorized to view these signups");
      }
      throw new Error(`Failed to fetch signups: ${error.message}`);
    }
    
    return data || [];
  }
}

export default new SignupsModel();
