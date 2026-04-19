import { Router } from "express";
import bcrypt from "bcryptjs";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { ROLES } from "../middleware/auth.js";
import { query } from "../db/dbClient.js";
import { formatDbError } from "../config/db.js";

export const adminRouter = Router();

const ASSIGNABLE_ROLES = [
  ROLES.CHEF_SITE,
  ROLES.AGENT_COLLECTEUR,
  ROLES.OPERATEUR,
  ROLES.ADMINISTRATEUR
];

function normalizeEmail(email) {
  return String(email ?? "")
    .trim()
    .toLowerCase();
}

function siteExists(id) {
  if (id == null || id === "") return true;
  return Number.isFinite(Number(id));
}

adminRouter.get("/utilisateurs", requireAdmin, async (_req, res) => {
  try {
    const [rows] = await query(
      "SELECT id, email, nom, prenom, role, site_id AS siteId FROM users ORDER BY id ASC"
    );
    return res.status(200).json(rows);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("GET /utilisateurs:", err);
    return res.status(500).json({ message: "Erreur lors du chargement des utilisateurs." });
  }
});

adminRouter.post("/utilisateurs", requireAdmin, async (req, res) => {
  try {
    const prenom = String(req.body?.prenom ?? "").trim();
    const nom = String(req.body?.nom ?? "").trim();
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password ?? "");
    const role = req.body?.role;
    const siteIdRaw = req.body?.siteId;
    const siteId =
      siteIdRaw === "" || siteIdRaw === undefined || siteIdRaw === null
        ? null
        : Number(siteIdRaw);

    if (!prenom || !nom || !email || !password) {
      return res.status(400).json({ message: "Prénom, nom, email et mot de passe sont requis." });
    }
    if (!ASSIGNABLE_ROLES.includes(role)) {
      return res.status(400).json({ message: "Rôle invalide." });
    }
    if (siteId !== null && Number.isNaN(siteId)) {
      return res.status(400).json({ message: "Site associé invalide." });
    }
    if (siteId !== null) {
      const [siteRows] = await query("SELECT id FROM sites WHERE id = ? LIMIT 1", [siteId]);
      if (!siteRows?.length) return res.status(400).json({ message: "Le site indiqué n'existe pas." });
    }
    const [existing] = await query("SELECT id FROM users WHERE email = ? LIMIT 1", [email]);
    if (existing?.length) return res.status(409).json({ message: "Un utilisateur avec cet email existe déjà." });

    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await query(
      "INSERT INTO users (email, password_hash, nom, prenom, role, site_id) VALUES (?, ?, ?, ?, ?, ?)",
      [email, passwordHash, nom, prenom, role, siteId]
    );
    const id = result.insertId;
    const [rows] = await query(
      "SELECT id, email, nom, prenom, role, site_id AS siteId FROM users WHERE id = ? LIMIT 1",
      [id]
    );
    return res.status(201).json(rows[0]);
  } catch (err) {
    if (err?.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Un utilisateur avec cet email existe déjà." });
    }
    // eslint-disable-next-line no-console
    console.error("POST /utilisateurs:", err);
    return res.status(500).json({
      message: "Erreur lors de la création de l'utilisateur.",
      error: formatDbError(err)
    });
  }
});

adminRouter.patch("/utilisateurs/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [existing] = await query("SELECT id, role FROM users WHERE id = ? LIMIT 1", [id]);
    if (!existing?.length) return res.status(404).json({ message: "Utilisateur introuvable." });

    // Optimisation: 1 seul UPDATE au lieu de multiples UPDATE séquentiels (réduit les timeouts)
    const fields = [];
    const params = [];
    if (req.body.prenom !== undefined) {
      fields.push("prenom = ?");
      params.push(String(req.body.prenom).trim());
    }
    if (req.body.nom !== undefined) {
      fields.push("nom = ?");
      params.push(String(req.body.nom).trim());
    }
    if (req.body.role !== undefined) {
      if (!ASSIGNABLE_ROLES.includes(req.body.role)) {
        return res.status(400).json({ message: "Rôle invalide." });
      }
      fields.push("role = ?");
      params.push(req.body.role);
    }
    if (req.body.siteId !== undefined) {
      const siteIdRaw = req.body.siteId;
      const siteId =
        siteIdRaw === "" || siteIdRaw === null ? null : Number(siteIdRaw);
      if (siteId !== null && Number.isNaN(siteId)) {
        return res.status(400).json({ message: "Site associé invalide." });
      }
      if (siteId !== null) {
        const [siteRows] = await query("SELECT id FROM sites WHERE id = ? LIMIT 1", [siteId]);
        if (!siteRows?.length) return res.status(400).json({ message: "Le site indiqué n'existe pas." });
      }
      fields.push("site_id = ?");
      params.push(siteId);
    }
    if (req.body.email !== undefined) {
      const email = normalizeEmail(req.body.email);
      if (!email) {
        return res.status(400).json({ message: "Email invalide." });
      }
      const [dupe] = await query("SELECT id FROM users WHERE email = ? AND id <> ? LIMIT 1", [
        email,
        id
      ]);
      if (dupe?.length) return res.status(409).json({ message: "Un utilisateur avec cet email existe déjà." });
      fields.push("email = ?");
      params.push(email);
    }
    if (req.body.password !== undefined && String(req.body.password).length > 0) {
      const passwordHash = await bcrypt.hash(String(req.body.password), 10);
      fields.push("password_hash = ?");
      params.push(passwordHash);
    }
    if (fields.length) {
      await query(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, [...params, id]);
    }

    const [rows] = await query(
      "SELECT id, email, nom, prenom, role, site_id AS siteId FROM users WHERE id = ? LIMIT 1",
      [id]
    );
    return res.status(200).json(rows[0]);
  } catch (err) {
    if (err?.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Un utilisateur avec cet email existe déjà." });
    }
    // eslint-disable-next-line no-console
    console.error("PATCH /utilisateurs/:id:", err);
    return res.status(500).json({
      message: "Erreur lors de la mise à jour de l'utilisateur.",
      error: formatDbError(err)
    });
  }
});

