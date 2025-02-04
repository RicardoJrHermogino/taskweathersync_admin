// API Route: pages/api/devices/update_activity.js
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export default async function handler(req, res) {
  // Add debug logging
  console.log('Received request:', {
    method: req.method,
    body: req.body,
    headers: req.headers
  });

  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const { deviceId } = req.body;
    
    console.log('Received deviceId:', deviceId); // Debug log
    
    if (!deviceId) {
      return res.status(400).json({ error: 'Device ID is required' });
    }

    let connection;
    try {
      // Test database connection
      connection = await mysql.createConnection(dbConfig);
      console.log('Database connected successfully'); // Debug log

      // Log the SQL query we're about to execute
      const query = `
        UPDATE devices 
        SET 
          last_active = CURRENT_TIMESTAMP,
          status = CASE
            WHEN DATEDIFF(CURRENT_TIMESTAMP, last_active) > 30 THEN 'inactive'
            WHEN DATEDIFF(CURRENT_TIMESTAMP, last_active) > 7 THEN 'idle'
            ELSE 'active'
          END
        WHERE device_id = ?
      `;
      console.log('Executing query:', query, 'with deviceId:', deviceId); // Debug log

      const [result] = await connection.execute(query, [deviceId]);
      console.log('Query result:', result); // Debug log

      await connection.end();

      if (result.affectedRows === 0) {
        console.log('No rows affected - device not found'); // Debug log
        return res.status(404).json({ error: 'Device not found' });
      }

      return res.status(200).json({ 
        message: 'Activity updated successfully',
        timestamp: new Date().toISOString(),
        affectedRows: result.affectedRows
      });

    } catch (error) {
      console.error('Database error:', error); // Detailed error logging
      if (connection) {
        try {
          await connection.end();
        } catch (closeError) {
          console.error('Error closing connection:', closeError);
        }
      }
      return res.status(500).json({ 
        error: 'Failed to update activity',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}