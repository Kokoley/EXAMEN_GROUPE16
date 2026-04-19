import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const ROLES = {
  CHEF_SITE: "CHEF_SITE",
  AGENT_COLLECTEUR: "AGENT_COLLECTEUR",
  OPERATEUR: "OPERATEUR",
  ADMINISTRATEUR: "ADMINISTRATEUR"
};

export function parseAuthUser(req) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice(7).trim();
  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    const id = Number(payload.sub);
    const role = payload.role;
    if (!Number.isFinite(id) || id <= 0) return null;
    if (!role) return null;
    return { id, role };
  } catch {
    return null;
  }
}

export function requireAuth(req, res, next) {
  const user = parseAuthUser(req);
  if (!user) {
    return res.status(401).json({ message: "Authentification requise." });
  }
  req.authUser = user;
  next();
}

export function requireRoles(...allowed) {
  const flat = allowed.flat();
  return (req, res, next) => {
    const user = parseAuthUser(req);
    if (!user) {
      return res.status(401).json({ message: "Authentification requise." });
    }
    if (!flat.includes(user.role)) {
      return res.status(403).json({ message: "Accès non autorisé pour ce rôle." });
    }
    req.authUser = user;
    next();
  };
}
