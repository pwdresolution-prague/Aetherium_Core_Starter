import 'dotenv/config';
import pg from 'pg';

export const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT), // 54322, ne 54323
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Vždy parametrizovaně ($1), nikdy skládáním stringů (SQL injection)
const { rows } = await pool.query('SELECT now() AS cas');
console.log(rows);
await pool.end();
