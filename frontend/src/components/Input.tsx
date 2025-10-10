interface InputProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
    type?: string;
    className?: string;
  }
  
  const Input = ({ value, onChange, placeholder, type = 'text', className = '' }: InputProps) => {
    return (
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`p-2 border rounded-md w-full focus:outline-none focus:border-blue-500 ${className}`}
      />
    );
  };
  
  export default Input;