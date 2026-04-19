import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { query } from "../db/dbClient.js";

export const authRouter = Router();

function sanitizeUser(row) {
  if (!row) return null;
  const { password_hash: _p, passwordHash: _p2, ...rest } = row;
  return rest;
}

authRouter.post("/login", async (req, res) => {
  try {
    const email = String(req.body?.email ?? "")
      .trim()
      .toLowerCase();
    const password = String(req.body?.password ?? "");

    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe requis." });
    }

    const [rows] = await query(
      "SELECT id, email, password_hash, nom, prenom, role, site_id AS siteId FROM users WHERE email = ? LIMIT 1",
      [email]
    );
    const row = rows?.[0] ?? null;

    if (!row) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect." });
    }

    const ok = await bcrypt.compare(password, row.password_hash);
    if (!ok) return res.status(401).json({ message: "Email ou mot de passe incorrect." });

    const user = sanitizeUser(row);
    const token = jwt.sign({ sub: user.id, role: user.role }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN
    });

    return res.status(200).json({ token, user });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("POST /api/login:", err);
    return res.status(500).json({ message: "Erreur interne lors de la connexion." });
  }
});
