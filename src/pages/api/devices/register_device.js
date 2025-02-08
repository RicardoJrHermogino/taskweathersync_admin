import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { deviceId, status = 'active' } = req.body;
  if (!deviceId) {
    return res.status(400).json({ error: 'Device ID is required' });
  }

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    // Enable strict mode and set timezone
    await connection.execute("SET SESSION sql_mode = 'STRICT_TRANS_TABLES'");
    await connection.execute("SET time_zone = '+08:00'");

    // Check if device already exists - using EXISTS for better performance
    const [existingRows] = await connection.execute(`
      SELECT EXISTS(SELECT 1 FROM devices WHERE device_id = ?) as exists_count`,
      [deviceId]
    );

    if (!existingRows[0].exists_count) {
      // Insert new device with status field
      const [result] = await connection.execute(
        `INSERT INTO devices (device_id, created_at, last_active, status) 
         VALUES (?, NOW(), NOW(), ?)`,
        [deviceId, status]
      );

      await connection.end();
      return res.status(201).json({
        message: 'Device registered successfully',
        deviceId,
        status,
        registered: true,
        timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' })
      });
    } else {
      // Update last_active timestamp for existing device
      await connection.execute(
        `UPDATE devices SET last_active = NOW() WHERE device_id = ?`,
        [deviceId]
      );

      // Get current device status
      const [deviceData] = await connection.execute(
        `SELECT status FROM devices WHERE device_id = ?`,
        [deviceId]
      );

      await connection.end();
      return res.status(200).json({
        message: 'Device already exists',
        deviceId,
        status: deviceData[0].status,
        registered: false,
        timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' })
      });
    }
  } catch (error) {
    console.error('Error registering device:', error);
    // Log the full error details server-side
    console.error('Full error:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage
    });
    
    if (connection) {
      await connection.end();
    }
    
    return res.status(500).json({
      error: 'Error registering device',
      details: error.message,
      code: error.code,
      sqlState: error.sqlState
    });
  }
}