import { Router } from "express";
import { requireRoles, ROLES } from "../middleware/auth.js";
import { query } from "../db/dbClient.js";

export const statsRouter = Router();

const STATUTS_SIGNAL = ["NOUVEAU", "VALIDE", "PLANIFIE", "EN_COURS", "TRAITE", "ANNULE"];

statsRouter.get(
  "/statistiques",
  requireRoles(ROLES.ADMINISTRATEUR, ROLES.OPERATEUR),
  async (_req, res) => {
    try {
      const [[{ totalSignalements }]] = await query(
        "SELECT COUNT(*) AS totalSignalements FROM signalements"
      );
      const [[{ totalCollectes }]] = await query("SELECT COUNT(*) AS totalCollectes FROM collectes");
      const [[{ collectesEnCours }]] = await query(
        "SELECT COUNT(*) AS collectesEnCours FROM collectes WHERE statut = 'EN_COURS'"
      );
      const [[{ agentsActifs }]] = await query(
        "SELECT COUNT(DISTINCT agent_id) AS agentsActifs FROM positions_gps"
      );

      const [rows] = await query(
        "SELECT statut, COUNT(*) AS n FROM signalements GROUP BY statut"
      );
      const repartitionStatuts = Object.fromEntries(STATUTS_SIGNAL.map((s) => [s, 0]));
      for (const r of rows) {
        const key = String(r.statut ?? "");
        if (!key) continue;
        repartitionStatuts[key] = Number(r.n ?? 0);
      }

      return res.status(200).json({
        signalementsTotal: Number(totalSignalements ?? 0),
        collectesTotal: Number(totalCollectes ?? 0),
        collectesEnCours: Number(collectesEnCours ?? 0),
        agentsActifs: Number(agentsActifs ?? 0),
        repartitionStatuts
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("GET /statistiques:", err);
      return res.status(500).json({ message: "Erreur lors du chargement des statistiques." });
    }
  }
);

