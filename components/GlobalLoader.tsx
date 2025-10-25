import React from 'react';
import { Spinner } from './Icons';

export const GlobalLoader: React.FC = () => {
  return (
    <div 
      className="fixed inset-0 bg-gray-900 bg-opacity-75 z-[9999] flex flex-col justify-center items-center" 
      aria-live="assertive" 
      role="alert"
    >
      <Spinner className="h-12 w-12 text-white" />
      <p className="mt-4 text-white text-lg font-semibold">Processing...</p>
    </div>
  );
};
