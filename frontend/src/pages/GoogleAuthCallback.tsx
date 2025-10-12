import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api"; // axios já configurado

const GoogleAuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // 1️⃣ Pega o hash da URL retornado pelo Google OAuth
    const hash = window.location.hash; // ex: #access_token=...
    const params = new URLSearchParams(hash.replace("#", ""));
    const access_token = params.get("access_token");

    if (!access_token) {
      alert("Google authentication failed");
      return;
    }

    // 2️⃣ Recupera o evento pendente do localStorage
    const pendingEvent = localStorage.getItem("pending_event");
    if (!pendingEvent) {
      alert("No pending event found");
      return;
    }

    const event = JSON.parse(pendingEvent);

    // 3️⃣ Prepara o objeto a enviar para o backend
    const eventToSend = {
      title: event.title,
      description: event.description || "",
      location: event.location || "",
      // Combina date e time para ISO 8601
      start: new Date(`${event.date.split("T")[0]}T${event.time}`).toISOString(),
      end: new Date(new Date(`${event.date.split("T")[0]}T${event.time}`).getTime() + 60 * 60 * 1000).toISOString() // +1 hora
    };

    // 4️⃣ Envia para o backend
    api.post("/api/google-calendar/add-event", { access_token, event: eventToSend })
      .then(() => {
        alert("Event added to Google Calendar!");
        localStorage.removeItem("pending_event"); // limpa o evento pendente
        navigate("/mysignups"); // redireciona para a página desejada
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
