// pages/api/getWeatherData.js
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export default async function getWeatherDataHandler(req, res) {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

    if (req.method === 'GET') {
      const { weather_data_id } = req.query;
      
      console.log('Received weather_data_id:', weather_data_id); // Debug logging

      let query = 'SELECT * FROM forecast_data';
      const queryParams = [];

      // If weather_data_id is provided, modify the query to get only the specific entry
      if (weather_data_id) {
        query += ' WHERE weather_data_id = ?';
        queryParams.push(weather_data_id);
      }

      const [rows] = await connection.query(query, queryParams);

      // Log the rows for debugging
      console.log('Query Results:', rows);

      // If a specific ID was requested but no rows found
      if (weather_data_id && rows.length === 0) {
        return res.status(404).json({ message: 'Weather data not found' });
      }

      const formattedData = rows.map(row => ({
        ...row,
        date: new Date(row.date).toLocaleDateString('en-CA'), // 'en-CA' format for YYYY-MM-DD
      }));
      
      res.status(200).json(weather_data_id ? formattedData[0] : formattedData);
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in getWeatherData API:', error);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}