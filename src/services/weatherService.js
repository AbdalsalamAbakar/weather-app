// src/services/weatherService.js
import axios from 'axios';

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const BASE_URL = import.meta.env.VITE_WEATHER_API_URL;
// Use HTTPS for all API calls
const GEO_URL = 'https://api.openweathermap.org/geo/1.0';

class WeatherService {
  constructor() {
    this.api = axios.create({
      baseURL: BASE_URL,
      params: {
        appid: API_KEY,
        units: 'metric'
      }
    });

    this.geoApi = axios.create({
      baseURL: GEO_URL,
      params: {
        appid: API_KEY
      }
    });

    // Request interceptor for loading states
    this.api.interceptors.request.use(
      (config) => {
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => this.handleError(error)
    );
  }

  handleError(error) {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          throw new Error('Invalid request. Please check the city name.');
        case 401:
          throw new Error('Invalid API key. Please check your API key.');
        case 404:
          throw new Error('City not found. Please check the city name and try again.');
        case 429:
          throw new Error('Too many requests. Please wait a moment and try again.');
        case 500:
          throw new Error('Server error. Please try again later.');
        default:
          throw new Error(data.message || 'An unexpected error occurred.');
      }
    } else if (error.request) {
      throw new Error('Network error. Please check your internet connection.');
    } else {
      throw new Error('An error occurred. Please try again.');
    }
  }

  // Search for cities by name
  async searchCities(query, limit = 5) {
    try {
      if (!query || query.length < 2) return [];
      
      const response = await this.geoApi.get('/direct', {
        params: {
          q: query,
          limit: limit
        }
      });
      
      return response.data.map(city => ({
        name: city.name,
        country: city.country,
        state: city.state || null,
        lat: city.lat,
        lon: city.lon,
        localNames: city.local_names || {},
        displayName: this.formatCityDisplay(city)
      }));
    } catch (error) {
      console.error('Error searching cities:', error);
      return [];
    }
  }

  // Get city by coordinates (reverse geocoding)
  async getCityByCoords(lat, lon) {
    try {
      const response = await this.geoApi.get('/reverse', {
        params: {
          lat,
          lon,
          limit: 1
        }
      });
      
      if (response.data && response.data.length > 0) {
        const city = response.data[0];
        return {
          name: city.name,
          country: city.country,
          state: city.state || null,
          lat: city.lat,
          lon: city.lon,
          displayName: this.formatCityDisplay(city)
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting city by coordinates:', error);
      return null;
    }
  }

  // Format city display name
  formatCityDisplay(city) {
    if (city.state) {
      return `${city.name}, ${city.state}, ${city.country}`;
    }
    return `${city.name}, ${city.country}`;
  }

  // Get weather by city name with better error handling
  async getCurrentWeather(city, units = 'metric') {
    try {
      // First, try to get weather directly
      const response = await this.api.get('/weather', {
        params: {
          q: city,
          units
        }
      });
      return this.formatCurrentWeather(response.data);
    } catch (error) {
      // If direct search fails, try to search for the city first
      if (error.message.includes('City not found')) {
        const cities = await this.searchCities(city);
        if (cities && cities.length > 0) {
          // Use the first matching city
          return this.getWeatherByCoords(cities[0].lat, cities[0].lon, units);
        }
      }
      throw error;
    }
  }

  // Get weather by exact coordinates (most precise)
  async getWeatherByCoords(lat, lon, units = 'metric') {
    try {
      const [currentResponse, forecastResponse] = await Promise.all([
        this.api.get('/weather', { params: { lat, lon, units } }),
        this.api.get('/forecast', { params: { lat, lon, units } })
      ]);

      // Get city name from reverse geocoding
      const cityInfo = await this.getCityByCoords(lat, lon);

      return {
        current: this.formatCurrentWeather(currentResponse.data, cityInfo),
        forecast: this.formatForecastData(forecastResponse.data)
      };
    } catch (error) {
      throw error;
    }
  }

  // Keep original method for backward compatibility
  async getWeatherByCityName(city, units = 'metric') {
    return this.getCurrentWeather(city, units);
  }

  async getForecast(city, units = 'metric') {
    try {
      const response = await this.api.get('/forecast', {
        params: {
          q: city,
          units
        }
      });
      return this.formatForecastData(response.data);
    } catch (error) {
      throw error;
    }
  }

  // Get weather alerts
  async getWeatherAlerts(city, units = 'metric') {
    try {
      const response = await this.api.get('/weather', {
        params: { 
          q: city, 
          units 
        }
      });
      return response.data.alerts || [];
    } catch (error) {
      console.log('No alerts available for this location');
      return [];
    }
  }

  // Get air pollution data
  async getAirPollution(lat, lon) {
    try {
      const response = await this.api.get('/air_pollution', {
        params: { lat, lon }
      });
      return this.formatAirPollution(response.data);
    } catch (error) {
      console.log('Air pollution data not available');
      return null;
    }
  }

  formatCurrentWeather(data, cityInfo = null) {
    return {
      city: cityInfo?.name || data.name,
      country: cityInfo?.country || data.sys.country,
      state: cityInfo?.state || null,
      lat: data.coord.lat,
      lon: data.coord.lon,
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      tempMin: Math.round(data.main.temp_min),
      tempMax: Math.round(data.main.temp_max),
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      windSpeed: data.wind.speed,
      windDeg: data.wind.deg,
      windGust: data.wind.gust || null,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      // Use HTTPS for images
      iconUrl: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
      timestamp: data.dt,
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset,
      clouds: data.clouds.all,
      visibility: data.visibility,
      alerts: data.alerts || []
    };
  }

  formatForecastData(data) {
    // Group forecast by day
    const dailyForecast = data.list.reduce((acc, item) => {
      const date = new Date(item.dt * 1000).toLocaleDateString();
      
      if (!acc[date]) {
        acc[date] = {
          date,
          temps: [],
          feelsLike: [],
          icons: [],
          descriptions: [],
          humidity: [],
          windSpeed: [],
          pressure: [],
          clouds: []
        };
      }

      acc[date].temps.push(item.main.temp);
      acc[date].feelsLike.push(item.main.feels_like);
      acc[date].icons.push(item.weather[0].icon);
      acc[date].descriptions.push(item.weather[0].description);
      acc[date].humidity.push(item.main.humidity);
      acc[date].windSpeed.push(item.wind.speed);
      acc[date].pressure.push(item.main.pressure);
      acc[date].clouds.push(item.clouds.all);

      return acc;
    }, {});

    // Calculate daily averages
    return Object.values(dailyForecast).map(day => ({
      date: day.date,
      tempMax: Math.round(Math.max(...day.temps)),
      tempMin: Math.round(Math.min(...day.temps)),
      avgTemp: Math.round(day.temps.reduce((a, b) => a + b, 0) / day.temps.length),
      feelsLike: Math.round(day.feelsLike.reduce((a, b) => a + b, 0) / day.feelsLike.length),
      icon: day.icons[Math.floor(day.icons.length / 2)], // Use midday icon
      // Use HTTPS for forecast icons as well
      iconUrl: `https://openweathermap.org/img/wn/${day.icons[Math.floor(day.icons.length / 2)]}.png`,
      description: day.descriptions[Math.floor(day.descriptions.length / 2)],
      avgHumidity: Math.round(day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length),
      avgWindSpeed: Math.round(day.windSpeed.reduce((a, b) => a + b, 0) / day.windSpeed.length),
      avgPressure: Math.round(day.pressure.reduce((a, b) => a + b, 0) / day.pressure.length),
      avgClouds: Math.round(day.clouds.reduce((a, b) => a + b, 0) / day.clouds.length)
    }));
  }

  formatAirPollution(data) {
    if (!data || !data.list || data.list.length === 0) return null;
    
    const pollution = data.list[0];
    return {
      aqi: pollution.main.aqi,
      components: pollution.components,
      timestamp: pollution.dt
    };
  }
}

export default new WeatherService();