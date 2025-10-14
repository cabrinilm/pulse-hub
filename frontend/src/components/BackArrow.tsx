import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface BackArrowProps {
  to: string;
  animateOnClick?: boolean;
}

const BackArrow: React.FC<BackArrowProps> = ({ to, animateOnClick = false }) => {
  const navigate = useNavigate();
  const [isClicked, setIsClicked] = useState(false);

  const handleBack = () => {
    if (animateOnClick) {
      setIsClicked(true);
      setTimeout(() => navigate(to), 150);
    } else {
      navigate(to);
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`p-2 rounded-full bg-black/30 backdrop-blur-md shadow-lg
        hover:bg-black/40 transition-all duration-200
        ${isClicked ? 'scale-90' : 'scale-100'}`}
    >
      <ArrowLeft size={24} className="text-white" />
    </button>
  );
};

export default BackArrow;



