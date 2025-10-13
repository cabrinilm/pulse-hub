"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const eventsModel_1 = __importDefault(require("../models/eventsModel"));
class EventsController {
    // create event 
    async createEvent(req, res) {
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
            const event = await eventsModel_1.default.createEvent(supabase, user_id, {
                title, description, location, event_date, is_public, price, min_participants, max_participants, image_url
            });
            res.status(201).json(event);
        }
        catch (error) {
            res.status(500).json({
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
    // list 
    async listEvents(req, res) {
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
            const events = await eventsModel_1.default.listEvents(supabase, user_id);
            res.status(200).json(events);
        }
        catch (error) {
            res.status(500).json({
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
    async getEventById(req, res) {
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
            const event = await eventsModel_1.default.getEventById(supabase, user_id, event_id);
            if (!event) {
                res.status(404).json({ error: "Event not found" });
                return;
            }
            res.status(200).json(event);
        }
        catch (error) {
            res.status(500).json({
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
    async updateEvent(req, res) {
        try {
            const supabase = req.supabase;
            const user_id = req.user?.id;
            const { event_id } = req.params;
            const { title, description, location, event_date, is_public, price, min_participants, max_participants, image_url } = req.body;
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
            if (title)
                updates.title = title;
            if (description !== undefined)
                updates.description = description;
            if (location !== undefined)
                updates.location = location;
            if (event_date)
                updates.event_date = event_date;
            if (is_public !== undefined)
                updates.is_public = is_public;
            if (price !== undefined) {
                if (price < 0) {
                    res.status(400).json({ error: "Price must be >= 0" });
                    return;
                }
                updates.price = price;
            }
            if (min_participants !== undefined)
                updates.min_participants = min_participants;
            if (max_participants !== undefined)
                updates.max_participants = max_participants;
            if (image_url !== undefined)
                updates.image_url = image_url;
            if (Object.keys(updates).length === 0) {
                res.status(400).json({ error: "No updates provided" });
                return;
            }
            const updatedEvent = await eventsModel_1.default.updateEvent(supabase, user_id, event_id, updates);
            if (!updatedEvent) {
                res.status(404).json({ error: "Event not found" });
                return;
            }
            res.status(200).json(updatedEvent);
        }
        catch (error) {
            res.status(500).json({
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
    // delete 
    async deleteEvent(req, res) {
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
            await eventsModel_1.default.deleteEvent(supabase, user_id, event_id);
            res.status(204).send();
        }
        catch (error) {
            if (error instanceof Error && error.message === "Event not found") {
                res.status(404).json({ error: error.message });
                return;
            }
            res.status(500).json({
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
}
const eventsController = new EventsController();
exports.default = eventsController;
