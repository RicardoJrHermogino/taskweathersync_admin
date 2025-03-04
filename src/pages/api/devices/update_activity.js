import pool from '@/lib/db';

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
      connection = await pool.getConnection(); // Use connection pool

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

      if (existingDevice.length === 0) {
        console.log('Device not found, registering new device');
        await connection.execute(insertQuery, [deviceId, 'active']);

        // Get the inserted timestamp
        const [rows] = await connection.execute(
          'SELECT last_active FROM devices WHERE device_id = ?',
          [deviceId]
        );

        connection.release(); // Release connection back to the pool
        return res.status(201).json({
          message: 'Device registered and activity updated successfully',
          timestamp: rows[0].last_active,
          isNewDevice: true
        });
      }

      console.log('Executing update query for existing device');
      await connection.execute(updateQuery, [deviceId]);

      // Get the updated timestamp
      const [rows] = await connection.execute(
        'SELECT last_active FROM devices WHERE device_id = ?',
        [deviceId]
      );

      connection.release(); // Release connection back to the pool
      return res.status(200).json({
        message: 'Activity updated successfully',
        timestamp: rows[0].last_active,
        isNewDevice: false
      });

    } catch (error) {
      console.error('Database error:', error);
      if (connection) {
        connection.release();
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
