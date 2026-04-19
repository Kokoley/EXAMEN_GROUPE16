import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: Number(process.env.PORT || 4000),
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  // Sur Windows, "localhost" peut résoudre vers ::1 (IPv6) et provoquer ECONNREFUSED si MySQL écoute en IPv4.
  DB_HOST: process.env.DB_HOST || "127.0.0.1",
  DB_PORT: Number(process.env.DB_PORT || 3308),
  DB_USER: process.env.DB_USER || "root",
  DB_PASSWORD: process.env.DB_PASSWORD || "1234",
  DB_NAME: process.env.DB_NAME || "gestion_dechets",
  JWT_SECRET: process.env.JWT_SECRET || "CHANGE_ME_IN_PRODUCTION",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "8h"
};
