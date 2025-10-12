// src/components/BackArrow.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface BackArrowProps {
  to: string;
  animateOnClick?: boolean; // ativa animação quando clicado
}

const BackArrow: React.FC<BackArrowProps> = ({ to, animateOnClick = false }) => {
  const navigate = useNavigate();
  const [isClicked, setIsClicked] = useState(false);

  const handleBack = () => {
    if (animateOnClick) {
      setIsClicked(true);
      setTimeout(() => {
        navigate(to);
      }, 150); // tempo da animação
    } else {
      navigate(to);
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-transform duration-150 ${
        isClicked ? 'scale-90' : 'scale-100'
      }`}
    >
      <ArrowLeft size={24} />
    </button>
  );
};

export default BackArrow;



