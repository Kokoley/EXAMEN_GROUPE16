import mysql from "mysql2/promise";
import { env } from "./env.js";

export const pool = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});

export const testDatabaseConnection = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.ping();
    return true;
  } finally {
    connection.release();
  }
};

export const formatDbError = (error) => {
  if (!error) return "Erreur inconnue";
  if (error.sqlMessage) return error.sqlMessage;
  if (error.message) return error.message;
  if (error.code) return `Code erreur: ${error.code}`;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
};
