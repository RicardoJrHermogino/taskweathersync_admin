import { getConnection } from '../../../lib/db';

// Function to insert task into the database
async function createTask(taskData) {
  // Validate the input


  const connection = await getConnection();
  const [result] = await connection.query(
    'INSERT INTO coconut_tasks (task_name, weatherRestrictions, details, requiredTemperature_min, requiredTemperature_max, idealHumidity_min, idealHumidity_max, requiredWindSpeed_max, requiredWindGust_max, requiredCloudCover_max, requiredPressure_min, requiredPressure_max) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      taskData.task_name,
      taskData.weatherRestrictions,
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
  connection.release();
  return result;
}

// API Handler
export default async function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const result = await createTask(req.body);
      res.status(201).json({ message: 'Task created successfully', result });
    } else {
      res.status(405).json({ error: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error("Error occurred while creating task:", error); // Log detailed error
    res.status(500).json({ error: error.message });
  }
}
