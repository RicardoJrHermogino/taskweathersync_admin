import pool from "@/lib/db";

export default async function handler(req, res) {
  if (req.method === 'POST') {
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
      const [result] = await pool.query(
        `INSERT INTO tasks 
        (task_name, weatherRestrictions, details, requiredTemperature_min, requiredTemperature_max, idealHumidity_min,
         idealHumidity_max, requiredWindSpeed_max, requiredWindGust_max, requiredCloudCover_max, 
         requiredPressure_min, requiredPressure_max) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          task_name,
          weatherRestrictions || '',
          details || '',
          requiredTemperature_min || '',
          requiredTemperature_max || '',
          idealHumidity_min || '',
          idealHumidity_max || '',
          requiredWindSpeed_max || '',
          requiredWindGust_max || '',
          requiredCloudCover_max || '',
          requiredPressure_min || '',
          requiredPressure_max || '',
        ]
      );
      res.status(201).json({ id: result.insertId, message: 'Task added successfully!' });
    } catch (error) {
      console.error('Database Insert Error:', error);
      res.status(500).json({ error: 'Failed to add task', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
