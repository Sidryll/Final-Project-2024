//db.ts

// import { Pool } from 'pg';
// import dotenv from 'dotenv';

// dotenv.config(); // Load environment variables

// // Create a new pool instance
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
// });

// pool.on('error', (err) => {
//   console.error('Error with PostgreSQL connection', err);
// });

// export default pool;

// import { Pool } from 'pg';
// import dotenv from 'dotenv';

// dotenv.config();

// const pool = new Pool({
//
// connectionString: process.env.DATABASE_URL,
// });

// pool.connect((err) => {
//   if (err) {
//     console.error('Connection error:', err);
//   } else {
//     console.log('Connected to the database!');
//   }
// });

// export default pool;

import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// const query = async (text: string, params?: any[]) => {
//   try {
//     const result = await pool.query(text, params);
//     return result;
//   } catch (error) {
//     console.error('Database query error:', error);
//     throw error;
//   }
// };

pool.connect((err) => {
  if (err) {
    console.error('Connection error:', err);
  } else {
    console.log('Connected to the database!');
  }
});

export default pool;
