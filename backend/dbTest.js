// dbTest.js
import 'dotenv/config';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

try {
  const client = await pool.connect();
  console.log('PostgreSQL bağlantısı başarılı!');
  client.release(); // bağlantıyı kapat
} catch (err) {
  console.error('Bağlantı hatası:', err);
} finally {
  await pool.end();
}
