// pages/api/tasks/[id].js
import pool from '@/lib/db';

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Task ID is required' });
  }

  if (req.method === 'GET') {
    try {
      const [tasks] = await pool.query('SELECT * FROM coconut_tasks WHERE task_id = ?', [id]);
      
      if (tasks.length === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }

      const task = tasks[0];
      task.weatherRestrictions = typeof task.weatherRestrictions === 'string' ? 
        JSON.parse(task.weatherRestrictions.replace(/"/g, '')) : 
        task.weatherRestrictions;
      
      return res.status(200).json(task);
    } catch (error) {
      console.error('Error fetching task:', error);
      return res.status(500).json({ error: 'Failed to fetch task' });
    }
  } 
  
  if (req.method === 'PUT') {
    const {
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
    } = req.body;

    if (!task_name || !weatherRestrictions) {
      return res.status(400).json({ error: 'Task name and weather restrictions are required' });
    }

    try {
      // Ensure weatherRestrictions is stored without quotes around elements
      const weatherRestrictionsString = JSON.stringify(weatherRestrictions.map(Number));
      
      await pool.query(
        `UPDATE coconut_tasks SET 
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
        WHERE task_id = ?`,
        [
          task_name,
          weatherRestrictionsString,
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
          id,
        ]
      );

      return res.status(200).json({
        task_id: id,
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
      });
    } catch (error) {
      console.error('Error updating task:', error);
      return res.status(500).json({ error: 'Failed to update task' });
    }
  }
  
  if (req.method === 'DELETE') {
    try {
      const [result] = await pool.query('DELETE FROM coconut_tasks WHERE task_id = ?', [id]);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      return res.status(204).end();
    } catch (error) {
      console.error('Error deleting task:', error);
      return res.status(500).json({ error: 'Failed to delete task' });
    }
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}