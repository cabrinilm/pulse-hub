// src/pages/GoogleAuthCallback.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const GoogleAuthCallback = () => {
  const navigate = useNavigate();
  const [statusMessage, setStatusMessage] = useState("Connecting to Google Calendar...");
  const [eventLink, setEventLink] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace("#", ""));
    const access_token = params.get("access_token");

    if (!access_token) {
      setStatusMessage("Google authentication failed.");
      return;
    }

    const pendingEvent = localStorage.getItem("pending_event");
    if (!pendingEvent) {
      setStatusMessage("No event found to add.");
      return;
    }

    const event = JSON.parse(pendingEvent);

    api.post("/api/google-calendar/add-event", { access_token, event })
      .then(res => {
        setStatusMessage("Event successfully added to Google Calendar!");
        setEventLink(res.data.event.htmlLink); // pega o link direto
        localStorage.removeItem("pending_event");
      })
      .catch(err => {
        console.error(err);
        setStatusMessage("Failed to add event to Google Calendar.");
      });
  }, [navigate]);

  return (
    <div className="p-8 text-center">
      <p>{statusMessage}</p>
      {eventLink && (
        <a
          href={eventLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline mt-2 block"
        >
          View event in Google Calendar
        </a>
      )}
    </div>
  );
};

export default GoogleAuthCallback;
