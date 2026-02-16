// src/components/Forecast.jsx
import React from 'react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { useWeather } from '../context/WeatherContext';

const Forecast = ({ data }) => {
  const { currentPage, itemsPerPage, setPage, unit } = useWeather();
  
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const visibleForecast = data.slice(startIndex, startIndex + itemsPerPage);

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setPage(currentPage + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setPage(currentPage - 1);
    }
  };

  return (
    <div className="weather-card">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        5-Day Forecast
      </h3>

      <div className="space-y-3">
        {visibleForecast.map((day, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 
                     bg-gray-50 dark:bg-gray-700/50 rounded-lg
                     hover:bg-gray-100 dark:hover:bg-gray-700 
                     transition-colors duration-200"
          >
            <div className="w-24">
              <p className="font-medium text-gray-900 dark:text-white">
                {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* FIXED: Changed from http:// to https:// */}
              <img
                src={`https://openweathermap.org/img/wn/${day.icon}.png`}
                alt={day.description}
                className="w-10 h-10"
              />
              <p className="text-sm text-gray-600 dark:text-gray-300 capitalize w-24">
                {day.description}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">Min</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {Math.round(day.tempMin)}°{unit === 'metric' ? 'C' : 'F'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">Max</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {Math.round(day.tempMax)}°{unit === 'metric' ? 'C' : 'F'}
                </p>
              </div>
              <div className="text-center hidden sm:block">
                <p className="text-xs text-gray-500 dark:text-gray-400">Humidity</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {day.avgHumidity}%
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6 pt-4 
                      border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handlePrev}
            disabled={currentPage === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm
                     bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                     rounded-lg disabled:opacity-50 disabled:cursor-not-allowed
                     hover:bg-gray-200 dark:hover:bg-gray-600 
                     transition-colors duration-200"
          >
            <FaArrowLeft /> Previous
          </button>
          
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage + 1} of {totalPages}
          </span>
          
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages - 1}
            className="flex items-center gap-2 px-4 py-2 text-sm
                     bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                     rounded-lg disabled:opacity-50 disabled:cursor-not-allowed
                     hover:bg-gray-200 dark:hover:bg-gray-600 
                     transition-colors duration-200"
          >
            Next <FaArrowRight />
          </button>
        </div>
      )}
    </div>
  );
};

export default Forecast;