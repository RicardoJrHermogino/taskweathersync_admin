// pages/api/getWeatherData.js
import pool from '@/lib/db';

export default async function getWeatherDataHandler(req, res) {
  let connection;
  try {
    connection = await pool.getConnection(); // Use connection from pool

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

      if (weather_data_id) {
        query += ' WHERE weather_data_id = ?';
        queryParams.push(weather_data_id);
      }

      const [rows] = await connection.query(query, queryParams);

      console.log('Query Results:', rows);

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
      connection.release(); // Release connection back to the pool
    }
  }
}
