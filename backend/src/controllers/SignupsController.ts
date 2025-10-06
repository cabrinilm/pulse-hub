import type { Request, Response } from "express";
import SignupsModel from "../models/SignupsModel";

class SignupsController {
  // signup event
  async signupEvent(req: Request, res: Response): Promise<void> {
    try {
      const eventId = req.params.id;
      const supabase = req.supabase;
      const user_id = req.user?.id;
      const { payment_status, presence_status } = req.body;

      if (!eventId) {
        res.status(400).json({ error: "Event ID is required" });
        return;
      }
      if (!supabase) {
        res.status(500).json({ error: "Supabase client not found in request" });
        return;
      }
      if (!user_id) {
        res.status(401).json({ error: "Unauthorized: No user ID found" });
        return;
      }

      const sucess = await SignupsModel.signupEvent(supabase, user_id, {
        event_id: eventId,
        payment_status,
        presence_status,
      });

      if (!sucess) {
        res.status(404).json({ error: "Event creation failed" });
        return;
      }

      res.status(201).json(sucess);
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
  // update
  async updatePresence(req: Request, res: Response): Promise<void> {
    try {
      const eventId = req.params.id;
      const supabase = req.supabase;
      const user_id = req.user?.id;
      const { presence_status } = req.body;

      console.log(user_id, "<userid");
      console.log(eventId, "<--- eventid ");

      if (!eventId) {
        res.status(400).json({ error: "Event ID is required" });
        return;
      }
      if (!supabase) {
        res.status(500).json({ error: "Supabase client not found in request" });
        return;
      }
      if (!user_id) {
        res.status(401).json({ error: "Unauthorized: No user ID found" });
        return;
      }
      if (!presence_status) {
        res.status(400).json({ error: "Presence status is required" });
        return;
      }

      const success = await SignupsModel.updatePresence(
        supabase,
        user_id,
        eventId,
        presence_status
      );

      if (!success) {
        res.status(404).json({ error: "Signup not found or update failed" });
        return;
      }

      res.status(200).json(success);
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
  // delete
  async deleteSignups(req: Request, res: Response): Promise<void> {
    try {
      const eventId = req.params.id;
      const supabase = req.supabase;
      const userId = req.user?.id;
  
      if (!eventId) {
        res.status(400).json({ error: "Event ID is required" });
        return;
      }
  
      if (!supabase) {
        res.status(500).json({ error: "Supabase client not found in request" });
        return;
      }
  
      if (!userId) {
        res.status(401).json({ error: "Unauthorized: No user ID found" });
        return;
      }
  
      const success = await SignupsModel.delete(supabase, eventId, userId);
  
      if (!success) {
        res.status(404).json({ error: "Signup not found or delete failed" });
        return;
      }
  
      res.status(204).send(); 
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
   }

const signupsController = new SignupsController();
export default signupsController;
