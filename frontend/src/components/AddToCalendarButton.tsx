import Button from "./Button";

interface AddToCalendarButtonProps {
  event: {
    title: string;
    description?: string;
    date: string; // YYYY-MM-DD
    time?: string; // HH:mm
    location?: string;
  };
  isVisible: boolean;
}

const AddToCalendarButton = ({ event, isVisible }: AddToCalendarButtonProps) => {
  if (!isVisible) return null;

  const handleGoogleAuth = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = "http://localhost:3000/api/google-calendar/callback";
    const scope = "https://www.googleapis.com/auth/calendar.events";
    const responseType = "code";

    // Normaliza o time: default 09:00
    const normalizedEvent = {
      ...event,
      date: event.date.split("T")[0], // só YYYY-MM-DD
      time: event.time && event.time.trim() !== "" ? event.time : "09:00",
    };

    // Salva no localStorage
    localStorage.setItem("pending_event", JSON.stringify(normalizedEvent));
    console.log("Event ready for Google Calendar:", normalizedEvent);

    // Redireciona para OAuth
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}&access_type=offline&prompt=consent`;
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
