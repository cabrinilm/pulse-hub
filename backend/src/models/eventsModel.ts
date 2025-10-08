// src/models/eventsModel.ts

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";

interface EventInput {
  title: string;
  description?: string;
  location?: string;
  event_date: string; 
  is_public?: boolean;
  price?: number;
  min_participants?: number;
  max_participants?: number;
  image_url?: string;
}

interface Event extends EventInput {
  id: string;
  community_id?: string;
  creator_id: string;
  created_at: string;
  updated_at: string;
}

class EventsModel {
  async createEvent(
    supabase: SupabaseClient<Database>,
    creator_id: string,
    event: EventInput
  ): Promise<Event> {
    const { data, error } = await supabase
      .from("events")
      .insert([
        {
          ...event,
          creator_id,
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create event: ${error.message}`);
    }

    if (!data) {
      throw new Error("No data returned from event creation");
    }

    return data as Event;
  }

  async listEvents(
    supabase: SupabaseClient<Database>,
    user_id: string
  ): Promise<Event[]> {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .or(`is_public.eq.true,creator_id.eq.${user_id}`);
    if (error) {
      throw new Error(`Failed to list events: ${error.message}`);
    }

    return data as Event[];
  }

  async getEventById(
    supabase: SupabaseClient<Database>,
    user_id: string,
    event_id: string
  ): Promise<Event | null> {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", event_id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch event: ${error.message}`);
    }

    return data as Event | null;
  }

 
}

export default new EventsModel();