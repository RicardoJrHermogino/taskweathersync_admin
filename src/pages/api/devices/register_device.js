import pool from '@/lib/db';

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
    return res.status(200).end();
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
    connection = await pool.getConnection(); // Use connection pool

    // Enable strict mode and set timezone
    await connection.execute("SET SESSION sql_mode = 'STRICT_TRANS_TABLES'");
    await connection.execute("SET time_zone = '+08:00'");

    // Check if device exists (EXISTS improves performance)
    const [existingRows] = await connection.execute(
      `SELECT EXISTS(SELECT 1 FROM devices WHERE device_id = ?) AS exists_count`,
      [deviceId]
    );

    if (!existingRows[0].exists_count) {
      // Insert new device
      await connection.execute(
        `INSERT INTO devices (device_id, created_at, last_active, status) 
         VALUES (?, NOW(), NOW(), ?)`,
        [deviceId, status]
      );

      connection.release();
      return res.status(201).json({
        message: 'Device registered successfully',
        deviceId,
        status,
        registered: true,
        timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' })
      });
    } else {
      // Update last_active timestamp
      await connection.execute(
        `UPDATE devices SET last_active = NOW() WHERE device_id = ?`,
        [deviceId]
      );

      // Get current device status
      const [deviceData] = await connection.execute(
        `SELECT status FROM devices WHERE device_id = ?`,
        [deviceId]
      );

      connection.release();
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

    if (connection) {
      connection.release();
    }

    return res.status(500).json({
      error: 'Error registering device',
      details: error.message,
      code: error.code,
      sqlState: error.sqlState
    });
  }
}
