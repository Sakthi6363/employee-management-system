const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const poolConfig = {
  host:             process.env.DB_HOST     || 'localhost',
  user:             process.env.DB_USER     || 'root',
  password:         process.env.DB_PASSWORD || '',
  database:         process.env.DB_NAME     || 'employee_management',
  port:             parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit:  10,
  queueLimit:       0
};

// Enable SSL for cloud databases (Aiven, Railway, PlanetScale, etc.)
if (process.env.DB_SSL === 'true') {
  poolConfig.ssl = { rejectUnauthorized: false };
}

const pool = mysql.createPool(poolConfig);

pool.getConnection()
  .then(conn => {
    console.log('MySQL connected successfully');
    conn.release();
  })
  .catch(err => {
    console.error('MySQL connection error:', err.message);
  });

module.exports = pool;
