import React from 'react';
import { FaTemperatureHigh } from 'react-icons/fa';
import { useWeather } from '../context/WeatherContext';

const UnitToggle = () => {
  const { unit, changeUnit } = useWeather();

  return (
    <button
      onClick={() => changeUnit(unit === 'metric' ? 'imperial' : 'metric')}
      className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 
                 text-gray-700 dark:text-gray-300 
                 hover:bg-gray-200 dark:hover:bg-gray-700 
                 transition-colors duration-200 font-medium flex items-center gap-2"
    >
      <FaTemperatureHigh />
      {unit === 'metric' ? '°C' : '°F'}
    </button>
  );
};

export default UnitToggle;