"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGoogleCallback = handleGoogleCallback;

const { google } = require("googleapis");
const { addEventToGoogleCalendar } = require("../services/googleCalendarService");

async function handleGoogleCallback(req, res) {
  try {
    console.log("=== Google OAuth Callback ===");
    console.log("Request query:", req.query);

    const code = req.query.code;
    const state = req.query.state;

    if (!code) {
      console.log("❌ No code received from Google");
      return res.status(400).send("Missing code from Google OAuth");
    }
    if (!state) {
      console.log("❌ No state received from Google");
      return res.status(400).send("No event data in state");
    }

    let event;
    try {
      event = JSON.parse(decodeURIComponent(state));
      console.log("✅ Parsed event from state:", event);
    } catch (parseErr) {
      console.error("❌ Failed to parse state:", parseErr);
      return res.status(400).send("Invalid event data in state");
    }

    const oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    console.log("Fetching tokens from Google...");
    const { tokens } = await oAuth2Client.getToken(code);
    console.log("✅ Tokens received:", tokens);

    const accessToken = tokens.access_token;
    if (!accessToken) {
      console.log("❌ No access token received from Google");
      return res.status(400).send("Failed to get access token from Google");
    }

    console.log("Adding event to Google Calendar...");
    const createdEvent = await addEventToGoogleCalendar(accessToken, event);
    console.log("✅ Event successfully created:", createdEvent);

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const redirectUrl = `${frontendUrl}/google-callback?message=${encodeURIComponent(
      "Event successfully added to Google Calendar!"
    )}&eventLink=${encodeURIComponent(createdEvent.htmlLink || "")}`;

    console.log("Redirecting user to frontend:", redirectUrl);
    return res.redirect(redirectUrl);

  } catch (err) {
    console.error("❌ Google OAuth Controller Error:", err.response?.data || err.message);

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const redirectUrl = `${frontendUrl}/google-callback?error=${encodeURIComponent(
      "Failed to add event to Google Calendar: " + err.message
    )}`;

    console.log("Redirecting user to frontend with error:", redirectUrl);
    return res.redirect(redirectUrl);
  }
}

module.exports = { handleGoogleCallback };
