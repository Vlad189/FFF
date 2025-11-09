import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div className="w-8 h-8 border-4 border-black border-t-yellow-300 rounded-full animate-spin"></div>
      <p className="text-xs">АНАЛІЗ РИНКУ...</p>
    </div>
  );
};

export default LoadingSpinner;
