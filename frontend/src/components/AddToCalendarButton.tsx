// src/components/AddToCalendarButton.tsx
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
}

const AddToCalendarButton = ({ event, isVisible }: AddToCalendarButtonProps) => {
  if (!isVisible) return null;

  const handleGoogleAuth = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = "http://localhost:3000/api/google-calendar/callback"; // rota do backend
    const scope = "https://www.googleapis.com/auth/calendar.events";
    const responseType = "code";

    // Normaliza o time
    const normalizedEvent = {
      ...event,
      time: event.time && event.time.trim() !== "" ? event.time : "09:00",
    };

    const stateParam = encodeURIComponent(JSON.stringify(normalizedEvent));

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}&access_type=offline&prompt=consent&state=${stateParam}`;

    window.location.href = authUrl; // redireciona para Google OAuth
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
