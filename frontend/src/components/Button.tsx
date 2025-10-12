// src/components/Button.tsx
interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset"; // <- adicionamos aqui
}

const Button = ({ children, variant = "primary", className = "", onClick, type = "button" }: ButtonProps) => {
  const baseStyles = "rounded px-4 py-2 font-medium transition-colors";
  const variantStyles =
    variant === "primary"
      ? "bg-blue-600 text-white hover:bg-blue-700"
      : "bg-gray-200 text-gray-800 hover:bg-gray-300";

  return (
    <button type={type} onClick={onClick} className={`${baseStyles} ${variantStyles} ${className}`}>
      {children}
    </button>
  );
};

export default Button;
