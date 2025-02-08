
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export default async function handler(req, res) {
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
    
    console.log('Received deviceId:', deviceId);
    
    if (!deviceId) {
      return res.status(400).json({ error: 'Device ID is required' });
    }

    let connection;
    try {
      // Test database connection first
      console.log('Attempting to connect to database...');
      connection = await mysql.createConnection(dbConfig);
      console.log('Database connection successful');

      // Set timezone without strict mode initially
      await connection.execute("SET time_zone='+08:00'");
      
      // Check if device exists
      console.log('Checking if device exists:', deviceId);
      const [existingDevice] = await connection.execute(
        'SELECT device_id FROM devices WHERE device_id = ?',
        [deviceId]
      );

      if (existingDevice.length === 0) {
        console.log('Device not found, attempting to register new device');
        const insertQuery = `
          INSERT INTO devices (device_id, created_at, last_active, status) 
          VALUES (?, NOW(), NOW(), 'active')
        `;
        
        await connection.execute(insertQuery, [deviceId]);
        
        const [rows] = await connection.execute(
          'SELECT last_active FROM devices WHERE device_id = ?',
          [deviceId]
        );
        
        console.log('Device registered successfully');
        await connection.end();
        return res.status(201).json({
          message: 'Device registered and activity updated successfully',
          timestamp: rows[0].last_active,
          isNewDevice: true
        });
      }

      console.log('Updating existing device activity');
      const updateQuery = `
        UPDATE devices 
        SET 
          last_active = NOW(),
          status = CASE
            WHEN DATEDIFF(NOW(), last_active) > 30 THEN 'inactive'
            WHEN DATEDIFF(NOW(), last_active) > 7 THEN 'idle'
            ELSE 'active'
          END
        WHERE device_id = ?
      `;

      await connection.execute(updateQuery, [deviceId]);

      const [rows] = await connection.execute(
        'SELECT last_active FROM devices WHERE device_id = ?',
        [deviceId]
      );

      console.log('Activity updated successfully');
      await connection.end();
      return res.status(200).json({
        message: 'Activity updated successfully',
        timestamp: rows[0].last_active,
        isNewDevice: false
      });

    } catch (error) {
      console.error('Detailed error:', {
        message: error.message,
        code: error.code,
        sqlState: error.sqlState,
        sqlMessage: error.sqlMessage
      });
      
      if (connection) {
        try {
          await connection.end();
        } catch (closeError) {
          console.error('Error closing connection:', closeError);
        }
      }
      
      return res.status(500).json({
        error: 'Failed to update activity',
        details: process.env.NODE_ENV === 'development' ? {
          message: error.message,
          code: error.code
        } : undefined
      });
    }
  }

  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}