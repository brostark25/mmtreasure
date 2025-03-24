import mysql from "mysql2/promise";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import dotenv from "dotenv";

// Resolve path to .env file directly
dotenv.config({
  path: resolve(dirname(fileURLToPath(import.meta.url)), "../.env"),
});

const connection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const connectToDatabase = async () => {
  return connection;
};