import React from "react";

interface AddToCalendarButtonProps {
  event: {
    title: string;
    description?: string;
    date: string;
    time?: string;
    location?: string;
  };
}

const AddToCalendarButton = ({ event }: AddToCalendarButtonProps) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    // Normaliza o time
    const normalizedEvent = {
      ...event,
      time: event.time && event.time.trim() !== "" ? event.time : "09:00",
    };

    // Salva no localStorage
    localStorage.setItem("pending_event", JSON.stringify(normalizedEvent));
    console.log("Event saved for Google Calendar:", normalizedEvent);

    // URL OAuth
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = "http://localhost:5173/auth/callback";
    const scope = "https://www.googleapis.com/auth/calendar.events";
    const responseType = "token";
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}&access_type=offline&prompt=consent`;
    console.log("OAuth URL:", authUrl);

    // 🔹 Descomente esta linha para ativar o redirecionamento real
    window.location.href = authUrl;
  };

  return (
    <button
      type="button"
      style={{
        padding: "0.5rem 1rem",
        backgroundColor: "#1d4ed8",
        color: "#fff",
        borderRadius: "0.5rem",
        border: "none",
        cursor: "pointer",
      }}
      onClick={handleClick}
    >
      Add to Google Calendar
    </button>
  );
};

export default AddToCalendarButton;
