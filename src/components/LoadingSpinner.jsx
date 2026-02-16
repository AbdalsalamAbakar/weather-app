import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-900 
                      rounded-full animate-pulse-slow"></div>
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-500 
                      rounded-full border-t-transparent animate-spin"></div>
      </div>
      <p className="mt-4 text-gray-600 dark:text-gray-400 animate-pulse">
        Fetching weather data...
      </p>
    </div>
  );
};

export default LoadingSpinner;