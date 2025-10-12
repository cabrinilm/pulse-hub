import { google } from "googleapis";

interface EventData {
  title: string;
  description?: string;
  date: string; // ex: "2025-10-12"
  time?: string; // ex: "09:00"
  location?: string;
}

export async function addEventToGoogleCalendar(accessToken: string, event: EventData) {
  try {
    if (!event.title || !event.date) {
      throw new Error("Event must have a title and date");
    }

    // Cria cliente OAuth2 com o accessToken
    const authClient = new google.auth.OAuth2();
    authClient.setCredentials({ access_token: accessToken });

    const calendar = google.calendar({ version: "v3", auth: authClient });

    // Calcula start e end (1 hora depois do start)
    const startDateTime = new Date(`${event.date}T${event.time || "09:00"}`);
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // +1 hora

    const calendarEvent = {
      summary: event.title,
      description: event.description || "",
      location: event.location || "",
      start: { dateTime: startDateTime.toISOString(), timeZone: "Europe/Lisbon" },
      end: { dateTime: endDateTime.toISOString(), timeZone: "Europe/Lisbon" },
    };

    // Insere o evento no calendário principal
    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: calendarEvent,
    });

    return response.data;
  } catch (err) {
    console.error("Google Calendar Service Error:", err);
    throw err;
  }
}
