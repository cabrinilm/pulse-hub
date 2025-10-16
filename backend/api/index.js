"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
// src/index.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const AuthController_1 = __importDefault(require("./controllers/AuthController"));
const profileController_1 = __importDefault(require("./controllers/profileController"));
const eventsController_1 = __importDefault(require("./controllers/eventsController"));
const signupsController_1 = __importDefault(require("./controllers/signupsController"));
const { handleGoogleCallback } = require("./controllers/googleOAuthController");
const auth_1 = require("./middleware/auth");
// const googleOAuthController_1 = require("./controllers/googleOAuthController");
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.app = app;

const corsOptions = {
    origin: "*", 
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};

app.options("*", (0, cors_1.default)(corsOptions));

app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());

app.use((req, _res, next) => {
    if (req.method === "OPTIONS")
        return next();
    next();
});

app.get("/api", (_req, res) => {
    res.json({ message: "PulseHub Backend" });
});
// Auth routes
app.post("/api/signup", AuthController_1.default.signup);
// Profile routes
app.post("/api/profile", auth_1.authMiddleware, profileController_1.default.createProfile);
app.get("/api/profile", auth_1.authMiddleware, profileController_1.default.getProfile);
app.patch("/api/profile", auth_1.authMiddleware, profileController_1.default.updateProfile);
app.delete("/api/profile", auth_1.authMiddleware, profileController_1.default.deleteProfile);
// Events routes
app.post("/api/events", auth_1.authMiddleware, eventsController_1.default.createEvent);
app.get("/api/events", auth_1.authMiddleware, eventsController_1.default.listEvents);
app.get("/api/events/:event_id", auth_1.authMiddleware, eventsController_1.default.getEventById);
app.patch("/api/events/:event_id", auth_1.authMiddleware, eventsController_1.default.updateEvent);
app.delete("/api/events/:event_id", auth_1.authMiddleware, eventsController_1.default.deleteEvent);
// Signups routes
app.post("/api/events/:event_id/signups", auth_1.authMiddleware, signupsController_1.default.createSignup);
app.post("/api/events/:event_id/add-user", auth_1.authMiddleware, signupsController_1.default.addUserToEvent);
app.get("/api/signups", auth_1.authMiddleware, signupsController_1.default.listSignups);
app.get("/api/events/:event_id/signups", auth_1.authMiddleware, signupsController_1.default.listEventSignups);
app.patch("/api/events/:event_id/signups", auth_1.authMiddleware, signupsController_1.default.updateSignup);
app.delete("/api/events/:event_id/signups", auth_1.authMiddleware, signupsController_1.default.deleteSignup);
// Google Calendar route
// app.get("/api/google-calendar/callback", handleGoogleCallback);


// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log(`✅ Backend running on port ${PORT}`);
// });

module.exports = app; 
