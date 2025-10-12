import { google } from "googleapis";

interface EventData {
  title: string;
  description?: string;
  date: string; // ex: "2025-10-12" ou ISO
  time?: string; // ex: "09:00"
  location?: string;
}

export async function addEventToGoogleCalendar(accessToken: string, event: EventData) {
  try {
    // 1️⃣ Validação mínima
    if (!event.title || !event.date) {
      throw new Error("Event must have a title and date");
    }

    // 2️⃣ Validação de hora, se fornecida
    if (event.time && !/^([01]\d|2[0-3]):([0-5]\d)$/.test(event.time)) {
      throw new Error("Event time must be in HH:mm format");
    }

    // 3️⃣ Cria cliente OAuth2
    const authClient = new google.auth.OAuth2();
    authClient.setCredentials({ access_token: accessToken });

    const calendar = google.calendar({ version: "v3", auth: authClient });

    // 4️⃣ Cria start e end
    const eventDate = event.date.split("T")[0]; // pega só a data yyyy-mm-dd
    const startDateTime = new Date(`${eventDate}T${event.time || "09:00"}`);
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // +1 hora

    // 5️⃣ Monta objeto do evento para Google Calendar
    const calendarEvent = {
      summary: event.title,
      description: event.description || "",
      location: event.location || "",
      start: { dateTime: startDateTime.toISOString(), timeZone: "Europe/London" },
      end: { dateTime: endDateTime.toISOString(), timeZone: "Europe/London" },
    };

    // 🔹 Log detalhado para debug
    console.log("=== Event to send to Google Calendar ===");
    console.log(JSON.stringify(calendarEvent, null, 2));
    console.log("Access token length:", accessToken.length);

    // 6️⃣ Cria o evento na Google Calendar API
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
