import bcrypt from "bcryptjs";
import { query } from "../src/db/dbClient.js";
import { ROLES } from "../src/middleware/auth.js";

const email = process.argv[2];
const password = process.argv[3];
const prenom = process.argv[4] || "Admin";
const nom = process.argv[5] || "System";

if (!email || !password) {
 
  console.error("Usage: node scripts/create-admin.js <email> <password> [prenom] [nom]");
  process.exit(1);
}

const passwordHash = await bcrypt.hash(password, 10);

const [existing] = await query("SELECT id FROM users WHERE email = ? LIMIT 1", [email]);
if (existing?.length) {
  // eslint-disable-next-line no-console
  console.error("Cet email existe déjà.");
  process.exit(1);
}

const [result] = await query(
  "INSERT INTO users (email, password_hash, nom, prenom, role, site_id) VALUES (?, ?, ?, ?, ?, NULL)",
  [email.toLowerCase(), passwordHash, nom, prenom, ROLES.ADMINISTRATEUR]
);

// eslint-disable-next-line no-console
console.log("Admin créé avec id:", result.insertId);

