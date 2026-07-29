// Veritabanı bağlantı havuzu (connection pool)
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

pool.on('connect', () => {
  console.log('PostgreSQL veritabanına bağlanıldı.');
});

pool.on('error', (err) => {
  console.error('Beklenmeyen veritabanı hatası:', err);
});

module.exports = pool;
