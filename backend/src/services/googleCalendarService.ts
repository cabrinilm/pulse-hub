import { google } from "googleapis";

interface EventData {
  title: string;
  description?: string;
  date: string;
  time?: string;
  location?: string;
}

export async function addEventToGoogleCalendar(accessToken: string, event: EventData) {
  try {
    // Cria cliente OAuth2
    const authClient = new google.auth.OAuth2();
    authClient.setCredentials({ access_token: accessToken });

    const calendar = google.calendar({ version: "v3", auth: authClient });

    // Monta o evento para o Google Calendar
    const startDateTime = new Date(`${event.date}T${event.time || "09:00"}`).toISOString();
    const endDateTime = new Date(`${event.date}T${event.time || "10:00"}`).toISOString();

    const calendarEvent = {
      summary: event.title,
      description: event.description,
      location: event.location,
      start: { dateTime: startDateTime },
      end: { dateTime: endDateTime },
    };

    // Insere o evento no calendário principal do usuário
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
