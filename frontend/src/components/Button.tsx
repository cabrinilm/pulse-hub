interface ButtonProps {
    onClick?: () => void;
    children: React.ReactNode;
    variant?: 'primary' | 'secondary';
    className?: string;
    disabled?: boolean;  // Adicionado para handling de loading/desabilitado
  }
  
  const Button = ({ onClick, children, variant = 'primary', className = '', disabled = false }: ButtonProps) => {
    const baseStyle = 'px-4 py-2 rounded-md text-white focus:outline-none';
    const variantStyle = variant === 'primary' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-500 hover:bg-gray-600';
    const disabledStyle = disabled ? 'opacity-50 cursor-not-allowed' : '';
  
    return (
      <button onClick={onClick} className={`${baseStyle} ${variantStyle} ${disabledStyle} ${className}`} disabled={disabled}>
        {children}
      </button>
    );
  };
  
  export default Button;