interface ButtonProps {
    onClick?: () => void;
    children: React.ReactNode;
    variant?: 'primary' | 'secondary';
    className?: string;
  }
  
  const Button = ({ onClick, children, variant = 'primary', className = '' }: ButtonProps) => {
    const baseStyle = 'px-4 py-2 rounded-md text-white focus:outline-none';
    const variantStyle = variant === 'primary' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-500 hover:bg-gray-600';
    return (
      <button onClick={onClick} className={`${baseStyle} ${variantStyle} ${className}`}>
        {children}
      </button>
    );
  };
  
  export default Button;