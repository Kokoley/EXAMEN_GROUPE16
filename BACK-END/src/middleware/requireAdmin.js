import { parseAuthUser, ROLES } from "./auth.js";

export function requireAdmin(req, res, next) {
  const user = parseAuthUser(req);
  if (!user) return res.status(401).json({ message: "Authentification requise." });
  if (user.role !== ROLES.ADMINISTRATEUR) {
    return res.status(403).json({ message: "Accès réservé aux administrateurs." });
  }
  req.adminUserId = user.id;
  next();
}
