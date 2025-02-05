import pool from "@/lib/db";

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Update all device statuses based on last_active timestamp
      const query = `
        UPDATE devices 
        SET status = CASE
          WHEN DATEDIFF(CURRENT_TIMESTAMP, last_active) > 30 THEN 'inactive'
          WHEN DATEDIFF(CURRENT_TIMESTAMP, last_active) > 7 THEN 'idle'
          ELSE 'active'
        END
      `;

      const [result] = await pool.query(query);

      res.status(200).json({ 
        message: 'Device statuses updated successfully',
        updatedDevices: result.affectedRows 
      });
    } catch (error) {
      console.error('Error updating device statuses:', error);
      res.status(500).json({ error: 'Failed to update device statuses' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}