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

  async addUserToEvent(req: Request, res: Response): Promise<void> {
    try {
      const eventId = req.params.event_id;
      const supabase = req.supabase;
      const creator_id = req.user?.id;
      const { user_id, presence_status } = req.body;
  
     
      if (!eventId) {
        res.status(400).json({ error: "Event ID is required" });
        return;
      }
      if (!supabase) {
        res.status(500).json({ error: "Supabase client not found in request" });
        return;
      }
      if (!creator_id) {
        res.status(401).json({ error: "Unauthorized: No user ID found" });
        return;
      }
      if (!user_id) {
        res.status(400).json({ error: "User ID to add is required" });
        return;
      }
  

      const { data: event, error: eventError } = await supabase
        .from("events")
        .select("creator_id")
        .eq("id", eventId)
        .single();
  
      if (eventError || !event) {
        res.status(404).json({ error: "Event not found" });
        return;
      }
  
      if (event.creator_id !== creator_id) {
        res.status(403).json({ error: "Forbidden: Only event creator can add users" });
        return;
      }
  
      
      const signup = await SignupsModel.signupEvent(supabase, user_id, {
        event_id: eventId,
        payment_status: "pending",
        presence_status: presence_status || "pending",
      });
  
      res.status(201).json(signup);
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

  // get

  async getAllSignups(req: Request, res: Response): Promise<void> {
    try {
      const supabase = req.supabase;
      const userId = req.user?.id;
  
      if (!userId) {
        res.status(401).json({ error: "Unauthorized: No user ID found" });
        return;
      }
  
      if (!supabase) {
        res.status(500).json({ error: "Supabase client not found in request" });
        return;
      }
  
      const success = await SignupsModel.getAllSignups(supabase, userId);
  
      if (!success || success.length === 0) {
        res.status(200).json({ message: "No signups found for this user", data: [] });
        return;
      }
  
      res.status(200).json(success);
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  }
    
  }
const signupsController = new SignupsController();
export default signupsController;
