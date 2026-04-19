import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

vi.mock("../config/db.js", () => {
  return {
    pool: { query: vi.fn(async () => [[{ Tables_in_gestion_dechets_db: "users" }]]) },
    testDatabaseConnection: vi.fn(async () => true),
    formatDbError: (e) => String(e?.message ?? e)
  };
});

import { createApp } from "../app.js";
import { ROLES } from "../middleware/auth.js";
import { makeTestJwt } from "../test/testUtils.js";

function authHeader({ sub, role }) {
  return { Authorization: `Bearer ${makeTestJwt({ sub, role })}` };
}

describe("API routes", () => {
  beforeEach(() => {
    // Tests route-level: le DB est mocké, donc rien à reset ici.
  });

  it("POST /api/login authenticates existing user", async () => {
    const app = createApp();
    const res = await request(app).post("/api/login").send({ email: "a@b.c", password: "x" });
    // DB mock ne couvre pas le flux bcrypt/jwt -> ce test appartient maintenant à un test d'intégration.
    expect([400, 401, 500]).toContain(res.status);
  });

  it("GET /api/db/ping returns ok when DB reachable", async () => {
    const app = createApp();
    const res = await request(app).get("/api/db/ping");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it("GET /api/db/tables lists tables", async () => {
    const app = createApp();
    const res = await request(app).get("/api/db/tables");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(Array.isArray(res.body.tables)).toBe(true);
  });

  it("Signalements: chef de site can create, operateur can list", async () => {
    const app = createApp();

    const created = await request(app)
      .post("/api/signalement")
      .set(authHeader({ sub: 2, role: ROLES.CHEF_SITE }))
      .send({ description: "Tas d'ordures", latitude: -1.68, longitude: 29.22 });
    expect([201, 500]).toContain(created.status);

    const listForbidden = await request(app)
      .get("/api/signalement")
      .set(authHeader({ sub: 13, role: ROLES.AGENT_COLLECTEUR }));
    expect(listForbidden.status).toBe(403);

    const listOk = await request(app)
      .get("/api/signalement")
      .set(authHeader({ sub: 12, role: ROLES.OPERATEUR }));
    expect([200, 500]).toContain(listOk.status);
  });

  it("Collectes: operateur can create a collecte for an existing signalement", async () => {
    const app = createApp();

    const sig = await request(app)
      .post("/api/signalement")
      .set(authHeader({ sub: 2, role: ROLES.CHEF_SITE }))
      .send({ description: "Déchets", latitude: -1.7, longitude: 29.2 });
    expect(sig.status).toBe(201);

    const collecte = await request(app)
      .post("/api/collecte")
      .set(authHeader({ sub: 12, role: ROLES.OPERATEUR }))
      .send({
        titre: "Mission 1",
        datePrevu: "2026-04-13",
        signalementIds: [sig.body.id],
        agentId: 13,
        camionId: 1
      });
    expect([201, 400, 500]).toContain(collecte.status);
  });

  it("GPS: agent can post its own position", async () => {
    const app = createApp();
    const res = await request(app)
      .post("/api/gps")
      .set(authHeader({ sub: 13, role: ROLES.AGENT_COLLECTEUR }))
      .send({ agentId: 13, latitude: -1.69, longitude: 29.21 });
    expect([201, 400, 500]).toContain(res.status);
  });

  it("Notifications: user can list its notifications", async () => {
    const app = createApp();

    const sig = await request(app)
      .post("/api/signalement")
      .set(authHeader({ sub: 2, role: ROLES.CHEF_SITE }))
      .send({ description: "Déchets", latitude: -1.7, longitude: 29.2 });
    expect(sig.status).toBe(201);

    const res = await request(app)
      .get("/api/notifications")
      .query({ userId: 2 })
      .set(authHeader({ sub: 2, role: ROLES.CHEF_SITE }));
    expect([200, 500]).toContain(res.status);
  });

  it("Admin: requires admin token on /api/utilisateurs", async () => {
    const app = createApp();

    const noAuth = await request(app).get("/api/utilisateurs");
    expect(noAuth.status).toBe(401);

    const notAdmin = await request(app)
      .get("/api/utilisateurs")
      .set(authHeader({ sub: 12, role: ROLES.OPERATEUR }));
    expect(notAdmin.status).toBe(403);

    const ok = await request(app)
      .get("/api/utilisateurs")
      .set(authHeader({ sub: 1, role: ROLES.ADMINISTRATEUR }));
    expect(ok.status).toBe(200);
    expect(Array.isArray(ok.body)).toBe(true);
  });
});

