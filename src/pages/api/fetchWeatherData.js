import WeatherAPI from '../../utils/WeatherApi';
import WeatherData from '../../utils/WeatherData';
import { locationCoordinates } from '@/utils/locationCoordinates';

const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export default async function fetchWeatherDataHandler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  );

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const weatherAPI = new WeatherAPI(API_KEY);
      const weatherDataHandler = new WeatherData(dbConfig);

      // Fetch weather data for each location
      const weatherData = await Promise.all(
        Object.entries(locationCoordinates).map(async ([location, coords]) => {
          const { lat, lon } = coords;
          return await weatherAPI.fetchWeatherData(lat, lon, location);
        })
      );

      // Flatten the array to combine all location forecasts
      const processedData = weatherData.flat();

      // Delete old data and insert new data into MySQL
      await weatherDataHandler.clearAndInsertWeatherData(processedData);

      res.status(200).json(processedData);
    } catch (error) {
      console.error('Error fetching or inserting forecast data:', error);
      res.status(500).json({ 
        error: 'Failed to fetch or insert forecast data for some locations',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
