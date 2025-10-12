import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import AuthController from "./controllers/AuthController";
import profilesController from "./controllers/profileController";
import eventsController from "./controllers/eventsController";
import signupsController from "./controllers/signupsController";
import { authMiddleware } from "./middleware/auth";
import { handleGoogleCallback } from "./controllers/googleOAuthController";

dotenv.config();

const app = express();

// CORS: permitindo tudo (somente para teste)
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

// Rotas
app.get("/api", (_req, res) => {
  res.json({ message: "PulseHub Backend" });
});

// Auth routes
app.post("/api/signup", AuthController.signup);

// Profile routes
app.post("/api/profile", authMiddleware, profilesController.createProfile);
app.get("/api/profile", authMiddleware, profilesController.getProfile);
app.patch("/api/profile", authMiddleware, profilesController.updateProfile);
app.delete("/api/profile", authMiddleware, profilesController.deleteProfile);

// Events routes
app.post("/api/events", authMiddleware, eventsController.createEvent);
app.get("/api/events", authMiddleware, eventsController.listEvents);
app.get("/api/events/:event_id", authMiddleware, eventsController.getEventById);
app.patch("/api/events/:event_id", authMiddleware, eventsController.updateEvent);
app.delete("/api/events/:event_id", authMiddleware, eventsController.deleteEvent);

// Signups routes
app.post("/api/events/:event_id/signups", authMiddleware, signupsController.createSignup);
app.post("/api/events/:event_id/add-user", authMiddleware, signupsController.addUserToEvent);
app.get("/api/signups", authMiddleware, signupsController.listSignups);
app.get("/api/events/:event_id/signups", authMiddleware, signupsController.listEventSignups);
app.patch("/api/events/:event_id/signups", authMiddleware, signupsController.updateSignup);
app.delete("/api/events/:event_id/signups", authMiddleware, signupsController.deleteSignup);

// Google Calendar route
app.get("/api/google-calendar/callback", handleGoogleCallback);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});

export { app };
