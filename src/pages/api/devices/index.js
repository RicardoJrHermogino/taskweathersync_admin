import pool from "@/lib/db";
export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const [devices] = await pool.query('SELECT * FROM devices');  // Fetch devices
      res.status(200).json(devices);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch devices' });
    }
  } else if (req.method === 'DELETE') {
    const { device_id } = req.body;  // Get device_id from the request body
    if (!device_id) {
      return res.status(400).json({ error: 'Device ID is required' });
    }

    try {
      // Delete device by device_id
      await pool.query('DELETE FROM devices WHERE device_id = ?', [device_id]);
      res.status(204).end();  // Successful deletion, no content
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to delete device' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);  // Handle unsupported methods
  }
}
