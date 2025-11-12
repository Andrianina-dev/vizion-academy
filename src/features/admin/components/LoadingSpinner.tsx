import React from 'react';
import { ProgressSpinner } from 'primereact/progressspinner';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-content-center align-items-center min-h-screen">
      <div className="text-center">
        <ProgressSpinner 
          style={{ width: '50px', height: '50px' }} 
          strokeWidth="4" 
          animationDuration=".5s" 
        />
        <p className="mt-3 text-gray-600">Chargement en cours...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
