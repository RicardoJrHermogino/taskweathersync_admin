import pool from '@/lib/db';

// Helper function to check for duplicate tasks
async function checkDuplicateTask(connection, deviceId, taskId, date, time, location) {
  const [rows] = await connection.execute(
    `SELECT COUNT(*) as count 
     FROM scheduled_tasks 
     WHERE device_id = ? 
     AND task_id = ? 
     AND date = ? 
     AND time = ? 
     AND location = ?`,
    [deviceId, taskId, date, time, location]
  );
  return rows[0].count > 0;
}

export default async function handler(req, res) {
  let connection;

  try {
    connection = await pool.getConnection(); // Use connection pool

    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method === 'POST') {
      const { userId, task_name, date, time, location } = req.body;

      if (!userId || !task_name || !date || !time || !location) {
        return res.status(400).json({
          message: 'Missing required fields',
          required: ['userId', 'task_name', 'date', 'time', 'location']
        });
      }

      // Find task_id for the given task_name
      const [taskRows] = await connection.execute(
        'SELECT task_id FROM coconut_tasks WHERE task_name = ?',
        [task_name]
      );

      if (taskRows.length === 0) {
        return res.status(404).json({ message: 'Task not found' });
      }

      const taskId = taskRows[0].task_id;

      // Check for duplicate task
      const isDuplicate = await checkDuplicateTask(
        connection,
        userId,
        taskId,
        date,
        time,
        location
      );

      if (isDuplicate) {
        return res.status(409).json({ message: 'A task with these details already exists' });
      }

      // Find coordinates for the location
      const [locationRows] = await connection.execute(
        'SELECT lat, lon FROM location_coordinates WHERE location_name = ?',
        [location]
      );

      if (locationRows.length === 0) {
        return res.status(404).json({ message: 'Location coordinates not found' });
      }

      const { lat, lon } = locationRows[0];

      // Insert scheduled task
      const [result] = await connection.execute(
        `INSERT INTO scheduled_tasks 
         (task_id, device_id, location, lat, lon, date, time) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [taskId, userId, location, lat, lon, date, time]
      );

      if (result.affectedRows > 0) {
        // Fetch the newly created task
        const [newTask] = await connection.execute(
          `SELECT st.sched_id, st.task_id, st.device_id, st.location, 
                  st.lat, st.lon, st.date, st.time, ct.task_name 
           FROM scheduled_tasks st
           JOIN coconut_tasks ct ON st.task_id = ct.task_id
           WHERE st.sched_id = ?`,
          [result.insertId]
        );

        res.status(201).json({
          message: 'Task scheduled successfully',
          task: newTask[0]
        });
      } else {
        res.status(500).json({ message: 'Failed to schedule task' });
      }
    } else {
      res.setHeader('Allow', ['POST', 'OPTIONS']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error:', error.message || error);
    res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    if (connection) connection.release(); // Release connection back to the pool
  }
}
