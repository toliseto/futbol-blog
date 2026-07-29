// Veritabanı bağlantı havuzu (connection pool)
require('dotenv').config();
const { Pool } = require('pg');

// Railway gibi platformlar tek bir DATABASE_URL değişkeni verir.
// Yerelde ise .env dosyasındaki ayrı DB_* değişkenlerini kullanırız.
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
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
