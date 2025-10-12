import type { Request, Response } from "express";
import { addEventToGoogleCalendar } from "../services/googleCalendarService";

export async function addEvent(req: Request, res: Response) {
  try {
    const { access_token, event } = req.body;

    // Validação básica
    if (!access_token || !event) {
      return res.status(400).json({ message: "Missing access token or event data" });
    }

    // Chama o service que integra com Google Calendar
    const createdEvent = await addEventToGoogleCalendar(access_token, event);

    return res.status(200).json({ message: "Event added to Google Calendar", event: createdEvent });
  } catch (error) {
    console.error("Google Calendar Controller Error:", error);
    return res.status(500).json({ message: "Failed to add event to Google Calendar", error });
  }
}
