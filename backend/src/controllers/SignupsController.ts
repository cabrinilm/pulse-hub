import { Request, Response } from "express";
import signupsModel from "../models/signupsModel";

class SignupsController {
 
  async createSignup(req: Request, res: Response): Promise<void> {
    try {
      const supabase = req.supabase;
      const user_id = req.user?.id;
      const { event_id } = req.params;

      if (!supabase) {
        res.status(500).json({ error: "Supabase client not found in request" });
        return;
      }

      if (!user_id) {
        res.status(401).json({ error: "Unauthorized: No user ID found" });
        return;
      }

      if (!event_id) {
        res.status(400).json({ error: "Event ID is required" });
        return;
      }
       console.log(event_id, "<--- controller, event_id")
       console.log(user_id, "<--- controller, user_id")
       
      const signup = await signupsModel.createSignup(supabase, user_id, event_id);
      res.status(201).json(signup);
    } catch (error) {
      if (error instanceof Error && error.message.includes("already exists")) {
        res.status(409).json({ error: error.message });
        return;
      }

      if (error instanceof Error && error.message.includes("Not authorized")) {
        res.status(403).json({ error: "Not authorized for this private event" });
        return;
      }

      res.status(500).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

 
  async listSignups(req: Request, res: Response): Promise<void> {
    try {
      const supabase = req.supabase;
      const user_id = req.user?.id;

      if (!supabase) {
        res.status(500).json({ error: "Supabase client not found in request" });
        return;
      }

      if (!user_id) {
        res.status(401).json({ error: "Unauthorized: No user ID found" });
        return;
      }

      const signups = await signupsModel.listSignups(supabase, user_id);
      res.status(200).json(signups);
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }


  async updateSignup(req: Request, res: Response): Promise<void> {
    try {
      const supabase = req.supabase;
      const user_id = req.user?.id;
      const { event_id } = req.params;
      const { payment_status, presence_status } = req.body;

      if (!supabase) {
        res.status(500).json({ error: "Supabase client not found in request" });
        return;
      }

      if (!user_id) {
        res.status(401).json({ error: "Unauthorized: No user ID found" });
        return;
      }

      if (!event_id) {
        res.status(400).json({ error: "Event ID is required" });
        return;
      }

      const updates: Partial<{ payment_status: string; presence_status: string }> = {};

      if (payment_status) {
        if (!["pending", "completed", "failed"].includes(payment_status)) {
          res.status(400).json({ error: "Invalid payment_status" });
          return;
        }
        updates.payment_status = payment_status;
      }

      if (presence_status) {
        if (!["pending", "confirmed", "rejected"].includes(presence_status)) {
          res.status(400).json({ error: "Invalid presence_status" });
          return;
        }
        updates.presence_status = presence_status;
      }

      if (Object.keys(updates).length === 0) {
        res.status(400).json({ error: "No updates provided" });
        return;
      }

      const updatedSignup = await signupsModel.updateSignup(supabase, user_id, event_id, updates);
      res.status(200).json(updatedSignup);
    } catch (error) {
      if (error instanceof Error && error.message === "Signup not found") {
        res.status(404).json({ error: error.message });
        return;
      }

      if (error instanceof Error && error.message.includes("not authorized")) {
        res.status(403).json({ error: "Not authorized to update this signup" });
        return;
      }

      res.status(500).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }


  async deleteSignup(req: Request, res: Response): Promise<void> {
    try {
      const supabase = req.supabase;
      const user_id = req.user?.id;
      const { event_id } = req.params;

      if (!supabase) {
        res.status(500).json({ error: "Supabase client not found in request" });
        return;
      }

      if (!user_id) {
        res.status(401).json({ error: "Unauthorized: No user ID found" });
        return;
      }

      if (!event_id) {
        res.status(400).json({ error: "Event ID is required" });
        return;
      }

      await signupsModel.deleteSignup(supabase, user_id, event_id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message.includes("not authorized")) {
        res.status(403).json({ error: "Not authorized to delete this signup" });
        return;
      }

      res.status(500).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

export default new SignupsController();
