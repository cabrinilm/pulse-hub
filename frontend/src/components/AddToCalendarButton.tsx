import Button from "./Button";
import { CalendarPlus } from 'lucide-react';
import type { ReactNode } from "react";

interface AddToCalendarButtonProps {
  event: {
    title: string;
    description?: string;
    date: string;
    time?: string;
    location?: string;
  };
  isVisible: boolean;
  isLoading?: boolean;
  className?: string;
  children?: ReactNode;
}

const AddToCalendarButton = ({ 
  event, 
  isVisible, 
  isLoading = false, 
  children,
  className 
}: AddToCalendarButtonProps) => {
  if (!isVisible) return null;

  const handleGoogleAuth = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';  
    const redirectUri = `${apiUrl}/google-calendar/callback`;  
    const scope = "https://www.googleapis.com/auth/calendar.events";
    const responseType = "code";

    const normalizedEvent = { ...event, time: event.time || "09:00" };
    const state = encodeURIComponent(JSON.stringify(normalizedEvent));

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}&access_type=offline&prompt=consent&state=${state}`;
    
  
    window.location.href = authUrl;
  };

  const defaultContent = (
    <>
      <CalendarPlus size={18} />
      <span className="hidden md:inline">Add to Calendar</span>
    </>
  );

  return (
    <Button
    variant="primary"
    className={`flex items-center gap-2 text-white bg-teal-500 hover:bg-teal-600 px-3 py-1 rounded-md transition-colors duration-200 ${className || ''}`}
    onClick={handleGoogleAuth}
    disabled={isLoading}
  >
    {children || defaultContent || (isLoading ? "Adding..." : "Add to Google Calendar")}
  </Button>
  );
};

export default AddToCalendarButton;