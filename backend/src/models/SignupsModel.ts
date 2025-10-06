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

    if (!validPaymentStatus.includes(signupEvent.payment_status)) {
      throw new Error("Invalid payment_status");
    }

    if (!validPresenceStatus.includes(signupEvent.presence_status)) {
      throw new Error("Invalid presence_status");
    }

 
    const { data, error } = await supabase
      .from("signups")
      .insert([
        {
          user_id,
          event_id: signupEvent.event_id,
          payment_status: signupEvent.payment_status,
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
          "Forbidden: user is not authorized to signup for this event"
        );
      }
      throw new Error(`Failed to signup for event: ${error.message}`);
    }

    if (!data) {
      throw new Error("No data returned from signup creation");
    }

    return data as Signups;
  }
}

export default new SignupsModel();