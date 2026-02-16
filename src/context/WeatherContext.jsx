// src/context/WeatherContext.jsx
import React, { createContext, useContext, useReducer, useCallback } from 'react';
import weatherService from '../services/weatherService';

const WeatherContext = createContext();

const initialState = {
  currentWeather: null,
  forecast: [],
  loading: false,
  error: null,
  searchHistory: JSON.parse(localStorage.getItem('searchHistory')) || [],
  favorites: JSON.parse(localStorage.getItem('favorites')) || [],
  unit: 'metric',
  theme: localStorage.getItem('theme') || 'light',
  currentPage: 0,
  itemsPerPage: 5,
  locationPermission: 'prompt'
};

const weatherReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    
    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        currentWeather: action.payload.current,
        forecast: action.payload.forecast,
        currentPage: 0,
        error: null
      };
    
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    
    case 'ADD_TO_HISTORY':
      const newHistory = [
        action.payload, 
        ...state.searchHistory.filter(city => city !== action.payload)
      ].slice(0, 10);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
      return { ...state, searchHistory: newHistory };
    
    case 'REMOVE_FROM_HISTORY':
      const filteredHistory = state.searchHistory.filter(city => city !== action.payload);
      localStorage.setItem('searchHistory', JSON.stringify(filteredHistory));
      return { ...state, searchHistory: filteredHistory };
    
    case 'CLEAR_HISTORY':
      localStorage.setItem('searchHistory', JSON.stringify([]));
      return { ...state, searchHistory: [] };
    
    // Favorites cases
    case 'ADD_TO_FAVORITES':
      // Check if already in favorites
      if (state.favorites.some(fav => fav.city === action.payload.city)) {
        return state;
      }
      const newFavorites = [...state.favorites, action.payload];
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
      return { ...state, favorites: newFavorites };
    
    case 'REMOVE_FROM_FAVORITES':
      const filteredFavorites = state.favorites.filter(fav => fav.city !== action.payload);
      localStorage.setItem('favorites', JSON.stringify(filteredFavorites));
      return { ...state, favorites: filteredFavorites };
    
    case 'CLEAR_FAVORITES':
      localStorage.setItem('favorites', JSON.stringify([]));
      return { ...state, favorites: [] };
    
    case 'SET_UNIT':
      return { ...state, unit: action.payload };
    
    case 'SET_THEME':
      localStorage.setItem('theme', action.payload);
      if (action.payload === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return { ...state, theme: action.payload };
    
    case 'SET_PAGE':
      return { ...state, currentPage: action.payload };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    case 'SET_LOCATION_PERMISSION':
      return { ...state, locationPermission: action.payload };
    
    default:
      return state;
  }
};

