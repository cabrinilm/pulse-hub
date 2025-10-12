// src/components/Card.tsx
import Button from "./Button";
import { Calendar, MapPin, Users } from "lucide-react";

interface CardProps {
  title: string;
  date: string;
  location: string | null;
  signup_count: number;
  onClick?: () => void;   // View Details
  editMode?: boolean;     // mostrar botão Edit Event
  onEdit?: () => void;    // callback do botão Edit Event
}

const Card = ({ title, date, location, signup_count, onClick, editMode = false, onEdit }: CardProps) => {
  const eventDate = new Date(date);
  const dayOfWeek = eventDate.toLocaleDateString('en-GB', { weekday: 'long' });
  const formattedDate = eventDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const formattedTime = eventDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-white rounded-xl shadow-md p-5 sm:p-6 flex flex-col md:flex-row md:items-center gap-3 sm:gap-4">
      <div className="flex-1 flex flex-col gap-1.5 sm:gap-2">
        <h3 className="text-xl sm:text-xl font-semibold text-gray-800">{title}</h3>
        <div className="flex flex-col sm:flex-row sm:justify-between text-sm text-gray-500 mt-1.5 sm:mt-2 gap-1 sm:gap-2">
          <span className="flex items-center gap-1">
            <Calendar size={15} className="text-blue-500" /> {dayOfWeek}, {formattedDate} at {formattedTime}
          </span>
          <span className="flex items-center gap-1">
            <MapPin size={15} className="text-red-500" /> {location || 'Online'}
          </span>
          <span className="flex items-center gap-1">
            <Users size={15} className="text-green-500" /> Signed up: {signup_count}
          </span>
        </div>
      </div>

      {/* Botões */}
      <div className="flex flex-col md:flex-row gap-2 mt-3 md:mt-0 md:ml-4">
        {onClick && !editMode && (
          <Button variant="primary" className="px-4 py-2 text-sm sm:text-base" onClick={onClick}>
            View Details
          </Button>
        )}
        {editMode && onEdit && (
          <Button variant="primary" className="px-4 py-2 text-sm sm:text-base" onClick={onEdit}>
            Edit Event
          </Button>
        )}
      </div>
    </div>
  );
};

export default Card;
