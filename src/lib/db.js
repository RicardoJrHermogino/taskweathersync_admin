
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,  // Wait for available connection if max limit reached
  connectionLimit: 20,       // Maximum number of connections to create at once
  queueLimit: 0              // Number of requests allowed to queue before rejecting
});

export default pool;

export const getConnection = async () => {
  return await pool.getConnection();
};

export async function getTasksFromDatabase() {
  try {
    const [rows] = await pool.query('SELECT * FROM coconut_tasks');
    return rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw new Error('Failed to fetch tasks');
  }
};


