// src/components/Button.tsx
import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  style?: React.CSSProperties; 
}

const Button = ({
  children,
  variant = "primary",
  className = "",
  onClick,
  disabled = false,
  type = "button",
  style,
}: ButtonProps) => {
  const variantClasses = {
    primary:
      "bg-[#2563EB] hover:bg-[#1D4ED8] text-white focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2",
    secondary:
      "bg-[#10B981] hover:bg-[#059669] text-white focus:ring-2 focus:ring-[#10B981] focus:ring-offset-2",
  };

  return (
    <button
      type={type}
      className={`px-4 py-3 rounded-md font-medium w-full transition-all duration-200 active:scale-95 cursor-pointer ${
        variantClasses[variant]
      } ${className}`}
      onClick={onClick}
      disabled={disabled}
      style={style}
    >
      {children}
    </button>
  );
};

export default Button;

