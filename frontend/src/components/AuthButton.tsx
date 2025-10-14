// src/components/AuthButton.tsx
import React from "react";

interface AuthButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

const AuthButton = ({ children, onClick, disabled = false }: AuthButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-6 py-2 rounded-lg font-medium
        bg-blue-500 hover:bg-blue-600 active:scale-95
        transition-all duration-200
        cursor-pointer
        w-full sm:w-auto
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      {children}
    </button>
  );
};

export default AuthButton;