export const WeatherProvider = ({ children }) => {
  const [state, dispatch] = useReducer(weatherReducer, initialState);

  const checkGeolocationStatus = useCallback(async () => {
    if (!navigator.geolocation) {
      dispatch({ type: 'SET_LOCATION_PERMISSION', payload: 'unsupported' });
      return 'unsupported';
    }
    
    try {
      const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
      if (import.meta.env.DEV) {
        console.log('Geolocation permission status:', permissionStatus.state);
      }
      dispatch({ type: 'SET_LOCATION_PERMISSION', payload: permissionStatus.state });
      
      permissionStatus.addEventListener('change', () => {
        if (import.meta.env.DEV) {
          console.log('Permission changed to:', permissionStatus.state);
        }
        dispatch({ type: 'SET_LOCATION_PERMISSION', payload: permissionStatus.state });
      });
      
      return permissionStatus.state;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.log('Could not check permission status:', error);
      }
      dispatch({ type: 'SET_LOCATION_PERMISSION', payload: 'unknown' });
      return 'unknown';
    }
  }, []);

  const searchWeather = useCallback(async (city) => {
    if (!city.trim()) return;

    dispatch({ type: 'FETCH_START' });
    
    try {
      const [current, forecast] = await Promise.all([
        weatherService.getCurrentWeather(city, state.unit),
        weatherService.getForecast(city, state.unit)
      ]);

      dispatch({
        type: 'FETCH_SUCCESS',
        payload: { current, forecast }
      });

      dispatch({
        type: 'ADD_TO_HISTORY',
        payload: city
      });
    } catch (error) {
      dispatch({
        type: 'FETCH_ERROR',
        payload: error.message
      });
    }
  }, [state.unit]);

  const getWeatherByLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      dispatch({
        type: 'FETCH_ERROR',
        payload: 'Geolocation is not supported by your browser. Please search for a city manually.'
      });
      dispatch({ type: 'SET_LOCATION_PERMISSION', payload: 'unsupported' });
      return;
    }

    dispatch({ type: 'FETCH_START' });

    try {
      const permissionStatus = await checkGeolocationStatus();
      
      if (permissionStatus === 'denied') {
        dispatch({ 
          type: 'SET_LOCATION_PERMISSION', 
          payload: 'denied' 
        });
        dispatch({ type: 'FETCH_ERROR', payload: null });
        dispatch({ type: 'FETCH_SUCCESS', payload: { current: null, forecast: [] } });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            if (import.meta.env.DEV) {
              console.log('Got location:', latitude, longitude);
            }
            
            const data = await weatherService.getWeatherByCoords(latitude, longitude, state.unit);
            
            dispatch({
              type: 'FETCH_SUCCESS',
              payload: data
            });
            
            if (data.current?.city) {
              dispatch({
                type: 'ADD_TO_HISTORY',
                payload: data.current.city
              });
            }
          } catch (error) {
            dispatch({
              type: 'FETCH_ERROR',
              payload: error.message
            });
          }
        },
        (error) => {
          if (import.meta.env.DEV) {
            console.log('Geolocation error:', error);
          }
          
          switch(error.code) {
            case error.PERMISSION_DENIED:
              dispatch({ type: 'SET_LOCATION_PERMISSION', payload: 'denied' });
              dispatch({ type: 'FETCH_ERROR', payload: null });
              dispatch({ type: 'FETCH_SUCCESS', payload: { current: null, forecast: [] } });
              return;
            case error.POSITION_UNAVAILABLE:
              dispatch({
                type: 'FETCH_ERROR',
                payload: 'Location information is unavailable. Please search for a city manually.'
              });
              break;
            case error.TIMEOUT:
              dispatch({
                type: 'FETCH_ERROR',
                payload: 'Location request timed out. Please search for a city manually.'
              });
              break;
            default:
              dispatch({
                type: 'FETCH_ERROR',
                payload: 'Unable to retrieve your location. Please search for a city manually.'
              });
          }
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error in getWeatherByLocation:', error);
      }
      dispatch({
        type: 'FETCH_ERROR',
        payload: 'An error occurred while trying to get your location.'
      });
    }
  }, [state.unit, checkGeolocationStatus]);

  // History management
  const removeFromHistory = useCallback((city) => {
    dispatch({
      type: 'REMOVE_FROM_HISTORY',
      payload: city
    });
  }, []);

  const clearHistory = useCallback(() => {
    dispatch({ type: 'CLEAR_HISTORY' });
  }, []);

  // Favorites management
  const addToFavorites = useCallback((cityData) => {
    dispatch({
      type: 'ADD_TO_FAVORITES',
      payload: cityData
    });
  }, []);

  const removeFromFavorites = useCallback((cityName) => {
    dispatch({
      type: 'REMOVE_FROM_FAVORITES',
      payload: cityName
    });
  }, []);

  const clearFavorites = useCallback(() => {
    dispatch({ type: 'CLEAR_FAVORITES' });
  }, []);

  const isFavorite = useCallback((cityName) => {
    return state.favorites.some(fav => fav.city === cityName);
  }, [state.favorites]);

  const changeUnit = useCallback((unit) => {
    dispatch({ type: 'SET_UNIT', payload: unit });
    if (state.currentWeather?.city) {
      searchWeather(state.currentWeather.city);
    }
  }, [state.currentWeather, searchWeather]);

  const changeTheme = useCallback((theme) => {
    dispatch({ type: 'SET_THEME', payload: theme });
  }, []);

  const setPage = useCallback((page) => {
    dispatch({ type: 'SET_PAGE', payload: page });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const searchCitySuggestions = useCallback(async (query) => {
    try {
      const suggestions = await weatherService.searchCities(query);
      return suggestions;
    } catch (error) {
      console.error('Error getting suggestions:', error);
      return [];
    }
  }, []);

  const getWeatherByExactCoords = useCallback(async (lat, lon) => {
    dispatch({ type: 'FETCH_START' });
    
    try {
      const data = await weatherService.getWeatherByCoords(lat, lon, state.unit);
      
      dispatch({
        type: 'FETCH_SUCCESS',
        payload: data
      });

      if (data.current?.city) {
        dispatch({
          type: 'ADD_TO_HISTORY',
          payload: data.current.city
        });
      }
    } catch (error) {
      dispatch({
        type: 'FETCH_ERROR',
        payload: error.message
      });
    }
  }, [state.unit]);

  const value = {
    ...state,
    searchWeather,
    getWeatherByLocation,
    changeUnit,
    changeTheme,
    setPage,
    clearError,
    checkGeolocationStatus,
    searchCitySuggestions,
    getWeatherByExactCoords,
    removeFromHistory,
    clearHistory,
    addToFavorites,
    removeFromFavorites,
    clearFavorites,
    isFavorite
  };

  return (
    <WeatherContext.Provider value={value}>
      {children}
    </WeatherContext.Provider>
  );
};

export const useWeather = () => {
  const context = useContext(WeatherContext);
  if (context === undefined) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
};