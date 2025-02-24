// pages/api/getHourlyWeatherData.js
import pool from '@/lib/db';

export default async function handler(req, res) {
  let connection;
  try {
    connection = await pool.getConnection(); // Use the connection pool

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
      const { location, date } = req.query;

      if (!location || !date) {
        return res.status(400).json({ message: 'Location and date are required' });
      }

      // Query to fetch hourly forecast data
      const query = `
        SELECT * FROM forecast_data 
        WHERE location = ? 
        AND date = ? 
        ORDER BY time ASC
      `;

      const [rows] = await connection.execute(query, [location, date]);

      if (rows.length === 0) {
        return res.status(404).json({ message: 'No hourly forecast data found' });
      }

      // Format the date before sending the response
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
    res.status(500).json({ message: 'Internal server error', error: error.message });
  } finally {
    if (connection) connection.release(); // Release the connection back to the pool
  }
}
