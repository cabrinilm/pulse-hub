// src/components/Card.tsx
import { Calendar, MapPin, Users } from "lucide-react";
import AuthButton from "./AuthButton";

interface CardProps {
  title: string;
  date: string;
  location: string | null;
  signup_count: number;
  buttonText?: string;
  onClick?: () => void;
}

const Card = ({
  title,
  date,
  location,
  signup_count,
  buttonText = "View Details",
  onClick,
}: CardProps) => {
  const eventDate = new Date(date);
  const dayOfWeek = eventDate.toLocaleDateString("en-GB", { weekday: "long" });
  const formattedDate = eventDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const formattedTime = eventDate.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className="
        bg-white/20 backdrop-blur-md rounded-2xl shadow-lg 
        p-5 sm:p-6 flex flex-col md:flex-row md:items-center gap-3 sm:gap-4 
        border border-white/30 
        transition-all duration-300 ease-in-out 
        hover:scale-[1.02] hover:shadow-xl hover:bg-white/25 hover:border-white/40
      "
    >
      <div className="flex-1 flex flex-col gap-1.5 sm:gap-2">
        <h3 className="text-xl sm:text-xl font-semibold text-white">{title}</h3>
        <div className="flex flex-col sm:flex-row sm:justify-between text-sm text-white/80 mt-1.5 sm:mt-2 gap-1 sm:gap-2">
          <span className="flex items-center gap-1 text-white/70">
            <Calendar size={15} /> {dayOfWeek}, {formattedDate} at {formattedTime}
          </span>
          <span className="flex items-center gap-1 text-white/70">
            <MapPin size={15} /> {location || "Online"}
          </span>
          <span className="flex items-center gap-1 text-white/70">
            <Users size={15} /> Signed up: {signup_count}
          </span>
        </div>
      </div>

      <div className="mt-3 md:mt-0 md:ml-4 flex justify-end">
        <AuthButton onClick={onClick}>{buttonText}</AuthButton>
      </div>
    </div>
  );
};

export default Card;
