import type { Request, Response } from "express";
import ProfileModel from "../models/ProfileModel";

class ProfilesController {
  // create profile
  async createProfile(req: Request, res: Response): Promise<void> {
    try {
      const supabase = req.supabase;
      const user_id = req.user?.id;
      const { username, full_name, avatar } = req.body;

      if (!supabase) {
        res.status(500).json({ error: "Supabase client not found in request" });
        return;
      }

      if (!user_id) {
        res.status(401).json({ error: "Unauthorized: No user ID found" });
        return;
      }

      if (!username) {
        res.status(400).json({ error: "Username is required" });
        return;
      }

      const profile = await ProfileModel.createProfile(supabase, user_id, {
        username,
        full_name,
        avatar,
      });

      res.status(201).json(profile);
    } catch (error) {
      if (error instanceof Error && error.message.includes("already exists")) {
        res.status(409).json({ error: error.message });
        return;
      }

      res.status(500).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // get profile by user_id
  async getProfile(req: Request, res: Response): Promise<void> {
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

      const profile = await ProfileModel.getProfile(supabase, user_id);

      if (!profile) {
        res.status(404).json({ error: "Profile not found" });
        return;
      }

      res.status(200).json(profile);
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

export default new ProfilesController();
