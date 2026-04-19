import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { ROLES } from "../middleware/auth.js";
import { query } from "../db/dbClient.js";

export const gpsRouter = Router();

gpsRouter.post("/", requireAuth, async (req, res) => {
  try {
    if (req.authUser.role !== ROLES.AGENT_COLLECTEUR) {
      return res.status(403).json({
        message: "Seuls les agents collecteurs peuvent envoyer une position GPS."
      });
    }
    const agentId = Number(req.body?.agentId);
    const latitude = Number(req.body?.latitude);
    const longitude = Number(req.body?.longitude);

    if (Number(agentId) !== Number(req.authUser.id)) {
      return res.status(403).json({
        message: "Vous ne pouvez envoyer que votre propre position."
      });
    }
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return res.status(400).json({ message: "Latitude et longitude valides requises." });
    }

    const [result] = await query(
      "INSERT INTO positions_gps (agent_id, latitude, longitude) VALUES (?, ?, ?)",
      [agentId, latitude, longitude]
    );
    const id = result.insertId;
    const [rows] = await query(
      `SELECT id, agent_id AS agentId, latitude, longitude,
        DATE_FORMAT(enregistre_le, '%Y-%m-%dT%H:%i:%s.000Z') AS enregistreLe
       FROM positions_gps
       WHERE id = ? LIMIT 1`,
      [id]
    );
    return res.status(201).json(rows[0]);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("POST /gps:", err);
    return res.status(500).json({ message: "Erreur lors de l'enregistrement de la position." });
  }
});
