import type { Request, Response } from "express";
import signupsModel from "../models/signusModel";

class SignupsController {
  // create

  async createSignup(req: Request, res: Response): Promise<void> {
    try {
      const supabase = req.supabase;
      const user_id = req.user?.id;
      const { event_id } = req.body;

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

      const signup = await signupsModel.createSignup(
        supabase,
        user_id,
        event_id
      );

      res.status(201).json(signup);
    } catch (error) {
      if (error instanceof Error && error.message.includes("already exists")) {
        res.status(409).json({ error: error.message });
        return;
      }

      if (
        error instanceof Error &&
        error.message.includes("violates row-level security")
      ) {
        res
          .status(403)
          .json({ error: "Not authorized for this private event" });
        return;
      }

      res.status(500).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // list

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
  // update 

  async updateSignup(req: Request, res: Response): Promise<void> {
    try {
      const supabase = req.supabase;
      const user_id = req.user?.id;
      const event_id = req.params.event_id; // Extraído de paramsff
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
      if (payment_status && ['pending', 'completed', 'failed'].includes(payment_status)) {
        updates.payment_status = payment_status;
      } else if (payment_status) {
        res.status(400).json({ error: "Invalid payment_status" });
        return;
      }

      if (presence_status && ['pending', 'confirmed', 'rejected'].includes(presence_status)) {
        updates.presence_status = presence_status;
      } else if (presence_status) {
        res.status(400).json({ error: "Invalid presence_status" });
        return;
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
}
const signupsController = new SignupsController();
export default signupsController;
