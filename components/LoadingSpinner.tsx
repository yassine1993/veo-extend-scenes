
import React, { useState, useEffect } from 'react';
import { LOADING_MESSAGES } from '../constants';

const LoadingSpinner: React.FC = () => {
  const [message, setMessage] = useState(LOADING_MESSAGES[0]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setMessage(prevMessage => {
        const currentIndex = LOADING_MESSAGES.indexOf(prevMessage);
        const nextIndex = (currentIndex + 1) % LOADING_MESSAGES.length;
        return LOADING_MESSAGES[nextIndex];
      });
    }, 4000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
      <div className="w-16 h-16 border-4 border-t-4 border-gray-600 border-t-cyan-400 rounded-full animate-spin mb-4"></div>
      <p className="text-lg text-gray-300 transition-opacity duration-500">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
