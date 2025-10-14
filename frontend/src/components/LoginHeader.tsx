interface LoginHeaderProps {
  onToggleSignup?: (value: boolean) => void;
}

const LoginHeader = ({ onToggleSignup }: LoginHeaderProps) => {
  return (
    <header className="w-full py-4 px-6 flex items-center justify-between z-10 relative">
      <a href="/" className="text-white text-2xl font-bold">
        Pulse<span className="font-light">Hub</span>
      </a>

      <nav className="flex items-center gap-6">
        <button
          onClick={() => onToggleSignup?.(false)}
          className="text-white/80 hover:text-white font-medium transition-colors"
        >
          Login
        </button>
        <button
          onClick={() => onToggleSignup?.(true)}
          className="text-green-400 hover:text-green-300 font-medium transition-colors"
        >
          Sign Up
        </button>
      </nav>
    </header>
  );
};

export default LoginHeader;
