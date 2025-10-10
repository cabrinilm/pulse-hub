import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="fixed bottom-0 w-full bg-white border-t flex justify-around p-2 md:hidden">
      <Link to="/" className="text-gray-600">Home</Link>
      <Link to="/events" className="text-gray-600">Events</Link>
      <Link to="/signups" className="text-gray-600">Signups</Link>
      <Link to="/my-events" className="text-gray-600">My Events</Link>
      <Link to="/settings" className="text-gray-600">Settings</Link>
    </nav>
  );
};

export default Navbar;