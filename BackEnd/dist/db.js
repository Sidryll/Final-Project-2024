"use strict";
//db.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
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
const pg_1 = require("pg");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const pool = new pg_1.Pool({
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
    }
    else {
        console.log('Connected to the database!');
    }
});
exports.default = pool;
