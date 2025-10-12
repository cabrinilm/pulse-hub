import Button from "./Button";

interface AddToCalendarButtonProps {
  event: {
    title: string;
    description?: string;
    date: string;
    time?: string;
    location?: string;
  };
  isVisible: boolean;
  isLoading?: boolean; // opcional para mostrar que está processando
}

const AddToCalendarButton = ({
  event,
  isVisible,
  isLoading = false,
}: AddToCalendarButtonProps) => {
  if (!isVisible) return null;

  const handleGoogleAuth = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = "http://localhost:3000/api/google-calendar/callback";
    const scope = "https://www.googleapis.com/auth/calendar.events";
    const responseType = "code";

    const normalizedEvent = {
      ...event,
      time: event.time && event.time.trim() !== "" ? event.time : "09:00",
    };

    localStorage.setItem("pending_event", JSON.stringify(normalizedEvent));

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}&access_type=offline&prompt=consent`;
    window.location.href = authUrl;
  };

  return (
    <Button
      variant="primary"
      className="mt-3 md:mt-0 md:ml-4 px-4 py-2 text-sm sm:text-base"
      onClick={handleGoogleAuth}
      disabled={isLoading} // 🔹 aqui usamos a prop disabled
    >
      {isLoading ? "Adding..." : "Add to Google Calendar"}
    </Button>
  );
};

export default AddToCalendarButton;
