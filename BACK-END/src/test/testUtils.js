import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function makeTestJwt({ sub, role }) {
  return jwt.sign({ sub, role }, env.JWT_SECRET, { expiresIn: "1h" });
}

