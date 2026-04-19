import { Router } from "express";
import { requireRoles, ROLES } from "../middleware/auth.js";
import { query } from "../db/dbClient.js";

export const resourcesRouter = Router();

resourcesRouter.get("/users", requireRoles(ROLES.OPERATEUR), async (_req, res) => {
  try {
    const [rows] = await query(
      `SELECT id, email, nom, prenom, role, site_id AS siteId
       FROM users
       WHERE role = ?
       ORDER BY id ASC`,
      [ROLES.AGENT_COLLECTEUR]
    );
    // Disponibilité simple: pas de mission active (PLANIFIEE/EN_COURS) où l'agent est dans equipe_ids
    const [busy] = await query(
      `SELECT id, equipe_ids AS equipeIds
       FROM collectes
       WHERE statut IN ('PLANIFIEE', 'EN_COURS')`
    );
    const busySet = new Set();
    for (const c of busy) {
      try {
        const ids = Array.isArray(c.equipeIds) ? c.equipeIds : JSON.parse(c.equipeIds ?? "[]");
        ids.forEach((x) => busySet.add(Number(x)));
      } catch {
        // ignore
      }
    }
    const withDisponibilite = rows.map((u) => ({
      ...u,
      disponible: !busySet.has(Number(u.id))
    }));
    return res.status(200).json(withDisponibilite);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("GET /users:", err);
    return res.status(500).json({ message: "Erreur lors du chargement des agents." });
  }
});

resourcesRouter.get("/camions", requireRoles(ROLES.OPERATEUR), async (_req, res) => {
  try {
    const [rows] = await query(
      `SELECT id, immatriculation, libelle
       FROM camions
       ORDER BY id ASC`
    );
    const [busy] = await query(
      `SELECT camion_id AS camionId
       FROM collectes
       WHERE statut IN ('PLANIFIEE', 'EN_COURS') AND camion_id IS NOT NULL`
    );
    const busySet = new Set(busy.map((r) => Number(r.camionId)));
    return res.status(200).json(
      rows.map((c) => ({
        ...c,
        disponible: !busySet.has(Number(c.id))
      }))
    );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("GET /camions:", err);
    return res.status(500).json({ message: "Erreur lors du chargement des camions." });
  }
});
