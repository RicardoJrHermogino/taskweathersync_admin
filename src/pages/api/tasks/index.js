// pages/api/tasks/index.js - For GET (list) and POST (create)
import pool from '../../lib/db';

export default async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      return await getTasks(req, res);
    case 'POST':
      return await createTask(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function getTasks(req, res) {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(`
      SELECT * FROM tasks
      ORDER BY task_id DESC
    `);
    connection.release();
    res.status(200).json(rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
}

async function createTask(req, res) {
  try {
    const connection = await pool.getConnection();
    const task = req.body;
    
    const [result] = await connection.execute(`
      INSERT INTO tasks (
        task_name, weatherRestrictions, details,
        requiredTemperature_min, requiredTemperature_max,
        idealHumidity_min, idealHumidity_max,
        requiredWindSpeed_max, requiredWindGust_max,
        requiredCloudCover_max, requiredPressure_min,
        requiredPressure_max
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      task.task_name,
      task.weatherRestrictions,
      task.details,
      task.requiredTemperature_min || null,
      task.requiredTemperature_max || null,
      task.idealHumidity_min || null,
      task.idealHumidity_max || null,
      task.requiredWindSpeed_max || null,
      task.requiredWindGust_max || null,
      task.requiredCloudCover_max || null,
      task.requiredPressure_min || null,
      task.requiredPressure_max || null
    ]);
    
    connection.release();
    
    // Fetch the newly created task to return complete data
    const [newTask] = await connection.execute('SELECT * FROM tasks WHERE task_id = ?', [result.insertId]);
    res.status(201).json(newTask[0]);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
}