adminRouter.delete("/utilisateurs/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [rows] = await query("SELECT id, role FROM users WHERE id = ? LIMIT 1", [id]);
    if (!rows?.length) return res.status(404).json({ message: "Utilisateur introuvable." });
    if (id === req.adminUserId) {
      return res.status(400).json({ message: "Vous ne pouvez pas supprimer votre propre compte." });
    }
    const [admins] = await query("SELECT id FROM users WHERE role = ?", [ROLES.ADMINISTRATEUR]);
    if (rows[0].role === ROLES.ADMINISTRATEUR && (admins?.length ?? 0) <= 1) {
      return res.status(400).json({ message: "Impossible de supprimer le dernier administrateur." });
    }
    await query("DELETE FROM users WHERE id = ?", [id]);
    return res.status(204).send();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("DELETE /utilisateurs/:id:", err);
    return res.status(500).json({ message: "Erreur lors de la suppression de l'utilisateur." });
  }
});

adminRouter.get("/sites", requireAdmin, async (_req, res) => {
  try {
    const [rows] = await query(
      "SELECT id, nom, localisation, description, actif FROM sites ORDER BY id ASC"
    );
    return res.status(200).json(rows);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("GET /sites:", err);
    return res.status(500).json({ message: "Erreur lors du chargement des sites." });
  }
});

adminRouter.post("/sites", requireAdmin, async (req, res) => {
  try {
    const nom = String(req.body?.nom ?? "").trim();
    const localisation = String(req.body?.localisation ?? "").trim();
    const description = String(req.body?.description ?? "").trim();
    const actif = req.body?.actif !== false;

    if (!nom || !localisation) {
      return res.status(400).json({ message: "Le nom et la localisation sont requis." });
    }

    const [result] = await query(
      "INSERT INTO sites (nom, localisation, description, actif) VALUES (?, ?, ?, ?)",
      [nom, localisation, description || "", actif]
    );
    const id = result.insertId;
    const [rows] = await query(
      "SELECT id, nom, localisation, description, actif FROM sites WHERE id = ? LIMIT 1",
      [id]
    );
    return res.status(201).json(rows[0]);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("POST /sites:", err);
    return res.status(500).json({ message: "Erreur lors de la création du site." });
  }
});

adminRouter.patch("/sites/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [existing] = await query("SELECT id FROM sites WHERE id = ? LIMIT 1", [id]);
    if (!existing?.length) return res.status(404).json({ message: "Site introuvable." });
    if (req.body.nom !== undefined) {
      const nom = String(req.body.nom).trim();
      if (!nom) {
        return res.status(400).json({ message: "Le nom ne peut pas être vide." });
      }
      await query("UPDATE sites SET nom = ? WHERE id = ?", [nom, id]);
    }
    if (req.body.localisation !== undefined) {
      const loc = String(req.body.localisation).trim();
      if (!loc) {
        return res.status(400).json({ message: "La localisation ne peut pas être vide." });
      }
      await query("UPDATE sites SET localisation = ? WHERE id = ?", [loc, id]);
    }
    if (req.body.description !== undefined) {
      await query("UPDATE sites SET description = ? WHERE id = ?", [
        String(req.body.description ?? "").trim(),
        id
      ]);
    }
    if (req.body.actif !== undefined) {
      await query("UPDATE sites SET actif = ? WHERE id = ?", [Boolean(req.body.actif), id]);
    }
    const [rows] = await query(
      "SELECT id, nom, localisation, description, actif FROM sites WHERE id = ? LIMIT 1",
      [id]
    );
    return res.status(200).json(rows[0]);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("PATCH /sites/:id:", err);
    return res.status(500).json({ message: "Erreur lors de la mise à jour du site." });
  }
});

