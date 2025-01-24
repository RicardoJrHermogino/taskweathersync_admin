// pages/api/getTasks.js
import pool from '../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const connection = await pool.getConnection();
      
      // Modify the SQL to order by task_id in ascending order
      const [rows] = await connection.execute(`
        SELECT * FROM coconut_tasks
        ORDER BY task_id DESC
      `);
      
      connection.release();
      
      res.status(200).json(rows);
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  } else if (req.method === 'POST') {
    try {
      const connection = await pool.getConnection();
      const task = req.body;
      
      const [result] = await connection.execute(`
        INSERT INTO coconut_tasks (
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
        task.requiredTemperature_min,
        task.requiredTemperature_max,
        task.idealHumidity_min,
        task.idealHumidity_max,
        task.requiredWindSpeed_max,
        task.requiredWindGust_max,
        task.requiredCloudCover_max,
        task.requiredPressure_min,
        task.requiredPressure_max
      ]);
      
      connection.release();
      
      res.status(201).json({ id: result.insertId, ...task });
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Failed to create task' });
    }
  } else if (req.method === 'PUT') {
    try {
      const connection = await pool.getConnection();
      const task = req.body;
      
      await connection.execute(`
        UPDATE coconut_tasks 
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
        task.requiredTemperature_min,
        task.requiredTemperature_max,
        task.idealHumidity_min,
        task.idealHumidity_max,
        task.requiredWindSpeed_max,
        task.requiredWindGust_max,
        task.requiredCloudCover_max,
        task.requiredPressure_min,
        task.requiredPressure_max,
        task.task_id
      ]);
      
      connection.release();
      
      res.status(200).json(task);
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Failed to update task' });
    }
  }
}
