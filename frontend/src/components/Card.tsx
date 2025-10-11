import { Calendar, MapPin, Users } from 'lucide-react';
import Button from "./Button";

interface CardProps {
  title: string;
  date: string;
  location: string | null;
  signup_count: number;
  onClick?: () => void;
}

const Card = ({ title, date, location, signup_count, onClick }: CardProps) => {
  const eventDate = new Date(date);
  const dayOfWeek = eventDate.toLocaleDateString('en-GB', { weekday: 'long' });
  const formattedDate = eventDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const formattedTime = eventDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      className="bg-white rounded-xl shadow-md p-4 md:p-6 flex flex-col md:flex-row md:items-center gap-4 cursor-pointer hover:shadow-lg transition-shadow duration-200 scale-[0.95] md:scale-100"
      onClick={onClick}
    >
      <div className="flex-1 flex flex-col gap-2">
        <h3 className="text-lg md:text-xl font-semibold text-gray-800">{title}</h3>
        
        <div className="flex flex-col sm:flex-row sm:justify-between text-sm text-gray-500 mt-2 gap-2">
          <span className="flex items-center gap-1">
            <Calendar size={16} />
            {`${dayOfWeek}, ${formattedDate} at ${formattedTime}`}
          </span>

          <span className="flex items-center gap-1">
            <MapPin size={16} />
            {location || 'Online'}
          </span>

          <span className="flex items-center gap-1">
            <Users size={16} />
            {`Signed up: ${signup_count}`}
          </span>
        </div>
      </div>

      <Button
        variant="primary"
        className="mt-3 md:mt-0 md:ml-4 text-sm md:text-base py-1.5 md:py-2"
        onClick={onClick}
      >
        View Details
      </Button>
    </div>
  );
};

export default Card;
