import { Router } from "express";
import { requireAuth, requireRoles, ROLES } from "../middleware/auth.js";
import { query } from "../db/dbClient.js";

export const signalementRouter = Router();

const CAN_LIST = [ROLES.CHEF_SITE, ROLES.OPERATEUR, ROLES.ADMINISTRATEUR];

signalementRouter.get("/", requireAuth, async (req, res) => {
  try {
    if (!CAN_LIST.includes(req.authUser.role)) {
      return res.status(403).json({ message: "Accès refusé." });
    }
    const [rows] = await query(
      `SELECT 
        id, description, photo_url AS photoUrl, latitude, longitude, statut,
        site_id AS siteId, cree_par_id AS creeParId,
        DATE_FORMAT(cree_le, '%Y-%m-%dT%H:%i:%s.000Z') AS creeLe
      FROM signalements
      ORDER BY cree_le DESC`
    );
    return res.status(200).json(rows);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("GET /signalement:", err);
    return res.status(500).json({ message: "Erreur lors du chargement des signalements." });
  }
});

signalementRouter.post("/", requireRoles(ROLES.CHEF_SITE), async (req, res) => {
  try {
    const description = String(req.body?.description ?? "").trim();
    const photoUrl = req.body?.photoUrl ? String(req.body.photoUrl) : null;
    const latitude = Number(req.body?.latitude);
    const longitude = Number(req.body?.longitude);
    const siteId = req.body?.siteId ?? null;

    if (!description || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return res.status(400).json({
        message: "Description et coordonnées GPS valides sont requises."
      });
    }

    const [result] = await query(
      `INSERT INTO signalements (description, photo_url, latitude, longitude, statut, site_id, cree_par_id)
       VALUES (?, ?, ?, ?, 'NOUVEAU', ?, ?)`,
      [description, photoUrl, latitude, longitude, siteId, req.authUser.id]
    );
    const id = result.insertId;
    const [rows] = await query(
      `SELECT 
        id, description, photo_url AS photoUrl, latitude, longitude, statut,
        site_id AS siteId, cree_par_id AS creeParId,
        DATE_FORMAT(cree_le, '%Y-%m-%dT%H:%i:%s.000Z') AS creeLe
      FROM signalements WHERE id = ? LIMIT 1`,
      [id]
    );

    // Notification DB (pour la page notifications)
    await query(
      `INSERT INTO notifications (user_id, titre, message, lu)
       VALUES (?, 'Signalement enregistré', CONCAT('Votre signalement #', ?, ' a été transmis.'), FALSE)`,
      [req.authUser.id, id]
    );

    return res.status(201).json(rows[0]);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("POST /signalement:", err);
    return res.status(500).json({ message: "Erreur lors de l'enregistrement du signalement." });
  }
});
