import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "../types/supabase"


interface Signups {
 user_id: string;
 event_id: string;
 signup_date: string;
 payment_status: string;
 presente_status: string;

}


class SignupsModel {


    async signupEvent(
        supabase: SupabaseClient<Database>,
        user_id: string,
        signupEvent: {
            event_id: string,
            payment_status: string,
            presence_status: string,
        }
    ): Promise<Signups> {

        const { data, error} = await supabase
        .from("signups")
            .insert([
                {
                user_id,
                event_id: signupEvent.event_id,
               payment_status: signupEvent.payment_status, 
               presence_status: signupEvent.presence_status
                }
  
            ])
        .select()
        .single(); 

        if (error) {
            if (error.code === "23505") {
              throw new Error("Event with this title already exists");
            }
            if (error.code === "42501") {
              throw new Error(
                "Forbidden: user is not a member of the specified community"
              );
            }
            throw new Error(`Failed to create event: ${error.message}`);
          }
      
          if (!data) {
            throw new Error("No data returned from event creation");
          }
      
          return data as Signups;
        }


    }


export default new SignupsModel;