import Button from "./Button";

interface CardProps {
    title: string;
    description: string | null;
    date: string;
    location: string | null;
    signup_count: number;
    onClick?: () => void;
  }
  
  const Card = ({ title, description, date, location, signup_count, onClick }: CardProps) => {
    return (
      <div className="p-4 border rounded-md shadow-sm bg-white flex flex-col md:flex-row items-start md:items-center cursor-pointer" onClick={onClick}>
        <div className="flex-1">
          <h3 className="text-lg font-bold">{title}</h3>
          <p className="text-sm text-gray-600">{description || 'No description'}</p>
          <p className="text-sm">Date: {date}</p>
          <p className="text-sm">Location: {location || 'No location'}</p>
          <p className="text-sm">Signed up: {signup_count}</p>
        </div>
        <Button variant="primary" className="mt-2 md:mt-0 md:ml-4">View Details</Button>
      </div>
    );
  };
  
  export default Card;