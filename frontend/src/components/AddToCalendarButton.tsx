import Button from "./Button";

interface AddToCalendarButtonProps {
  event: {
    title: string;
    description?: string;
    date: string; // yyyy-mm-dd ou ISO
    time?: string; // HH:mm ou vazio
    location?: string;
  };
  isVisible: boolean; // controla se o botão deve aparecer
}

const AddToCalendarButton = ({ event, isVisible }: AddToCalendarButtonProps) => {
  if (!isVisible) return null;

  const handleGoogleAuth = () => {
    // Validação mínima
    if (!event.title || !event.date) {
      alert("Event must have a title and date");
      return;
    }

    // Prepara o evento com fallback de hora
    const eventToSave = {
      title: event.title,
      description: event.description || "",
      location: event.location || "",
      // Se não tiver hora, assume 09:00
      date: event.date,
      time: event.time && event.time.trim() !== "" ? event.time : "09:00"

    };

    // Salva no localStorage
    localStorage.setItem("pending_event", JSON.stringify(eventToSave));

    // Redireciona para o OAuth do Google
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = "http://localhost:5173/auth/callback";
    const scope = "https://www.googleapis.com/auth/calendar.events";
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}&access_type=offline&prompt=consent`;

    window.location.href = authUrl;
  };

  return (
    <Button
      variant="primary"
      className="mt-3 md:mt-0 md:ml-4 px-4 py-2 text-sm sm:text-base"
      onClick={handleGoogleAuth}
    >
      Add to Google Calendar
    </Button>
  );
};

export default AddToCalendarButton;
