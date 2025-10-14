import React from 'react';
import Lottie from 'lottie-react';
import loadingAnimation from '../lottie/Trail_lottie.json';

interface LoadingOverlayProps {
  message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm z-50">
      <Lottie animationData={loadingAnimation} loop={true} className="w-56 h-56" />
      <p className="mt-4 text-white/80 text-lg">{message}</p>
    </div>
  );
};

export default LoadingOverlay;