adminRouter.delete("/sites/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [existing] = await query("SELECT id FROM sites WHERE id = ? LIMIT 1", [id]);
    if (!existing?.length) return res.status(404).json({ message: "Site introuvable." });
    const [attached] = await query("SELECT id FROM users WHERE site_id = ? LIMIT 1", [id]);
    if (attached?.length) {
      return res.status(400).json({
        message: "Impossible de supprimer ce site : des utilisateurs y sont encore rattachés."
      });
    }
    await query("DELETE FROM sites WHERE id = ?", [id]);
    return res.status(204).send();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("DELETE /sites/:id:", err);
    return res.status(500).json({ message: "Erreur lors de la suppression du site." });
  }
});

// Camions (admin)
adminRouter.get("/admin/camions", requireAdmin, async (_req, res) => {
  try {
    const [rows] = await query(
      "SELECT id, immatriculation, libelle FROM camions ORDER BY id ASC"
    );
    return res.status(200).json(rows);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("GET /camions (admin):", err);
    return res.status(500).json({ message: "Erreur lors du chargement des camions." });
  }
});

adminRouter.post("/admin/camions", requireAdmin, async (req, res) => {
  try {
    const immatriculation = String(req.body?.immatriculation ?? "").trim();
    const libelle = String(req.body?.libelle ?? "").trim();
    if (!immatriculation) {
      return res.status(400).json({ message: "Immatriculation requise." });
    }

    const [result] = await query(
      "INSERT INTO camions (immatriculation, libelle) VALUES (?, ?)",
      [immatriculation, libelle || null]
    );
    const id = result.insertId;
    const [rows] = await query(
      "SELECT id, immatriculation, libelle FROM camions WHERE id = ? LIMIT 1",
      [id]
    );
    return res.status(201).json(rows[0]);
  } catch (err) {
    if (err?.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Un camion avec cette immatriculation existe déjà." });
    }
    // eslint-disable-next-line no-console
    console.error("POST /camions (admin):", err);
    return res.status(500).json({ message: "Erreur lors de la création du camion." });
  }
});

adminRouter.patch("/admin/camions/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [existing] = await query("SELECT id FROM camions WHERE id = ? LIMIT 1", [id]);
    if (!existing?.length) return res.status(404).json({ message: "Camion introuvable." });

    const fields = [];
    const params = [];
    if (req.body.immatriculation !== undefined) {
      const imm = String(req.body.immatriculation ?? "").trim();
      if (!imm) return res.status(400).json({ message: "Immatriculation invalide." });
      fields.push("immatriculation = ?");
      params.push(imm);
    }
    if (req.body.libelle !== undefined) {
      fields.push("libelle = ?");
      params.push(String(req.body.libelle ?? "").trim() || null);
    }
    if (!fields.length) return res.status(200).json((await query("SELECT id, immatriculation, libelle FROM camions WHERE id = ? LIMIT 1", [id]))[0][0]);

    await query(`UPDATE camions SET ${fields.join(", ")} WHERE id = ?`, [...params, id]);
    const [rows] = await query(
      "SELECT id, immatriculation, libelle FROM camions WHERE id = ? LIMIT 1",
      [id]
    );
    return res.status(200).json(rows[0]);
  } catch (err) {
    if (err?.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Un camion avec cette immatriculation existe déjà." });
    }
    // eslint-disable-next-line no-console
    console.error("PATCH /camions/:id (admin):", err);
    return res.status(500).json({ message: "Erreur lors de la mise à jour du camion." });
  }
});

adminRouter.delete("/admin/camions/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [existing] = await query("SELECT id FROM camions WHERE id = ? LIMIT 1", [id]);
    if (!existing?.length) return res.status(404).json({ message: "Camion introuvable." });

    const [inUse] = await query(
      "SELECT id FROM collectes WHERE camion_id = ? AND statut IN ('PLANIFIEE', 'EN_COURS') LIMIT 1",
      [id]
    );
    if (inUse?.length) {
      return res.status(400).json({ message: "Impossible de supprimer : camion affecté à une mission active." });
    }

    await query("DELETE FROM camions WHERE id = ?", [id]);
    return res.status(204).send();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("DELETE /camions/:id (admin):", err);
    return res.status(500).json({ message: "Erreur lors de la suppression du camion." });
  }
});
