import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";

interface Event {
  id: string;
  community_id: string | null;
  title: string;
  description: string | null;
  event_date: string;
  is_public: boolean;
  price: number | null;
  location: string | null;
  creator_id: string;
  created_at: string;
  updated_at: string;
}

const NAME_REGEX = /^[a-zA-Z0-9\s]{3,50}$/;

class EventsModel {
  private validateTitle(title: string): { isValid: boolean; error?: string } {
    if (!NAME_REGEX.test(title)) {
      return {
        isValid: false,
        error:
          "Event title must be 3-50 characters and contain only alphanumeric characters or spaces",
      };
    }
    return { isValid: true };
  }

  async createEvent(
    supabase: SupabaseClient<Database>,
    creator_id: string,
    eventData: {
      title: string;
      description?: string | null;
      event_date: string;
      is_public?: boolean;
      price?: number | null;
      location?: string | null;
    }
  ): Promise<Event> {
    const validation = this.validateTitle(eventData.title);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    const { data, error } = await supabase
      .from("events")
      .insert([
        {
          creator_id,
          title: eventData.title,
          description: eventData.description ?? null,
          event_date: eventData.event_date,
          is_public: eventData.is_public ?? true,
          price: eventData.price ?? 0,
          location: eventData.location ?? null,
        },
      ])
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new Error("Event with this title already exists");
      }
      throw new Error(`Failed to create event: ${error.message}`);
    }

    if (!data) {
      throw new Error("No data returned from event creation");
    }

    return data as Event;
  }
}

export default new EventsModel();