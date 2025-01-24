// pages/api/tasks/[id].js - For GET (single), PUT (update), and DELETE
import pool from '../../../lib/db';

export default async function handler(req, res) {
  const { id } = req.query;

  switch (req.method) {
    case 'GET':
      return await getTask(req, res, id);
    case 'PUT':
      return await updateTask(req, res, id);
    case 'DELETE':
      return await deleteTask(req, res, id);
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function getTask(req, res, id) {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute('SELECT * FROM tasks WHERE task_id = ?', [id]);
    connection.release();

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
}

async function updateTask(req, res, id) {
  try {
    const connection = await pool.getConnection();
    const task = req.body;
    
    const [result] = await connection.execute(`
      UPDATE tasks 
      SET 
        task_name = ?,
        weatherRestrictions = ?,
        details = ?,
        requiredTemperature_min = ?,
        requiredTemperature_max = ?,
        idealHumidity_min = ?,
        idealHumidity_max = ?,
        requiredWindSpeed_max = ?,
        requiredWindGust_max = ?,
        requiredCloudCover_max = ?,
        requiredPressure_min = ?,
        requiredPressure_max = ?
      WHERE task_id = ?
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
      task.requiredPressure_max || null,
      id
    ]);

    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Fetch the updated task to return complete data
    const [updatedTask] = await connection.execute('SELECT * FROM tasks WHERE task_id = ?', [id]);
    res.status(200).json(updatedTask[0]);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
}

async function deleteTask(req, res, id) {
  try {
    const connection = await pool.getConnection();
    const [result] = await connection.execute('DELETE FROM tasks WHERE task_id = ?', [id]);
    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(204).end();
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
}