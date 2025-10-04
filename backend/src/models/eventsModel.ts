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
      community_id?: string | null;
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
          community_id: eventData.community_id ?? null,
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

    return data as Event;
  }

  // update event

  async updateEvent(
    supabase: SupabaseClient<Database>,
    event_id: string,
    creator_id: string,
    eventData: {
      title: string;
      description?: string | null;
      event_date: string;
      is_public?: boolean;
      price?: number | null;
      location?: string | null;
      community_id?: string | null;
    }
  ): Promise<Event | null> {
    const validation = this.validateTitle(eventData.title);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }
  
    const { data, error } = await supabase
      .from("events")
      .update({
        title: eventData.title,
        description: eventData.description ?? null,
        event_date: eventData.event_date,
        is_public: eventData.is_public ?? true,
        price: eventData.price ?? 0,
        location: eventData.location ?? null,
        community_id: eventData.community_id ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", event_id)
      .eq("creator_id", creator_id)
      .select()
      .maybeSingle();
  
    if (error) {
      if (error.code === "42501") {
        throw new Error("Forbidden: user is not the creator of the event or not a member of the specified community");
      }
      if (error.code === "23505") {
        throw new Error("Event with this title already exists");
      }
      throw new Error(`Failed to update event: ${error.message}`);
    }
  
    return data as Event | null;
  }

  // delete event 

  async deleteEvent(
    supabase: SupabaseClient<Database>,
    event_id: string,
    creator_id: string
  ): Promise<boolean> {
    const { data, error } = await supabase
      .from("events")
      .delete()
      .eq("id", event_id)
      .eq("creator_id", creator_id)
      .select(); 
  
    if (error) {
      if (error.code === "42501") {
        throw new Error("Forbidden: user is not the creator of the event");
      }
      throw new Error(`Failed to delete event: ${error.message}`);
    }
  

    return !!data && data.length > 0;
  }
}



export default new EventsModel();
