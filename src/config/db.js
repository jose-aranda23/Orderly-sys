const mariadb = require('mariadb');
const env = require('./env');

const pool = mariadb.createPool({
  host: env.DB_HOST,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  port: env.DB_PORT,
  connectionLimit: 10,
  timezone: 'Z',
  dateStrings: true
});

const getConnection = async () => {
  let conn;
  try {
    conn = await pool.getConnection();
    return conn;
  } catch (err) {
    console.error('Error conectando a MariaDB: ', err);
    throw err;
  }
};

module.exports = {
  pool,
  getConnection
};
