import React from 'react';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import { useWeather } from '../context/WeatherContext';

const ErrorMessage = ({ message }) => {
  const { clearError } = useWeather();

  return (
    <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 
                    rounded-lg p-4 mb-6 relative animate__animated animate__fadeIn">
      <div className="flex items-start">
        <FaExclamationTriangle className="text-red-500 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
            Error
          </h3>
          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
            {message}
          </p>
        </div>
        <button
          onClick={clearError}
          className="ml-4 text-red-500 dark:text-red-400 hover:text-red-600 
                   dark:hover:text-red-300 transition-colors duration-200"
        >
          <FaTimes />
        </button>
      </div>
    </div>
  );
};

export default ErrorMessage;