import type { Request, Response } from "express";
import { google } from "googleapis";
import { addEventToGoogleCalendar } from "../services/googleCalendarService.ts";

export async function handleGoogleCallback(req: Request, res: Response) {
  try {
    const code = req.query.code as string;
    const state = req.query.state as string; // evento vindo do frontend

    if (!code) {
      return res.status(400).send("Missing code from Google OAuth");
    }
    if (!state) {
      return res.status(400).send("No event data in state");
    }

    const event = JSON.parse(decodeURIComponent(state));

    const oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Troca code por tokens
    const { tokens } = await oAuth2Client.getToken(code);
    const accessToken = tokens.access_token;

    if (!accessToken) {
      return res.status(400).send("Failed to get access token from Google");
    }

    const createdEvent = await addEventToGoogleCalendar(accessToken, event);

    // Redireciona para o frontend mostrando sucesso
    return res.redirect(
      `http://localhost:5173/google-callback?message=${encodeURIComponent(
        "Event successfully added to Google Calendar!"
      )}&eventLink=${encodeURIComponent(createdEvent.htmlLink || "")}`
    );
  } catch (err: any) {
    console.error("Google OAuth Controller Error:", err.response?.data || err.message);
    return res.redirect(
      `http://localhost:5173/google-callback?error=${encodeURIComponent(
        "Failed to add event to Google Calendar: " + err.message
      )}`
    );
  }
}
