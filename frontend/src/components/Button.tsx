interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset"; // ✅ Adicionado
}

const Button = ({
  children,
  variant = "primary",
  className = "",
  onClick,
  disabled = false,
  type = "button", // ✅ Valor padrão
}: ButtonProps) => {
  return (
    <button
      type={type} // ✅ Agora o botão aceita "submit"
      className={`btn-${variant} ${className} transition-all duration-200 active:scale-95`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
