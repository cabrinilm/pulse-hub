// src/components/LoginHeader.tsx
import { Link } from 'react-router-dom';

const LoginHeader = () => {
  return (
    <header className="w-full py-4 bg-white dark:bg-neutral-dark shadow-md border-b border-slate-200 dark:border-neutral-dark flex items-center justify-between px-6">
      {/* Logo */}
      <Link to="/" className="text-[#2563EB] dark:text-[#3B82F6] text-xl font-bold">
        PulseHub
      </Link>

      {/* Navegação */}
      <nav className="flex items-center gap-4">
        <Link
          to="/login"
          className="text-[#2563EB] dark:text-[#3B82F6] hover:text-[#1D4ED8] dark:hover:text-[#60A5FA] font-medium transition-colors"
        >
          Login
        </Link>
        <Link
          to="/signup"
          className="text-[#10B981] dark:text-[#22C55E] hover:text-[#059669] dark:hover:text-[#34D399] font-medium transition-colors"
        >
          Sign Up
        </Link>
      </nav>
    </header>
  );
};

export default LoginHeader;
