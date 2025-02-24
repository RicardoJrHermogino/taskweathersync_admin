import pool from '@/lib/db';

export default async function handler(req, res) {
  let connection;

  try {
    connection = await pool.getConnection(); // Use connection pool

    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method === 'GET') {
      const { task_id } = req.query;

      let query = 'SELECT * FROM coconut_tasks';
      const queryParams = [];

      if (task_id) {
        query += ' WHERE task_id = ?';
        queryParams.push(task_id);
      }

      const [rows] = await connection.query(query, queryParams);

      if (task_id && rows.length === 0) {
        return res.status(404).json({ message: 'Task not found' });
      }

      res.status(200).json({
        coconut_tasks: task_id ? [rows[0]] : rows
      });
    } else {
      res.setHeader('Allow', ['GET', 'OPTIONS']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error in getCoconutTasks API:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    if (connection) connection.release(); // Release connection back to the pool
  }
}
