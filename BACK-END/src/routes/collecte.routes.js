import { Router } from "express";
import { requireAuth, requireRoles, ROLES } from "../middleware/auth.js";
import { query } from "../db/dbClient.js";

export const collecteRouter = Router();

function safeParseJson(value, fallback) {
  if (value == null) return fallback;
  if (Array.isArray(value)) return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function mapCollecteRow(r) {
  return {
    id: r.id,
    titre: r.titre,
    datePrevu: r.datePrevu,
    statut: r.statut,
    itineraire: safeParseJson(r.itineraire, []),
    equipeIds: safeParseJson(r.equipeIds, []),
    signalementIds: safeParseJson(r.signalementIds, []),
    camionId: r.camionId ?? null
  };
}

collecteRouter.get("/", requireRoles(ROLES.OPERATEUR, ROLES.ADMINISTRATEUR), async (_req, res) => {
  try {
    const [rows] = await query(
      `SELECT 
        id, titre, DATE_FORMAT(date_prevu, '%Y-%m-%d') AS datePrevu, statut,
        itineraire, equipe_ids AS equipeIds, signalement_ids AS signalementIds,
        camion_id AS camionId
       FROM collectes
       ORDER BY id DESC`
    );
    return res.status(200).json(rows.map(mapCollecteRow));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("GET /collecte:", err);
    return res.status(500).json({ message: "Erreur lors du chargement des collectes." });
  }
});

collecteRouter.get("/missions/:agentId", requireAuth, async (req, res) => {
  try {
    const agentId = Number(req.params.agentId);
    const { role, id: userId } = req.authUser;
    if (role === ROLES.AGENT_COLLECTEUR && userId !== agentId) {
      return res.status(403).json({ message: "Accès refusé." });
    }
    if (
      role !== ROLES.AGENT_COLLECTEUR &&
      role !== ROLES.OPERATEUR &&
      role !== ROLES.ADMINISTRATEUR
    ) {
      return res.status(403).json({ message: "Accès refusé." });
    }

    const [rows] = await query(
      `SELECT 
        id, titre, DATE_FORMAT(date_prevu, '%Y-%m-%d') AS datePrevu, statut,
        itineraire, equipe_ids AS equipeIds, signalement_ids AS signalementIds,
        camion_id AS camionId
       FROM collectes
       WHERE JSON_CONTAINS(equipe_ids, CAST(? AS JSON))
       ORDER BY id DESC`,
      [JSON.stringify(agentId)]
    );

    return res.status(200).json(rows.map(mapCollecteRow));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("GET /collecte/missions/:agentId:", err);
    return res.status(500).json({ message: "Erreur lors du chargement des missions." });
  }
});

collecteRouter.post("/", requireRoles(ROLES.OPERATEUR), async (req, res) => {
  try {
    const titre = String(req.body?.titre ?? "").trim();
    const datePrevu = String(req.body?.datePrevu ?? "").trim();
    const signalementIds = Array.isArray(req.body?.signalementIds)
      ? req.body.signalementIds.map(Number).filter(Number.isFinite)
      : [];
    const agentId = Number(req.body?.agentId);
    const camionId = Number(req.body?.camionId);

    if (!titre || !datePrevu || signalementIds.length === 0) {
      return res.status(400).json({ message: "Titre, date prévue et au moins un signalement sont requis." });
    }
    if (!Number.isFinite(agentId) || !Number.isFinite(camionId)) {
      return res.status(400).json({ message: "Agent et camion sont requis." });
    }

    // validation existence
    const [agentRows] = await query("SELECT id FROM users WHERE id = ? AND role = ? LIMIT 1", [
      agentId,
      ROLES.AGENT_COLLECTEUR
    ]);
    if (!agentRows?.length) {
      return res.status(400).json({ message: "Agent introuvable ou rôle invalide." });
    }
    const [camionRows] = await query("SELECT id FROM camions WHERE id = ? LIMIT 1", [camionId]);
    if (!camionRows?.length) return res.status(400).json({ message: "Camion introuvable." });

    // busy checks
    const [busyCollectes] = await query(
      `SELECT id FROM collectes
       WHERE statut IN ('PLANIFIEE', 'EN_COURS')
       AND (JSON_CONTAINS(equipe_ids, CAST(? AS JSON)) OR camion_id = ?)
       LIMIT 1`,
      [JSON.stringify(agentId), camionId]
    );
    if (busyCollectes?.length) {
      return res.status(400).json({ message: "Agent ou camion indisponible (mission active)." });
    }

    const [sigRows] = await query(
      `SELECT id FROM signalements WHERE id IN (${signalementIds.map(() => "?").join(",")})`,
      signalementIds
    );
    if ((sigRows?.length ?? 0) !== signalementIds.length) {
      return res.status(400).json({ message: "Un ou plusieurs signalements sont introuvables." });
    }

    // itinéraire simple (similaire au mock)
    const [sigCoords] = await query(
      `SELECT id, latitude, longitude FROM signalements WHERE id IN (${signalementIds
        .map(() => "?")
        .join(",")})`,
      signalementIds
    );
    const sorted = [...sigCoords].sort((a, b) => Number(b.latitude) - Number(a.latitude));
    const itineraire = [
      ...sorted.map(
        (s) =>
          `Signalement #${s.id} (${Number(s.latitude).toFixed(3)}, ${Number(s.longitude).toFixed(3)})`
      ),
      "Dépôt central — triage"
    ];

    const [result] = await query(
      `INSERT INTO collectes (titre, date_prevu, statut, itineraire, equipe_ids, signalement_ids, camion_id)
       VALUES (?, ?, 'PLANIFIEE', ?, ?, ?, ?)`,
      [
        titre,
        datePrevu,
        JSON.stringify(itineraire),
        JSON.stringify([agentId]),
        JSON.stringify(signalementIds),
        camionId
      ]
    );

    const id = result.insertId;
    const [rows] = await query(
      `SELECT 
        id, titre, DATE_FORMAT(date_prevu, '%Y-%m-%d') AS datePrevu, statut,
        itineraire, equipe_ids AS equipeIds, signalement_ids AS signalementIds,
        camion_id AS camionId
       FROM collectes WHERE id = ? LIMIT 1`,
      [id]
    );

    // notifications pour les créateurs de signalements
    const [sigCreators] = await query(
      `SELECT id, cree_par_id AS creeParId FROM signalements WHERE id IN (${signalementIds
        .map(() => "?")
        .join(",")})`,
      signalementIds
    );
    if (sigCreators.length) {
      const valuesSql = sigCreators.map(() => "(?, ?, ?, FALSE)").join(", ");
      const params = [];
      for (const s of sigCreators) {
        params.push(
          s.creeParId,
          `Signalement #${s.id} — collecte planifiée`,
          `La collecte « ${titre} » (#${id}) inclut votre signalement. État de la mission : planifiée (en attente).`
        );
      }
      await query(
        `INSERT INTO notifications (user_id, titre, message, lu) VALUES ${valuesSql}`,
        params
      );
    }

    return res.status(201).json(mapCollecteRow(rows[0]));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("POST /collecte:", err);
    return res.status(500).json({ message: "Erreur lors de la création de la collecte." });
  }
});

collecteRouter.patch("/:id", requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [rows] = await query(
      `SELECT 
        id, titre, DATE_FORMAT(date_prevu, '%Y-%m-%d') AS datePrevu, statut,
        itineraire, equipe_ids AS equipeIds, signalement_ids AS signalementIds,
        camion_id AS camionId
       FROM collectes WHERE id = ? LIMIT 1`,
      [id]
    );
    const c = rows?.[0] ? mapCollecteRow(rows[0]) : null;
    if (!c) return res.status(404).json({ message: "Collecte introuvable." });

    const { role, id: userId } = req.authUser;
    const isOperateur = role === ROLES.OPERATEUR || role === ROLES.ADMINISTRATEUR;
    const isAgentOnMission =
      role === ROLES.AGENT_COLLECTEUR && (c.equipeIds || []).includes(userId);
    if (!isOperateur && !isAgentOnMission) {
      return res.status(403).json({ message: "Modification non autorisée." });
    }

    const oldStatut = c.statut;
    if (req.body.statut !== undefined) {
      const allowed = ["PLANIFIEE", "EN_COURS", "TERMINEE", "ANNULEE"];
      if (!allowed.includes(req.body.statut)) {
        return res.status(400).json({ message: "Statut invalide." });
      }
      c.statut = req.body.statut;
    }

    if (isOperateur && req.body.itineraire !== undefined) {
      c.itineraire = req.body.itineraire;
    }
    if (isOperateur && req.body.equipeIds !== undefined) {
      c.equipeIds = req.body.equipeIds;
    }

    await query(
      `UPDATE collectes
       SET statut = ?, itineraire = ?, equipe_ids = ?
       WHERE id = ?`,
      [c.statut, JSON.stringify(c.itineraire ?? []), JSON.stringify(c.equipeIds ?? []), id]
    );

    if (req.body.statut !== undefined && c.statut !== oldStatut) {
      // notif simple aux créateurs des signalements liés
      const [sigCreators] = await query(
        `SELECT cree_par_id AS creeParId, id AS signalementId FROM signalements
         WHERE JSON_CONTAINS(CAST(? AS JSON), CAST(id AS JSON))`,
        [JSON.stringify(c.signalementIds ?? [])]
      );
      if (sigCreators.length) {
        const valuesSql = sigCreators.map(() => "(?, ?, ?, FALSE)").join(", ");
        const params = [];
        for (const s of sigCreators) {
          params.push(
            s.creeParId,
            `Signalement #${s.signalementId} — mission mise à jour`,
            `La collecte « ${c.titre} » (#${c.id}) est passée de « ${oldStatut} » à « ${c.statut} ».`
          );
        }
        await query(
          `INSERT INTO notifications (user_id, titre, message, lu) VALUES ${valuesSql}`,
          params
        );
      }
    }

    return res.status(200).json({ ...c });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("PATCH /collecte/:id:", err);
    return res.status(500).json({ message: "Erreur lors de la mise à jour." });
  }
});
