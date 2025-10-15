"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGoogleCallback = handleGoogleCallback;
const googleapis_1 = require("googleapis");
const googleCalendarService_1 = require("../services/googleCalendarService");
async function handleGoogleCallback(req, res) {
  try {
    const code = req.query.code;
    const state = req.query.state;
    if (!code) return res.status(400).send("Missing code from Google OAuth");
    if (!state) return res.status(400).send("No event data in state");
    const event = JSON.parse(decodeURIComponent(state));
    const oAuth2Client = new googleapis_1.google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    const { tokens } = await oAuth2Client.getToken(code);
    const accessToken = tokens.access_token;
    if (!accessToken)
      return res.status(400).send("Failed to get access token from Google");
    const createdEvent = await (0,
    googleCalendarService_1.addEventToGoogleCalendar)(accessToken, event);

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    return res.redirect(
      `${frontendUrl}/google-callback?message=${encodeURIComponent("Event successfully added to Google Calendar!")}&eventLink=${encodeURIComponent(createdEvent.htmlLink || "")}`
    );
  } catch (err) {
    console.error(
      "Google OAuth Controller Error:",
      err.response?.data || err.message
    );
  
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    return res.redirect(
      `${frontendUrl}/google-callback?error=${encodeURIComponent("Failed to add event to Google Calendar: " + err.message)}`
    );
  }
}

module.exports = { handleGoogleCallback };