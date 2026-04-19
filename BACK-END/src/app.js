import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { apiRouter } from "./routes/index.js";

const isLocalhostOrigin = (origin) => {
  if (!origin) return false;
  try {
    const u = new URL(origin);
    return u.hostname === "localhost" || u.hostname === "127.0.0.1";
  } catch {
    return false;
  }
};

export const createApp = () => {
  const app = express();

  app.use(
    cors({
      origin(origin, cb) {
        // Allow non-browser tools (no Origin) + configured client + any localhost port (dev/preview)
        if (!origin) return cb(null, true);
        if (origin === env.CLIENT_URL) return cb(null, true);
        if (isLocalhostOrigin(origin)) return cb(null, true);
        return cb(new Error(`CORS blocked origin: ${origin}`));
      }
    })
  );
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.status(200).json({ ok: true, status: "up" });
  });

  app.use("/api", apiRouter);

  return app;
};
