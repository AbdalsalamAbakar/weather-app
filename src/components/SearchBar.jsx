// src/components/SearchBar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaMapMarkerAlt, FaHistory, FaExclamationTriangle, FaQuestionCircle, FaTimes, FaTrash } from 'react-icons/fa';
import { useWeather } from '../context/WeatherContext';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [showLocationHelp, setShowLocationHelp] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showHistoryConfirm, setShowHistoryConfirm] = useState(false);
  const [cityToRemove, setCityToRemove] = useState(null);
  
  const { 
    searchWeather, 
    getWeatherByLocation, 
    searchHistory, 
    loading, 
    error,
    locationPermission,
    searchCitySuggestions,
    getWeatherByExactCoords,
    removeFromHistory,
    clearHistory
  } = useWeather();
  
  const searchRef = useRef(null);
  const helpRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowHistory(false);
        setShowSuggestions(false);
      }
      if (helpRef.current && !helpRef.current.contains(event.target)) {
        setShowLocationHelp(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search for suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsSearching(true);
      const results = await searchCitySuggestions(query);
      setSuggestions(results);
      setIsSearching(false);
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [query, searchCitySuggestions]);

  // Check if error is location-related
  useEffect(() => {
    if (error && error.toLowerCase().includes('location')) {
      setLocationError(error);
    } else {
      setLocationError(null);
    }
  }, [error]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      searchWeather(query);
      setQuery('');
      setShowHistory(false);
      setShowSuggestions(false);
      setLocationError(null);
    }
  };

  const handleHistoryClick = (city) => {
    searchWeather(city);
    setQuery('');
    setShowHistory(false);
    setShowSuggestions(false);
    setLocationError(null);
  };

  // Handle removing a single history item
  const handleRemoveHistoryItem = (city, e) => {
    e.stopPropagation();
    setCityToRemove(city);
    setShowHistoryConfirm(true);
  };

  const confirmRemoveHistory = () => {
    if (cityToRemove) {
      removeFromHistory(cityToRemove);
      setShowHistoryConfirm(false);
      setCityToRemove(null);
    }
  };

  const cancelRemoveHistory = () => {
    setShowHistoryConfirm(false);
    setCityToRemove(null);
  };

  // Handle clearing all history
  const handleClearAllHistory = (e) => {
    e.stopPropagation();
    if (window.confirm('Clear all search history?')) {
      clearHistory();
    }
  };

  const handleSuggestionClick = (city) => {
    getWeatherByExactCoords(city.lat, city.lon);
    setQuery(city.displayName);
    setShowSuggestions(false);
    setSuggestions([]);
    setLocationError(null);
  };

  const handleLocationClick = async () => {
    if (locationPermission === 'denied') {
      setShowLocationHelp(true);
    } else {
      try {
        setLocationError(null);
        await getWeatherByLocation();
      } catch (error) {
        console.log('Location request initiated');
      }
    }
  };

  const handleClearSearch = () => {
    setQuery('');
    setSuggestions([]);
  };

  const handleInputFocus = () => {
    setShowHistory(true);
    if (query.length >= 2) {
      setShowSuggestions(true);
    }
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    if (e.target.value.length >= 2) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const getBrowserHelpText = () => {
    const userAgent = navigator.userAgent;
    if (userAgent.indexOf("Firefox") > -1) {
      return {
        steps: [
          "Click the lock icon (🔒) in the address bar",
          "Click the 'X' next to 'Blocked' for location",
          "Select 'Allow' and refresh the page"
        ]
      };
    } else if (userAgent.indexOf("Edg") > -1) {
      return {
        steps: [
          "Click the lock icon (🔒) in the address bar",
          "Click 'Permissions for this site'",
          "Find 'Location' and change to 'Allow'",
          "Refresh the page"
        ]
      };
    } else {
      return {
        steps: [
          "Click the lock icon (🔒) in the address bar",
          "Click 'Site settings'",
          "Find 'Location' and change to 'Allow'",
          "Refresh the page"
        ]
      };
    }
  };

  const getLocationPermissionMessage = () => {
    if (locationPermission === 'denied') {
      const browserHelp = getBrowserHelpText();
      
      return (
        <div className="mt-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-start gap-3">
            <FaExclamationTriangle className="text-yellow-600 dark:text-yellow-400 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                📍 Location access is blocked
              </p>
              
              <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-2">
                <p>To enable location-based weather:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  {browserHelp.steps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
                
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => window.location.reload()}
                    className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 
                             text-white text-sm rounded-lg transition-colors duration-200"
                  >
                    Refresh Page
                  </button>
                  <button
                    onClick={() => setShowLocationHelp(!showLocationHelp)}
                    className="px-3 py-1 bg-yellow-100 dark:bg-yellow-800 
                             text-yellow-800 dark:text-yellow-200 text-sm rounded-lg 
                             hover:bg-yellow-200 dark:hover:bg-yellow-700 
                             transition-colors duration-200 flex items-center gap-1"
                  >
                    <FaQuestionCircle /> More Help
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {showLocationHelp && (
            <div className="mt-3 pt-3 border-t border-yellow-200 dark:border-yellow-800">
              <div className="text-sm text-yellow-700 dark:text-yellow-300">
                <p className="font-medium mb-2">🔧 Detailed Instructions:</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="font-bold">1.</span>
                    <span>Look at the top of your browser window - you'll see a lock icon (🔒) just before the website address (URL)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">2.</span>
                    <span>Click on this lock icon to open site permissions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">3.</span>
                    <span>Find "Location" in the permissions list and change it from "Block" to "Allow"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">4.</span>
                    <span>After changing, refresh this page and click "My Location" again</span>
                  </li>
                </ul>
                
                <div className="mt-3 p-2 bg-yellow-100 dark:bg-yellow-800/50 rounded">
                  <p className="text-xs">
                    <span className="font-medium">Note:</span> If you don't want to use location, 
                    you can still search for any city using the search box above!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative" ref={searchRef}>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder={locationPermission === 'denied' 
              ? "Search for any city (location is blocked)" 
              : "Search for a city..."}
            className={`w-full px-4 py-3 pl-12 pr-10 text-gray-900 dark:text-white 
                     bg-white dark:bg-gray-800 border rounded-lg 
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     transition-all duration-200
                     ${locationPermission === 'denied' 
                       ? 'border-yellow-300 dark:border-yellow-700' 
                       : 'border-gray-300 dark:border-gray-700'}`}
            disabled={loading}
            autoComplete="off"
          />
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 
                              text-gray-400 dark:text-gray-500" />
          
          {query && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2
                       text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
                       transition-colors duration-200"
              aria-label="Clear search"
            >
              <FaTimes />
            </button>
          )}
          
          {/* City Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 
                          border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg 
                          max-h-60 overflow-y-auto">
              <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {isSearching ? 'Searching...' : 'Select a city:'}
                </p>
              </div>
              {suggestions.map((city, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(city)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 
                           transition-colors duration-150"
                >
                  <div className="text-sm text-gray-900 dark:text-white">
                    {city.displayName}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Lat: {city.lat.toFixed(2)}, Lon: {city.lon.toFixed(2)}
                  </div>
                </button>
              ))}
            </div>
          )}
          
          {/* Search History with Remove Buttons */}
          {searchHistory.length > 0 && showHistory && !showSuggestions && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 
                          border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg 
                          max-h-60 overflow-y-auto">
              <div className="p-2 border-b border-gray-100 dark:border-gray-700 
                            flex justify-between items-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Recent Searches
                </p>
                {searchHistory.length > 1 && (
                  <button
                    onClick={handleClearAllHistory}
                    className="text-xs text-red-500 hover:text-red-600 
                             dark:text-red-400 dark:hover:text-red-300
                             flex items-center gap-1 transition-colors"
                  >
                    <FaTrash size={10} />
                    Clear All
                  </button>
                )}
              </div>
              {searchHistory.map((city, index) => (
                <div
                  key={index}
                  className="group relative flex items-center justify-between
                           hover:bg-gray-100 dark:hover:bg-gray-700 
                           transition-colors duration-150"
                >
                  <button
                    onClick={() => handleHistoryClick(city)}
                    className="flex-1 px-4 py-2 text-left flex items-center gap-2"
                  >
                    <FaHistory className="text-gray-400 dark:text-gray-500 text-sm" />
                    <span className="text-gray-700 dark:text-gray-300">{city}</span>
                  </button>
                  <button
                    onClick={(e) => handleRemoveHistoryItem(city, e)}
                    className="absolute right-2 p-1 opacity-0 group-hover:opacity-100
                             hover:bg-red-100 dark:hover:bg-red-900/30 
                             rounded-full transition-all duration-200"
                    title="Remove from history"
                  >
                    <FaTimes className="text-red-500 text-xs" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleLocationClick}
            className={`px-4 py-3 rounded-lg transition-colors duration-200 
                     border flex items-center justify-center gap-2
                     ${locationPermission === 'denied'
                       ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700 hover:bg-yellow-100 dark:hover:bg-yellow-800/30'
                       : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'
                     }`}
            title={locationPermission === 'denied' 
              ? 'Location access blocked - Click for help' 
              : 'Use my location'}
            disabled={loading && locationPermission !== 'denied'}
          >
            <FaMapMarkerAlt />
            <span className="hidden sm:inline">
              {locationPermission === 'denied' ? 'Location Help' : 'My Location'}
            </span>
          </button>
          
          <button
            type="submit"
            className="px-6 py-3 bg-blue-500 text-white rounded-lg 
                     hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors duration-200 font-medium flex-1 sm:flex-none
                     flex items-center justify-center gap-2"
            disabled={!query.trim() || loading}
          >
            <FaSearch className="sm:hidden" />
            <span>{loading ? 'Searching...' : 'Search'}</span>
          </button>
        </div>
      </form>

      {/* Location permission message */}
      {getLocationPermissionMessage()}

      {/* Location error message */}
      {locationError && locationPermission !== 'denied' && (
        <div className="mt-2 text-sm text-red-600 dark:text-red-400 
                      bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-start gap-2">
            <FaExclamationTriangle className="mt-0.5 flex-shrink-0" />
            <p>{locationError}</p>
          </div>
        </div>
      )}

      {/* Confirmation Modal for removing history item */}
      {showHistoryConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Remove from History
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to remove "{cityToRemove}" from your search history?
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelRemoveHistory}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 
                         text-gray-700 dark:text-gray-300 rounded-lg 
                         hover:bg-gray-200 dark:hover:bg-gray-600 
                         transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemoveHistory}
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

export default SearchBar;