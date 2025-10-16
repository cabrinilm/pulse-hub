"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGoogleCallback = handleGoogleCallback;

const { google } = require("googleapis");
const { addEventToGoogleCalendar } = require("../services/googleCalendarService");

async function handleGoogleCallback(req, res) {
  try {
    const code = req.query.code;
    const state = req.query.state;

    if (!code || !state) {
      return res.status(400).json({ success: false, message: "Missing code or state from Google OAuth" });
    }

    let event;
    try {
      event = JSON.parse(decodeURIComponent(state));
    } catch {
      return res.status(400).json({ success: false, message: "Invalid event data in state" });
    }

    const oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const { tokens } = await oAuth2Client.getToken(code);
    const accessToken = tokens.access_token;

    if (!accessToken) {
      return res.status(400).json({ success: false, message: "Failed to get access token from Google" });
    }

    const createdEvent = await addEventToGoogleCalendar(accessToken, event);

    return res.status(200).json({
      success: true,
      message: "Event successfully added to Google Calendar!",
      eventLink: createdEvent.htmlLink || null,
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to add event to Google Calendar: " + err.message,
    });
  }
}

module.exports = { handleGoogleCallback };
