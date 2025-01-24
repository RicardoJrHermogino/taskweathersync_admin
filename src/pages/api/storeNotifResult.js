import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export default async function storeTaskResultHandler(req, res) {
  if (req.method === 'POST') {
    const { deviceId, taskId, location, date, time, isFeasible } = req.body;

    // Validate all required fields except for resultMessage
    if (!deviceId || !taskId || !location || !date || !time || isFeasible == null) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let connection;
    try {
      // Create database connection
      connection = await mysql.createConnection(dbConfig);

      // Check if the result already exists in the database
      const checkQuery = `
        SELECT COUNT(*) AS count 
        FROM results 
        WHERE device_id = ? 
        AND task_id = ? 
        AND location = ? 
        AND date = ? 
        AND time = ?
      `;
      const [rows] = await connection.execute(checkQuery, [deviceId, taskId, location, date, time]);

      // If the result already exists, return a message and don't insert
      if (rows[0].count > 0) {
        return res.status(200).json({ message: 'Result already exists in the database' });
      }

      // Insert the result into the task_results table
      const query = `
        INSERT INTO results (device_id, task_id, location, date, time, is_feasible)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      await connection.execute(query, [
        deviceId,
        taskId,
        location,
        date,
        time,
        isFeasible,
      ]);

      return res.status(200).json({ message: 'Result stored successfully' });
    } catch (error) {
      console.error('Error storing result:', error.message);
      return res.status(500).json({ error: 'Failed to store the result' });
    } finally {
      if (connection) await connection.end();
    }
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
