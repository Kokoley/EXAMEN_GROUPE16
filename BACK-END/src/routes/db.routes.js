import { Router } from "express";
import { formatDbError, pool, testDatabaseConnection } from "../config/db.js";

export const dbRouter = Router();

dbRouter.get("/ping", async (_req, res) => {
  try {
    await testDatabaseConnection();
    res.status(200).json({ ok: true, message: "Connexion MySQL reussie" });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Connexion MySQL echouee",
      error: formatDbError(error)
    });
  }
});

dbRouter.get("/tables", async (_req, res) => {
  try {
    const [rows] = await pool.query("SHOW TABLES");
    res.status(200).json({ ok: true, tables: rows });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Impossible de lister les tables",
      error: formatDbError(error)
    });
  }
});
