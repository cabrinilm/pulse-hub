// src/components/LoginHeader.tsx
import { Link } from 'react-router-dom';

const LoginHeader = () => {
  return (
    <header className="w-full py-4 px-6 flex items-center justify-between z-10 relative">
    
      <Link to="/" className="text-white text-2xl font-bold">
        Pulse<span className="font-light">Hub</span>
      </Link>

    
      <nav className="flex items-center gap-6">
        <Link
          to="/login"
          className="text-white/80 hover:text-white font-medium transition-colors"
        >
          Login
        </Link>
        <Link
          to="/signup"
          className="text-green-400 hover:text-green-300 font-medium transition-colors"
        >
          Sign Up
        </Link>
      </nav>
    </header>
  );
};

export default LoginHeader;
