import { getConnection } from '../../../lib/db';

// Update a task
async function updateTask(id, taskData) {
  const connection = await getConnection();
  try {
    const [result] = await connection.query(
      'UPDATE coconut_tasks SET ' +
      'task_name = ?, ' +
      'weatherRestrictions = ?, ' +
      'details = ?, ' +
      'requiredTemperature_min = ?, ' +
      'requiredTemperature_max = ?, ' +
      'idealHumidity_min = ?, ' +
      'idealHumidity_max = ?, ' +
      'requiredWindSpeed_max = ?, ' +
      'requiredWindGust_max = ?, ' +
      'requiredCloudCover_max = ?, ' +
      'requiredPressure_min = ?, ' +
      'requiredPressure_max = ? ' +
      'WHERE task_id = ?',
      [
        taskData.task_name,
        taskData.weatherRestrictions || null, // Allow null if not provided
        taskData.details || null, // Allow null if not provided
        taskData.requiredTemperature_min || null,
        taskData.requiredTemperature_max || null,
        taskData.idealHumidity_min || null,
        taskData.idealHumidity_max || null,
        taskData.requiredWindSpeed_max || null,
        taskData.requiredWindGust_max || null,
        taskData.requiredCloudCover_max || null,
        taskData.requiredPressure_min || null,
        taskData.requiredPressure_max || null,
        id,
      ]
    );
    return result;
  } catch (error) {
    console.error('Error updating task:', error);
    throw new Error('Failed to update task');
  } finally {
    connection.release();
  }
}

// Delete a task
async function deleteTask(id) {
  const connection = await getConnection();
  try {
    const [result] = await connection.query('DELETE FROM coconut_tasks WHERE task_id = ?', [id]);
    return result;
  } catch (error) {
    console.error('Error deleting task:', error);
    throw new Error('Failed to delete task');
  } finally {
    connection.release();
  }
}

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    if (req.method === 'PUT') {
      const result = await updateTask(id, req.body);
      res.status(200).json({ message: 'Task updated successfully', result });
    } else if (req.method === 'DELETE') {
      const result = await deleteTask(id);
      res.status(200).json({ message: 'Task deleted successfully', result });
    } else {
      res.status(405).json({ error: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error('Error in API handler:', error);
    res.status(500).json({ error: error.message });
  }
}
