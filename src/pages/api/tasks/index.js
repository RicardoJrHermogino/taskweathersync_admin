// pages/api/tasks/index.js
import pool from '@/lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const sort = req.query.sort || 'updated';
      const orderBy = sort === 'updated' ? 'updated_at' : 'created_at';
      
      const [tasks] = await pool.query(
        `SELECT * FROM coconut_tasks ORDER BY ${orderBy} DESC`
      );
      
      const parsedTasks = tasks.map(task => ({
        ...task,
        weatherRestrictions: typeof task.weatherRestrictions === 'string' ? 
          JSON.parse(task.weatherRestrictions.replace(/"/g, '')) : 
          task.weatherRestrictions
      }));
      
      res.status(200).json(parsedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  } else if (req.method === 'POST') {
    const taskData = req.body;

    if (!taskData.task_name || !taskData.weatherRestrictions) {
      return res.status(400).json({ error: 'Task name and weather restrictions are required' });
    }

    try {
      const weatherRestrictionsString = JSON.stringify(taskData.weatherRestrictions.map(Number));
      
      const [result] = await pool.query(
        `INSERT INTO coconut_tasks (
          task_name, 
          weatherRestrictions, 
          details, 
          requiredTemperature_min,
          requiredTemperature_max,
          idealHumidity_min,
          idealHumidity_max,
          requiredWindSpeed_max,
          requiredWindGust_max,
          requiredCloudCover_max,
          requiredPressure_min,
          requiredPressure_max,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          taskData.task_name,
          weatherRestrictionsString,
          taskData.details,
          taskData.requiredTemperature_min,
          taskData.requiredTemperature_max,
          taskData.idealHumidity_min,
          taskData.idealHumidity_max,
          taskData.requiredWindSpeed_max,
          taskData.requiredWindGust_max,
          taskData.requiredCloudCover_max,
          taskData.requiredPressure_min,
          taskData.requiredPressure_max,
        ]
      );

      const [newTask] = await pool.query(
        'SELECT * FROM coconut_tasks WHERE task_id = ?',
        [result.insertId]
      );

      res.status(201).json({
        ...newTask[0],
        weatherRestrictions: JSON.parse(newTask[0].weatherRestrictions)
      });
    } catch (error) {
      console.error('Error creating task:', error);
      res.status(500).json({ error: 'Failed to create task' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
  