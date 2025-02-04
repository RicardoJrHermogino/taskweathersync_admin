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

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
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
    // Create database connection
    connection = await mysql.createConnection(dbConfig);

    // Check if device already exists to prevent duplicate entries
    const [existingRows] = await connection.execute(
      'SELECT COUNT(*) as count FROM devices WHERE device_id = ?', 
      [deviceId]
    );

    // If device doesn't exist, insert it
    if (existingRows[0].count === 0) {
      await connection.execute(
        'INSERT INTO devices (device_id, created_at) VALUES (?, NOW())', 
        [deviceId]
      );
      
      // Close the connection
      await connection.end();

      return res.status(201).json({ 
        message: 'Device registered successfully', 
        deviceId,
        registered: true
      });
    } else {
      // Close the connection
      await connection.end();

      return res.status(200).json({ 
        message: 'Device already exists', 
        deviceId,
        registered: false
      });
    }

  } catch (error) {
    console.error('Error registering device:', error);
    
    // Ensure connection is closed in case of error
    if (connection) {
      await connection.end();
    }

    return res.status(500).json({ 
      error: 'Error registering device', 
      details: error.message 
    });
  }
}