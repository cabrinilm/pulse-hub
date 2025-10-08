import type { Request, Response } from "express";
import eventsModel from "../models/eventsModel";



class EventsController {

  // create event 
  async createEvent(req: Request, res: Response): Promise<void> {
    try {
      const supabase = req.supabase;
      const user_id = req.user?.id;
      const { title, description, location, event_date, is_public = true, price, min_participants = 0, max_participants, image_url } = req.body;

      if (!supabase) {
        res.status(500).json({ error: "Supabase client not found in request" });
        return;
      }

      if (!user_id) {
        res.status(401).json({ error: "Unauthorized: No user ID found" });
        return;
      }

      if (!title) {
        res.status(400).json({ error: "Title is required" });
        return;
      }

      if (!event_date) {
        res.status(400).json({ error: "Event date is required" });
        return;
      }

      if (price !== undefined && price < 0) {
        res.status(400).json({ error: "Price must be >= 0" });
        return;
      }

      const event = await eventsModel.createEvent(supabase, user_id, {
        title, description, location, event_date, is_public, price, min_participants, max_participants, image_url
      });

      res.status(201).json(event);
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

}



const eventsController = new EventsController();
export default eventsController;