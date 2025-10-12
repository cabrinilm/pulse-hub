// src/pages/GoogleAuthCallback.tsx
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";

const GoogleAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [statusMessage, setStatusMessage] = useState("Connecting to Google Calendar...");
  const [eventLink, setEventLink] = useState<string | null>(null);

  useEffect(() => {
    // ✅ Pega o code da query string (Authorization Code Flow)
    const params = new URLSearchParams(location.search);
    const code = params.get("code");

    if (!code) {
      setStatusMessage("Google authentication failed: no code returned.");
      return;
    }

    // ✅ Pega o evento pendente do localStorage
    const pendingEvent = localStorage.getItem("pending_event");
    if (!pendingEvent) {
      setStatusMessage("No event data found in localStorage.");
      return;
    }
    const event = JSON.parse(pendingEvent);

    // ✅ Envia code + evento para o backend
    api.post("/api/google-calendar/callback", { code, event })
      .then(res => {
        setStatusMessage("Event successfully added to Google Calendar!");
        setEventLink(res.data.event.htmlLink);
        localStorage.removeItem("pending_event");
      })
      .catch(err => {
        console.error(err);
        setStatusMessage("Failed to add event to Google Calendar.");
      });
  }, [location]);

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
