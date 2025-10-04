import type { Request, Response } from "express";
import EventsModel from "../models/EventsModel";


class EventsController {

  // create event 
  async createEventByUser(req: Request, res: Response): Promise<void> {
    try {
      const creatorId = req.user?.id;
      const supabase = req.supabase;
      const { creator_id, title, description, event_date, is_public, price, location, community_id } = req.body;

      if (!creatorId) {
        res.status(401).json({ error: "Unauthorized: No user ID found" });
        return;
      }
      if (!supabase) {
        res.status(500).json({ error: "Supabase client not found in request" });
        return;
      }
      if (!title || !event_date) {
        res.status(400).json({ error: "Title and event_date are required" });
        return;
      }
      if (creator_id !== creatorId) {
        res.status(403).json({ error: "Forbidden: creator_id does not match authenticated user" });
        return;
      }

      const event = await EventsModel.createEvent(supabase, creatorId, {
        title,
        description,
        event_date,
        is_public,
        price,
        location,
        community_id,
      });

      if (!event) {
        res.status(404).json({ error: "Event creation failed" });
        return;
      }

      res.status(201).json(event);
    } catch (error) {
      if (error instanceof Error && error.message.includes("Forbidden")) {
        res.status(403).json({ error: error.message });
        return;
      }
      res.status(500).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // update event 

  async updateEventByUser(req: Request, res: Response): Promise<void> {
    try {
      const creatorId = req.user?.id;
      const supabase = req.supabase;
      const eventId = req.params.id;
      const { creator_id, title, description, event_date, is_public, price, location, community_id } = req.body;

      if (!creatorId) {
        res.status(401).json({ error: "Unauthorized: No user ID found" });
        return;
      }
      if (!supabase) {
        res.status(500).json({ error: "Supabase client not found in request" });
        return;
      }
      if (!title || !event_date) {
        res.status(400).json({ error: "Title and event_date are required" });
        return;
      }
      if (creator_id !== creatorId) {
        res.status(403).json({ error: "Forbidden: creator_id does not match authenticated user" });
        return;
      }

      const event = await EventsModel.updateEvent(supabase, eventId, creatorId, {
        title,
        description,
        event_date,
        is_public,
        price,
        location,
        community_id,
      });

      if (!event) {
        res.status(404).json({ error: "Event not found or update failed" });
        return;
      }

      res.status(200).json(event);
    } catch (error) {
      if (error instanceof Error && error.message.includes("Forbidden")) {
        res.status(403).json({ error: error.message });
        return;
      }
      res.status(500).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
  async deleteEventByUser(req: Request, res: Response): Promise<void> {
    try {
      const creatorId = req.user?.id;
      const supabase = req.supabase;
      const eventId = req.params.id;

      if (!creatorId) {
        res.status(401).json({ error: "Unauthorized: No user ID found" });
        return;
      }
      if (!supabase) {
        res.status(500).json({ error: "Supabase client not found in request" });
        return;
      }

      const success = await EventsModel.deleteEvent(supabase, eventId, creatorId);

      if (!success) {
        res.status(404).json({ error: "Event not found or delete failed" });
        return;
      }

      res.status(204).send(); // Status 204 para exclusão bem-sucedida
    } catch (error) {
      if (error instanceof Error && error.message.includes("Forbidden")) {
        res.status(403).json({ error: error.message });
        return;
      }
      res.status(500).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}


const eventsController = new EventsController();
export default eventsController;