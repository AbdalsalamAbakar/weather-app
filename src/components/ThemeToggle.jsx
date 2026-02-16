import React, { useEffect } from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';
import { useWeather } from '../context/WeatherContext';

const ThemeToggle = () => {
  const { theme, changeTheme } = useWeather();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <button
      onClick={() => changeTheme(theme === 'light' ? 'dark' : 'light')}
      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 
                 text-gray-700 dark:text-gray-300 
                 hover:bg-gray-200 dark:hover:bg-gray-700 
                 transition-colors duration-200"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? <FaMoon /> : <FaSun />}
    </button>
  );
};

export default ThemeToggle;