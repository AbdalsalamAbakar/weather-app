// src/components/FavoritesBar.jsx
import React, { useState } from 'react';
import { FaStar, FaTrash, FaTimes, FaHeart, FaRegHeart } from 'react-icons/fa';
import { useWeather } from '../context/WeatherContext';

const FavoritesBar = () => {
  const { 
    favorites = [], 
    removeFromFavorites, 
    clearFavorites, 
    searchWeather,
    currentWeather,
    unit 
  } = useWeather();
  
  const [showConfirm, setShowConfirm] = useState(false);
  const [cityToRemove, setCityToRemove] = useState(null);

  // Safe check for favorites
  if (!favorites || favorites.length === 0) {
    return (
      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
          <FaRegHeart className="text-gray-400" />
          No favorite cities yet. Click the ★ on any city to add it.
        </p>
      </div>
    );
  }

  const handleRemoveClick = (city, e) => {
    e.stopPropagation();
    setCityToRemove(city);
    setShowConfirm(true);
  };

  const confirmRemove = () => {
    if (cityToRemove) {
      removeFromFavorites(cityToRemove);
      setShowConfirm(false);
      setCityToRemove(null);
    }
  };

  const cancelRemove = () => {
    setShowConfirm(false);
    setCityToRemove(null);
  };

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <FaStar className="text-yellow-500" />
          Favorite Cities ({favorites.length})
        </h3>
        {favorites.length > 0 && (
          <button
            onClick={clearFavorites}
            className="text-xs text-red-500 hover:text-red-600 dark:text-red-400 
                     dark:hover:text-red-300 flex items-center gap-1 transition-colors"
          >
            <FaTrash size={10} />
            Clear All
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {favorites.map((fav) => (
          <div
            key={fav.city}
            className={`group relative flex items-center gap-2 px-3 py-2 rounded-lg 
                      border transition-all duration-200 cursor-pointer
                      ${currentWeather?.city === fav.city
                        ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                      }`}
            onClick={() => searchWeather(fav.city)}
          >
            {/* Weather icon if available */}
            {fav.icon && (
              <img 
                src={`http://openweathermap.org/img/wn/${fav.icon}.png`}
                alt=""
                className="w-6 h-6"
              />
            )}
            
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {fav.city}
              </p>
              {fav.temp && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {fav.temp}°{fav.unit === 'metric' ? 'C' : 'F'}
                </p>
              )}
            </div>

            {/* Remove button */}
            <button
              onClick={(e) => handleRemoveClick(fav.city, e)}
              className="ml-1 p-1 opacity-0 group-hover:opacity-100 
                       hover:bg-red-100 dark:hover:bg-red-900/30 
                       rounded-full transition-all duration-200"
              title="Remove from favorites"
            >
              <FaTimes className="text-red-500 text-xs" />
            </button>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Remove from Favorites
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to remove {cityToRemove} from your favorites?
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelRemove}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 
                         text-gray-700 dark:text-gray-300 rounded-lg 
                         hover:bg-gray-200 dark:hover:bg-gray-600 
                         transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemove}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg 
                         hover:bg-red-600 transition-colors duration-200"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FavoritesBar;