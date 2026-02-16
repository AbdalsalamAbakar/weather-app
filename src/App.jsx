// src/App.jsx
import React, { useEffect } from 'react';
import { WeatherProvider, useWeather } from './context/WeatherContext';
import SearchBar from './components/SearchBar';
import CurrentWeather from './components/CurrentWeather';
import Forecast from './components/Forecast';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import ThemeToggle from './components/ThemeToggle';
import UnitToggle from './components/UnitToggle';
import FavoritesBar from './components/FavoritesBar';

const WeatherDashboard = () => {
  const { 
    currentWeather, 
    forecast, 
    loading, 
    error, 
    getWeatherByLocation,
    searchWeather,
    locationPermission,
    checkGeolocationStatus
  } = useWeather();

  useEffect(() => {
    checkGeolocationStatus();

    const initializeWeather = async () => {
      if (locationPermission === 'denied') {
        console.log('Location denied, showing default city (London)');
        searchWeather('London');
      } else {
        try {
          const locationPromise = getWeatherByLocation();
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Location request timeout')), 5000);
          });

          await Promise.race([locationPromise, timeoutPromise]);
        } catch (error) {
          console.log('Using default city (London)');
          searchWeather('London');
        }
      }
    };

    initializeWeather();
  }, [locationPermission]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 
                    dark:from-gray-900 dark:to-gray-800 
                    transition-colors duration-200">
      
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-br from-blue-50 to-blue-100 
                      dark:from-gray-900 dark:to-gray-800 border-b border-gray-200 
                      dark:border-gray-700 shadow-sm">
        <div className="container mx-auto px-4 py-4 max-w-6xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <div className="text-3xl sm:text-4xl" role="img" aria-label="Weather App Logo">
                  🌤️
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                    Weather Forecast
                  </h1>
                  {locationPermission === 'denied' && (
                    <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1 truncate">
                      ⚠️ Showing default weather (London)
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2 self-end sm:self-auto flex-shrink-0">
              <UnitToggle />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="mb-6">
          <SearchBar />
        </div>

        <FavoritesBar />

        {error && !error.toLowerCase().includes('location') && locationPermission !== 'denied' && (
          <div className="mb-4">
            <ErrorMessage message={error} />
          </div>
        )}

        {loading && (
          <div className="mt-8">
            <LoadingSpinner />
          </div>
        )}

        {!loading && currentWeather && (
          <div className="space-y-4 sm:space-y-6">
            <CurrentWeather data={currentWeather} />
            {forecast.length > 0 && <Forecast data={forecast} />}
          </div>
        )}

        {!loading && !currentWeather && !error && (
          <div className="text-center py-8 sm:py-12">
            <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg">
              🔍 Search for a city to see the weather forecast
            </p>
            {locationPermission === 'denied' && (
              <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">
                Location is blocked - you can still search for any city manually
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

function App() {
  return (
    <WeatherProvider>
      <WeatherDashboard />
    </WeatherProvider>
  );
}

export default App;