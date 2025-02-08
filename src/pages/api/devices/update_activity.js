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
      connection = await mysql.createConnection({
        ...dbConfig,
        timezone: '+08:00',
        dateStrings: false
      });
      
      await connection.execute("SET time_zone='+08:00'");
      await connection.execute("SET SESSION sql_mode='STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION'");

      // Check if device exists
      const [existingDevice] = await connection.execute(
        'SELECT device_id FROM devices WHERE device_id = ?',
        [deviceId]
      );

      const insertQuery = `
        INSERT INTO devices (device_id, created_at, last_active, status) 
        VALUES (?, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6), ?)
      `;

      const updateQuery = `
        UPDATE devices 
        SET 
          last_active = CURRENT_TIMESTAMP(6),
          status = CASE
            WHEN TIMESTAMPDIFF(DAY, last_active, CURRENT_TIMESTAMP(6)) > 30 THEN 'inactive'
            WHEN TIMESTAMPDIFF(DAY, last_active, CURRENT_TIMESTAMP(6)) > 7 THEN 'idle'
            ELSE 'active'
          END
        WHERE device_id = ?
      `;

      // Modified SELECT query to format the timestamp
      const selectQuery = `
        SELECT 
          DATE_FORMAT(last_active, '%Y-%m-%d %H:%i:%s') as formatted_timestamp
        FROM devices 
        WHERE device_id = ?
      `;

      if (existingDevice.length === 0) {
        console.log('Device not found, registering new device');
        await connection.execute(insertQuery, [deviceId, 'active']);
        
        const [rows] = await connection.execute(selectQuery, [deviceId]);
        
        await connection.end();
        return res.status(201).json({
          message: 'Device registered and activity updated successfully',
          timestamp: rows[0].formatted_timestamp,
          isNewDevice: true
        });
      }

      console.log('Executing update query for existing device');
      await connection.execute(updateQuery, [deviceId]);

      const [rows] = await connection.execute(selectQuery, [deviceId]);
      console.log('Retrieved timestamp:', rows[0].formatted_timestamp); // Debug log

      await connection.end();
      return res.status(200).json({
        message: 'Activity updated successfully',
        timestamp: rows[0].formatted_timestamp,
        isNewDevice: false
      });

    } catch (error) {
      console.error('Database error:', error);
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