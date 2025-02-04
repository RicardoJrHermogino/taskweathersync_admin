import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export default async function handler(req, res) {
  let connection;

  try {
    // Establish the database connection
    connection = await mysql.createConnection(dbConfig);

    // Handle CORS
    const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];
    const origin = req.headers.origin;

    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, PATCH, DELETE, POST, PUT');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    // GET: Fetch tasks
    if (req.method === 'GET') {
      const { deviceId } = req.query;
      if (!deviceId) {
        return res.status(400).json({ message: 'Device ID is required' });
      }
    
      const [rows] = await connection.execute(
        `SELECT st.sched_id, st.task_id, st.device_id, st.location, st.date, st.time, ct.task_name 
         FROM scheduled_tasks st
         JOIN coconut_tasks ct ON st.task_id = ct.task_id
         WHERE st.device_id = ?
         ORDER BY st.sched_id DESC`,  // Added sorting by sched_id in descending order
        [deviceId]
      );
    
      res.status(200).json(rows);
    }
    
    // PUT: Update a scheduled task
else if (req.method === 'PUT') {
  const { schedId, date, time, location, taskName } = req.body;

  if (!schedId) {
    return res.status(400).json({ message: 'Scheduled Task ID is required' });
  }

  // Find the task_id corresponding to the selected task_name
    const [taskRows] = await connection.execute(
      'SELECT task_id FROM coconut_tasks WHERE task_name = ?',
      [taskName]
    );

    if (taskRows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const taskId = taskRows[0].task_id;

    const [result] = await connection.execute(
      'UPDATE scheduled_tasks SET date = ?, time = ?, location = ?, task_id = ? WHERE sched_id = ?',
      [date, time, location, taskId, schedId]
    );

    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Task updated successfully' });
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  }

    // DELETE: Delete a scheduled task
    else if (req.method === 'DELETE') {
      const { schedId } = req.query;

      if (!schedId) {
        return res.status(400).json({ message: 'Scheduled Task ID is required' });
      }

      const [result] = await connection.execute(
        'DELETE FROM scheduled_tasks WHERE sched_id = ?',
        [schedId]
      );

      if (result.affectedRows > 0) {
        res.status(200).json({ message: 'Task deleted successfully' });
      } else {
        res.status(404).json({ message: 'Task not found' });
      }
    }

    // Unsupported methods
    else {
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE', 'OPTIONS']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error:', error.message || error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
