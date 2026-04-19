import { pool } from "../config/db.js";

export async function query(sql, params = []) {
  return pool.query(sql, params);
}

