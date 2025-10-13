"use strict";
// src/models/eventsModel.ts
Object.defineProperty(exports, "__esModule", { value: true });
class EventsModel {
    async createEvent(supabase, creator_id, event) {
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
        return data;
    }
    async listEvents(supabase, user_id) {
        const { data, error } = await supabase
            .from("events")
            .select("*")
            .or(`is_public.eq.true,creator_id.eq.${user_id}`);
        if (error) {
            throw new Error(`Failed to list events: ${error.message}`);
        }
        return data;
    }
    async getEventById(supabase, user_id, event_id) {
        const { data, error } = await supabase
            .from("events")
            .select("*")
            .eq("id", event_id)
            .maybeSingle();
        if (error) {
            throw new Error(`Failed to fetch event: ${error.message}`);
        }
        return data;
    }
    // update
    async updateEvent(supabase, creator_id, event_id, updates) {
        const { data, error } = await supabase
            .from("events")
            .update(updates)
            .eq("id", event_id)
            .eq("creator_id", creator_id)
            .select()
            .single();
        if (error) {
            throw new Error(`Failed to update event: ${error.message}`);
        }
        return data;
    }
    // delete 
    async deleteEvent(supabase, creator_id, event_id) {
        const { data, error } = await supabase
            .from("events")
            .delete()
            .eq("id", event_id)
            .eq("creator_id", creator_id)
            .select();
        if (error) {
            throw new Error(`Failed to delete event: ${error.message}`);
        }
        if (data.length === 0) {
            throw new Error("Event not found");
        }
    }
}
exports.default = new EventsModel();
