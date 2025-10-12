import Button from "./Button";

interface AddToCalendarButtonProps {
  event: {
    title: string;
    description?: string;
    date: string;
    time?: string;
    location?: string;
  };
  isVisible: boolean; // controla se o botão deve aparecer
}

const AddToCalendarButton = ({ event, isVisible }: AddToCalendarButtonProps) => {
  if (!isVisible) return null;

  const handleGoogleAuth = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = "http://localhost:5173/auth/callback";
    const scope = "https://www.googleapis.com/auth/calendar.events";
    const responseType = "token"; // ou "code" se fores trocar pelo backend

    // Guardar temporariamente os dados do evento para usar depois
    localStorage.setItem("pending_event", JSON.stringify(event));

    // Redireciona o utilizador para o Google OAuth
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
