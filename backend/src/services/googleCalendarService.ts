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
    // Valida campos essenciais
    if (!event.title || !event.date) {
      throw new Error("Event must have a title and date");
    }

    if (event.time && !/^\d{2}:\d{2}$/.test(event.time)) {
      throw new Error("Event time must be in HH:mm format");
    }

    // Cria cliente OAuth2
    const authClient = new google.auth.OAuth2();
    authClient.setCredentials({ access_token: accessToken });

    const calendar = google.calendar({ version: "v3", auth: authClient });

    // Cria start e end
    const startDateTime = new Date(`${event.date}T${event.time || "09:00"}`);
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // +1 hora

    // Monta objeto do evento
    const calendarEvent = {
      summary: event.title,
      description: event.description || "",
      location: event.location || "",
      start: { dateTime: startDateTime.toISOString(), timeZone: "Europe/Lisbon" },
      end: { dateTime: endDateTime.toISOString(), timeZone: "Europe/Lisbon" },
    };

    // 🔹 Log detalhado para debug
    console.log("=== Event to send to Google Calendar ===");
    console.log(JSON.stringify(calendarEvent, null, 2));
    console.log("Access token length:", accessToken.length);

    // Chama Google Calendar API
    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: calendarEvent,
    });

    console.log("=== Google Calendar response ===", response.data);

    return response.data;
  } catch (err: any) {
    console.error("Google Calendar Service Error:", err.response?.data || err.message);
    throw err;
  }
}
