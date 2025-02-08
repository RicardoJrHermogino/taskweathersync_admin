import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  timezone: '+08:00',
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

  const { deviceId } = req.body;
  if (!deviceId) {
    return res.status(400).json({ error: 'Device ID is required' });
  }

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    // Set session timezone
    await connection.execute("SET time_zone = '+08:00'");

    // Check if device already exists
    const [existingRows] = await connection.execute(
      'SELECT COUNT(*) as count FROM devices WHERE device_id = ?',
      [deviceId]
    );

    if (existingRows[0].count === 0) {
      // Insert new device using NOW() directly in the query
      const [result] = await connection.execute(`
        INSERT INTO devices (device_id, created_at, last_active, status) 
        VALUES (?, NOW(), NOW(), ?)`,
        [deviceId, 'active']
      );

      await connection.end();
      return res.status(201).json({
        message: 'Device registered successfully',
        deviceId,
        registered: true,
        timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' })
      });
    } else {
      await connection.end();
      return res.status(200).json({
        message: 'Device already exists',
        deviceId,
        registered: false,
        timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' })
      });
    }
  } catch (error) {
    console.error('Error registering device:', error);
    if (connection) {
      await connection.end();
    }
    return res.status(500).json({
      error: 'Error registering device',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}