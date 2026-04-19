import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { query } from "../db/dbClient.js";

export const notificationsRouter = Router();

notificationsRouter.get("/", requireAuth, async (req, res) => {
  try {
    const uid = Number(req.query.userId);
    if (!Number.isFinite(uid) || uid !== req.authUser.id) {
      return res.status(403).json({ message: "Accès aux notifications refusé." });
    }
    const [rows] = await query(
      `SELECT 
        id, user_id AS userId, titre, message, lu,
        DATE_FORMAT(cree_le, '%Y-%m-%dT%H:%i:%s.000Z') AS creeLe
      FROM notifications
      WHERE user_id = ?
      ORDER BY cree_le DESC`,
      [uid]
    );
    return res.status(200).json(rows);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("GET /notifications:", err);
    return res.status(500).json({ message: "Erreur lors du chargement des notifications." });
  }
});

notificationsRouter.patch("/:id/lu", requireAuth, async (req, res) => {
  try {
    const nid = Number(req.params.id);
    const bodyUser = Number(req.body?.userId);
    if (!Number.isFinite(bodyUser) || bodyUser !== req.authUser.id) {
      return res.status(403).json({ message: "Action non autorisée." });
    }
    const [result] = await query(
      "UPDATE notifications SET lu = TRUE WHERE id = ? AND user_id = ?",
      [nid, bodyUser]
    );
    if (!result.affectedRows) {
      return res.status(404).json({ message: "Notification introuvable." });
    }
    const [rows] = await query(
      `SELECT 
        id, user_id AS userId, titre, message, lu,
        DATE_FORMAT(cree_le, '%Y-%m-%dT%H:%i:%s.000Z') AS creeLe
      FROM notifications
      WHERE id = ? AND user_id = ? LIMIT 1`,
      [nid, bodyUser]
    );
    return res.status(200).json(rows[0]);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("PATCH /notifications/:id/lu:", err);
    return res.status(500).json({ message: "Erreur lors de la mise à jour." });
  }
});
