import type { Request, Response } from "express";
import eventsModel from "../models/eventsModel";


class EventsController {
    async eventCreateByUser(req: Request, res: Response): Promise<void> {
       try {
        
        const creatorId = req.user?.id; 
        const supabase = req.supabase;
        const {title, description, event_date, is_public, price, location} = req.body;

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

          const event = await eventsModel.createEvent(
            supabase, 
            creatorId,
            { title, description, event_date, is_public, price, location }
          );

          if(!event){
            res.status(404).json({ error: "Event cration failed" });
            return;
          }
            
          res.status(201).json(event);
       } catch (error){
        res.status(500).json({
            error: error instanceof Error ? error.message: "Unknow error",
        });
       }
    }
}


 export default new EventsController();