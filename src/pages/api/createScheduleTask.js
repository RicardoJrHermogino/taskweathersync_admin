import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

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
    // Establish database connection
    connection = await mysql.createConnection(dbConfig);

    // Handle CORS
    const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];
    const origin = req.headers.origin;

    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    // Handle POST request to create scheduled task
    if (req.method === 'POST') {
      const { userId, task_name, date, time, location } = req.body;

      // Validate required fields
      if (!userId || !task_name || !date || !time || !location) {
        return res.status(400).json({
          message: 'Missing required fields',
          required: ['userId', 'task_name', 'date', 'time', 'location']
        });
      }

      // Find the task_id corresponding to the task_name
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
        return res.status(409).json({ 
          message: 'A task with these details already exists' 
        });
      }

      // Find the coordinates for the location
      const [locationRows] = await connection.execute(
        'SELECT lat, lon FROM location_coordinates WHERE location_name = ?',
        [location]
      );

      let lat, lon;
      if (locationRows.length > 0) {
        lat = locationRows[0].lat;
        lon = locationRows[0].lon;
      } else {
        return res.status(404).json({ message: 'Location coordinates not found' });
      }

      // Insert the scheduled task with all required fields
      const [result] = await connection.execute(
        `INSERT INTO scheduled_tasks 
         (task_id, device_id, location, lat, lon, date, time) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [taskId, userId, location, lat, lon, date, time]
      );

      if (result.affectedRows > 0) {
        // Fetch the newly created task with task_name for the response
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
    if (connection) {
      await connection.end();
    }
  }
}