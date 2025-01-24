// pages/api/getHourlyWeatherData.js
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export default async function handler(req, res) {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

      // Allow multiple origins
    const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];
    const origin = req.headers.origin;
    
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');


    if (req.method === 'GET') {
      const { location, date } = req.query;

      if (!location || !date) {
        return res.status(400).json({ 
          message: 'Location and date are required' 
        });
      }

      // Query to fetch hourly forecast data for a specific location and date
      const query = `
        SELECT * FROM forecast_data 
        WHERE location = ? 
        AND date = ? 
        ORDER BY time ASC
      `;

      const [rows] = await connection.query(query, [location, date]);

      // If no data found
      if (rows.length === 0) {
        return res.status(404).json({ 
          message: 'No hourly forecast data found' 
        });
      }

      // Format the data
      const formattedData = rows.map(row => ({
        ...row,
        date: new Date(row.date).toLocaleDateString('en-CA'),
      }));
      
      res.status(200).json(formattedData);
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in getHourlyWeatherData API:', error);
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