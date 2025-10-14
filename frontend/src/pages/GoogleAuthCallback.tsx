// src/pages/GoogleAuthCallback.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const GoogleAuthCallback = () => {
  const navigate = useNavigate();
  const [statusMessage, setStatusMessage] = useState("Connecting to Google Calendar...");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const message = params.get("message");
    const error = params.get("error");

    if (error) {
      setStatusMessage(error);
      setTimeout(() => navigate("/my-signups"), 3000); 
      return;
    }

    if (message) {
      setStatusMessage(message);

     
      const timer = setTimeout(() => {
        navigate("/my-signups");
      }, 3000);

      return () => clearTimeout(timer);
    }

  
    setStatusMessage("No data received from Google.");
    setTimeout(() => navigate("/my-signups"), 3000);
  }, [navigate]);

  return (
    <div className="p-8 text-center flex flex-col items-center justify-center min-h-screen bg-green-50 animate-fade-in">
      <div className="bg-white p-6 rounded-lg shadow-lg border border-green-200">
        <p className="text-lg font-semibold">{statusMessage}</p>
      </div>
    </div>
  );
};

export default GoogleAuthCallback;
