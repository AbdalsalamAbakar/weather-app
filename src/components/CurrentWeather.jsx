// src/components/CurrentWeather.jsx
import React from 'react';
import { 
  FaThermometerHalf, FaTint, FaWind, FaCompress, 
  FaSun, FaMoon, FaStar, FaRegStar
} from 'react-icons/fa';
import { useWeather } from '../context/WeatherContext';

const CurrentWeather = ({ data }) => {
  const { unit, addToFavorites, removeFromFavorites, isFavorite } = useWeather();
  
  // Safely check if functions exist
  if (!addToFavorites || !removeFromFavorites || !isFavorite) {
    console.error('Favorite functions not available in context');
    return <div>Error: Favorite functions not available</div>;
  }
  
  const isFav = isFavorite(data.city);

  const handleFavoriteToggle = () => {
    console.log('Toggling favorite for:', data.city);
    
    // Create city data with all required fields
    const cityData = {
      city: data.city,
      country: data.country || '',
      temp: data.temperature,
      unit: unit,
      icon: data.icon || '01d',
      timestamp: Date.now()
    };
    
    console.log('City data:', cityData);
    
    if (isFav) {
      console.log('Removing:', data.city);
      removeFromFavorites(data.city);
    } else {
      console.log('Adding:', cityData);
      addToFavorites(cityData);
    }
  };

  const getWindDirection = (deg) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 
                       'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(deg / 22.5) % 16;
    return directions[index];
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getLastUpdated = () => {
    return new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="weather-card relative">
      {/* Favorite Button */}
      <button
        onClick={handleFavoriteToggle}
        className="absolute top-4 right-4 p-2 rounded-full
                   hover:bg-gray-100 dark:hover:bg-gray-700 
                   transition-colors duration-200 group"
        title={isFav ? 'Remove from favorites' : 'Add to favorites'}
      >
        {isFav ? (
          <FaStar className="text-yellow-500 text-xl" />
        ) : (
          <FaRegStar className="text-gray-400 group-hover:text-yellow-500 text-xl" />
        )}
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {data.city}, {data.country}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Last updated: {getLastUpdated()}
          </p>
        </div>
        
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          {/* FIXED: Using HTTPS for image */}
          <img 
            src={`https://openweathermap.org/img/wn/${data.icon}@4x.png`}
            alt={data.description}
            className="w-20 h-20"
          />
          <div>
            <div className="text-5xl font-bold text-gray-900 dark:text-white">
              {data.temperature}°{unit === 'metric' ? 'C' : 'F'}
            </div>
            <p className="text-gray-600 dark:text-gray-400 capitalize">
              {data.description}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
            <FaThermometerHalf />
            <span className="metric-label">Feels Like</span>
          </div>
          <div className="metric-value">
            {data.feelsLike}°{unit === 'metric' ? 'C' : 'F'}
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
            <FaTint />
            <span className="metric-label">Humidity</span>
          </div>
          <div className="metric-value">{data.humidity}%</div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
            <FaWind />
            <span className="metric-label">Wind</span>
          </div>
          <div className="metric-value">
            {data.windSpeed} {unit === 'metric' ? 'm/s' : 'mph'}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {getWindDirection(data.windDeg)}
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
            <FaCompress />
            <span className="metric-label">Pressure</span>
          </div>
          <div className="metric-value">{data.pressure} hPa</div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between">
          <div className="flex items-center gap-2">
            <FaSun className="text-yellow-500" />
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Sunrise</span>
              <p className="font-semibold text-gray-900 dark:text-white">
                {formatTime(data.sunrise)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <FaMoon className="text-gray-400" />
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Sunset</span>
              <p className="font-semibold text-gray-900 dark:text-white">
                {formatTime(data.sunset)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentWeather;