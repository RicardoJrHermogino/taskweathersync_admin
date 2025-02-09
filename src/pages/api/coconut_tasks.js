import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export default async function getCoconutTasksHandler(req, res) {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

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

      // Wrap the response in a coconut_tasks property to match frontend expectations
      res.status(200).json({
        coconut_tasks: task_id ? [rows[0]] : rows
      });
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in getCoconutTasks API:', error);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
