"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const profilesModel_1 = __importDefault(require("../models/profilesModel"));
class ProfilesController {
    async createProfile(req, res) {
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
            const profile = await profilesModel_1.default.createProfile(supabase, user_id, { username, full_name, avatar });
            res.status(201).json(profile);
        }
        catch (error) {
            if (error instanceof Error && error.message.includes("already exists")) {
                res.status(409).json({ error: error.message });
                return;
            }
            res.status(500).json({
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
    async getProfile(req, res) {
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
            const profile = await profilesModel_1.default.getProfile(supabase, user_id);
            if (!profile) {
                res.status(404).json({ error: "Profile not found" });
                return;
            }
            res.status(200).json(profile);
        }
        catch (error) {
            res.status(500).json({
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
    async updateProfile(req, res) {
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
            const updates = {};
            if (username)
                updates.username = username;
            if (full_name !== undefined)
                updates.full_name = full_name;
            if (avatar !== undefined)
                updates.avatar = avatar;
            if (Object.keys(updates).length === 0) {
                res.status(400).json({ error: "No updates provided" });
                return;
            }
            const updatedProfile = await profilesModel_1.default.updateProfile(supabase, user_id, updates);
            res.status(200).json(updatedProfile);
        }
        catch (error) {
            if (error instanceof Error && error.message.includes("already exists")) {
                res.status(409).json({ error: error.message });
                return;
            }
            if (error instanceof Error && error.message === "Profile not found") {
                res.status(404).json({ error: error.message });
                return;
            }
            res.status(500).json({
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
    async deleteProfile(req, res) {
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
            await profilesModel_1.default.deleteProfile(supabase, user_id);
            res.status(204).send();
        }
        catch (error) {
            res.status(500).json({
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
}
const profilesController = new ProfilesController();
exports.default = profilesController;
