import pool from "@/lib/db";

export default async function handler(req, res) {
  const { task_id } = req.query;

  if (req.method === 'GET') {
    try {
      const [task] = await pool.query('SELECT * FROM tasks WHERE task_id = ?', [task_id]);
      if (task.length === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.status(200).json(task[0]);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch task' });
    }
  } else if (req.method === 'PUT') {
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

    if (!task_name) {
      return res.status(400).json({ error: 'Task name is required' });
    }

    try {
      await pool.query(
        `UPDATE tasks SET 
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
          weatherRestrictions || null,
          details || null,
          requiredTemperature_min || null,
          requiredTemperature_max || null,
          idealHumidity_min || null,
          idealHumidity_max || null,
          requiredWindSpeed_max || null,
          requiredWindGust_max || null,
          requiredCloudCover_max || null,
          requiredPressure_min || null,
          requiredPressure_max || null,
          task_id,
        ]
      );
      res.status(200).json({ task_id, ...req.body });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update task' });
    }
  } else if (req.method === 'DELETE') {
    try {
      await pool.query('DELETE FROM coconut_tasks WHERE task_id = ?', [task_id]);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete task' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
