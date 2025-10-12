import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api"; // tu já tens axios configurado

const GoogleAuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash; // ex: #access_token=...
    const params = new URLSearchParams(hash.replace("#", ""));
    const access_token = params.get("access_token");

    if (!access_token) {
      alert("Google authentication failed");
      return;
    }

    // Pega o evento pendente do localStorage
    const pendingEvent = localStorage.getItem("pending_event");
    if (!pendingEvent) {
      alert("No pending event found");
      return;
    }

    const event = JSON.parse(pendingEvent);

    // Envia para o backend
    api.post("/api/google-calendar/add-event", { access_token, event })
      .then(() => {
        alert("Event added to Google Calendar!");
        localStorage.removeItem("pending_event"); // limpa o evento pendente
        navigate("/mysignups"); // redireciona para onde quiseres
      })
      .catch(err => {
        console.error(err);
        alert("Failed to add event to Google Calendar");
      });
  }, [navigate]);

  return (
    <div className="p-8 text-center">
      <p>Connecting to Google Calendar...</p>
    </div>
  );
};

export default GoogleAuthCallback;
