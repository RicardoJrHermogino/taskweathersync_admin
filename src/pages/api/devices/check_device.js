import pool from '@/lib/db';

export default async function checkDeviceHandler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers', 
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Validate request body
  const { deviceId } = req.body;
  if (!deviceId) {
    return res.status(400).json({ error: 'Device ID is required' });
  }

  let connection;
  try {
    // Get connection from pool
    connection = await pool.getConnection();

    // Check if device exists in the database
    const [rows] = await connection.execute(
      'SELECT EXISTS(SELECT 1 FROM devices WHERE device_id = ?) AS exists_count', 
      [deviceId]
    );

    connection.release(); // Release connection back to the pool

    return res.status(200).json({ 
      exists: rows[0].exists_count === 1,
      deviceId 
    });

  } catch (error) {
    console.error('Error checking device:', error);

    if (connection) {
      connection.release(); // Release connection even in case of error
    }

    return res.status(500).json({ 
      error: 'Error checking device', 
      details: error.message 
    });
  }
}
