"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addEventToGoogleCalendar = addEventToGoogleCalendar;

const googleapis_1 = require("googleapis");
async function addEventToGoogleCalendar(accessToken, event) {
    try {

        if (!event.title || !event.date) {
            throw new Error("Event must have a title and date");
        }
  
        if (event.time && !/^\d{2}:\d{2}$/.test(event.time)) {
            throw new Error("Event time must be in HH:mm format");
        }
     
        const authClient = new googleapis_1.google.auth.OAuth2();
        authClient.setCredentials({ access_token: accessToken });
        const calendar = googleapis_1.google.calendar({ version: "v3", auth: authClient });
  
        let startDateTime;
   
        if (event.date.includes("T")) {
            startDateTime = new Date(event.date);
        }
        else {
            startDateTime = new Date(`${event.date}T${event.time || "09:00"}`);
        }
        if (isNaN(startDateTime.getTime())) {
            throw new Error("Invalid date or time value");
        }
        const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // + 1 hour
     
        const calendarEvent = {
            summary: event.title,
            description: event.description || "",
            location: event.location || "",
            start: { dateTime: startDateTime.toISOString(), timeZone: "Europe/London" },
            end: { dateTime: endDateTime.toISOString(), timeZone: "Europe/London" },
        };

     
   
        const response = await calendar.events.insert({
            calendarId: "primary",
            requestBody: calendarEvent,
        });
   
        return response.data;
    }
    catch (err) {
     
        throw err;
    }
}
