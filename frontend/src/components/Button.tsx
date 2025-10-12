interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
  onClick?: () => void;
  disabled?: boolean; // 🔹 Adicione isto
}

const Button = ({ children, variant = "primary", className = "", onClick, disabled = false }: ButtonProps) => {
  return (
    <button
      className={`btn-${variant} ${className}`}
      onClick={onClick}
      disabled={disabled} // 🔹 Agora funciona
    >
      {children}
    </button>
  );
};

export default Button;
