"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const signupsModel_1 = __importDefault(require("../models/signupsModel"));
class signupsController {
  // create
  async createSignup(req, res) {
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
      const signup = await signupsModel_1.default.createSignup(
        supabase,
        user_id,
        event_id
      );
      res.status(201).json(signup);
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message === "Event not found or not authorized" ||
          error.message.includes("Not authorized")
        ) {
          res
            .status(403)
            .json({ error: "Not authorized for this private event" });
          return;
        }
        if (error.message.includes("already exists")) {
          res.status(409).json({ error: error.message });
          return;
        }
      }
      res.status(500).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
  async addUserToEvent(req, res) {
    try {
      const supabase = req.supabase;
      const creator_id = req.user?.id;
      const { event_id } = req.params;
      const { username } = req.body;
      if (!supabase) {
        res.status(500).json({ error: "Supabase client not found in request" });
        return;
      }
      if (!creator_id) {
        res.status(401).json({ error: "Unauthorized: No user ID found" });
        return;
      }
      if (!event_id) {
        res.status(400).json({ error: "Event ID is required" });
        return;
      }
      if (!username) {
        res.status(400).json({ error: "Username is required" });
        return;
      }
      const addedSignup = await signupsModel_1.default.addUserToEvent(
        supabase,
        creator_id,
        event_id,
        username
      );
      res.status(201).json(addedSignup);
    } catch (error) {
      if (error instanceof Error && error.message === "User not found") {
        res.status(404).json({ error: "User not found" });
        return;
      }
      if (error instanceof Error && error.message.includes("already exists")) {
        res.status(409).json({ error: "User already added to event" });
        return;
      }
      if (error instanceof Error && error.message.includes("not authorized")) {
        res
          .status(403)
          .json({ error: "Not authorized to add user to this event" });
        return;
      }
      res
        .status(500)
        .json({
          error: error instanceof Error ? error.message : "Unknown error",
        });
    }
  }
  // list
  async listSignups(req, res) {
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
      const signups = await signupsModel_1.default.listSignups(
        supabase,
        user_id
      );
      res.status(200).json(signups);
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
  async listEventSignups(req, res) {
    try {
      const supabase = req.supabase;
      const { event_id } = req.params;
      if (!supabase) {
        res.status(500).json({ error: "Supabase client not found in request" });
        return;
      }
      if (!event_id) {
        res.status(400).json({ error: "Event ID is required" });
        return;
      }
      const stats = await signupsModel_1.default.getEventSignupStats(
        supabase,
        event_id
      );
      res.status(200).json(stats);
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
  // update
  async updateSignup(req, res) {
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
      const updates = {};
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
      const updatedSignup = await signupsModel_1.default.updateSignup(
        supabase,
        user_id,
        event_id,
        updates
      );
      res.status(200).json(updatedSignup);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Signup not found or not authorized"
      ) {
        res.status(403).json({ error: "Not authorized to update this signup" });
        return;
      }
      if (error instanceof Error && error.message.includes("already exists")) {
        res.status(409).json({ error: error.message });
        return;
      }
      res.status(500).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
  // delete
  async deleteSignup(req, res) {
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
      await signupsModel_1.default.deleteSignup(supabase, user_id, event_id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message.includes("not authorized")) {
        res.status(403).json({ error: "Not authorized to delete this signup" });
        return;
      }
      if (error instanceof Error && error.message === "Signup not found") {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(500).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
exports.default = new signupsController();
